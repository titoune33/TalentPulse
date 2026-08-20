"""
Billing routes TalentPulse API
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from services.auth_service import get_current_user, require_role
from models.user import User, UserRole

router = APIRouter(tags=["billing"])


@router.get("/plan")
async def get_current_plan(
    db: Session = Depends(get_db),
    user: User = Depends(require_role(UserRole.ADMIN)),
):
    """Get current billing plan (admin only)"""
    return {
        "plan": user.subscription_status or "free",
        "stripe_customer_id": user.stripe_customer_id,
    }


@router.post("/subscribe")
async def subscribe(
    db: Session = Depends(get_db),
    user: User = Depends(require_role(UserRole.ADMIN)),
):
    """Create Stripe checkout session (admin only)"""
    # TODO: Integrate Stripe Checkout
    raise HTTPException(status_code=501, detail="Stripe integration not yet configured")
