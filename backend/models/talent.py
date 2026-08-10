"""
Talent model for TalentPulse
"""

from sqlalchemy import Column, Integer, String, DateTime, Float, JSON, Enum, ForeignKey, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base
import enum


class TalentStatus(str, enum.Enum):
    ACTIVE = "active"
    AT_RISK = "at_risk"
    INACTIVE = "inactive"
    TURNOVER = "turnover"


class Talent(Base):
    """
    Talent model representing employees in the system
    """
    __tablename__ = "talents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    # Basic info
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(20), nullable=True)

    # Position info
    position = Column(String(100), nullable=True)
    department = Column(String(100), nullable=True)
    hire_date = Column(DateTime(timezone=True), nullable=True)
    salary = Column(Float, nullable=True)

    # Skills and experience
    skills = Column(JSON, default=list)
    experience_years = Column(Integer, default=0)
    education = Column(String(200), nullable=True)

    # Performance metrics (0 to 1)
    performance_score = Column(Float, default=0.0)
    engagement_score = Column(Float, default=0.0)
    satisfaction_score = Column(Float, default=0.0)

    # Status
    status = Column(Enum(TalentStatus, values_callable=lambda e: [m.value for m in e]), default=TalentStatus.ACTIVE)
    turnover_risk = Column(Float, default=0.0)

    # Metadata
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", backref="talents")
    predictions = relationship("Prediction", back_populates="talent", cascade="all, delete-orphan")

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"
