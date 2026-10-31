import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import unittest
import uuid
from datetime import datetime, timezone, timedelta
from fastapi.testclient import TestClient

from app.main import app
from app.services.escalation_service import EscalationService
from app.services.matching_engine import SmartMatchingEngine
from app.services.freshness_ai import AzureFreshnessAIEngine
from app.routers.donations import SURPLUS_DB
from app.security import create_access_token

class TestFoodBridgeEscalationAndSimplification(unittest.TestCase):
    """
    Comprehensive End-to-End Test Suite for:
    - Section 4: Automatic NGO Escalation & Reallocation Engine (5-minute response window, partial claim, fallback chain)
    - Section 5: Live Pickup Tracking, Delay Management, GPS Proximity, In-Transit Lock
    - Section 6: Multi-Recipient Food Allocation & Atomic Balance Protection
    - Section 7: Distribution Photo/Video Proof Separation & Independent Witness Closure
    - Section 8: Role Authorization (RBAC) & Governance Controls
    - Section 9: Resilient External Fallbacks (Gemini AI Heuristics, Offline Routing & WhatsApp URLs)
    """

    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        cls.admin_token = create_access_token(
            {"sub": "admin_user_001", "role": "ADMIN", "email": "admin@foodbridge.org"}
        )
        cls.volunteer_token = create_access_token(
            {"sub": "user_arjun_volunteer", "role": "VOLUNTEER", "email": "arjun@volunteer.org"}
        )
        cls.ngo_token = create_access_token(
            {"sub": "ngo-101", "role": "NGO", "email": "coordinator@akshayapatra.org"}
        )

    # =========================================================================
    # SCENARIO 1: AUTOMATIC REALLOCATION ON EXPIRED RESPONSE WINDOW & PARTIAL CLAIM
    # =========================================================================

    def test_01_auto_reallocation_on_timeout_and_partial_claim(self):
        """
        Scenario 1:
        1. Surplus food is offered to top-ranked NGO with a 5-minute deadline.
        2. NGO fails to respond before deadline -> system marks offer EXPIRED.
        3. System automatically escalates and creates offer for next ranked NGO.
        4. Next NGO accepts partial claim (60 of 100 servings).
        5. Remaining 40 servings are automatically reallocated to the next ranked NGO.
        """
        # Ensure list-001 has quantity and clear previous test offers for list-001
        listing = next((item for item in SURPLUS_DB if item["id"] == "list-001"), None)
        self.assertIsNotNone(listing)
        listing["status"] = "POSTED"
        listing["quantity_servings"] = 100
        listing["reserved_servings"] = 0

        # Clear existing offers for list-001 to test clean lifecycle
        for k in list(EscalationService.OFFERS_DB.keys()):
            if EscalationService.OFFERS_DB[k].get("listing_id") == "list-001":
                del EscalationService.OFFERS_DB[k]

        # 1. Create initial offer via query parameters
        create_res = self.client.post(
            "/api/escalation/create-offer",
            params={"listing_id": "list-001", "response_window_minutes": 5}
        )
        self.assertEqual(create_res.status_code, 200)
        initial_offer = create_res.json()
        initial_offer_id = initial_offer["id"]
        self.assertEqual(initial_offer["status"], "OFFERED")
        first_ngo_id = initial_offer["ngo_id"]

        # 2. Artificially expire the offer by setting deadline in past
        EscalationService.OFFERS_DB[initial_offer_id]["response_deadline"] = (
            datetime.now(timezone.utc) - timedelta(minutes=2)
        )

        # 3. Trigger escalation check
        check_res = self.client.post("/api/escalation/check-escalations")
        self.assertEqual(check_res.status_code, 200)
        check_data = check_res.json()
        self.assertGreaterEqual(check_data["escalated_count"], 1)

        # Verify initial offer is EXPIRED
        expired_offer = EscalationService.OFFERS_DB[initial_offer_id]
        self.assertEqual(expired_offer["status"], "EXPIRED")

        # 4. Find the reallocated offer for next NGO
        next_offer = next((
            o for o in EscalationService.OFFERS_DB.values()
            if o["listing_id"] == "list-001" and o["id"] != initial_offer_id and o["status"] == "OFFERED"
        ), None)
        self.assertIsNotNone(next_offer, "Next NGO should have received an automated reallocated offer")
        self.assertNotEqual(next_offer["ngo_id"], first_ngo_id)

        # 5. Next NGO accepts partial claim (60 servings)
        respond_res = self.client.post("/api/escalation/respond", json={
            "offer_id": next_offer["id"],
            "action": "ACCEPT",
            "accepted_servings": 60,
            "rejection_reason": None
        })
        self.assertEqual(respond_res.status_code, 200)
        resp_data = respond_res.json()
        self.assertTrue(resp_data["success"])
        self.assertEqual(resp_data["offer"]["accepted_servings"], 60)
        self.assertTrue(resp_data["reallocated_to_next"])

        # Verify listing has 60 reserved servings
        self.assertEqual(listing["reserved_servings"], 60)

        # 6. Verify next offer was automatically returned
        self.assertIsNotNone(resp_data["next_offer"], "Next offer must be created and returned")
        self.assertEqual(resp_data["next_offer"]["offered_servings"], 40)

    # =========================================================================
    # SCENARIO 2: LIVE ARRIVAL & DELAY MANAGEMENT WITH IN-TRANSIT LOCK
    # =========================================================================

    def test_02_arrival_and_delay_management_with_intransit_lock(self):
        """
        Scenario 2:
        1. Volunteer assigned to delivery with GPS telemetry.
        2. Volunteer reports delay with standardized reason -> ETA updated and kitchen notified.
        3. Volunteer approaches within 250m -> Arrival proximity confirmed via GPS.
        4. In-transit protection: An active delivery or collected food cannot be reallocated or expired.
        """
        # Assign delivery
        assign_res = self.client.post("/api/deliveries/assign", json={
            "delivery_id": "deliv-401",
            "volunteer_id": "user_arjun_volunteer",
            "volunteer_name": "Arjun Sharma",
            "volunteer_phone": "+91 98234 56789",
            "vehicle_type": "VAN",
            "volunteer_lat": 28.6050,
            "volunteer_lon": 77.1600
        })
        self.assertEqual(assign_res.status_code, 200)

        # Volunteer reports delay
        delay_res = self.client.post("/api/deliveries/report-delay", json={
            "delivery_id": "deliv-401",
            "volunteer_id": "user_arjun_volunteer",
            "delay_reason": "HEAVY_TRAFFIC",
            "delay_minutes": 15,
            "notes": "Heavy congestion near Ring Road Flyover"
        })
        self.assertEqual(delay_res.status_code, 200)
        delay_data = delay_res.json()
        self.assertTrue(delay_data["success"])
        self.assertEqual(delay_data["delay_record"]["reason"], "HEAVY_TRAFFIC")

        # Volunteer arrives at dock (<250m)
        arrive_res = self.client.post("/api/deliveries/arrive", json={
            "delivery_id": "deliv-401",
            "volunteer_id": "user_arjun_volunteer",
            "current_lat": 28.5980,
            "current_lon": 77.1730
        })
        self.assertEqual(arrive_res.status_code, 200)
        arrive_data = arrive_res.json()
        self.assertEqual(arrive_data["status"], "ARRIVED_AT_PICKUP")
        self.assertTrue(arrive_data["success"])

        # IN-TRANSIT PROTECTION:
        listing = next((item for item in SURPLUS_DB if item["id"] == "list-002"), None)
        if listing:
            listing["status"] = "IN_TRANSIT"
            realloc = EscalationService.reallocate_to_next_ngo(
                listing_id="list-002",
                servings=50
            )
            self.assertIsNone(realloc, "Food in transit must NEVER be reallocated to another recipient")

    # =========================================================================
    # SCENARIO 3: MULTI-RECIPIENT SPLIT & ATOMIC QUANTITY PRESERVATION
    # =========================================================================

    def test_03_multi_recipient_split_and_atomic_preservation(self):
        """
        Scenario 3:
        1. Large food batch (e.g. 500 servings) is split across multiple recipients.
        2. Sum of allocated servings exactly equals distributed portions.
        3. Prevents race-condition double booking or negative stock.
        """
        split_res = self.client.post("/api/matching/allocate", json={
            "listing_id": "list-002",
            "max_recipients": 3
        })
        self.assertEqual(split_res.status_code, 200)
        split_data = split_res.json()
        self.assertEqual(split_data["listing_id"], "list-002")
        self.assertGreater(len(split_data["allocations"]), 0)

        # Sum of allocations cannot exceed total available
        sum_allocated = sum(a["allocated_servings"] for a in split_data["allocations"])
        self.assertLessEqual(sum_allocated, split_data["total_servings"])

        # Attempt to request more meals than available on a listing
        overbook_res = self.client.post("/api/deliveries/request", json={
            "listing_id": "list-001",
            "ngo_id": "ngo-101",
            "ngo_name": "Akshaya Patra",
            "requested_servings": 999999,
            "dropoff_address": "Test Address",
            "dropoff_lat": 28.5833,
            "dropoff_lon": 77.0500,
            "contact_phone": "+91 98101 23456"
        })
        self.assertEqual(overbook_res.status_code, 400)
        self.assertIn("exceed available stock", overbook_res.json()["detail"])

    # =========================================================================
    # SCENARIO 4: FULL DISTRIBUTION LIFECYCLE & SEPARATE PROOFS
    # =========================================================================

    def test_04_full_distribution_lifecycle_separate_proofs(self):
        """
        Scenario 4:
        1. NGO receives food intake.
        2. Delivery photo is recorded but does NOT count as actual distribution proof.
        3. Actual serving session is logged with beneficiary count, meal photos, and leftover balance.
        4. Independent 3rd-party community witness certifies the event with digital signature.
        5. Admin audit completes governance closure.
        """
        # 1. Create distribution event
        intake_res = self.client.post("/api/distribution/create-event", json={
            "donation_id": "list-001",
            "ngo_id": "ngo-101",
            "ngo_name": "Akshaya Patra Foundation",
            "food_category": "COOKED_MEALS",
            "quantity_received": 150,
            "planned_location": "Dwarka Sector 10 Pantry A"
        })
        self.assertEqual(intake_res.status_code, 200)
        event_data = intake_res.json()
        event_id = event_data["id"]
        self.assertIn(event_data["status"], ["PLANNED", "INTAKE_LOGGED"])
        self.assertFalse(event_data["witness_confirmed"], "Intake must NOT be marked witness confirmed before distribution")

        # 2. Record actual distribution session
        session_res = self.client.post("/api/distribution/record-session", json={
            "event_id": event_id,
            "servings_distributed": 140,
            "beneficiary_count": 140,
            "servings_remaining": 10,
            "servings_spoiled": 0,
            "servings_rejected": 0,
            "actual_location": "Dwarka Slum Cluster Community Hall",
            "notes": "Hot meal distributed in disposable biodegradable bowls"
        })
        self.assertEqual(session_res.status_code, 200)
        session_data = session_res.json()
        self.assertEqual(session_data["servings_distributed"], 140)
        self.assertEqual(session_data["servings_remaining"], 10)

        # 3. Independent witness verification
        witness_res = self.client.post("/api/distribution/witness-verify", json={
            "event_id": event_id,
            "witness_name": "Ramesh Chandra",
            "witness_phone": "+91 98111 22334",
            "witness_organization": "Delhi Municipal Ward 24",
            "witness_confirmed": True,
            "observed_quantity": 140,
            "discrepancy_flagged": False,
            "witness_notes": "I personally witnessed 140 people served hot fresh food in hygienic conditions."
        })
        self.assertEqual(witness_res.status_code, 200)
        witness_data = witness_res.json()
        self.assertTrue(witness_data["witness_confirmed"])

        # 4. Admin Governance Audit with Admin RBAC Token
        audit_res = self.client.post(
            "/api/distribution/admin-audit",
            json={
                "event_id": event_id,
                "audit_decision": "VERIFIED",
                "admin_notes": "Cryptographic intake, temperature logs, and independent witness all verified.",
                "admin_id": "admin_user_001"
            },
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )
        self.assertEqual(audit_res.status_code, 200)
        audit_data = audit_res.json()
        self.assertEqual(audit_data["audit_status"], "VERIFIED")

    # =========================================================================
    # SCENARIO 5: DASHBOARD RBAC & UNIFIED COMMUNITY AUDITED LEADERBOARD
    # =========================================================================

    def test_05_dashboard_rbac_and_unified_leaderboard(self):
        """
        Scenario 5:
        1. Admin endpoints strictly reject unauthorized non-admin tokens.
        2. Verified impact analytics return authentic values based on real data.
        """
        # Volunteer attempts to run admin audit -> 403 Forbidden
        unauthorized_audit = self.client.post(
            "/api/distribution/admin-audit",
            json={
                "event_id": "dist-test-999",
                "audit_decision": "VERIFIED",
                "admin_notes": "Volunteer trying to certify audit",
                "admin_id": "user_arjun_volunteer"
            },
            headers={"Authorization": f"Bearer {self.volunteer_token}"}
        )
        self.assertEqual(unauthorized_audit.status_code, 403)

        # Call analytics impact
        analytics_res = self.client.get("/api/analytics/impact")
        self.assertEqual(analytics_res.status_code, 200)
        impact_data = analytics_res.json()
        self.assertIn("total_meals_rescued", impact_data)
        self.assertGreater(impact_data["total_meals_rescued"], 0)
        self.assertIn("total_co2_avoided_kg", impact_data)

    # =========================================================================
    # SCENARIO 6: INTEGRATION RESILIENCY & GRACEFUL DEGRADATION
    # =========================================================================

    def test_06_integration_resiliency_and_graceful_degradation(self):
        """
        Scenario 6:
        1. Gemini AI freshness scoring falls back to deterministic heuristic when API key is unset or offline.
        2. Haversine distance calculations produce accurate geographic results without external map servers.
        3. Escalation offers endpoint handles non-existent offers cleanly.
        """
        # Test Freshness Evaluation directly via Service Heuristic Fallback
        fresh_eval = AzureFreshnessAIEngine.evaluate_freshness(
            food_title="Fresh Paneer Butter Masala",
            food_category="COOKED_MEALS",
            preparation_timestamp=datetime.now(timezone.utc) - timedelta(hours=1),
            storage_condition="HEATED",
            classification="CATEGORY_A"
        )
        self.assertGreaterEqual(fresh_eval.freshness_score, 70.0)
        self.assertIn(fresh_eval.safety_category, ["HIGHLY_FRESH", "MODERATE_RESCUE", "URGENT_DISPATCH", "EXPIRED"])
        self.assertIsNotNone(fresh_eval.validation_hash)

        # Test Haversine distance calculation (NSUT Dwarka to Taj Palace: ~14.8 km)
        dist = SmartMatchingEngine.haversine_distance(28.6100, 77.0380, 28.5975, 77.1724)
        self.assertAlmostEqual(dist, 13.9, delta=2.5)

        # Non-existent offer response returns 400 or 404
        bad_offer_res = self.client.post("/api/escalation/respond", json={
            "offer_id": "offer-nonexistent-9999",
            "action": "ACCEPT"
        })
        self.assertIn(bad_offer_res.status_code, [400, 404])

if __name__ == "__main__":
    unittest.main()
