"""
Pydantic schemas for TalentPulse API
"""

from .user import UserCreate, UserResponse, UserLogin
from .talent import TalentCreate, TalentResponse, TalentUpdate
from .prediction import PredictionResponse

__all__ = [
    "UserCreate",
    "UserResponse",
    "UserLogin",
    "TalentCreate",
    "TalentResponse",
    "TalentUpdate",
    "PredictionResponse",
]
