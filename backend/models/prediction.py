"""
Prediction model for TalentPulse
Turnover prediction and HR analytics
"""

from sqlalchemy import Column, Integer, String, DateTime, Float, JSON, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base


class Prediction(Base):
    """
    Prediction model for turnover and performance predictions
    """
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    talent_id = Column(Integer, ForeignKey("talents.id"), nullable=False)

    # Prediction type
    prediction_type = Column(String(50), nullable=False)  # e.g. "turnover"

    # Prediction data
    score = Column(Float, nullable=False)
    confidence = Column(Float, default=0.0)
    probability = Column(Float, nullable=True)

    # Features used for prediction
    features = Column(JSON, default=dict)

    # Prediction details
    details = Column(JSON, default=dict)
    recommendation = Column(String(1000), nullable=True)

    # Timestamps
    predicted_at = Column(DateTime(timezone=True), server_default=func.now())
    valid_until = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    talent = relationship("Talent", back_populates="predictions")
