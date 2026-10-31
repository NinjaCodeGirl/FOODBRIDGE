# PHASE 0–4 BUG & SECURITY VULNERABILITY INVENTORY
**UNION FOOD BRIDGE PLATFORM**
**Date:** October 31, 2026
**Branch:** `stabilization/phase0-4-audit-and-fix`

---

### Bug 1: Missing Backend Authentication & Authorization (CRITICAL)
- **Severity:** High / Critical Security
- **Affected Files:** [`backend/app/main.py`](file:///c:/Users/yogit/OneDrive/Desktop/UNION/backend/app/main.py), [`src/context/AuthContext.jsx`](file:///c:/Users/yogit/OneDrive/Desktop/UNION/src/context/AuthContext.jsx)
- **Description:** The FastAPI backend had no `/api/auth` router. Authentication existed exclusively in the browser using `localStorage`. Passwords were stored in plaintext on the client. Any user could edit `localStorage.foodbridge_auth_user` or directly send HTTP requests to admin routes without receiving a 401/403.
- **Fix:**
  1. Create `backend/app/security.py` implementing PBKDF2-HMAC-SHA256 password hashing with salt, JWT token generation & verification, and `require_roles()` dependency.
  2. Create `backend/app/routers/auth.py` with `POST /api/auth/register`, `POST /api/auth/login` (with IP/account rate-limiting), and `GET /api/auth/me`.
  3. Protect backend administrative routes (e.g. `POST /api/distribution/admin-audit`) using `Depends(require_roles(["ADMIN"]))`.
  4. Update `AuthContext.jsx` to authenticate against `/api/auth/login` and `/api/auth/register`, storing the JWT token in HTTP Authorization headers.

---

### Bug 2: Missing Backend Multipart Evidence Upload Endpoint (HIGH)
- **Severity:** High
- **Affected Files:** [`src/components/evidence/CameraEvidenceModal.jsx`](file:///c:/Users/yogit/OneDrive/Desktop/UNION/src/components/evidence/CameraEvidenceModal.jsx), [`backend/app/services/distribution_service.py`](file:///c:/Users/yogit/OneDrive/Desktop/UNION/backend/app/services/distribution_service.py)
- **Description:** The WebRTC camera modal captured photos and video previews and calculated SHA-256 in the browser, but the actual file binary was never uploaded to the backend. The backend had no multipart upload handler.
- **Fix:**
  1. Create `backend/app/routers/evidence.py` with `POST /api/evidence/upload`.
  2. Enforce file size limit (max 25 MB) and permitted MIME types (`image/jpeg`, `image/png`, `image/webp`, `video/webm`, `video/mp4`).
  3. Compute SHA-256 server-side from raw upload stream to guarantee tamper evidence.
  4. Save file to `backend/uploads/` and record metadata in `evidence_uploads` table / store.
  5. Mount `/uploads` static file directory in `backend/app/main.py`.
  6. Update `CameraEvidenceModal.jsx` to upload the captured blob via `FormData`.

---

### Bug 3: QR Token Replay & Missing OTP Backend Verification (HIGH)
- **Severity:** High
- **Affected Files:** [`backend/app/services/qr_service.py`](file:///c:/Users/yogit/OneDrive/Desktop/UNION/backend/app/services/qr_service.py), [`backend/app/routers/qr.py`](file:///c:/Users/yogit/OneDrive/Desktop/UNION/backend/app/routers/qr.py)
- **Description:**
  1. Once a JWT QR token was verified, its `handshake_id` was not stored in a consumed set, allowing the same token to be redeemed multiple times.
  2. `scanned_by_role` parameter was passed in `QRVerifyRequest` but never validated against the permitted recipient role.
  3. No backend endpoint existed to verify 6-digit OTP codes with single-use revocation.
- **Fix:**
  1. Add `CONSUMED_TOKENS: set` and `ACTIVE_OTPS: dict` in `QRHandshakeService`.
  2. Block reuse of already-verified tokens with explicit error `"Token has already been redeemed"`.
  3. Validate that `scanned_by_role` belongs to an authorized recipient/volunteer.
  4. Implement `POST /api/qr/verify-otp` with expiration (30 min) and single-use invalidation.

---

### Bug 4: Multi-Session Quantity Reconciliation Defect (MEDIUM)
- **Severity:** Medium / Data Integrity
- **Affected Files:** [`backend/app/services/distribution_service.py`](file:///c:/Users/yogit/OneDrive/Desktop/UNION/backend/app/services/distribution_service.py)
- **Description:** In `DistributionService.record_session()`, the reconciliation balance check evaluated:
  `data.servings_distributed + data.servings_remaining <= event["quantity_received"]`
  In a multi-session workflow where Session 1 already distributed 40 portions, Session 2 submitting `distributed: 50, remaining: 25` would pass the check ($50 + 25 = 75 \le 100$), even though the true cumulative accounted portions would be $40 + 50 + 25 = 115 > 100$.
- **Fix:** Calculate cumulative distributed servings:
  `cumulative_distributed = event["servings_distributed"] + data.servings_distributed`
  `total_accounted = cumulative_distributed + data.servings_remaining + data.servings_spoiled + data.servings_rejected`
  Raise `ValueError` if `total_accounted > event["quantity_received"]`.

---

### Bug 5: Unidirectional Anti-Self-Witnessing Check (MEDIUM)
- **Severity:** Medium / Governance Bypass
- **Affected Files:** [`backend/app/services/distribution_service.py`](file:///c:/Users/yogit/OneDrive/Desktop/UNION/backend/app/services/distribution_service.py)
- **Description:** The check `event["ngo_name"].lower() in data.witness_organization.lower()` failed if the witness used an abbreviated NGO name (e.g. `"Akshaya Patra"` instead of `"Akshaya Patra Foundation Shelter"`).
- **Fix:** Implement bidirectional token-based overlap checking: tokenize names, remove common stopwords, and reject verification if meaningful tokens match.

---

### Bug 6: Gemini Multimodal Image Inspection Not Forwarding Media (LOW/MEDIUM)
- **Severity:** Low / Medium
- **Affected Files:** [`backend/app/services/freshness_ai.py`](file:///c:/Users/yogit/OneDrive/Desktop/UNION/backend/app/services/freshness_ai.py)
- **Description:** `evaluate_freshness()` only evaluated text metadata; food photograph bytes were not parsed by Gemini vision.
- **Fix:** Add `evaluate_freshness_multimodal()` accepting `image_bytes` and MIME type, passing PIL Image / Part to Gemini, with honest fallback tagging (`ai_source: "DETERMINISTIC_DECAY_MODEL"` vs `"GEMINI_MULTIMODAL_API"`).

---

### Bug 7: Database Schema Missing Columns for Auth & Verification (LOW)
- **Severity:** Low / Schema Completeness
- **Affected Files:** [`database/schema.sql`](file:///c:/Users/yogit/OneDrive/Desktop/UNION/database/schema.sql)
- **Description:** `public.users` table lacked `password_hash`, `fssai_license`, `darpan_id`, `vehicle_type`, and `service_radius_km`.
- **Fix:** Add migration alter statements / table definitions in `schema.sql`.

---

### Bug 8: Missing Automated Test Suite (HIGH)
- **Severity:** High / Operational Quality
- **Affected Files:** [`package.json`](file:///c:/Users/yogit/OneDrive/Desktop/UNION/package.json), `backend/tests/`
- **Description:** No automated backend or frontend tests existed to systematically verify the complete 18-step food donation lifecycle and negative security cases.
- **Fix:** Create `backend/tests/test_e2e_lifecycle.py` and configure automated test execution.

