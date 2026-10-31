from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.models.schemas import (
    SubscriptionPlan,
    OrganizationSubscription,
    SandboxCheckoutRequest,
    SandboxCheckoutResponse,
    BillingInvoice
)
from app.services.subscription_service import SubscriptionService

router = APIRouter(prefix="/api/subscriptions", tags=["B2B SaaS Subscriptions & Billing"])

@router.get("/plans", response_model=List[SubscriptionPlan])
def get_subscription_plans():
    """
    Returns the 4 FoodBridge subscription tiers (Community Free, Food Partner Pro, Business Plus, Enterprise & CSR).
    """
    return SubscriptionService.get_all_plans()

@router.get("/current", response_model=OrganizationSubscription)
def get_current_subscription(organization_id: str = Query("org_taj_palace")):
    """
    Returns the active subscription plan and entitlements for an organization.
    """
    return SubscriptionService.get_organization_subscription(organization_id)

@router.post("/sandbox-checkout", response_model=SandboxCheckoutResponse)
def execute_sandbox_checkout(payload: SandboxCheckoutRequest):
    """
    Sandbox simulated payment checkout. Safely tests upgrade/downgrade flow without real financial transactions.
    """
    try:
        return SubscriptionService.execute_sandbox_checkout(payload)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/invoices", response_model=List[BillingInvoice])
def get_organization_invoices(organization_id: str = Query("org_taj_palace")):
    """
    Returns historical billing invoices for an organization.
    """
    return SubscriptionService.get_invoices_for_organization(organization_id)

@router.get("/check-entitlement")
def check_entitlement(organization_id: str = Query("org_taj_palace"), feature: str = Query(...)):
    """
    Server-side entitlement check verifying if an organization is licensed to use a premium feature.
    """
    allowed = SubscriptionService.has_entitlement(organization_id, feature)
    return {
        "organization_id": organization_id,
        "feature": feature,
        "is_entitled": allowed
    }
