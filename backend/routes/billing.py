"""
Stripe webhook routes for TalentPulse
Handles subscription events: checkout.session.completed, invoice.payment_succeeded, etc.
"""

import os
import json
import stripe
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from database import get_db
from models.user import User
from services.auth_service import auth_service, get_current_user

router = APIRouter(tags=["billing"])

# Configure Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
endpoint_secret = os.getenv("STRIPE_WEBHOOK_SECRET")


@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    db: Session = Depends(get_db),
):
    """Handle Stripe webhook events for subscription management."""
    if not stripe.api_key or not endpoint_secret:
        raise HTTPException(
            status_code=status.HTTP_503_NOT_IMPLEMENTED,
            detail="Stripe n'est pas configuré sur ce serveur.",
        )

    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, endpoint_secret
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Payload invalide")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Signature invalide")

    # Handle the event
    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        user_id = session.get("client_reference_id")
        if user_id:
            user = db.query(User).filter(User.id == int(user_id)).first()
            if user:
                # Store the stripe customer id
                user.stripe_customer_id = session.get("customer")
                db.commit()

    elif event["type"] == "customer.subscription.created":
        subscription = event["data"]["object"]
        # Log subscription creation
        print(f"[stripe] Abonnement créé: {subscription.get('id')}")

    elif event["type"] == "customer.subscription.updated":
        subscription = event["data"]["object"]
        # Update subscription status
        print(f"[stripe] Abonnement mis à jour: {subscription.get('id')}")

    elif event["type"] == "invoice.payment_succeeded":
        invoice = event["data"]["object"]
        print(f"[stripe] Paiement réussi: {invoice.get('id')}")

    elif event["type"] == "invoice.payment_failed":
        invoice = event["data"]["object"]
        # Notify user of failed payment
        print(f"[stripe] Paiement échoué: {invoice.get('id')}")

    return JSONResponse(status_code=200, content={"status": "success"})


@router.post("/create-checkout-session")
async def create_checkout_session(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a Stripe Checkout Session for subscription upgrade."""
    if not stripe.api_key:
        raise HTTPException(
            status_code=status.HTTP_503_NOT_IMPLEMENTED,
            detail="Stripe n'est pas configuré.",
        )

    body = await request.json()
    price_id = body.get("price_id")

    if not price_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="price_id est requis",
        )

    try:
        session = stripe.checkout.Session.create(
            mode="subscription",
            payment_method_types=["card"],
            line_items=[{
                "price": price_id,
                "quantity": 1,
            }],
            customer_email=current_user.email,
            client_reference_id=str(current_user.id),
            success_url=os.getenv(
                "FRONTEND_URL",
                "http://localhost:3000"
            ) + "/billing?session_id={CHECKOUT_SESSION_ID}",
            cancel_url=os.getenv(
                "FRONTEND_URL",
                "http://localhost:3000"
            ) + "/billing",
        )
        return {"url": session.url}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la création de la session: {str(e)}",
        )
