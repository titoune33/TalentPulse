"""
Talent schemas for TalentPulse
"""

from pydantic import BaseModel, ConfigDict, EmailStr, Field
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
    salary: Optional[float] = Field(None, ge=0)
    skills: List[str] = Field(default_factory=list)
    experience_years: int = Field(0, ge=0, le=100)
    education: Optional[str] = None
    performance_score: float = Field(0.0, ge=0.0, le=1.0)
    engagement_score: float = Field(0.0, ge=0.0, le=1.0)
    satisfaction_score: float = Field(0.0, ge=0.0, le=1.0)


class TalentResponse(TalentBase):
    id: int
    user_id: Optional[int] = None
    phone: Optional[str] = None
    position: Optional[str] = None
    department: Optional[str] = None
    hire_date: Optional[datetime] = None
    salary: Optional[float] = None
    skills: List[str] = Field(default_factory=list)
    experience_years: int
    education: Optional[str] = None
    performance_score: float
    engagement_score: float
    satisfaction_score: float
    status: TalentStatus = TalentStatus.ACTIVE
    turnover_risk: float
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class TalentUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    position: Optional[str] = None
    department: Optional[str] = None
    hire_date: Optional[datetime] = None
    salary: Optional[float] = Field(None, ge=0)
    skills: Optional[List[str]] = None
    experience_years: Optional[int] = Field(None, ge=0, le=100)
    education: Optional[str] = None
    performance_score: Optional[float] = Field(None, ge=0.0, le=1.0)
    engagement_score: Optional[float] = Field(None, ge=0.0, le=1.0)
    satisfaction_score: Optional[float] = Field(None, ge=0.0, le=1.0)
    status: Optional[TalentStatus] = None
    turnover_risk: Optional[float] = Field(None, ge=0.0, le=1.0)
    is_active: Optional[bool] = None
