from pydantic import BaseModel
from typing import Optional
from enum import Enum

class SubscriptionPlan(str, Enum):
    FREE = "FREE"
    PRO = "PRO"
    ENTERPRISE = "ENTERPRISE"

class SubscriptionBase(BaseModel):
    plan: SubscriptionPlan = SubscriptionPlan.FREE

class Subscription(SubscriptionBase):
    id: str
    user_id: str
    status: str = "ACTIVE"
    stripe_id: Optional[str] = None
    current_period_end: Optional[str] = None
    created_at: str
    updated_at: str