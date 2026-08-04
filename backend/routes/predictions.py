"""
Prediction routes for TalentPulse API
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from schemas.prediction import PredictionResponse
from services.prediction_service import prediction_service
from services.talent_service import talent_service
from models.prediction import Prediction

router = APIRouter(prefix="/predictions", tags=["predictions"])


@router.post("/talents/{talent_id}", response_model=PredictionResponse, status_code=status.HTTP_201_CREATED)
async def predict_talent_turnover(
    talent_id: int,
    db: Session = Depends(get_db)
):
    """Create a turnover prediction for a talent"""
    talent = talent_service.get_talent_by_id(db, talent_id)
    if not talent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Talent not found"
        )
    
    return prediction_service.create_prediction(db, talent_id, "turnover")


@router.get("/talents/{talent_id}", response_model=List[PredictionResponse])
async def get_talent_predictions(
    talent_id: int,
    db: Session = Depends(get_db)
):
    """Get all predictions for a talent"""
    predictions = db.query(Prediction).filter(
        Prediction.talent_id == talent_id
    ).order_by(Prediction.predicted_at.desc()).all()
    
    if not predictions:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No predictions found for this talent"
        )
    return predictions


@router.get("/recent", response_model=List[PredictionResponse])
async def get_recent_predictions(
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """Get recent predictions"""
    return db.query(Prediction).order_by(
        Prediction.predicted_at.desc()
    ).limit(limit).all()


@router.get("/high-risk", response_model=List[PredictionResponse])
async def get_high_risk_predictions(
    min_risk: float = Query(0.7, ge=0.0, le=1.0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """Get predictions with high turnover risk"""
    return db.query(Prediction).filter(
        Prediction.score >= min_risk
    ).order_by(
        Prediction.score.desc()
    ).limit(limit).all()


@router.get("/stats", response_model=dict)
async def get_prediction_stats(
    db: Session = Depends(get_db)
):
    """Get prediction statistics"""
    from sqlalchemy import func
    
    total = db.query(Prediction).count()
    avg_risk = db.query(func.avg(Prediction.score)).scalar() or 0
    high_risk = db.query(Prediction).filter(Prediction.score >= 0.7).count()
    medium_risk = db.query(Prediction).filter(
        Prediction.score >= 0.4,
        Prediction.score < 0.7
    ).count()
    low_risk = db.query(Prediction).filter(Prediction.score < 0.4).count()
    
    return {
        "total": total,
        "avg_risk_score": float(avg_risk),
        "high_risk": high_risk,
        "medium_risk": medium_risk,
        "low_risk": low_risk,
    }
