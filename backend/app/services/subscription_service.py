import uuid
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Optional
from app.models.schemas import (
    SubscriptionPlan, 
    OrganizationSubscription, 
    SandboxCheckoutRequest, 
    SandboxCheckoutResponse,
    BillingInvoice
)

class SubscriptionService:
    """
    B2B SaaS Subscription, Entitlements, and Billing Engine for FoodBridge.
    Ensures essential food redistribution is free for all while monetizing commercial operational tools.
    """

    # Defined Subscription Plans
    PLANS: List[SubscriptionPlan] = [
        SubscriptionPlan(
            id="plan_free",
            name="Community Free",
            code="COMMUNITY_FREE",
            price_monthly_inr=0,
            price_annual_inr=0,
            target_users="NGOs, shelters, community kitchens, and small food businesses",
            is_free=True,
            is_popular=False,
            features=[
                "Essential surplus food donation listing",
                "Food-safety eligibility & shelf-life checks",
                "Basic proximity intelligent matching",
                "Donation claim & acceptance workflow",
                "Essential pickup & delivery tracking",
                "Cryptographic QR/OTP handover confirmation",
                "Basic donation history (30 days)"
            ],
            entitlements=[
                "core_donation_listing",
                "core_safety_check",
                "core_matching",
                "core_qr_handover",
                "core_tracking"
            ]
        ),
        SubscriptionPlan(
            id="plan_pro",
            name="Food Partner Pro",
            code="FOOD_PARTNER_PRO",
            price_monthly_inr=999,
            price_annual_inr=9590, # ~20% discount
            target_users="Independent restaurants, cafés, cloud kitchens, and small hotels",
            is_free=False,
            is_popular=True,
            features=[
                "Everything in Community Free",
                "Automated repeat donation scheduling (Quick Re-Donate)",
                "Staff account management (up to 5 team members)",
                "Monthly certified environmental impact reports",
                "Donation & food waste trend analytics",
                "Operational SMS/WhatsApp pickup notifications",
                "Downloadable donation ledger (CSV/PDF)",
                "Priority NGO matching window"
            ],
            entitlements=[
                "core_donation_listing",
                "core_safety_check",
                "core_matching",
                "core_qr_handover",
                "core_tracking",
                "automated_scheduling",
                "staff_management_basic",
                "monthly_impact_reports",
                "analytics_basic",
                "export_ledger_csv"
            ]
        ),
        SubscriptionPlan(
            id="plan_business",
            name="Business Plus",
            code="BUSINESS_PLUS",
            price_monthly_inr=2999,
            price_annual_inr=28790,
            target_users="Hotels, caterers, restaurant chains, and cloud kitchen operators",
            is_free=False,
            is_popular=False,
            features=[
                "Everything in Food Partner Pro",
                "Multi-location management (up to 15 branches)",
                "Centralized multi-outlet donation analytics",
                "Branch-wise food waste & rescue comparison",
                "Automated daily/weekly executive email reporting",
                "Bulk multi-batch donation dispatch",
                "Exportable operational compliance records",
                "Dedicated customer success onboarding"
            ],
            entitlements=[
                "core_donation_listing",
                "core_safety_check",
                "core_matching",
                "core_qr_handover",
                "core_tracking",
                "automated_scheduling",
                "staff_management_basic",
                "monthly_impact_reports",
                "analytics_basic",
                "export_ledger_csv",
                "multi_branch_management",
                "centralized_analytics",
                "bulk_dispatch",
                "compliance_audit_export",
                "automated_reporting"
            ]
        ),
        SubscriptionPlan(
            id="plan_enterprise",
            name="Enterprise & CSR",
            code="ENTERPRISE_CSR",
            price_monthly_inr=9999, # Base starting price
            price_annual_inr=99990,
            target_users="Large hotel chains, corporate dining, institutions, and CSR partners",
            is_free=False,
            is_popular=False,
            features=[
                "Everything in Business Plus",
                "Multi-city regional cluster management",
                "Custom enterprise reporting & ERP API connectors",
                "Dedicated organization-wide executive dashboard",
                "CSR program sponsorship tracking & budget allocation",
                "Third-party audited impact & carbon mitigation logs",
                "Dedicated 24/7 key account management",
                "Custom Service Level Agreements (SLAs)"
            ],
            entitlements=[
                "core_donation_listing",
                "core_safety_check",
                "core_matching",
                "core_qr_handover",
                "core_tracking",
                "automated_scheduling",
                "staff_management_basic",
                "monthly_impact_reports",
                "analytics_basic",
                "export_ledger_csv",
                "multi_branch_management",
                "centralized_analytics",
                "bulk_dispatch",
                "compliance_audit_export",
                "automated_reporting",
                "multi_city",
                "csr_program_tracking",
                "api_integration",
                "custom_slas"
            ]
        )
    ]

    # In-memory organization subscriptions store
    SUBSCRIPTIONS_DB: Dict[str, OrganizationSubscription] = {
        "org_taj_palace": OrganizationSubscription(
            organization_id="org_taj_palace",
            organization_name="Taj Palace Banquet Kitchen",
            plan_code="FOOD_PARTNER_PRO",
            plan_name="Food Partner Pro",
            billing_cycle="monthly",
            status="ACTIVE",
            current_period_start=datetime.now(timezone.utc) - timedelta(days=12),
            current_period_end=datetime.now(timezone.utc) + timedelta(days=18),
            cancel_at_period_end=False,
            amount_inr=999,
            entitlements=[
                "core_donation_listing", "core_safety_check", "core_matching",
                "core_qr_handover", "core_tracking", "automated_scheduling",
                "staff_management_basic", "monthly_impact_reports",
                "analytics_basic", "export_ledger_csv"
            ]
        ),
        "org_nsut_dining": OrganizationSubscription(
            organization_id="org_nsut_dining",
            organization_name="NSUT Campus Dining Hall",
            plan_code="COMMUNITY_FREE",
            plan_name="Community Free",
            billing_cycle="monthly",
            status="ACTIVE",
            current_period_start=datetime.now(timezone.utc) - timedelta(days=5),
            current_period_end=datetime.now(timezone.utc) + timedelta(days=25),
            cancel_at_period_end=False,
            amount_inr=0,
            entitlements=[
                "core_donation_listing", "core_safety_check", "core_matching",
                "core_qr_handover", "core_tracking"
            ]
        )
    }

    # Invoices DB
    INVOICES_DB: List[BillingInvoice] = [
        BillingInvoice(
            id="inv_1001",
            invoice_number="INV-FB-2026-0812",
            organization_id="org_taj_palace",
            organization_name="Taj Palace Banquet Kitchen",
            plan_name="Food Partner Pro (Monthly)",
            amount_inr=999,
            status="PAID",
            billing_period="Oct 2026 - Nov 2026",
            created_at=datetime.now(timezone.utc) - timedelta(days=12),
            download_url="/invoices/INV-FB-2026-0812.pdf"
        ),
        BillingInvoice(
            id="inv_1002",
            invoice_number="INV-FB-2026-0712",
            organization_id="org_taj_palace",
            organization_name="Taj Palace Banquet Kitchen",
            plan_name="Food Partner Pro (Monthly)",
            amount_inr=999,
            status="PAID",
            billing_period="Sep 2026 - Oct 2026",
            created_at=datetime.now(timezone.utc) - timedelta(days=42),
            download_url="/invoices/INV-FB-2026-0712.pdf"
        )
    ]

    @classmethod
    def get_all_plans(cls) -> List[SubscriptionPlan]:
        return cls.PLANS

    @classmethod
    def get_plan_by_code(cls, code: str) -> Optional[SubscriptionPlan]:
        return next((p for p in cls.PLANS if p.code == code), None)

    @classmethod
    def get_organization_subscription(cls, org_id: str) -> OrganizationSubscription:
        if org_id not in cls.SUBSCRIPTIONS_DB:
            # Default to Community Free
            free_plan = cls.get_plan_by_code("COMMUNITY_FREE")
            cls.SUBSCRIPTIONS_DB[org_id] = OrganizationSubscription(
                organization_id=org_id,
                organization_name="Commercial Food Partner",
                plan_code="COMMUNITY_FREE",
                plan_name="Community Free",
                billing_cycle="monthly",
                status="ACTIVE",
                current_period_start=datetime.now(timezone.utc),
                current_period_end=datetime.now(timezone.utc) + timedelta(days=30),
                cancel_at_period_end=False,
                amount_inr=0,
                entitlements=free_plan.entitlements
            )
        return cls.SUBSCRIPTIONS_DB[org_id]

    @classmethod
    def has_entitlement(cls, org_id: str, required_entitlement: str) -> bool:
        sub = cls.get_organization_subscription(org_id)
        if sub.status != "ACTIVE":
            # Fall back to Community Free entitlements
            return required_entitlement in cls.get_plan_by_code("COMMUNITY_FREE").entitlements
        return required_entitlement in sub.entitlements

    @classmethod
    def execute_sandbox_checkout(cls, req: SandboxCheckoutRequest) -> SandboxCheckoutResponse:
        plan = cls.get_plan_by_code(req.target_plan_code)
        if not plan:
            raise ValueError(f"Unknown plan code: {req.target_plan_code}")

        if req.simulate_failure:
            return SandboxCheckoutResponse(
                success=False,
                transaction_id=f"tx_fail_{uuid.uuid4().hex[:8]}",
                order_id=f"order_{uuid.uuid4().hex[:8]}",
                invoice_number="N/A",
                amount_inr=plan.price_monthly_inr if req.billing_cycle == "monthly" else plan.price_annual_inr,
                currency="INR",
                status="FAILED",
                payment_mode="SANDBOX_SIMULATED",
                message="Simulated transaction failure for testing error recovery.",
                timestamp=datetime.now(timezone.utc)
            )

        amount = plan.price_monthly_inr if req.billing_cycle == "monthly" else plan.price_annual_inr
        period_days = 365 if req.billing_cycle == "annual" else 30
        now = datetime.now(timezone.utc)
        inv_number = f"INV-FB-{now.strftime('%Y%m')}-{uuid.uuid4().hex[:4].upper()}"

        # Update Subscription
        sub = OrganizationSubscription(
            organization_id=req.organization_id,
            organization_name=req.customer_name or "Commercial Food Partner",
            plan_code=plan.code,
            plan_name=f"{plan.name} ({'Annual' if req.billing_cycle == 'annual' else 'Monthly'})",
            billing_cycle=req.billing_cycle,
            status="ACTIVE",
            current_period_start=now,
            current_period_end=now + timedelta(days=period_days),
            cancel_at_period_end=False,
            amount_inr=amount,
            entitlements=plan.entitlements
        )
        cls.SUBSCRIPTIONS_DB[req.organization_id] = sub

        # Create Invoice
        invoice = BillingInvoice(
            id=f"inv_{uuid.uuid4().hex[:8]}",
            invoice_number=inv_number,
            organization_id=req.organization_id,
            organization_name=req.customer_name,
            plan_name=plan.name,
            amount_inr=amount,
            status="PAID",
            billing_period=f"{now.strftime('%b %Y')} - {(now + timedelta(days=period_days)).strftime('%b %Y')}",
            created_at=now,
            download_url=f"/invoices/{inv_number}.pdf"
        )
        cls.INVOICES_DB.insert(0, invoice)

        return SandboxCheckoutResponse(
            success=True,
            transaction_id=f"pay_sbx_{uuid.uuid4().hex[:12]}",
            order_id=f"order_sbx_{uuid.uuid4().hex[:10]}",
            invoice_number=inv_number,
            amount_inr=amount,
            currency="INR",
            status="SUCCESS",
            payment_mode="SANDBOX_SIMULATED",
            message=f"Sandbox checkout successful! Upgraded to {plan.name}.",
            timestamp=now
        )

    @classmethod
    def get_invoices_for_organization(cls, org_id: str) -> List[BillingInvoice]:
        return [inv for inv in cls.INVOICES_DB if inv.organization_id == org_id]
