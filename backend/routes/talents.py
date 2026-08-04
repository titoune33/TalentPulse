"""
Talent routes for TalentPulse API
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from database import get_db
from schemas.talent import TalentCreate, TalentResponse, TalentUpdate
from services.talent_service import talent_service
from models.talent import Talent, TalentStatus

router = APIRouter(prefix="/talents", tags=["talents"])


@router.get("/", response_model=List[TalentResponse])
async def get_all_talents(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[TalentStatus] = Query(None),
    department: Optional[str] = Query(None),
):
    """Get all talents with optional filters"""
    query = db.query(Talent)
    
    if status:
        query = query.filter(Talent.status == status)
    if department:
        query = query.filter(Talent.department == department)
    
    talents = query.offset(skip).limit(limit).all()
    return talents


@router.get("/{talent_id}", response_model=TalentResponse)
async def get_talent_by_id(
    talent_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific talent by ID"""
    talent = talent_service.get_talent_by_id(db, talent_id)
    if not talent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Talent not found"
        )
    return talent


@router.post("/", response_model=TalentResponse, status_code=status.HTTP_201_CREATED)
async def create_talent(
    talent_data: TalentCreate,
    db: Session = Depends(get_db)
):
    """Create a new talent"""
    return talent_service.create_talent(db, talent_data)


@router.put("/{talent_id}", response_model=TalentResponse)
async def update_talent(
    talent_id: int,
    talent_data: TalentUpdate,
    db: Session = Depends(get_db)
):
    """Update a talent"""
    talent = talent_service.update_talent(db, talent_id, talent_data)
    if not talent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Talent not found"
        )
    return talent


@router.delete("/{talent_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_talent(
    talent_id: int,
    db: Session = Depends(get_db)
):
    """Delete a talent"""
    success = talent_service.delete_talent(db, talent_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Talent not found"
        )
    return None


@router.get("/search", response_model=List[TalentResponse])
async def search_talents(
    q: str = Query(..., min_length=1, description="Search query"),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Search talents by name, email, or department"""
    return talent_service.search_talents(db, q, limit)


@router.get("/at-risk", response_model=List[TalentResponse])
async def get_talents_at_risk(
    min_risk: float = Query(0.7, ge=0.0, le=1.0),
    db: Session = Depends(get_db)
):
    """Get talents with high turnover risk"""
    return talent_service.get_talents_at_risk(db, min_risk)


@router.get("/stats", response_model=dict)
async def get_talent_stats(
    db: Session = Depends(get_db)
):
    """Get talent statistics"""
    total = db.query(Talent).count()
    active = db.query(Talent).filter(Talent.status == TalentStatus.ACTIVE).count()
    at_risk = db.query(Talent).filter(Talent.status == TalentStatus.AT_RISK).count()
    turnover = db.query(Talent).filter(Talent.status == TalentStatus.TURNOVER).count()
    
    avg_performance = db.query(func.avg(Talent.performance_score)).scalar() or 0
    avg_engagement = db.query(func.avg(Talent.engagement_score)).scalar() or 0
    
    return {
        "total": total,
        "active": active,
        "at_risk": at_risk,
        "turnover": turnover,
        "avg_performance": float(avg_performance),
        "avg_engagement": float(avg_engagement),
    }


# Import func for SQL aggregate functions
from sqlalchemy import func
