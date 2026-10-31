from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# ==============================================================================
# 1. Surplus Food Listing Models (Phase D Multi-Step Form Supported)
# ==============================================================================
class SurplusListingCreate(BaseModel):
    donor_name: str
    food_title: str
    food_category: str = Field(..., description="COOKED_MEALS, BAKERY, PRODUCE, PACKAGED, DAIRY")
    dietary_type: Optional[str] = Field("VEGETARIAN", description="VEGETARIAN, NON_VEGETARIAN, VEGAN")
    quantity_servings: int = Field(..., gt=0)
    weight_kg: float = Field(..., gt=0)
    packaging_type: Optional[str] = Field("INSULATED_CONTAINERS", description="INSULATED_CONTAINERS, SEALED_BOXES, TRAYS, POUCHES")
    preparation_timestamp: datetime
    pickup_deadline: Optional[datetime] = None
    storage_condition: str = Field(..., description="REFRIGERATED, HEATED, ROOM_TEMP, FROZEN, INSULATED")
    storage_confirmed: Optional[bool] = Field(True, description="Food has remained under stated storage conditions")
    classification: str = Field("CATEGORY_A", description="CATEGORY_A (Ambient), CATEGORY_B (Cold Chain Required)")
    allergens: Optional[List[str]] = []
    pickup_address: str
    donor_phone: Optional[str] = "+91 98765 43210"
    contact_person: Optional[str] = "Kitchen Dispatch Lead"
    special_instructions: Optional[str] = "Loading dock at rear service entrance."
    latitude: float
    longitude: float
    photo_url: Optional[str] = None

# 2. AI Freshness & Eligibility Evaluation Response
class FreshnessEvaluationResult(BaseModel):
    freshness_score: float = Field(..., ge=0.0, le=100.0)
    estimated_shelf_life_hours: float
    safety_category: str = Field(..., description="HIGHLY_FRESH, MODERATE_RESCUE, URGENT_DISPATCH, EXPIRED")
    risk_level: str = Field("LOW", description="LOW, MEDIUM, HIGH, CRITICAL")
    allergens: List[str] = []
    validation_hash: str
    ai_recommendation: str
    ai_source: Optional[str] = "DETERMINISTIC_DECAY_MODEL"
    ai_verified: bool = False

# 3. Surplus Listing Response
class SurplusListingResponse(BaseModel):
    id: str
    donor_name: str
    donor_phone: Optional[str] = "+91 98765 43210"
    food_title: str
    food_category: str
    dietary_type: Optional[str] = "VEGETARIAN"
    classification: str = "CATEGORY_A"
    quantity_servings: int
    weight_kg: float
    packaging_type: Optional[str] = "INSULATED_CONTAINERS"
    freshness_score: float
    risk_level: str = "LOW"
    allergens: List[str] = []
    validation_hash: str
    estimated_shelf_life_hours: float
    status: str
    pickup_address: str
    latitude: float
    longitude: float
    created_at: datetime
    matched_ngo: Optional[str] = None
    pickup_deadline: Optional[datetime] = None
    photo_url: Optional[str] = None

# ==============================================================================
# 4. Multi-Recipient Allocation Models
# ==============================================================================
class SplitAllocationRequest(BaseModel):
    listing_id: str
    max_recipients: Optional[int] = 3

class NGOAllocationRecipient(BaseModel):
    ngo_id: str
    ngo_name: str
    address: str
    phone: str = "+91 98123 45678"
    contact_person: str = "Volunteer Lead"
    allocated_servings: int
    allocated_weight_kg: float
    distance_km: float
    estimated_transit_mins: int

class SplitAllocationResponse(BaseModel):
    listing_id: str
    total_servings: int
    allocations: List[NGOAllocationRecipient]
    matching_timestamp: datetime

# ==============================================================================
# 5. Call Log Models (Ola-style Contact & Call Tracking)
# ==============================================================================
class CallLogCreate(BaseModel):
    listing_id: Optional[str] = None
    caller_role: str = Field(..., description="DONOR, NGO, COURIER, ADMIN")
    caller_name: str
    caller_phone: str
    recipient_name: str
    recipient_phone: str
    duration_seconds: Optional[int] = 45
    status: str = Field("COMPLETED", description="COMPLETED, IN_PROGRESS, MISSED, REJECTED")
    notes: Optional[str] = "Donor and NGO coordinated food pickup location and arrival window."

class CallLogResponse(BaseModel):
    id: str
    listing_id: Optional[str]
    caller_role: str
    caller_name: str
    caller_phone: str
    recipient_name: str
    recipient_phone: str
    duration_seconds: int
    status: str
    notes: Optional[str]
    created_at: datetime

# ==============================================================================
# 6. Trust Rating & Review Models
# ==============================================================================
class TrustRatingCreate(BaseModel):
    target_org_id: str
    target_org_name: str
    evaluator_role: str = Field(..., description="DONOR, NGO, COURIER")
    evaluator_name: str
    rating: int = Field(..., ge=1, le=5)
    hygiene_rating: Optional[int] = Field(5, ge=1, le=5)
    punctuality_rating: Optional[int] = Field(5, ge=1, le=5)
    feedback_text: Optional[str] = "Excellent food quality and prompt pickup!"

class TrustRatingResponse(BaseModel):
    id: str
    target_org_id: str
    target_org_name: str
    evaluator_role: str
    evaluator_name: str
    rating: int
    hygiene_rating: int
    punctuality_rating: int
    feedback_text: str
    created_at: datetime

# ==============================================================================
# 7. QR Verification Handshake Payload
# ==============================================================================
class QRHandshakeCreate(BaseModel):
    allocation_id: str
    donor_id: str
    recipient_ngo_id: str
    servings: int

class QRVerificationResponse(BaseModel):
    handshake_id: str
    verification_token: str
    qr_code_base64: str
    status: str

class QRVerifyRequest(BaseModel):
    verification_token: str
    scanned_by_role: str

class OTPVerifyRequest(BaseModel):
    donation_id: str
    otp_code: str
    role: str = "VOLUNTEER"

class QRVerifyResult(BaseModel):
    success: bool
    message: str
    co2_mitigated_kg: float
    meals_rescued: int
    updated_trust_score: float

# ==============================================================================
# 8. Analytics & Impact Metrics
# ==============================================================================
class ImpactMetricsResponse(BaseModel):
    total_meals_rescued: int
    total_co2_avoided_kg: float
    total_food_saved_tonnes: float
    active_ngo_partners: int
    verified_pickups_count: int
    average_match_time_mins: float

# ==============================================================================
# 9. Subscription & Monetization SaaS Models (Phases 2-5)
# ==============================================================================
class SubscriptionPlan(BaseModel):
    id: str
    name: str
    code: str # COMMUNITY_FREE, FOOD_PARTNER_PRO, BUSINESS_PLUS, ENTERPRISE_CSR
    price_monthly_inr: int
    price_annual_inr: int
    target_users: str
    is_free: bool = False
    is_popular: bool = False
    features: List[str]
    entitlements: List[str]

class OrganizationSubscription(BaseModel):
    organization_id: str
    organization_name: str
    plan_code: str
    plan_name: str
    billing_cycle: str = "monthly" # monthly, annual
    status: str = "ACTIVE" # ACTIVE, PAST_DUE, CANCELLED, TRIAL
    current_period_start: datetime
    current_period_end: datetime
    cancel_at_period_end: bool = False
    amount_inr: int
    entitlements: List[str]

class SubscriptionUpgradeRequest(BaseModel):
    organization_id: str
    target_plan_code: str
    billing_cycle: str = "monthly"
    payment_method_id: Optional[str] = "sandbox_pm_card"

class SandboxCheckoutRequest(BaseModel):
    organization_id: str
    target_plan_code: str
    billing_cycle: str = "monthly"
    customer_name: str
    customer_email: str
    simulate_failure: bool = False

class SandboxCheckoutResponse(BaseModel):
    success: bool
    transaction_id: str
    order_id: str
    invoice_number: str
    amount_inr: int
    currency: str = "INR"
    status: str
    payment_mode: str = "SANDBOX_SIMULATED"
    message: str
    timestamp: datetime

class BillingInvoice(BaseModel):
    id: str
    invoice_number: str
    organization_id: str
    organization_name: str
    plan_name: str
    amount_inr: int
    status: str = "PAID" # PAID, PENDING, FAILED
    billing_period: str
    created_at: datetime
    download_url: Optional[str] = None

# ==============================================================================
# 10. Enterprise Inquiries & CSR Program Models (Phase 6)
# ==============================================================================
class EnterpriseInquiryCreate(BaseModel):
    organization_name: str
    contact_person: str
    email: str
    phone: str
    number_of_branches: int = Field(..., gt=0)
    estimated_monthly_servings: int = Field(..., gt=0)
    custom_reporting_needed: bool = True
    multi_city: bool = False
    csr_sponsor_interest: bool = False
    notes: Optional[str] = None

class EnterpriseInquiryResponse(BaseModel):
    id: str
    organization_name: str
    contact_person: str
    email: str
    phone: str
    number_of_branches: int
    estimated_monthly_servings: int
    custom_reporting_needed: bool
    multi_city: bool
    csr_sponsor_interest: bool
    notes: Optional[str]
    status: str = "NEW" # NEW, CONTACTED, PROPOSAL_SENT, CLOSED_WON, ARCHIVED
    created_at: datetime

class CSRProgramCreate(BaseModel):
    program_name: str
    sponsor_organization: str
    implementing_ngo: str
    allocated_budget_inr: int
    duration_months: int
    target_meals_count: int
    cities_covered: List[str]

class CSRProgramResponse(BaseModel):
    id: str
    program_name: str
    sponsor_organization: str
    implementing_ngo: str
    allocated_budget_inr: int
    disbursed_to_date_inr: int
    duration_months: int
    target_meals_count: int
    verified_meals_delivered: int
    co2_mitigated_kg: float
    cities_covered: List[str]
    status: str = "ACTIVE" # ACTIVE, COMPLETED, AUDIT_PENDING
    compliance_certified: bool = True
    created_at: datetime

# ==============================================================================
# 11. Revenue Analytics & Financial Sustainability Models (Phases 5 & 7)
# ==============================================================================
class RevenueAnalyticsResponse(BaseModel):
    mrr_inr: int
    arr_inr: int
    active_paying_organizations: int
    total_organizations: int
    free_customers_count: int
    paid_customers_count: int
    plan_breakdown: Dict[str, int]
    monthly_churn_rate_pct: float
    arpu_inr: int
    outstanding_invoices_inr: int
    conversion_rate_pct: float
    revenue_growth_mom_pct: float
    is_demo_data: bool = True

class UnitEconomicsMetrics(BaseModel):
    average_revenue_per_paying_org_inr: int
    tech_infrastructure_cost_per_org_inr: int
    ai_and_voice_api_cost_per_rescue_inr: float
    logistics_coordination_subsidy_per_rescue_inr: float
    support_cost_per_org_inr: int
    net_cost_per_rescue_inr: float
    contribution_margin_pct: float
    estimated_monthly_operating_result_inr: int
    break_even_paying_orgs_count: int
    is_projection: bool = True
    projection_disclaimer: str

# ==============================================================================
# 12. Donation Records & Operational Compliance Models (Phase 8)
# ==============================================================================
class ComplianceAuditRecord(BaseModel):
    id: str
    listing_id: str
    donor_organization: str
    recipient_shelter: str
    food_category: str
    servings_count: int
    weight_kg: float
    storage_condition: str
    preparation_timestamp: datetime
    pickup_timestamp: datetime
    delivery_timestamp: datetime
    handshake_token_hash: str
    courier_name: str
    temperature_complied: bool
    incident_logged: bool = False
    disclaimer: str = "Operational compliance log for food safety traceability. Not valid for Section 80G income-tax deduction."

# ==============================================================================
# 13. Phase 3 & 4 Distribution Proof, TrustChain & Geo-Radius Schemas
# ==============================================================================

class LocationUpdateRequest(BaseModel):
    user_id: str
    organization_name: str
    role: str
    address: str
    latitude: float
    longitude: float
    service_radius_km: Optional[float] = 10.0

class LocationUpdateResponse(BaseModel):
    success: bool
    message: str
    latitude: float
    longitude: float

class GeoRadiusSearchRequest(BaseModel):
    origin_lat: float
    origin_lon: float
    radius_km: float = 10.0
    food_category: Optional[str] = None
    dietary_type: Optional[str] = None
    min_servings: Optional[int] = None
    max_urgency_hours: Optional[float] = None

class TrustChainEventCreate(BaseModel):
    donation_id: str
    stage: str
    actor_id: str
    actor_name: str
    actor_role: str
    location_address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    evidence_reference: Optional[str] = None
    evidence_hash: Optional[str] = None
    notes: Optional[str] = None

class TrustChainEventResponse(BaseModel):
    id: str
    donation_id: str
    stage: str
    actor_id: str
    actor_name: str
    actor_role: str
    timestamp: datetime
    location_address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    evidence_reference: Optional[str] = None
    evidence_hash: Optional[str] = None
    verification_status: str = "VERIFIED"
    notes: Optional[str] = None

class DistributionEventCreate(BaseModel):
    donation_id: str
    ngo_id: str
    ngo_name: str
    food_category: str
    quantity_received: int
    planned_location: str
    actual_location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class DistributionSessionRecord(BaseModel):
    event_id: str
    servings_distributed: int
    beneficiary_count: int
    servings_remaining: int
    servings_spoiled: Optional[int] = 0
    servings_rejected: Optional[int] = 0
    actual_location: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    evidence_hashes: Optional[List[str]] = []
    notes: Optional[str] = None

class WitnessVerifyRequest(BaseModel):
    event_id: str
    witness_name: str
    witness_phone: str
    witness_organization: str
    witness_confirmed: bool
    observed_quantity: Optional[int] = None
    discrepancy_flagged: Optional[bool] = False
    witness_notes: Optional[str] = None

class AdminAuditRequest(BaseModel):
    event_id: str
    audit_decision: str = Field(..., description="VERIFIED, DISPUTED, REJECTED, ADDITIONAL_EVIDENCE_REQUESTED")
    admin_notes: str
    admin_id: str = "admin_governance"

class DistributionEventResponse(BaseModel):
    id: str
    event_code: str
    donation_id: str
    ngo_id: str
    ngo_name: str
    food_category: str
    quantity_received: int
    servings_distributed: int
    servings_remaining: int
    servings_spoiled: int
    servings_rejected: int
    beneficiary_count: int
    distribution_date: datetime
    actual_location: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    evidence_hashes: List[str] = []
    witness_name: Optional[str] = None
    witness_confirmed: bool = False
    witness_notes: Optional[str] = None
    witness_verified_at: Optional[datetime] = None
    status: str
    audit_status: str
    admin_audit_notes: Optional[str] = None
    created_at: datetime

class QuantityLedgerItem(BaseModel):
    id: str
    donation_id: str
    transaction_type: str
    quantity_servings: int
    balance_servings: int
    reason: str
    authorized_by: str
    timestamp: datetime

class DistributionAuditSummaryResponse(BaseModel):
    total_donations_received: int
    total_food_distributed_servings: int
    total_beneficiaries_served: int
    independently_verified_events_count: int
    pending_audit_events_count: int
    flagged_discrepancies_count: int
    unreconciled_inventory_servings: int

# ==============================================================================
# 14. Rapid Pickup, Live GPS, Countdown & Delay Management (Phase 5)
# ==============================================================================
class DeliveryRequestCreate(BaseModel):
    listing_id: str
    ngo_id: str
    ngo_name: str
    requested_servings: int = Field(..., gt=0)
    dropoff_address: str
    dropoff_lat: float
    dropoff_lon: float
    contact_phone: Optional[str] = "+91 98101 23456"

class DeliveryApproveRequest(BaseModel):
    delivery_id: str
    prep_time_minutes: int = Field(15, ge=0, le=120)
    pickup_instructions: Optional[str] = "Service dock rear entry"

class DeliveryAssignRequest(BaseModel):
    delivery_id: str
    volunteer_id: str
    volunteer_name: str
    volunteer_phone: str = "+91 98222 33445"
    vehicle_type: str = "VAN"
    volunteer_lat: float
    volunteer_lon: float

class DeliveryLocationPing(BaseModel):
    delivery_id: str
    volunteer_id: str
    current_lat: float
    current_lon: float

class DeliveryDelayReport(BaseModel):
    delivery_id: str
    volunteer_id: str
    delay_reason: str = Field(..., description="HEAVY_TRAFFIC, VEHICLE_BREAKDOWN, KITCHEN_PREP_DELAY, GPS_REROUTE, WEATHER_CONDITIONS, OTHER")
    delay_minutes: int = Field(..., ge=1, le=120)
    notes: Optional[str] = None

class DeliveryArrivalVerify(BaseModel):
    delivery_id: str
    volunteer_id: str
    current_lat: float
    current_lon: float

class DeliveryRecordResponse(BaseModel):
    id: str
    listing_id: str
    ngo_id: str
    ngo_name: str
    donor_name: str
    food_title: str
    allocated_servings: int
    pickup_address: str
    pickup_lat: float
    pickup_lon: float
    dropoff_address: str
    dropoff_lat: float
    dropoff_lon: float
    volunteer_id: Optional[str] = None
    volunteer_name: Optional[str] = None
    volunteer_phone: Optional[str] = None
    volunteer_lat: Optional[float] = None
    volunteer_lon: Optional[float] = None
    status: str = Field("REQUESTED", description="REQUESTED, APPROVED, ASSIGNED, EN_ROUTE_TO_PICKUP, ARRIVED_AT_PICKUP, COLLECTED, EN_ROUTE_TO_DELIVERY, DELIVERED, CANCELLED")
    prep_time_minutes: int = 15
    estimated_travel_minutes: int = 20
    grace_period_minutes: int = 10
    pickup_deadline: Optional[datetime] = None
    accepted_at: Optional[datetime] = None
    collected_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    late_policy_status: str = "ON_TIME"
    delay_history: List[Dict[str, Any]] = []
    created_at: datetime

class LivePickupStatusResponse(BaseModel):
    delivery_id: str
    status: str
    volunteer_name: Optional[str]
    volunteer_phone: Optional[str]
    volunteer_lat: Optional[float]
    volunteer_lon: Optional[float]
    pickup_lat: float
    pickup_lon: float
    dropoff_lat: float
    dropoff_lon: float
    distance_to_pickup_km: float
    estimated_arrival_minutes: int
    seconds_remaining: int
    pickup_deadline: Optional[datetime]
    late_policy_status: str
    is_delayed: bool
    delay_reason: Optional[str]
    is_near_pickup: bool

# ==============================================================================
# 15. In-App Notifications & Lifecycle Messaging (Phase 7)
# ==============================================================================
class NotificationItem(BaseModel):
    id: str
    user_id: Optional[str] = None
    role: str
    event_type: str = Field(..., description="DONATION_CREATED, FOOD_REQUEST_RECEIVED, REQUEST_ACCEPTED, REQUEST_REJECTED, VOLUNTEER_ASSIGNED, VOLUNTEER_APPROACHING, PICKUP_COMPLETED, DELIVERY_DELAYED, FOOD_DELIVERED, DISTRIBUTION_COMPLETED")
    title: str
    message: str
    action_url: Optional[str] = None
    priority: str = "NORMAL" # LOW, NORMAL, HIGH, URGENT
    is_read: bool = False
    timestamp: datetime
    metadata: Dict[str, Any] = {}

class NotificationDispatchCreate(BaseModel):
    role: str
    event_type: str
    title: str
    message: str
    action_url: Optional[str] = None
    user_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = {}

# ==============================================================================
# 16. Food Safety & Security Reporting (Phase 6)
# ==============================================================================
class FoodSecurityReportResponse(BaseModel):
    total_food_listed_servings: int
    total_food_rescued_servings: int
    total_food_distributed_servings: int
    rejected_food_servings: int
    spoiled_food_servings: int
    unclaimed_food_servings: int
    beneficiary_coverage_count: int
    meals_diverted_from_landfill: int
    co2_mitigated_kg: float
    active_partners_count: int
    fssai_compliance_rate_percent: float

class BatchSplittingReconciliationReport(BaseModel):
    listing_id: str
    food_title: str
    total_listed_servings: int
    available_servings: int
    reserved_servings: int
    in_transit_servings: int
    delivered_servings: int
    spoiled_or_cancelled_servings: int
    is_fully_reconciled: bool
    allocations_breakdown: List[Dict[str, Any]]

# ==============================================================================
# 17. Payment Webhook & Admin Pricing Updates (Phase 7)
# ==============================================================================
class SubscriptionWebhookPayload(BaseModel):
    event: str
    payload: Dict[str, Any]
    signature: str

class PlanPriceUpdateRequest(BaseModel):
    plan_code: str
    price_monthly_inr: int
    price_annual_inr: int
    features: Optional[List[str]] = None

# ==============================================================================
# 18. Automatic NGO Escalation & Food Reallocation Engine (Section 4)
# ==============================================================================
class NGOOfferResponse(BaseModel):
    id: str
    listing_id: str
    food_title: str
    donor_name: str
    ngo_id: str
    ngo_name: str
    offered_servings: int
    status: str = Field("OFFERED", description="OFFERED, ACCEPTED, REJECTED, EXPIRED, TIME_EXTENSION_REQUESTED, REALLOCATED")
    offered_at: datetime
    response_deadline: datetime
    seconds_remaining: int
    escalation_level: int = 1
    accepted_servings: Optional[int] = None
    rejection_reason: Optional[str] = None

class OfferRespondRequest(BaseModel):
    offer_id: str
    action: str = Field(..., description="ACCEPT, REJECT, REQUEST_TIME")
    accepted_servings: Optional[int] = None
    rejection_reason: Optional[str] = None
    extension_minutes: Optional[int] = 5

class OfferRespondResponse(BaseModel):
    success: bool
    message: str
    action_taken: str
    offer: NGOOfferResponse
    reallocated_to_next: bool = False
    next_offer: Optional[NGOOfferResponse] = None
    remaining_available_servings: int



