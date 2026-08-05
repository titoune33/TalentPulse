from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class EmployeeBase(BaseModel):
    name: str
    email: EmailStr
    role: str
    department: Optional[str] = None
    hire_date: Optional[str] = None
    salary: Optional[float] = None
    phone: Optional[str] = None
    skills: Optional[List[str]] = []

class EmployeeCreate(EmployeeBase):
    pass

class Employee(EmployeeBase):
    id: str
    user_id: str
    risk_score: int = 0
    status: str = "STABLE"
    predicted_turnover: bool = False
    predicted_turnover_probability: float = 0.0
    created_at: str
    updated_at: str