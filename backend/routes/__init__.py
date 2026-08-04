"""
API routes for TalentPulse
"""

from .talents import router as talents_router
from .auth import router as auth_router
from .predictions import router as predictions_router

__all__ = ["talents_router", "auth_router", "predictions_router"]
