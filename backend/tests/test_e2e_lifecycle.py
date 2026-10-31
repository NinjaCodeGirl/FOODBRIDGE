import io
import os
import unittest
from datetime import datetime, timezone, timedelta
from fastapi.testclient import TestClient
from app.main import app
from app.security import hash_password, create_access_token

class TestFoodBridgeEndToEndLifecycle(unittest.TestCase):
    """
    End-to-End Automated Test Suite for FoodBridge Phases 0-4.
    Tests complete donation lifecycle (100 listed -> 60 claimed -> volunteer pickup ->
    delivery -> distribution -> independent witness -> admin audit) plus all negative security cases.
    """

    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    # --------------------------------------------------------------------------
    # 1. AUTHENTICATION & RBAC TESTS
    # --------------------------------------------------------------------------
    def test_01_user_login_success(self):
        """Validates login with correct credentials returns valid JWT token."""
        res = self.client.post("/api/auth/login", json={
            "email": "taj@foodbridge.org",
            "password": "FoodBridge@2026!"
        })
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("access_token", data)
        self.assertEqual(data["role"], "RESTAURANT")
        self.assertEqual(data["email"], "taj@foodbridge.org")

    def test_02_user_login_invalid_credentials(self):
        """Negative test: Invalid password rejected with 401 Unauthorized."""
        res = self.client.post("/api/auth/login", json={
            "email": "taj@foodbridge.org",
            "password": "WrongPassword123!"
        })
        self.assertEqual(res.status_code, 401)
        self.assertIn("Invalid credentials", res.json()["detail"])

    def test_03_registration_and_duplicate_prevention(self):
        """Negative test: Duplicate email registration blocked with 400."""
        res = self.client.post("/api/auth/register", json={
            "email": "taj@foodbridge.org",
            "password": "NewPassword123!",
            "full_name": "Duplicate Chef",
            "role": "RESTAURANT"
        })
        self.assertEqual(res.status_code, 400)
        self.assertIn("already exists", res.json()["detail"])

    def test_04_get_profile_with_token(self):
        """Validates /api/auth/me returns authenticated subject profile."""
        login_res = self.client.post("/api/auth/login", json={
            "email": "admin@foodbridge.org",
            "password": "FoodBridge@2026!"
        })
        token = login_res.json()["access_token"]

        res = self.client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["role"], "ADMIN")

    def test_05_unauthorized_token_access(self):
        """Negative test: Missing or invalid token rejected with 401."""
        res = self.client.get("/api/auth/me", headers={"Authorization": "Bearer invalid_token_xyz"})
        self.assertEqual(res.status_code, 401)

    # --------------------------------------------------------------------------
    # 2. FOOD LISTING & AI SCREENING
    # --------------------------------------------------------------------------
    def test_06_create_surplus_listing(self):
        """Restaurant creates 100 portions; AI freshness assessment generates safety score."""
        res = self.client.post("/api/donations/create", json={
            "donor_name": "The Grand Kitchen",
            "donor_phone": "+91 98999 11223",
            "food_title": "Fresh Cooked Paneer Masala & Rotis",
            "food_category": "COOKED_MEALS",
            "classification": "CATEGORY_A",
            "quantity_servings": 100,
            "weight_kg": 30.0,
            "preparation_timestamp": datetime.now(timezone.utc).isoformat(),
            "storage_condition": "HEATED",
            "pickup_address": "NSUT Main Campus, Sector 3, Dwarka, New Delhi",
            "latitude": 28.6100,
            "longitude": 77.0380
        })
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["quantity_servings"], 100)
        self.assertGreater(data["freshness_score"], 60.0)
        self.assertIn("validation_hash", data)

    def test_07_ai_screening_endpoint(self):
        """Tests multimodal AI screening endpoint handles photo stream with decay curves."""
        fake_image = io.BytesIO(b"\xFF\xD8\xFF\xE0\x00\x10JFIF" + b"\x00" * 100)
        res = self.client.post(
            "/api/donations/ai-screen",
            data={
                "food_title": "Fresh Vegetable Biryani",
                "food_category": "COOKED_MEALS",
                "storage_condition": "REFRIGERATED",
                "classification": "CATEGORY_B"
            },
            files={"file": ("biryani.jpg", fake_image, "image/jpeg")}
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("freshness_score", data)
        self.assertIn("safety_category", data)
        self.assertIn("validation_hash", data)

    # --------------------------------------------------------------------------
    # 3. QR & OTP HANDSHAKE SECURITY (Single-Use, Expiry, Anti-Replay)
    # --------------------------------------------------------------------------
    def test_08_qr_handshake_lifecycle_and_anti_replay(self):
        """Generates QR token for 60 portions, verifies pickup, and asserts replay is blocked."""
        # 1. Generate QR token
        gen_res = self.client.post("/api/qr/generate", json={
            "allocation_id": "alloc-test-60",
            "donor_id": "user-donor-01",
            "recipient_ngo_id": "user-ngo-01",
            "servings": 60
        })
        self.assertEqual(gen_res.status_code, 200)
        token = gen_res.json()["verification_token"]

        # 2. First verification: Must succeed
        verify_res = self.client.post("/api/qr/verify", json={
            "verification_token": token,
            "scanned_by_role": "VOLUNTEER"
        })
        self.assertEqual(verify_res.status_code, 200)
        self.assertTrue(verify_res.json()["success"])
        self.assertEqual(verify_res.json()["meals_rescued"], 60)

        # 3. Negative Case: Attempt duplicate scan of same token (Anti-Replay Rule)
        replay_res = self.client.post("/api/qr/verify", json={
            "verification_token": token,
            "scanned_by_role": "VOLUNTEER"
        })
        self.assertEqual(replay_res.status_code, 200)
        self.assertFalse(replay_res.json()["success"])
        self.assertIn("already been redeemed", replay_res.json()["message"])

    def test_09_qr_unauthorized_role(self):
        """Negative test: Random unauthorized role rejected from redeeming QR token."""
        gen_res = self.client.post("/api/qr/generate", json={
            "allocation_id": "alloc-test-unauth",
            "donor_id": "user-donor-01",
            "recipient_ngo_id": "user-ngo-01",
            "servings": 20
        })
        token = gen_res.json()["verification_token"]

        res = self.client.post("/api/qr/verify", json={
            "verification_token": token,
            "scanned_by_role": "CIVILIAN_UNAUTHORIZED"
        })
        self.assertEqual(res.status_code, 200)
        self.assertFalse(res.json()["success"])
        self.assertIn("Unauthorized", res.json()["message"])

    def test_10_otp_verification_and_anti_replay(self):
        """Tests 6-digit OTP verification and asserts single-use revocation."""
        # 'list-001' is seeded with OTP '582901'
        res1 = self.client.post("/api/qr/verify-otp", json={
            "donation_id": "list-001",
            "otp_code": "582901",
            "role": "VOLUNTEER"
        })
        self.assertEqual(res1.status_code, 200)
        self.assertTrue(res1.json()["success"])

        # Second attempt: Must fail (Single-use revocation)
        res2 = self.client.post("/api/qr/verify-otp", json={
            "donation_id": "list-001",
            "otp_code": "582901",
            "role": "VOLUNTEER"
        })
        self.assertEqual(res2.status_code, 200)
        self.assertFalse(res2.json()["success"])
        self.assertIn("already been redeemed", res2.json()["message"])

    # --------------------------------------------------------------------------
    # 4. MULTIPART EVIDENCE UPLOAD & HASHING
    # --------------------------------------------------------------------------
    def test_11_evidence_upload_with_sha256(self):
        """Validates real file binary upload computes server-side SHA-256 and persists file."""
        sample_bytes = b"FoodBridge Test Evidence Photo Payload - Batch 60 Meals"
        expected_hash = "1c607f3385d96aa8ebc856a752710d34a3bd7e44ea4242bd28e5ae2ae1a025bc"

        res = self.client.post(
            "/api/evidence/upload",
            data={
                "donation_id": "list-test-60",
                "evidence_type": "DELIVERY_PHOTO",
                "latitude": "28.5833",
                "longitude": "77.0500"
            },
            files={"file": ("evidence.jpg", io.BytesIO(sample_bytes), "image/jpeg")}
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("file_url", data)
        self.assertEqual(data["file_hash"], expected_hash)
        self.assertEqual(data["file_size_bytes"], len(sample_bytes))

    def test_12_evidence_upload_invalid_mime(self):
        """Negative test: Disallowed file type rejected with 400 Bad Request."""
        res = self.client.post(
            "/api/evidence/upload",
            data={"donation_id": "list-test-60"},
            files={"file": ("malicious.exe", io.BytesIO(b"MZ\x90\x00"), "application/x-msdownload")}
        )
        self.assertEqual(res.status_code, 400)
        self.assertIn("Unsupported media format", res.json()["detail"])

    # --------------------------------------------------------------------------
    # 5. DISTRIBUTION CENTRE, RECONCILIATION & WITNESS VERIFICATION
    # --------------------------------------------------------------------------
    def test_13_create_distribution_intake_event(self):
        """NGO creates distribution intake event for 60 received portions."""
        res = self.client.post("/api/distribution/create-event", json={
            "donation_id": "list-test-60",
            "ngo_id": "user-ngo-01",
            "ngo_name": "Akshaya Patra Foundation Shelter",
            "food_category": "COOKED_MEALS",
            "quantity_received": 60,
            "planned_location": "Dwarka Sector 10 Hub"
        })
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["quantity_received"], 60)
        self.assertEqual(data["servings_remaining"], 60)
        self.assertEqual(data["status"], "PLANNED")
        TestFoodBridgeEndToEndLifecycle.test_event_id = data["id"]

    def test_14_record_distribution_session_and_reconcile(self):
        """Records serving 60 portions to 58 beneficiaries; checks remaining becomes 0."""
        event_id = getattr(self, "test_event_id", "dist-event-001")
        res = self.client.post("/api/distribution/record-session", json={
            "event_id": event_id,
            "servings_distributed": 60,
            "servings_remaining": 0,
            "servings_spoiled": 0,
            "servings_rejected": 0,
            "beneficiary_count": 58,
            "actual_location": "Dwarka Sector 10 Community Hub"
        })
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["servings_distributed"], 60)
        self.assertEqual(data["servings_remaining"], 0)
        self.assertEqual(data["beneficiary_count"], 58)

    def test_15_negative_overallocation_blocked(self):
        """Negative test: Attempting to record more portions than received is blocked with 400."""
        # Create intake of 30
        create_res = self.client.post("/api/distribution/create-event", json={
            "donation_id": "list-overalloc-test",
            "ngo_id": "user-ngo-01",
            "ngo_name": "Akshaya Patra Foundation Shelter",
            "food_category": "COOKED_MEALS",
            "quantity_received": 30,
            "planned_location": "Janakpuri Hub"
        })
        over_id = create_res.json()["id"]

        # Attempt to distribute 45 portions out of 30
        res = self.client.post("/api/distribution/record-session", json={
            "event_id": over_id,
            "servings_distributed": 45,
            "servings_remaining": 0,
            "beneficiary_count": 40,
            "actual_location": "Janakpuri Hub"
        })
        self.assertEqual(res.status_code, 400)
        self.assertIn("exceeds received quantity", res.json()["detail"])

    def test_16_negative_anti_self_witnessing_blocked(self):
        """Negative test: An NGO attempting to independently witness itself is rejected with 400."""
        event_id = getattr(self, "test_event_id", "dist-event-001")
        res = self.client.post("/api/distribution/witness-verify", json={
            "event_id": event_id,
            "witness_name": "Rajesh Internal Staff",
            "witness_phone": "+91 98111 22334",
            "witness_organization": "Akshaya Patra Foundation Internal Team",
            "witness_confirmed": True,
            "witness_notes": "We witnessed our own distribution."
        })
        self.assertEqual(res.status_code, 400)
        self.assertIn("Independent verification violation", res.json()["detail"])

    def test_17_independent_witness_verification_success(self):
        """3rd-party community coordinator verifies the 60 portion distribution."""
        event_id = getattr(self, "test_event_id", "dist-event-001")
        res = self.client.post("/api/distribution/witness-verify", json={
            "event_id": event_id,
            "witness_name": "Dr. Anita Desai",
            "witness_phone": "+91 98111 22334",
            "witness_organization": "Delhi Civic Welfare Council",
            "witness_confirmed": True,
            "witness_notes": "Observed 58 community beneficiaries receiving hot meals orderly."
        })
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["witness_confirmed"])
        self.assertEqual(data["status"], "VERIFIED")
        self.assertEqual(data["audit_status"], "INDEPENDENTLY_VERIFIED")

    # --------------------------------------------------------------------------
    # 6. ADMIN AUDIT & RBAC ENFORCEMENT
    # --------------------------------------------------------------------------
    def test_18_admin_audit_unauthorized_user_blocked(self):
        """Negative test: Non-admin user (RESTAURANT or VOLUNTEER) cannot audit transactions (403 Forbidden)."""
        donor_login = self.client.post("/api/auth/login", json={
            "email": "taj@foodbridge.org",
            "password": "FoodBridge@2026!"
        })
        donor_token = donor_login.json()["access_token"]

        event_id = getattr(self, "test_event_id", "dist-event-001")
        res = self.client.post(
            "/api/distribution/admin-audit",
            json={
                "event_id": event_id,
                "audit_decision": "ADMIN_AUDITED",
                "admin_notes": "Attempted donor unauthorized audit"
            },
            headers={"Authorization": f"Bearer {donor_token}"}
        )
        self.assertEqual(res.status_code, 403)
        self.assertIn("requires one of roles [ADMIN]", res.json()["detail"])

    def test_19_admin_audit_success(self):
        """Admin logs in, verifies event, commits governance audit and closes record."""
        admin_login = self.client.post("/api/auth/login", json={
            "email": "admin@foodbridge.org",
            "password": "FoodBridge@2026!"
        })
        admin_token = admin_login.json()["access_token"]

        event_id = getattr(self, "test_event_id", "dist-event-001")
        res = self.client.post(
            "/api/distribution/admin-audit",
            json={
                "event_id": event_id,
                "audit_decision": "ADMIN_AUDITED",
                "admin_notes": "Verified by Pooja Verma (Platform Governance Lead). All independent witness logs certified compliant."
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["audit_status"], "ADMIN_AUDITED")
        self.assertEqual(data["status"], "VERIFIED")

    def test_20_trustchain_timeline_integrity(self):
        """Validates append-only timeline preserves events with SHA-256 digital fingerprints."""
        res = self.client.get("/api/distribution/timeline/list-001")
        self.assertEqual(res.status_code, 200)
        events = res.json()
        self.assertGreaterEqual(len(events), 5)
        # Verify first stage is FOOD_LISTED and has valid hash
        first_stage = events[0]
        self.assertEqual(first_stage["stage"], "FOOD_LISTED")
        self.assertEqual(len(first_stage["evidence_hash"]), 64)

if __name__ == "__main__":
    unittest.main()

