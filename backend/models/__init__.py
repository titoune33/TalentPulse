"""
Database models for TalentPulse
"""

from .user import User
from .talent import Talent
from .prediction import Prediction

__all__ = ["User", "Talent", "Prediction"]
