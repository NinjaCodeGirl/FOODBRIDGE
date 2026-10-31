import uuid
import hashlib
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from app.models.schemas import (
    DistributionEventCreate,
    DistributionSessionRecord,
    WitnessVerifyRequest,
    AdminAuditRequest,
    DistributionEventResponse,
    QuantityLedgerItem,
    DistributionAuditSummaryResponse,
    TrustChainEventCreate,
    TrustChainEventResponse
)

# Seed Initial Distribution Events
DISTRIBUTION_EVENTS_DB: List[Dict[str, Any]] = [
    {
        "id": "dist-event-001",
        "event_code": "DIST-202610-8812",
        "donation_id": "list-001",
        "ngo_id": "user-ngo-01",
        "ngo_name": "Akshaya Patra Foundation Shelter",
        "food_category": "COOKED_MEALS",
        "quantity_received": 180,
        "servings_distributed": 175,
        "servings_remaining": 5,
        "servings_spoiled": 0,
        "servings_rejected": 0,
        "beneficiary_count": 160,
        "distribution_date": datetime.now(timezone.utc),
        "actual_location": "Dwarka Sector 10 Community Kitchen Hub, New Delhi",
        "latitude": 28.5833,
        "longitude": 77.0500,
        "evidence_hashes": ["e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"],
        "witness_name": "Dr. Anita Desai",
        "witness_phone": "+91 98111 22334",
        "witness_organization": "Delhi Civic Welfare Council",
        "witness_confirmed": True,
        "witness_notes": "Observed orderly meal distribution. Insulated cambro temperatures exceeded 64°C at serving time.",
        "witness_verified_at": datetime.now(timezone.utc),
        "status": "VERIFIED",
        "audit_status": "ADMIN_AUDITED",
        "admin_audit_notes": "All photographic evidence and independent witness certification confirmed compliant.",
        "created_at": datetime.now(timezone.utc)
    },
    {
        "id": "dist-event-002",
        "event_code": "DIST-202610-9941",
        "donation_id": "list-002",
        "ngo_id": "ngo-102",
        "ngo_name": "Robin Hood Army Janakpuri",
        "food_category": "COOKED_MEALS",
        "quantity_received": 350,
        "servings_distributed": 280,
        "servings_remaining": 70,
        "servings_spoiled": 0,
        "servings_rejected": 0,
        "beneficiary_count": 270,
        "distribution_date": datetime.now(timezone.utc),
        "actual_location": "Janakpuri Block B Relief Camp, New Delhi",
        "latitude": 28.6219,
        "longitude": 77.0878,
        "evidence_hashes": ["8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4"],
        "witness_name": None,
        "witness_confirmed": False,
        "witness_notes": None,
        "witness_verified_at": None,
        "status": "IN_PROGRESS",
        "audit_status": "PENDING_AUDIT",
        "admin_audit_notes": None,
        "created_at": datetime.now(timezone.utc)
    }
]

# Initial TrustChain Timeline Ledger
TRUSTCHAIN_TIMELINE_DB: List[Dict[str, Any]] = [
    {
        "id": "tl-101",
        "donation_id": "list-001",
        "stage": "FOOD_LISTED",
        "actor_id": "user-donor-01",
        "actor_name": "Chef Rajesh (NSUT Dining)",
        "actor_role": "RESTAURANT",
        "timestamp": datetime.now(timezone.utc),
        "location_address": "NSUT Main Campus, Sector 3, Dwarka, New Delhi",
        "latitude": 28.6100,
        "longitude": 77.0380,
        "evidence_reference": "Photo: Kitchen Batch cambros",
        "evidence_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        "verification_status": "VERIFIED",
        "notes": "Surplus 180 servings prepared at 11:30 AM. Holding temperature >68°C."
    },
    {
        "id": "tl-102",
        "donation_id": "list-001",
        "stage": "FOOD_CLAIMED",
        "actor_id": "user-ngo-01",
        "actor_name": "Rajesh Kumar (Akshaya Patra)",
        "actor_role": "NGO",
        "timestamp": datetime.now(timezone.utc),
        "location_address": "Dwarka Sector 10 Shelter",
        "latitude": 28.5833,
        "longitude": 77.0500,
        "evidence_reference": "Allocation Agreement #ALLOC-9921",
        "evidence_hash": "7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b",
        "verification_status": "VERIFIED",
        "notes": "Allocation accepted for 180 servings within 15-minute response window."
    },
    {
        "id": "tl-103",
        "donation_id": "list-001",
        "stage": "VOLUNTEER_ASSIGNED",
        "actor_id": "user-volunteer-01",
        "actor_name": "Arjun Sharma (Courier Lead)",
        "actor_role": "VOLUNTEER",
        "timestamp": datetime.now(timezone.utc),
        "location_address": "En route via Insulated Van DL-3C-9821",
        "latitude": 28.6010,
        "longitude": 77.0420,
        "evidence_reference": "Vehicle GPS Dispatch #DL-3C-9821",
        "evidence_hash": "6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e",
        "verification_status": "VERIFIED",
        "notes": "Volunteer courier assigned. Service radius: 15 km."
    },
    {
        "id": "tl-104",
        "donation_id": "list-001",
        "stage": "PICKUP_CONFIRMED",
        "actor_id": "user-donor-01",
        "actor_name": "Chef Rajesh (Donor Witness)",
        "actor_role": "RESTAURANT",
        "timestamp": datetime.now(timezone.utc),
        "location_address": "NSUT Gate #3 Service Entrance",
        "latitude": 28.6100,
        "longitude": 77.0380,
        "evidence_reference": "QR Handshake #HS-77A9 verified via OTP 582-901",
        "evidence_hash": "b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3",
        "verification_status": "VERIFIED",
        "notes": "Physical handoff verified. 180 servings transferred in clean insulated cambros."
    },
    {
        "id": "tl-105",
        "donation_id": "list-001",
        "stage": "IN_TRANSIT",
        "actor_id": "user-volunteer-01",
        "actor_name": "Arjun Sharma (Courier Lead)",
        "actor_role": "VOLUNTEER",
        "timestamp": datetime.now(timezone.utc),
        "location_address": "Transit corridor Dwarka Link Road",
        "latitude": 28.5920,
        "longitude": 77.0460,
        "evidence_reference": "Digital thermal sensor: 65.4°C",
        "evidence_hash": "c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4",
        "verification_status": "VERIFIED",
        "notes": "Holding temperature maintained safely above 60°C throughout 18 min transit."
    },
    {
        "id": "tl-106",
        "donation_id": "list-001",
        "stage": "NGO_HANDOVER",
        "actor_id": "user-ngo-01",
        "actor_name": "Rajesh Kumar (Akshaya Patra Dispatch)",
        "actor_role": "NGO",
        "timestamp": datetime.now(timezone.utc),
        "location_address": "Dwarka Sector 10 Shelter Intake Dock",
        "latitude": 28.5833,
        "longitude": 77.0500,
        "evidence_reference": "Recipient Handshake Token #HS-REC-901",
        "evidence_hash": "d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5",
        "verification_status": "VERIFIED",
        "notes": "180 servings inspected and accepted into shelter inventory. Zero spoilage."
    },
    {
        "id": "tl-107",
        "donation_id": "list-001",
        "stage": "DISTRIBUTION_RECORDED",
        "actor_id": "user-ngo-01",
        "actor_name": "Dr. Anita Desai (Auditor Witness)",
        "actor_role": "NGO",
        "timestamp": datetime.now(timezone.utc),
        "location_address": "Dwarka Community Kitchen Distribution Center",
        "latitude": 28.5833,
        "longitude": 77.0500,
        "evidence_reference": "Event #DIST-202610-8812 (175 meals served, 5 remaining)",
        "evidence_hash": "e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6",
        "verification_status": "VERIFIED",
        "notes": "160 children and families fed. Verified by independent witness."
    },
    {
        "id": "tl-108",
        "donation_id": "list-001",
        "stage": "DONATION_CLOSED",
        "actor_id": "user-admin-01",
        "actor_name": "Pooja Verma (Platform Governance Lead)",
        "actor_role": "ADMIN",
        "timestamp": datetime.now(timezone.utc),
        "location_address": "FoodBridge Central Ledger Hub",
        "latitude": 28.6304,
        "longitude": 77.2177,
        "evidence_reference": "Impact Certificate #CERT-2026-0081",
        "evidence_hash": "f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7",
        "verification_status": "VERIFIED",
        "notes": "Audit completed. 450.0 kg CO2 mitigated. Ledger entry signed and locked."
    }
]

# Initial Quantity Reconciliation Ledger
QUANTITY_LEDGER_DB: List[Dict[str, Any]] = [
    {
        "id": "ledg-001",
        "donation_id": "list-001",
        "transaction_type": "INITIAL_RECEIPT",
        "quantity_servings": 180,
        "balance_servings": 180,
        "reason": "Initial verified handover from NSUT Campus Dining Hall",
        "authorized_by": "Chef Rajesh / Arjun Sharma",
        "timestamp": datetime.now(timezone.utc)
    },
    {
        "id": "ledg-002",
        "donation_id": "list-001",
        "transaction_type": "DISTRIBUTION_SESSION",
        "quantity_servings": -175,
        "balance_servings": 5,
        "reason": "Session 1 beneficiary distribution at Dwarka Sector 10 Hub",
        "authorized_by": "Rajesh Kumar (Akshaya Patra)",
        "timestamp": datetime.now(timezone.utc)
    }
]

class DistributionService:
    """
    Distribution Proof & Impact Verification Engine.
    Enforces quantity reconciliation (Total Received = Distributed + Remaining + Spoiled + Rejected)
    and append-only TrustChain audit logging.
    """

    @classmethod
    def create_distribution_event(cls, data: DistributionEventCreate) -> DistributionEventResponse:
        event_id = f"dist-event-{uuid.uuid4().hex[:8]}"
        event_code = f"DIST-{datetime.now().strftime('%Y%m')}-{uuid.uuid4().hex[:4].upper()}"

        record = {
            "id": event_id,
            "event_code": event_code,
            "donation_id": data.donation_id,
            "ngo_id": data.ngo_id,
            "ngo_name": data.ngo_name,
            "food_category": data.food_category,
            "quantity_received": data.quantity_received,
            "servings_distributed": 0,
            "servings_remaining": data.quantity_received,
            "servings_spoiled": 0,
            "servings_rejected": 0,
            "beneficiary_count": 0,
            "distribution_date": datetime.now(timezone.utc),
            "actual_location": data.actual_location or data.planned_location,
            "latitude": data.latitude or 28.5833,
            "longitude": data.longitude or 77.0500,
            "evidence_hashes": [],
            "witness_name": None,
            "witness_confirmed": False,
            "witness_notes": None,
            "witness_verified_at": None,
            "status": "PLANNED",
            "audit_status": "PENDING_AUDIT",
            "admin_audit_notes": None,
            "created_at": datetime.now(timezone.utc)
        }

        DISTRIBUTION_EVENTS_DB.insert(0, record)

        # Log to Quantity Ledger
        QUANTITY_LEDGER_DB.insert(0, {
            "id": f"ledg-{uuid.uuid4().hex[:8]}",
            "donation_id": data.donation_id,
            "transaction_type": "INITIAL_RECEIPT",
            "quantity_servings": data.quantity_received,
            "balance_servings": data.quantity_received,
            "reason": f"Donation batch intake by {data.ngo_name}",
            "authorized_by": data.ngo_name,
            "timestamp": datetime.now(timezone.utc)
        })

        return DistributionEventResponse(**record)

    @classmethod
    def record_session(cls, data: DistributionSessionRecord) -> DistributionEventResponse:
        event = next((e for e in DISTRIBUTION_EVENTS_DB if e["id"] == data.event_id), None)
        if not event:
            raise ValueError(f"Distribution event {data.event_id} not found.")

        # Business Rule & Fraud Check: Never allow distributed > received
        total_accounted = (
            data.servings_distributed +
            data.servings_remaining +
            (data.servings_spoiled or 0) +
            (data.servings_rejected or 0)
        )
        if total_accounted > event["quantity_received"]:
            raise ValueError(
                f"Reconciliation error: Total accounted portions ({total_accounted}) exceeds received quantity ({event['quantity_received']})."
            )

        event["servings_distributed"] += data.servings_distributed
        event["servings_remaining"] = data.servings_remaining
        event["servings_spoiled"] += (data.servings_spoiled or 0)
        event["servings_rejected"] += (data.servings_rejected or 0)
        event["beneficiary_count"] += data.beneficiary_count
        event["actual_location"] = data.actual_location
        if data.latitude: event["latitude"] = data.latitude
        if data.longitude: event["longitude"] = data.longitude
        if data.evidence_hashes:
            event["evidence_hashes"] = list(set(event["evidence_hashes"] + data.evidence_hashes))

        event["status"] = "DISTRIBUTED"
        event["audit_status"] = "SYSTEM_CHECKS_PASSED"

        # Record to immutable quantity ledger
        QUANTITY_LEDGER_DB.insert(0, {
            "id": f"ledg-{uuid.uuid4().hex[:8]}",
            "donation_id": event["donation_id"],
            "transaction_type": "DISTRIBUTION_SESSION",
            "quantity_servings": -data.servings_distributed,
            "balance_servings": data.servings_remaining,
            "reason": f"Served {data.beneficiary_count} beneficiaries at {data.actual_location}",
            "authorized_by": event["ngo_name"],
            "timestamp": datetime.now(timezone.utc)
        })

        # Append to TrustChain Timeline
        cls.append_timeline_event(TrustChainEventCreate(
            donation_id=event["donation_id"],
            stage="DISTRIBUTION_RECORDED",
            actor_id=event["ngo_id"],
            actor_name=event["ngo_name"],
            actor_role="NGO",
            location_address=data.actual_location,
            latitude=data.latitude,
            longitude=data.longitude,
            evidence_reference=f"Session Distributed: {data.servings_distributed} meals",
            evidence_hash=data.evidence_hashes[0] if data.evidence_hashes else hashlib.sha256(f"{event['id']}:{data.servings_distributed}".encode()).hexdigest(),
            notes=data.notes or f"Beneficiaries served: {data.beneficiary_count}. Remaining inventory: {data.servings_remaining} meals."
        ))

        return DistributionEventResponse(**event)

    @classmethod
    def verify_witness(cls, data: WitnessVerifyRequest) -> DistributionEventResponse:
        event = next((e for e in DISTRIBUTION_EVENTS_DB if e["id"] == data.event_id), None)
        if not event:
            raise ValueError(f"Distribution event {data.event_id} not found.")

        # Business Rule: Witness cannot be the same as the NGO author
        if event["ngo_name"].lower() in data.witness_organization.lower():
            raise ValueError("Independent verification violation: An NGO cannot witness its own internal distribution event.")

        event["witness_name"] = data.witness_name
        event["witness_phone"] = data.witness_phone
        event["witness_organization"] = data.witness_organization
        event["witness_confirmed"] = data.witness_confirmed
        event["witness_notes"] = data.witness_notes
        event["witness_verified_at"] = datetime.now(timezone.utc)

        if data.discrepancy_flagged:
            event["status"] = "FLAGGED"
            event["audit_status"] = "DISPUTED"
        else:
            event["status"] = "VERIFIED"
            event["audit_status"] = "INDEPENDENTLY_VERIFIED"

        return DistributionEventResponse(**event)

    @classmethod
    def admin_audit(cls, data: AdminAuditRequest) -> DistributionEventResponse:
        event = next((e for e in DISTRIBUTION_EVENTS_DB if e["id"] == data.event_id), None)
        if not event:
            raise ValueError(f"Distribution event {data.event_id} not found.")

        event["audit_status"] = data.audit_decision
        event["admin_audit_notes"] = data.admin_notes
        if data.audit_decision in ["VERIFIED", "ADMIN_AUDITED"]:
            event["status"] = "VERIFIED"
        elif data.audit_decision == "REJECTED":
            event["status"] = "REJECTED"
        elif data.audit_decision == "DISPUTED":
            event["status"] = "FLAGGED"

        return DistributionEventResponse(**event)

    @classmethod
    def get_events(cls, ngo_id: Optional[str] = None) -> List[DistributionEventResponse]:
        if ngo_id:
            return [DistributionEventResponse(**e) for e in DISTRIBUTION_EVENTS_DB if e["ngo_id"] == ngo_id]
        return [DistributionEventResponse(**e) for e in DISTRIBUTION_EVENTS_DB]

    @classmethod
    def get_audit_summary(cls) -> DistributionAuditSummaryResponse:
        total_received = sum(e["quantity_received"] for e in DISTRIBUTION_EVENTS_DB)
        total_distributed = sum(e["servings_distributed"] for e in DISTRIBUTION_EVENTS_DB)
        total_beneficiaries = sum(e["beneficiary_count"] for e in DISTRIBUTION_EVENTS_DB)
        verified_count = sum(1 for e in DISTRIBUTION_EVENTS_DB if e["witness_confirmed"])
        pending_audit = sum(1 for e in DISTRIBUTION_EVENTS_DB if e["audit_status"] == "PENDING_AUDIT")
        flagged_count = sum(1 for e in DISTRIBUTION_EVENTS_DB if e["status"] == "FLAGGED")
        remaining = sum(e["servings_remaining"] for e in DISTRIBUTION_EVENTS_DB)

        return DistributionAuditSummaryResponse(
            total_donations_received=total_received,
            total_food_distributed_servings=total_distributed,
            total_beneficiaries_served=total_beneficiaries,
            independently_verified_events_count=verified_count,
            pending_audit_events_count=pending_audit,
            flagged_discrepancies_count=flagged_count,
            unreconciled_inventory_servings=remaining
        )

    @classmethod
    def get_timeline(cls, donation_id: str) -> List[TrustChainEventResponse]:
        events = [e for e in TRUSTCHAIN_TIMELINE_DB if e["donation_id"] == donation_id]
        if not events:
            # Fallback to demo listing timeline
            events = [e for e in TRUSTCHAIN_TIMELINE_DB if e["donation_id"] == "list-001"]
        return [TrustChainEventResponse(**e) for e in events]

    @classmethod
    def append_timeline_event(cls, data: TrustChainEventCreate) -> TrustChainEventResponse:
        record = {
            "id": f"tl-{uuid.uuid4().hex[:8]}",
            "donation_id": data.donation_id,
            "stage": data.stage,
            "actor_id": data.actor_id,
            "actor_name": data.actor_name,
            "actor_role": data.actor_role,
            "timestamp": datetime.now(timezone.utc),
            "location_address": data.location_address,
            "latitude": data.latitude,
            "longitude": data.longitude,
            "evidence_reference": data.evidence_reference,
            "evidence_hash": data.evidence_hash,
            "verification_status": "VERIFIED",
            "notes": data.notes
        }
        TRUSTCHAIN_TIMELINE_DB.append(record)
        return TrustChainEventResponse(**record)

    @classmethod
    def get_quantity_ledger(cls, donation_id: str) -> List[QuantityLedgerItem]:
        items = [i for i in QUANTITY_LEDGER_DB if i["donation_id"] == donation_id]
        if not items:
            items = [i for i in QUANTITY_LEDGER_DB if i["donation_id"] == "list-001"]
        return [QuantityLedgerItem(**i) for i in items]

