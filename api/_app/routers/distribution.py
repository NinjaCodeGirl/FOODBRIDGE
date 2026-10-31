from fastapi import APIRouter, HTTPException, Query, Depends
from typing import List, Optional
from _app.models.schemas import (
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
from _app.services.distribution_service import DistributionService
from _app.security import require_roles

router = APIRouter(prefix="/api/distribution", tags=["Distribution Proof & Impact Verification"])

@router.post("/create-event", response_model=DistributionEventResponse)
def create_distribution_event(payload: DistributionEventCreate):
    """
    Initialize a distribution intake event for an NGO.
    Enforces initial receipt balance in the immutable quantity ledger.
    """
    try:
        return DistributionService.create_distribution_event(payload)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create distribution event: {str(e)}")

@router.post("/record-session", response_model=DistributionEventResponse)
def record_distribution_session(payload: DistributionSessionRecord):
    """
    Record an actual beneficiary serving session.
    Reconciles portions: Distributed + Remaining + Spoiled + Rejected == Received.
    """
    try:
        return DistributionService.record_session(payload)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to record session: {str(e)}")

@router.post("/witness-verify", response_model=DistributionEventResponse)
def witness_verify_event(payload: WitnessVerifyRequest):
    """
    Independent 3rd-party community/auditor witness verification.
    Enforces anti-self-witnessing rule (NGO cannot witness itself).
    """
    try:
        return DistributionService.verify_witness(payload)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Witness verification failed: {str(e)}")

@router.post("/admin-audit", response_model=DistributionEventResponse)
def admin_audit_event(payload: AdminAuditRequest, current_user: dict = Depends(require_roles(["ADMIN"]))):
    """
    Platform Governance & Compliance audit decision (VERIFIED, REJECTED, DISPUTED).
    Requires authenticated user with server-verified role: ADMIN.
    """
    try:
        return DistributionService.admin_audit(payload)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Admin audit failed: {str(e)}")

@router.get("/events", response_model=List[DistributionEventResponse])
def get_distribution_events(ngo_id: Optional[str] = Query(None, description="Optional NGO ID to filter by")):
    """
    List distribution events, optionally filtered by NGO.
    """
    return DistributionService.get_events(ngo_id=ngo_id)

@router.get("/audit-summary", response_model=DistributionAuditSummaryResponse)
def get_distribution_audit_summary():
    """
    Aggregated compliance metrics for Admin governance.
    """
    return DistributionService.get_audit_summary()

@router.get("/timeline/{donation_id}", response_model=List[TrustChainEventResponse])
def get_donation_timeline(donation_id: str):
    """
    Retrieve full 8-stage TrustChain audit timeline for a donation.
    """
    return DistributionService.get_timeline(donation_id=donation_id)

@router.post("/timeline/append", response_model=TrustChainEventResponse)
def append_timeline_event(payload: TrustChainEventCreate):
    """
    Append an immutable TrustChain event record to the timeline.
    """
    return DistributionService.append_timeline_event(payload)

@router.get("/ledger/{donation_id}", response_model=List[QuantityLedgerItem])
def get_quantity_ledger(donation_id: str):
    """
    Retrieve immutable quantity reconciliation ledger transactions for a donation.
    """
    return DistributionService.get_quantity_ledger(donation_id=donation_id)

