"""
Prediction schemas for TalentPulse
"""

from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime


class PredictionBase(BaseModel):
    prediction_type: str
    score: float


class PredictionResponse(PredictionBase):
    id: int
    talent_id: int
    confidence: float = 0.0
    probability: Optional[float] = None
    features: Dict[str, Any] = {}
    details: Dict[str, Any] = {}
    recommendation: Optional[str] = None
    predicted_at: datetime
    valid_until: Optional[datetime] = None

    class Config:
        from_attributes = True
