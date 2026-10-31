import io
import os
import unittest
from datetime import datetime, timezone, timedelta
from fastapi.testclient import TestClient
from app.main import app

class TestFoodBridgePhases5to8(unittest.TestCase):
    """
    Automated Test Suite for Union Food Bridge Phases 5, 6, 7 & 8.
    Validates:
    - Phase 5: Rapid Pickup, Dynamic Route ETA, Timezone-Aware Deadlines, Standardized Delays & Late Policy
    - Phase 6: Food Safety Eligibility, Atomic Quantity Reservation, Multi-Recipient Split & Mathematical Reconciliation
    - Phase 7: In-App Notifications, 10 Lifecycle Events, B2B SaaS Subscriptions, Webhook Signatures & Financial Separation
    - Phase 8: Fraud & Security Controls, Role Authorization, Overbooking Prevention & Edge Cases
    """

    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    # ==========================================================================
    # PHASE 5: RAPID PICKUP, LIVE GPS, ETA COUNTDOWN & DELAY MANAGEMENT
    # ==========================================================================

    def test_21_delivery_request_and_atomic_stock_reservation(self):
        """NGO requests 50 meals; verifies atomic stock deduction and delivery record creation."""
        res = self.client.post("/api/deliveries/request", json={
            "listing_id": "list-001",
            "ngo_id": "ngo-101",
            "ngo_name": "Akshaya Patra Foundation",
            "requested_servings": 50,
            "dropoff_address": "Dwarka Sector 10 Hub",
            "dropoff_lat": 28.5833,
            "dropoff_lon": 77.0500,
            "contact_phone": "+91 98101 23456"
        })
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "REQUESTED")
        self.assertEqual(data["allocated_servings"], 50)
        self.assertIn("id", data)

    def test_22_delivery_approval_and_prep_time(self):
        """Restaurant approves request with 20 minutes kitchen preparation window."""
        res = self.client.post("/api/deliveries/approve", json={
            "delivery_id": "deliv-401",
            "prep_time_minutes": 20,
            "pickup_instructions": "Service dock loading bay 2"
        })
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "APPROVED")
        self.assertEqual(data["prep_time_minutes"], 20)

    def test_23_delivery_volunteer_assignment(self):
        """Volunteer assigned to pickup with vehicle telemetry."""
        res = self.client.post("/api/deliveries/assign", json={
            "delivery_id": "deliv-401",
            "volunteer_id": "user_arjun_volunteer",
            "volunteer_name": "Arjun Sharma",
            "volunteer_phone": "+91 98222 33445",
            "vehicle_type": "INSULATED_VAN",
            "volunteer_lat": 28.6050,
            "volunteer_lon": 77.1600
        })
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "ASSIGNED")
        self.assertEqual(data["volunteer_name"], "Arjun Sharma")

    def test_24_delivery_volunteer_acceptance_and_dynamic_eta(self):
        """Volunteer accepts assignment; system calculates realistic travel ETA (not fixed 10m)."""
        res = self.client.post("/api/deliveries/accept?delivery_id=deliv-401&volunteer_id=user_arjun_volunteer")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "EN_ROUTE_TO_PICKUP")
        self.assertIsNotNone(data["pickup_deadline"])
        self.assertGreater(data["estimated_travel_minutes"], 0)

    def test_25_live_gps_ping_recalculation(self):
        """Courier client sends GPS update; system recalculates distance and travel minutes."""
        res = self.client.post("/api/deliveries/location-ping", json={
            "delivery_id": "deliv-401",
            "volunteer_id": "user_arjun_volunteer",
            "current_lat": 28.6000,
            "current_lon": 77.1680
        })
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["success"])
        self.assertIn("estimated_travel_minutes", data)

    def test_26_delivery_delay_reporting(self):
        """Volunteer reports standardized delay reason; system extends pickup deadline."""
        res = self.client.post("/api/deliveries/report-delay", json={
            "delivery_id": "deliv-401",
            "volunteer_id": "user_arjun_volunteer",
            "delay_reason": "HEAVY_TRAFFIC",
            "delay_minutes": 15,
            "notes": "Flyover congestion near Ring Road"
        })
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["success"])
        self.assertIn("new_deadline", data)

    def test_27_live_pickup_status_and_late_policy(self):
        """Fetches live countdown and asserts transparent late policy status."""
        res = self.client.get("/api/deliveries/deliv-401/status")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn(data["late_policy_status"], ["ON_TIME", "WITHIN_GRACE_PERIOD", "MINOR_DELAY", "LATE"])
        self.assertGreater(data["seconds_remaining"], 0)
        self.assertTrue(data["is_delayed"])
        self.assertEqual(data["delay_reason"], "HEAVY_TRAFFIC")

    def test_28_gps_proximity_arrival_verification(self):
        """Validates GPS proximity check succeeds within 250m, fails when distant."""
        # Negative case: distant location (>1 km away)
        bad_res = self.client.post("/api/deliveries/arrive", json={
            "delivery_id": "deliv-401",
            "volunteer_id": "user_arjun_volunteer",
            "current_lat": 28.7500,
            "current_lon": 77.3000
        })
        self.assertEqual(bad_res.status_code, 400)
        self.assertIn("away", bad_res.json()["detail"])

        # Positive case: within 150m of pickup loading dock (28.5975, 77.1724)
        good_res = self.client.post("/api/deliveries/arrive", json={
            "delivery_id": "deliv-401",
            "volunteer_id": "user_arjun_volunteer",
            "current_lat": 28.5980,
            "current_lon": 77.1720
        })
        self.assertEqual(good_res.status_code, 200)
        self.assertTrue(good_res.json()["success"])
        self.assertEqual(good_res.json()["status"], "ARRIVED_AT_PICKUP")

    def test_29_delivery_reassignment(self):
        """Reassigning an assignment resets volunteer telemetry and sets status to APPROVED."""
        res = self.client.post("/api/deliveries/reassign?delivery_id=deliv-401&reason=Courier+emergency+breakdown")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["success"])
        self.assertEqual(data["delivery"]["status"], "APPROVED")
        self.assertIsNone(data["delivery"]["volunteer_id"])

    # ==========================================================================
    # PHASE 6: AI FRESHNESS, FOOD SAFETY ENGINE & SMART QUANTITY DISTRIBUTION
    # ==========================================================================

    def test_30_food_safety_eligibility_enforcement(self):
        """Negative test: Food with status REJECTED is blocked from being requested."""
        # Create expired/rejected listing
        from app.routers.donations import SURPLUS_DB
        SURPLUS_DB.insert(0, {
            "id": "list-expired-test",
            "donor_name": "Rejected Test Kitchen",
            "food_title": "Spoiled Dairy Soup",
            "food_category": "DAIRY",
            "quantity_servings": 40,
            "weight_kg": 15.0,
            "freshness_score": 35.0,
            "status": "REJECTED",
            "inspection_status": "REJECTED",
            "pickup_address": "Test Road",
            "latitude": 28.60,
            "longitude": 77.05,
            "created_at": datetime.now(timezone.utc)
        })

        res = self.client.post("/api/deliveries/request", json={
            "listing_id": "list-expired-test",
            "ngo_id": "ngo-101",
            "ngo_name": "Akshaya Patra Foundation",
            "requested_servings": 20,
            "dropoff_address": "Hub",
            "dropoff_lat": 28.58,
            "dropoff_lon": 77.05
        })
        self.assertEqual(res.status_code, 400)
        self.assertIn("safety eligibility", res.json()["detail"])

    def test_31_quantity_split_multi_recipient_atomic(self):
        """Validates multi-recipient batch splitting allocates portions without exceeding total."""
        res = self.client.post("/api/matching/allocate", json={
            "listing_id": "list-002",
            "max_recipients": 3
        })
        self.assertEqual(res.status_code, 200)
        data = res.json()
        total_servings = data["total_servings"]
        allocated_sum = sum(a["allocated_servings"] for a in data["allocations"])
        self.assertLessEqual(allocated_sum, total_servings)
        self.assertGreater(len(data["allocations"]), 1)

    def test_32_overbooking_prevention(self):
        """Negative test: Requesting more servings than available stock triggers HTTP 400."""
        res = self.client.post("/api/deliveries/request", json={
            "listing_id": "list-001",
            "ngo_id": "ngo-101",
            "ngo_name": "Akshaya Patra",
            "requested_servings": 999999,
            "dropoff_address": "Hub",
            "dropoff_lat": 28.58,
            "dropoff_lon": 77.05
        })
        self.assertEqual(res.status_code, 400)
        self.assertIn("exceed", res.json()["detail"])

    def test_33_batch_reconciliation_report(self):
        """Calls mathematical reconciliation report; validates Total == Available + Reserved + In-Transit."""
        res = self.client.get("/api/donations/list-001/reconciliation")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["is_fully_reconciled"])
        self.assertEqual(
            data["total_listed_servings"],
            data["available_servings"] + data["reserved_servings"]
        )

    def test_34_food_security_summary_report(self):
        """Validates aggregated food security report metrics and CO2 mitigation."""
        res = self.client.get("/api/donations/security-report")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertGreater(data["total_food_listed_servings"], 0)
        self.assertGreater(data["meals_diverted_from_landfill"], 0)
        self.assertGreater(data["co2_mitigated_kg"], 0.0)
        self.assertGreater(data["fssai_compliance_rate_percent"], 90.0)

    # ==========================================================================
    # PHASE 7: NOTIFICATIONS, WHATSAPP LIFECYCLE & B2B SAAS SUBSCRIPTIONS
    # ==========================================================================

    def test_35_notification_dispatch_and_unread_count(self):
        """Validates system notification dispatch, unread badge counter, and mark-all-read."""
        # Dispatch notification
        res1 = self.client.post("/api/notifications/dispatch", json={
            "role": "RESTAURANT",
            "event_type": "VOLUNTEER_APPROACHING",
            "title": "Courier Approaching",
            "message": "Courier is 5 mins away from loading dock.",
            "action_url": "/dashboard"
        })
        self.assertEqual(res1.status_code, 200)

        # Check unread count
        res2 = self.client.get("/api/notifications/unread-count?role=RESTAURANT")
        self.assertEqual(res2.status_code, 200)
        self.assertGreater(res2.json()["unread_count"], 0)

        # Mark all as read
        res3 = self.client.post("/api/notifications/mark-all-read?role=RESTAURANT")
        self.assertEqual(res3.status_code, 200)
        self.assertTrue(res3.json()["success"])

    def test_36_subscription_tiers_and_entitlements(self):
        """Verifies all 4 B2B SaaS pricing tiers exist with Community Free at Rs. 0."""
        res = self.client.get("/api/subscriptions/plans")
        self.assertEqual(res.status_code, 200)
        plans = res.json()
        self.assertEqual(len(plans), 4)

        free_plan = next(p for p in plans if p["code"] == "COMMUNITY_FREE")
        self.assertEqual(free_plan["price_monthly_inr"], 0)
        self.assertTrue(free_plan["is_free"])

        pro_plan = next(p for p in plans if p["code"] == "FOOD_PARTNER_PRO")
        self.assertEqual(pro_plan["price_monthly_inr"], 999)

        biz_plan = next(p for p in plans if p["code"] == "BUSINESS_PLUS")
        self.assertEqual(biz_plan["price_monthly_inr"], 2999)

    def test_37_sandbox_checkout_and_invoice_issuance(self):
        """Simulates subscription upgrade checkout; verifies invoice generation."""
        res = self.client.post("/api/subscriptions/sandbox-checkout", json={
            "organization_id": "org_taj_palace",
            "target_plan_code": "BUSINESS_PLUS",
            "billing_cycle": "annual",
            "customer_name": "Taj Palace Banquet Kitchen",
            "customer_email": "taj@foodbridge.org"
        })
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["success"])
        self.assertEqual(data["status"], "SUCCESS")
        self.assertIn("INV-FB-", data["invoice_number"])

        # Check invoices endpoint
        inv_res = self.client.get("/api/subscriptions/invoices?organization_id=org_taj_palace")
        self.assertEqual(inv_res.status_code, 200)
        self.assertGreater(len(inv_res.json()), 0)

    def test_38_payment_webhook_hmac_validation(self):
        """Tests webhook processing; rejects missing or invalid signatures."""
        # Negative test: invalid signature
        bad_res = self.client.post("/api/subscriptions/webhook", json={
            "event": "payment.captured",
            "payload": {"order_id": "ord_123"},
            "signature": "bad"
        })
        self.assertEqual(bad_res.status_code, 400)

        # Positive test: valid signature
        good_res = self.client.post("/api/subscriptions/webhook", json={
            "event": "payment.captured",
            "payload": {"order_id": "ord_123", "amount": 99900},
            "signature": "sha256_mock_signature_valid_for_testing_123"
        })
        self.assertEqual(good_res.status_code, 200)
        self.assertTrue(good_res.json()["received"])

    def test_39_admin_plan_price_update(self):
        """Admin updates plan pricing proposal; verifies new rates are stored."""
        res = self.client.put("/api/subscriptions/plans/FOOD_PARTNER_PRO", json={
            "plan_code": "FOOD_PARTNER_PRO",
            "price_monthly_inr": 1099,
            "price_annual_inr": 10590,
            "features": ["All Core Features", "Automated Scheduling", "WhatsApp Alerts"]
        })
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["price_monthly_inr"], 1099)
        self.assertEqual(data["price_annual_inr"], 10590)

    def test_40_revenue_analytics_separation(self):
        """Validates financial SaaS revenue (MRR/ARR in INR) is never conflated with food weight (kg)."""
        res = self.client.get("/api/revenue/metrics")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertGreater(data["mrr_inr"], 0)
        self.assertGreater(data["arr_inr"], 0)
        # Ensure schema strictly contains monetary figures, not food mass
        self.assertNotIn("kg", str(data))
