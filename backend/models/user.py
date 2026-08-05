from pydantic import BaseModel, EmailStr
from typing import Optional

class UserBase(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    company: Optional[str] = None

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: str
    is_active: bool = True
    role: str = "USER"