"""
Talent routes TalentPulse API
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import func
from sqlalchemy.orm import Session
from typing import List, Optional

from database import get_db
from schemas.talent import TalentCreate, TalentResponse, TalentUpdate
from services.auth_service import get_current_user, require_any_role
from services.talent_service import talent_service
from models.talent import Talent, TalentStatus
from models.user import User, UserRole

router = APIRouter(tags=["talents"])


# NOTE: static routes (/search, /at-risk, /stats) declared BEFORE
# dynamic route /{talent_id} so FastAPI does not shadow them.


@router.get("/", response_model=List[TalentResponse])
async def get_all_talents(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status_filter: Optional[TalentStatus] = Query(None, alias="status"),
    department: Optional[str] = Query(None),
    _ : User = Depends(require_any_role([UserRole.ADMIN, UserRole.HR_MANAGER])),
):
    """Get all talents with optional filters (admin/HR only)"""
    query = db.query(Talent)

    if status_filter:
        query = query.filter(Talent.status == status_filter)
    if department:
        query = query.filter(Talent.department == department)

    return query.order_by(Talent.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/search", response_model=List[TalentResponse])
async def search_talents(
    q: str = Query(..., min_length=1, description="Search query"),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    _ : User = Depends(require_any_role([UserRole.ADMIN, UserRole.HR_MANAGER])),
):
    """Search talents by name, email, department"""
    return talent_service.search_talents(db, q, limit)


@router.get("/at-risk", response_model=List[TalentResponse])
async def get_at_risk_talents(
    db: Session = Depends(get_db),
    _ : User = Depends(require_any_role([UserRole.ADMIN, UserRole.HR_MANAGER])),
):
    """Get talents with high turnover risk"""
    return talent_service.get_at_risk_talents(db)


@router.get("/stats", response_model=dict)
async def get_talent_stats(
    db: Session = Depends(get_db),
    _ : User = Depends(require_any_role([UserRole.ADMIN, UserRole.HR_MANAGER])),
):
    """Get talent statistics"""
    return talent_service.get_talent_stats(db)


@router.get("/{talent_id}", response_model=TalentResponse)
async def get_talent(
    talent_id: int,
    db: Session = Depends(get_db),
    _ : User = Depends(require_any_role([UserRole.ADMIN, UserRole.HR_MANAGER])),
):
    """Get a single talent by ID"""
    talent = talent_service.get_talent(db, talent_id)
    if not talent:
        raise HTTPException(status_code=404, detail="Talent introuvable")
    return talent


@router.post("/", response_model=TalentResponse, status_code=status.HTTP_201_CREATED)
async def create_talent(
    talent_data: TalentCreate,
    db: Session = Depends(get_db),
    _ : User = Depends(require_any_role([UserRole.ADMIN, UserRole.HR_MANAGER])),
):
    """Create a new talent"""
    return talent_service.create_talent(db, talent_data)


@router.put("/{talent_id}", response_model=TalentResponse)
async def update_talent(
    talent_id: int,
    talent_data: TalentUpdate,
    db: Session = Depends(get_db),
    _ : User = Depends(require_any_role([UserRole.ADMIN, UserRole.HR_MANAGER])),
):
    """Update a talent"""
    updated = talent_service.update_talent(db, talent_id, talent_data)
    if not updated:
        raise HTTPException(status_code=404, detail="Talent introuvable")
    return updated


@router.delete("/{talent_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_talent(
    talent_id: int,
    db: Session = Depends(get_db),
    _ : User = Depends(require_any_role([UserRole.ADMIN, UserRole.HR_MANAGER])),
):
    """Delete a talent"""
    if not talent_service.delete_talent(db, talent_id):
        raise HTTPException(status_code=404, detail="Talent introuvable")
