"""
Billing routes TalentPulse API
"""

import os
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from database import get_db
from services.auth_service import get_current_user, require_role
from models.user import User, UserRole

router = APIRouter(tags=["billing"])


class CheckoutRequest(BaseModel):
    price_id: Optional[str] = None


@router.get("/plan")
async def get_current_plan(
    db: Session = Depends(get_db),
    user: User = Depends(require_role(UserRole.ADMIN)),
):
    """Get current billing plan (admin only)"""
    return {
        "plan": user.subscription_status or "pro",
        "stripe_customer_id": user.stripe_customer_id,
    }


@router.post("/create-checkout-session")
async def create_checkout_session(
    payload: CheckoutRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Create Stripe checkout session or simulate activation in demo mode."""
    stripe_key = os.getenv("STRIPE_SECRET_KEY")

    if stripe_key and payload.price_id:
        try:
            import stripe
            stripe.api_key = stripe_key
            session = stripe.checkout.Session.create(
                payment_method_types=["card"],
                line_items=[{"price": payload.price_id, "quantity": 1}],
                mode="subscription",
                success_url=os.getenv("FRONTEND_URL", "http://localhost:3000") + "/billing?success=true",
                cancel_url=os.getenv("FRONTEND_URL", "http://localhost:3000") + "/billing?canceled=true",
                customer_email=user.email,
            )
            return {"url": session.url}
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Erreur Stripe: {str(e)}")

    # Mode démo si pas de clé Stripe
    user.subscription_status = "pro"
    db.commit()
    return {
        "url": None,
        "message": "Plan Pro débloqué avec succès en mode démonstration !",
        "plan": "pro"
    }


@router.post("/subscribe")
async def subscribe(
    db: Session = Depends(get_db),
    user: User = Depends(require_role(UserRole.ADMIN)),
):
    """Create Stripe checkout session (admin only)"""
    return await create_checkout_session(CheckoutRequest(), db, user)

