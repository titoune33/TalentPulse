"""
User model for TalentPulse
"""

from sqlalchemy import Column, Integer, String, DateTime, Enum, Boolean
from sqlalchemy.sql import func
from database import Base
import enum


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    HR_MANAGER = "hr_manager"
    EMPLOYEE = "employee"


class User(Base):
    """
    User model representing HR personnel and employees
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    hashed_password = Column(String(500), nullable=False)
    role = Column(Enum(UserRole, values_callable=lambda e: [m.value for m in e]), default=UserRole.EMPLOYEE)
    company_id = Column(Integer, nullable=True)
    is_active = Column(Boolean, default=True)
    
    # Stripe billing
    stripe_customer_id = Column(String(255), nullable=True)
    subscription_status = Column(String(50), default="free")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
