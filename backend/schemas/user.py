"""
User schemas for TalentPulse
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from models.user import UserRole


class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: UserRole = UserRole.EMPLOYEE


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)


class UserResponse(UserBase):
    id: int
    is_active: bool
    company_id: Optional[int] = None
    created_at: str
    updated_at: Optional[str] = None

    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse
