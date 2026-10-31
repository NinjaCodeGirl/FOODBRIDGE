from fastapi import APIRouter, HTTPException
from typing import List
from _app.models.schemas import (
    RevenueAnalyticsResponse,
    UnitEconomicsMetrics,
    EnterpriseInquiryCreate,
    EnterpriseInquiryResponse,
    CSRProgramCreate,
    CSRProgramResponse
)
from _app.services.revenue_service import RevenueService

router = APIRouter(prefix="/api/revenue", tags=["Revenue Analytics & Financial Sustainability"])

@router.get("/metrics", response_model=RevenueAnalyticsResponse)
def get_revenue_analytics():
    """
    Returns platform MRR, ARR, active paying partners, and revenue breakdown.
    """
    return RevenueService.get_revenue_metrics()

@router.get("/unit-economics", response_model=UnitEconomicsMetrics)
def get_unit_economics_dashboard():
    """
    Returns internal financial sustainability, cost per rescue, contribution margins, and break-even thresholds.
    """
    return RevenueService.get_unit_economics()

@router.post("/enterprise-inquiry", response_model=EnterpriseInquiryResponse)
def submit_enterprise_inquiry(payload: EnterpriseInquiryCreate):
    """
    Receives and stores an enterprise or multi-branch quotation inquiry.
    """
    return RevenueService.submit_enterprise_inquiry(payload)

@router.get("/enterprise-inquiries", response_model=List[EnterpriseInquiryResponse])
def get_enterprise_inquiries():
    """
    Admin-only endpoint listing all enterprise demo and quote inquiries.
    """
    return RevenueService.get_all_enterprise_inquiries()

@router.post("/csr-programs", response_model=CSRProgramResponse)
def create_csr_program(payload: CSRProgramCreate):
    """
    Registers a new sponsored corporate CSR hunger relief grant.
    """
    return RevenueService.submit_csr_program(payload)

@router.get("/csr-programs", response_model=List[CSRProgramResponse])
def get_csr_programs():
    """
    Lists all active CSR-supported redistribution programs.
    """
    return RevenueService.get_all_csr_programs()
