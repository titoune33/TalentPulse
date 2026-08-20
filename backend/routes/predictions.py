"""
Predictions routes TalentPulse API
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from database import get_db
from schemas.prediction import PredictionResponse
from services.auth_service import get_current_user, require_any_role
from services.prediction_service import prediction_service
from models.user import User, UserRole

router = APIRouter(tags=["predictions"])


@router.get("/", response_model=List[PredictionResponse])
async def get_all_predictions(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    _ : User = Depends(require_any_role([UserRole.ADMIN, UserRole.HR_MANAGER])),
):
    """Get all predictions"""
    return prediction_service.get_all_predictions(db, skip, limit)


@router.get("/{prediction_id}", response_model=PredictionResponse)
async def get_prediction(
    prediction_id: int,
    db: Session = Depends(get_db),
    _ : User = Depends(require_any_role([UserRole.ADMIN, UserRole.HR_MANAGER])),
):
    """Get a single prediction"""
    prediction = prediction_service.get_prediction(db, prediction_id)
    if not prediction:
        raise HTTPException(status_code=404, detail="Prediction not found")
    return prediction


@router.post("/talents/{talent_id}", response_model=PredictionResponse)
async def predict_talent_turnover(
    talent_id: int,
    db: Session = Depends(get_db),
    _ : User = Depends(require_any_role([UserRole.ADMIN, UserRole.HR_MANAGER])),
):
    """Run turnover prediction for a talent"""
    return prediction_service.predict_turnover(db, talent_id)
