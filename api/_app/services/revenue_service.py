import uuid
from datetime import datetime, timezone, timedelta
from typing import List, Dict
from _app.models.schemas import (
    RevenueAnalyticsResponse,
    UnitEconomicsMetrics,
    EnterpriseInquiryCreate,
    EnterpriseInquiryResponse,
    CSRProgramCreate,
    CSRProgramResponse
)

class RevenueService:
    """
    Revenue Analytics, Unit Economics, Enterprise Inquiry & CSR Tracking Service.
    Distinguishes operational redistribution metrics from B2B SaaS subscription revenue.
    """

    # Stored Enterprise Inquiries
    ENTERPRISE_INQUIRIES: List[EnterpriseInquiryResponse] = [
        EnterpriseInquiryResponse(
            id="inq_101",
            organization_name="ITC Maurya & Fortune Hotels North",
            contact_person="Vikram Mehra (Director of Sustainability)",
            email="vikram.mehra@itchotels.com",
            phone="+91 98111 44556",
            number_of_branches=8,
            estimated_monthly_servings=4500,
            custom_reporting_needed=True,
            multi_city=True,
            csr_sponsor_interest=True,
            notes="Requires ERP batch integration and audited quarterly CSR environmental filing.",
            status="PROPOSAL_SENT",
            created_at=datetime.now(timezone.utc) - timedelta(days=4)
        ),
        EnterpriseInquiryResponse(
            id="inq_102",
            organization_name="Rebel Foods (Faasos & Behrouz Delhi Cluster)",
            contact_person="Ananya Sen (Regional Operations Lead)",
            email="ananya.sen@rebelfoods.com",
            phone="+91 98222 77889",
            number_of_branches=14,
            estimated_monthly_servings=6200,
            custom_reporting_needed=True,
            multi_city=False,
            csr_sponsor_interest=False,
            notes="Needs multi-kitchen consolidated branch performance rankings and automated dispatch.",
            status="NEW",
            created_at=datetime.now(timezone.utc) - timedelta(days=1)
        )
    ]

    # Stored CSR Programs
    CSR_PROGRAMS: List[CSRProgramResponse] = [
        CSRProgramResponse(
            id="csr_201",
            program_name="Project Annapurna — Delhi NCR Urban Hunger Relief",
            sponsor_organization="HDFC Bank Parivartan CSR Initiative",
            implementing_ngo="Akshaya Patra Foundation",
            allocated_budget_inr=1500000, # 15 Lakhs
            disbursed_to_date_inr=620000,
            duration_months=12,
            target_meals_count=60000,
            verified_meals_delivered=24800,
            co2_mitigated_kg=62000.0,
            cities_covered=["New Delhi", "Dwarka", "Janakpuri", "Noida"],
            status="ACTIVE",
            compliance_certified=True,
            created_at=datetime.now(timezone.utc) - timedelta(days=90)
        ),
        CSRProgramResponse(
            id="csr_202",
            program_name="Zero Waste Kitchens & Slum Feeding Drive",
            sponsor_organization="Tata Chemicals CSR Foundation",
            implementing_ngo="Robin Hood Army Delhi",
            allocated_budget_inr=800000,
            disbursed_to_date_inr=450000,
            duration_months=6,
            target_meals_count=32000,
            verified_meals_delivered=18200,
            co2_mitigated_kg=45500.0,
            cities_covered=["West Delhi", "Gurugram"],
            status="ACTIVE",
            compliance_certified=True,
            created_at=datetime.now(timezone.utc) - timedelta(days=45)
        )
    ]

    @classmethod
    def get_revenue_metrics(cls) -> RevenueAnalyticsResponse:
        """
        Calculates MRR, ARR, and monetization health.
        Clearly tags whether live records or demo baseline is utilized.
        """
        # Baseline simulation representing paying restaurant partners
        mrr = 184850 # ₹1,84,850 MRR
        arr = mrr * 12

        return RevenueAnalyticsResponse(
            mrr_inr=mrr,
            arr_inr=arr,
            active_paying_organizations=86,
            total_organizations=240,
            free_customers_count=154,
            paid_customers_count=86,
            plan_breakdown={
                "COMMUNITY_FREE": 154,
                "FOOD_PARTNER_PRO": 62,
                "BUSINESS_PLUS": 19,
                "ENTERPRISE_CSR": 5
            },
            monthly_churn_rate_pct=2.1,
            arpu_inr=2149, # Average Revenue per Paying Account
            outstanding_invoices_inr=12800,
            conversion_rate_pct=8.4,
            revenue_growth_mom_pct=16.8,
            is_demo_data=True
        )

    @classmethod
    def get_unit_economics(cls) -> UnitEconomicsMetrics:
        """
        Unit-economics financial sustainability model.
        """
        return UnitEconomicsMetrics(
            average_revenue_per_paying_org_inr=2149,
            tech_infrastructure_cost_per_org_inr=145, # Cloud hosting, database, CDN
            ai_and_voice_api_cost_per_rescue_inr=1.20, # Gemini + Deepgram per rescue
            logistics_coordination_subsidy_per_rescue_inr=8.50, # Volunteer travel subsidy
            support_cost_per_org_inr=190,
            net_cost_per_rescue_inr=14.20,
            contribution_margin_pct=64.2,
            estimated_monthly_operating_result_inr=68400, # Net operating surplus
            break_even_paying_orgs_count=42, # Platform achieves self-sustainability at 42 paying commercial partners
            is_projection=True,
            projection_disclaimer="Projections derived from Delhi NCR pilot assumptions. Excludes external pass-through grants."
        )

    @classmethod
    def submit_enterprise_inquiry(cls, data: EnterpriseInquiryCreate) -> EnterpriseInquiryResponse:
        inquiry_id = f"inq_{uuid.uuid4().hex[:8]}"
        record = EnterpriseInquiryResponse(
            id=inquiry_id,
            organization_name=data.organization_name,
            contact_person=data.contact_person,
            email=data.email,
            phone=data.phone,
            number_of_branches=data.number_of_branches,
            estimated_monthly_servings=data.estimated_monthly_servings,
            custom_reporting_needed=data.custom_reporting_needed,
            multi_city=data.multi_city,
            csr_sponsor_interest=data.csr_sponsor_interest,
            notes=data.notes,
            status="NEW",
            created_at=datetime.now(timezone.utc)
        )
        cls.ENTERPRISE_INQUIRIES.insert(0, record)
        return record

    @classmethod
    def get_all_enterprise_inquiries(cls) -> List[EnterpriseInquiryResponse]:
        return cls.ENTERPRISE_INQUIRIES

    @classmethod
    def submit_csr_program(cls, data: CSRProgramCreate) -> CSRProgramResponse:
        program_id = f"csr_{uuid.uuid4().hex[:8]}"
        record = CSRProgramResponse(
            id=program_id,
            program_name=data.program_name,
            sponsor_organization=data.sponsor_organization,
            implementing_ngo=data.implementing_ngo,
            allocated_budget_inr=data.allocated_budget_inr,
            disbursed_to_date_inr=0,
            duration_months=data.duration_months,
            target_meals_count=data.target_meals_count,
            verified_meals_delivered=0,
            co2_mitigated_kg=0.0,
            cities_covered=data.cities_covered,
            status="ACTIVE",
            compliance_certified=True,
            created_at=datetime.now(timezone.utc)
        )
        cls.CSR_PROGRAMS.insert(0, record)
        return record

    @classmethod
    def get_all_csr_programs(cls) -> List[CSRProgramResponse]:
        return cls.CSR_PROGRAMS
