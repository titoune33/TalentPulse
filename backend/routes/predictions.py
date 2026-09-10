"""
Predictions routes TalentPulse API
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from schemas.prediction import PredictionResponse
from services.auth_service import require_any_role, require_role
from services.prediction_service import prediction_service
from models.user import User, UserRole

router = APIRouter(tags=["predictions"])


# NOTE: static routes (/recent, /stats, /high-risk, /train) are declared BEFORE
# the dynamic route /{prediction_id} so FastAPI does not shadow them.


@router.get("/", response_model=List[PredictionResponse])
async def get_all_predictions(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    _ : User = Depends(require_any_role([UserRole.ADMIN, UserRole.HR_MANAGER])),
):
    """Get all predictions, most recent first"""
    return prediction_service.get_all_predictions(db, skip, limit)


@router.get("/recent", response_model=List[PredictionResponse])
async def get_recent_predictions(
    db: Session = Depends(get_db),
    limit: int = Query(200, ge=1, le=1000),
    _ : User = Depends(require_any_role([UserRole.ADMIN, UserRole.HR_MANAGER])),
):
    """Latest prediction for each talent (dashboard cohort snapshot)"""
    return prediction_service.get_recent_predictions(db, limit)


@router.get("/stats", response_model=dict)
async def get_prediction_stats(
    db: Session = Depends(get_db),
    _ : User = Depends(require_any_role([UserRole.ADMIN, UserRole.HR_MANAGER])),
):
    """Cohort-level prediction KPIs (deduplicated per talent)"""
    return prediction_service.get_prediction_stats(db)


@router.get("/high-risk", response_model=List[PredictionResponse])
async def get_high_risk_predictions(
    db: Session = Depends(get_db),
    min_risk: float = Query(0.7, ge=0.0, le=1.0),
    limit: int = Query(200, ge=1, le=1000),
    _ : User = Depends(require_any_role([UserRole.ADMIN, UserRole.HR_MANAGER])),
):
    """Latest predictions at or above the given risk threshold"""
    return prediction_service.get_high_risk_predictions(db, min_risk, limit)


@router.get("/talents/{talent_id}", response_model=List[PredictionResponse])
async def get_talent_prediction_history(
    talent_id: int,
    db: Session = Depends(get_db),
    limit: int = Query(100, ge=1, le=1000),
    _ : User = Depends(require_any_role([UserRole.ADMIN, UserRole.HR_MANAGER])),
):
    """Prediction history for a single talent"""
    return prediction_service.get_talent_predictions(db, talent_id, limit)


@router.post("/talents/{talent_id}", response_model=PredictionResponse)
async def predict_talent_turnover(
    talent_id: int,
    db: Session = Depends(get_db),
    _ : User = Depends(require_any_role([UserRole.ADMIN, UserRole.HR_MANAGER])),
):
    """Run a turnover prediction for a talent and persist the result"""
    try:
        return prediction_service.create_prediction(db, talent_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Talent non trouvé")


@router.post("/train", response_model=dict)
async def retrain_model(
    db: Session = Depends(get_db),
    _ : User = Depends(require_role(UserRole.ADMIN)),
):
    """
    Retrain the turnover model on the current talent base.

    A talent is used as a positive example when its current risk score is at
    or above the critical threshold, which keeps the retrained model aligned
    with the scores this instance already produces.
    """
    return prediction_service.retrain_from_database(db)


@router.get("/{prediction_id}", response_model=PredictionResponse)
async def get_prediction(
    prediction_id: int,
    db: Session = Depends(get_db),
    _ : User = Depends(require_any_role([UserRole.ADMIN, UserRole.HR_MANAGER])),
):
    """Get a single prediction"""
    prediction = prediction_service.get_prediction(db, prediction_id)
    if not prediction:
        raise HTTPException(status_code=404, detail="Prédiction introuvable")
    return prediction
