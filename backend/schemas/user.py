"""
User schemas TalentPulse
"""

from pydantic import BaseModel, ConfigDict, EmailStr, Field
from typing import Optional
from datetime import datetime
from models.user import UserRole


class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: UserRole = UserRole.EMPLOYEE


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)


class RegisterRequest(BaseModel):
    """
    Public self-serve signup payload.

    Deliberately has no `role` field: the account created through the public
    endpoint is always the workspace owner. Creating another account with a
    specific role is an admin-only operation (POST /api/auth/users).
    """

    email: EmailStr
    name: str = Field(..., min_length=1, max_length=100)
    password: str = Field(..., min_length=8)


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None


class UserResponse(UserBase):
    id: int
    is_active: bool
    company_id: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class UserListResponse(BaseModel):
    users: list[UserResponse]


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class ChangePassword(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse
