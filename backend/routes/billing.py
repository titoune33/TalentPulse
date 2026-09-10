"""
Billing routes TalentPulse API

Two modes:

* **Stripe mode** — `STRIPE_SECRET_KEY` is set. Checkout sessions are created
  against a server-side price allow-list (a client can never pick an arbitrary
  price), and `POST /api/billing/webhook` upgrades the account once Stripe
  confirms the payment.
* **Demo mode** — no Stripe key configured. Subscribing simply unlocks the Pro
  plan locally so the product can be demonstrated end to end.
"""

import logging
import os
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from models.user import User, UserRole
from services.auth_service import get_current_user, require_role

logger = logging.getLogger("talentpulse")

router = APIRouter(tags=["billing"])

# Public (non-secret) plan catalogue. Environment variables hold the Stripe
# price ids; a plan is offered only when its price id is configured.
PLAN_CATALOGUE = [
    {
        "id": "starter",
        "name": "Starter",
        "price_eur": 49,
        "limit": "50 collaborateurs",
        "env_var": "STRIPE_PRICE_ID_STARTER",
    },
    {
        "id": "pro",
        "name": "Pro",
        "price_eur": 149,
        "limit": "250 collaborateurs",
        "env_var": "STRIPE_PRICE_ID_PRO",
    },
    {
        "id": "enterprise",
        "name": "Entreprise",
        "price_eur": None,
        "limit": "illimité",
        "env_var": "STRIPE_PRICE_ID_ENTERPRISE",
    },
]


def _price_allowlist() -> dict:
    """Map Stripe price id -> internal plan id, from the environment only."""
    allowlist = {}
    for plan in PLAN_CATALOGUE:
        price_id = os.getenv(plan["env_var"])
        if price_id:
            allowlist[price_id] = plan["id"]
    return allowlist


class CheckoutRequest(BaseModel):
    price_id: Optional[str] = None


@router.get("/plans")
async def list_plans():
    """
    Public plan catalogue with the Stripe price ids that can be checked out.

    Price ids are publishable identifiers, not secrets; the frontend needs them
    to start a checkout session.
    """
    stripe_configured = bool(os.getenv("STRIPE_SECRET_KEY"))
    return {
        "stripe_configured": stripe_configured,
        "plans": [
            {
                "id": plan["id"],
                "name": plan["name"],
                "price_eur": plan["price_eur"],
                "limit": plan["limit"],
                "price_id": os.getenv(plan["env_var"]) if stripe_configured else None,
            }
            for plan in PLAN_CATALOGUE
        ],
    }


@router.get("/plan")
async def get_current_plan(
    user: User = Depends(get_current_user),
):
    """Current billing plan of the authenticated account."""
    return {
        "plan": user.subscription_status or "free",
        "stripe_customer_id": user.stripe_customer_id,
        "stripe_configured": bool(os.getenv("STRIPE_SECRET_KEY")),
    }


@router.post("/create-checkout-session")
async def create_checkout_session(
    payload: CheckoutRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Create a Stripe Checkout session, or activate the plan in demo mode."""
    stripe_key = os.getenv("STRIPE_SECRET_KEY")

    if not stripe_key:
        # Demo mode: unlock Pro locally so the whole product can be shown.
        user.subscription_status = "pro"
        db.commit()
        return {
            "url": None,
            "plan": "pro",
            "demo": True,
            "message": "Mode démonstration : le plan Pro est activé localement (aucune clé Stripe configurée).",
        }

    allowlist = _price_allowlist()
    if not allowlist:
        raise HTTPException(
            status_code=503,
            detail="Aucun tarif Stripe n'est configuré côté serveur (STRIPE_PRICE_ID_*).",
        )
    if not payload.price_id or payload.price_id not in allowlist:
        # Never forward a client-supplied price id straight to Stripe.
        raise HTTPException(status_code=400, detail="Tarif inconnu ou non autorisé.")

    plan_id = allowlist[payload.price_id]
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000").rstrip("/")

    try:
        import stripe

        stripe.api_key = stripe_key
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{"price": payload.price_id, "quantity": 1}],
            mode="subscription",
            success_url=f"{frontend_url}/billing?success=true",
            cancel_url=f"{frontend_url}/billing?canceled=true",
            customer_email=user.email,
            client_reference_id=str(user.id),
            metadata={"user_id": str(user.id), "plan": plan_id},
        )
    except Exception as e:
        logger.error("Stripe checkout creation failed: %s", e)
        raise HTTPException(status_code=400, detail=f"Erreur Stripe : {e}")

    return {"url": session.url, "plan": plan_id, "demo": False}


@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Stripe webhook: the only place a paid plan becomes active.

    Configuring STRIPE_WEBHOOK_SECRET is strongly recommended — without it the
    signature cannot be verified and the endpoint refuses to run.
    """
    stripe_key = os.getenv("STRIPE_SECRET_KEY")
    webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")
    if not stripe_key or not webhook_secret:
        raise HTTPException(status_code=503, detail="Facturation Stripe non configurée.")

    import stripe

    stripe.api_key = stripe_key
    payload = await request.body()
    signature = request.headers.get("stripe-signature", "")

    try:
        event = stripe.Webhook.construct_event(payload, signature, webhook_secret)
    except Exception as e:
        logger.warning("Rejected Stripe webhook: %s", e)
        raise HTTPException(status_code=400, detail="Signature de webhook invalide.")

    def _apply(user_id: Optional[str], customer_id: Optional[str], plan: Optional[str], email: Optional[str]):
        target = None
        if user_id:
            target = db.query(User).filter(User.id == int(user_id)).first()
        if target is None and email:
            target = db.query(User).filter(User.email == email).first()
        if target is None:
            logger.warning("Stripe webhook: no matching user (user_id=%s, email=%s)", user_id, email)
            return
        if customer_id:
            target.stripe_customer_id = customer_id
        if plan:
            target.subscription_status = plan
        db.commit()

    event_type = event["type"]
    obj = event["data"]["object"]

    if event_type == "checkout.session.completed":
        metadata = obj.get("metadata") or {}
        _apply(
            metadata.get("user_id") or obj.get("client_reference_id"),
            obj.get("customer"),
            metadata.get("plan") or "pro",
            obj.get("customer_email") or (obj.get("customer_details") or {}).get("email"),
        )
    elif event_type in {"customer.subscription.deleted", "customer.subscription.paused"}:
        customer_id = obj.get("customer")
        if customer_id:
            target = db.query(User).filter(User.stripe_customer_id == customer_id).first()
            if target:
                target.subscription_status = "free"
                db.commit()
    elif event_type == "customer.subscription.updated":
        customer_id = obj.get("customer")
        status_value = obj.get("status")
        if customer_id and status_value in {"canceled", "unpaid", "incomplete_expired"}:
            target = db.query(User).filter(User.stripe_customer_id == customer_id).first()
            if target:
                target.subscription_status = "free"
                db.commit()

    return {"received": True, "type": event_type}
