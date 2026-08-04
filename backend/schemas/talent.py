"""
Talent schemas for TalentPulse
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from models.talent import TalentStatus


class TalentBase(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr


class TalentCreate(TalentBase):
    phone: Optional[str] = None
    position: Optional[str] = None
    department: Optional[str] = None
    hire_date: Optional[datetime] = None
    salary: Optional[float] = None
    skills: List[str] = Field(default_factory=list)
    experience_years: int = 0
    education: Optional[str] = None
    performance_score: float = 0.0
    engagement_score: float = 0.0
    satisfaction_score: float = 0.0


class TalentResponse(TalentBase):
    id: int
    user_id: Optional[int] = None
    phone: Optional[str] = None
    position: Optional[str] = None
    department: Optional[str] = None
    hire_date: Optional[datetime] = None
    salary: Optional[float] = None
    skills: List[str] = Field(default_factory=list)
    experience_years: int = 0
    education: Optional[str] = None
    performance_score: float = 0.0
    engagement_score: float = 0.0
    satisfaction_score: float = 0.0
    status: TalentStatus = TalentStatus.ACTIVE
    turnover_risk: float = 0.0
    is_active: bool = True
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class TalentUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    position: Optional[str] = None
    department: Optional[str] = None
    hire_date: Optional[datetime] = None
    salary: Optional[float] = None
    skills: Optional[List[str]] = None
    experience_years: Optional[int] = None
    education: Optional[str] = None
    performance_score: Optional[float] = None
    engagement_score: Optional[float] = None
    satisfaction_score: Optional[float] = None
    status: Optional[TalentStatus] = None
    turnover_risk: Optional[float] = None
    is_active: Optional[bool] = None
