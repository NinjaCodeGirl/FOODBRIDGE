# UNION FOOD BRIDGE — BACKEND IMPLEMENTATION REPORT

**Author & Role:** FoodBridge Principal Platform Engineer  
**Date:** October 31, 2026  
**Active Branch:** `feat/backend-escalation-and-simplification`  
**API Documentation (Swagger UI):** `http://localhost:8000/docs`  
**Test Suite Coverage:** 46/46 Automated Tests Passing (100% Pass Rate)

---

## 1. EXECUTIVE SUMMARY & BACKEND ARCHITECTURE

The Union Food Bridge platform has transitioned from a client-side prototype into a fully integrated, production-grade, backend-powered surplus food redistribution ecosystem.

The system ensures that **the frontend is never the source of truth for important business transactions**:
- All food reservations, stock deductions, response timeouts, volunteer dispatching, and cryptographic verifications are calculated and enforced server-side.
- Financial metrics (B2B SaaS MRR/ARR in INR) are strictly decoupled from physical metrics (rescued food weight in kg and portions served).
- Delivery intake photos are cryptographically separated from beneficiary distribution proof to eliminate distribution fraud.

```
                                  [ Web Client / Mobile Responsive ]
                                                  |
                                                  v
                      [ FastAPI Gateway / Application Server (Uvicorn) ]
                                                  |
           +--------------------+-----------------+--------------------+--------------------+
           |                    |                 |                    |                    |
    [ Auth & RBAC ]      [ Escalation &    [ Live Dispatch &    [ Distribution &      [ B2B SaaS &
   JWT / PBKDF2-SHA256   Matching Engine ]   GPS Telemetry ]     TrustChain Ledger ]    Subscriptions ]
           |                    |                 |                    |                    |
           v                    v                 v                    v                    v
      [ Users &            [ Surplus &        [ Deliveries &      [ Evidence Store     [ Subscriptions,
      Orgs DB ]            Offers DB ]        Delay Records ]      SHA-256 Hashes ]    Invoices & Logs ]
```

---

## 2. API MODULES & ROUTER REGISTRY

The backend exposes 14 modular routers mounted under `/api` in `backend/app/main.py`:

| Router Prefix | Router Module | Core Functionality | Status |
| :--- | :--- | :--- | :--- |
| `/api/auth` | `auth.py` | Role-based authentication (DONOR, NGO, VOLUNTEER, ADMIN), password hashing, JWT token issuance & profile lookup | ✅ Active |
| `/api/donations` | `donations.py` | Surplus food creation, AI screening, Category A/B classification, mathematical reconciliation & security reports | ✅ Active |
| `/api/escalation` | `escalation.py` | Automatic NGO priority offers, 5-minute timeout countdowns, partial allocations, and automatic fallback reallocations | ✅ Active |
| `/api/deliveries` | `deliveries.py` | Rapid dispatch, dynamic travel ETA calculation, GPS arrival verification (<250m), standardized delay management | ✅ Active |
| `/api/matching` | `ngo.py` | Smart NGO ranking (cold chain, proximity, capacity, trust score), batch splitting across up to 3 recipients | ✅ Active |
| `/api/distribution`| `distribution.py`| NGO intake events, beneficiary distribution records, independent witness attestation, admin governance audits | ✅ Active |
| `/api/evidence` | `evidence.py` | Physical media uploads (JPEG, PNG, MP4), server-side SHA-256 cryptographic hashing, static file serving | ✅ Active |
| `/api/qr` | `qr.py` | Single-use QR cryptographic tokens and 6-digit OTP codes with anti-replay and role revocation | ✅ Active |
| `/api/notifications`| `notifications.py`| Multi-role in-app notification ledger covering 10 lifecycle events with unread count badges | ✅ Active |
| `/api/subscriptions`| `subscriptions.py`| 4 B2B SaaS pricing tiers (Community Free to Enterprise), checkout simulation, webhook HMAC signatures | ✅ Active |
| `/api/revenue` | `revenue.py` | MRR/ARR analytics, unit economics simulator, gross margin metrics (isolated from food kilograms) | ✅ Active |
| `/api/analytics` | `analytics.py` | Audited civic impact metrics (meals rescued, CO₂ avoided in kg, landfill mitigation) | ✅ Active |
| `/api/calls` | `calls.py` | Ola/Uber-style privacy-preserving contact exchange and call logs | ✅ Active |
| `/api/ratings` | `ratings.py` | Bidirectional 5-star trust and hygiene reputation scoring | ✅ Active |

---

## 3. AUTOMATIC NGO ESCALATION & FOOD REALLOCATION ENGINE

### Workflow & Core Mechanics
1. **Initial Dispatch:** When surplus food is listed, the system evaluates nearby registered NGOs using an algorithmic priority score:
   $$\text{Priority Score} = (\text{Trust Score} \times 20.0) - (\text{Distance km} \times 3.0) + \left(\frac{\text{Capacity Meals}}{50.0}\right) + \text{Cold Chain Bonus (15.0)}$$
2. **Server-Side Countdown:** Top-ranked NGO receives an initial priority offer with a server-side 5-minute response deadline (`response_deadline = now + 5 min`).
3. **Automatic Expiry & Reallocation:** A background or on-demand evaluation cycle detects expired offers. If the deadline passes without response, the offer is flagged as `EXPIRED`, and the system automatically creates a new offer for the next ranked eligible NGO.
4. **Partial Acceptance & Remainder Reallocation:** If an NGO accepts a partial quantity (e.g. 60 out of 100 servings):
   - The accepted 60 servings are atomically deducted from available stock and credited to reserved servings.
   - The remaining 40 servings are **instantly and automatically reallocated** to the next ranked NGO candidate.
5. **In-Transit Protection:** Under no circumstances can food be reallocated or expired if an assignment has progressed to `PICKUP_ASSIGNED`, `IN_TRANSIT`, `COLLECTED`, or `DELIVERED`.

---

## 4. RAPID PICKUP & LIVE GPS TELEMETRY

- **Dynamic Route Travel Calculation:** Travel time is calculated dynamically based on real volunteer distance from the kitchen dock rather than a static 10-minute timer:
  - $\le 3\text{ km}$: 12 minutes
  - $3 \text{ to } 7\text{ km}$: 20 minutes
  - $7 \text{ to } 15\text{ km}$: 35 minutes
  - $> 15\text{ km}$: 50 minutes
- **Standardized Delay Policy:** Volunteers can report delays using 6 standardized codes:
  1. `HEAVY_TRAFFIC` (Traffic / Flyover Congestion)
  2. `VEHICLE_BREAKDOWN` (Mechanical issue or flat tire)
  3. `KITCHEN_PREP_DELAY` (Kitchen packaging delay)
  4. `WEATHER_CONDITIONS` (Severe rain or weather)
  5. `GPS_REROUTE` (Road diversion)
  6. `OTHER` (General contingency)
  Reporting a delay updates the server-side deadline, recalculates the transparent late status (`ON_TIME`, `WITHIN_GRACE_PERIOD`, `MINOR_DELAY`, `LATE`), and notifies both kitchen and shelter.
- **GPS Proximity Handshake (<250m):** When the courier approaches the kitchen loading dock, calling `/api/deliveries/arrive` verifies the haversine distance is $\le 250\text{ meters}$ before confirming arrival.

---

## 5. DISTRIBUTION PROOF & SEPARATE VERIFICATION

To prevent fraudulent claims where delivery photos are masqueraded as completed distributions:
1. **Delivery Confirmation vs Distribution Proof:** A delivery photo confirms physical transit to an NGO site. It is categorized as `DELIVERY_CONFIRMATION` and does NOT mark the distribution verified.
2. **NGO Serving Session:** Recipient NGOs must log actual serving sessions with:
   - Portions served to human beneficiaries
   - Leftover balance remaining
   - Meal distribution photographs/video links
   - Serving temperature ($\ge 60^\circ\text{C}$ for hot meals)
3. **Independent 3rd-Party Witness Attestation:** An independent community witness (e.g. municipal official, local councillor, medical officer) must attest to the event with their full name, organization, phone number, and a digital attestation signature.
4. **Anti-Self-Witnessing Enforcement:** The backend strictly rejects any attempt by an NGO employee or coordinator to witness their own organization's distribution.
5. **Platform Governance Admin Audit:** Platform admins review the full audit packet and mark the event `VERIFIED`, closing the cryptographic TrustChain event.

---

## 6. MULTI-RECIPIENT SPLITTING & MATHEMATICAL RECONCILIATION

- High-volume surplus donations (e.g., 500+ meals from banquets) can be distributed among up to 3 recipients.
- The mathematical reconciliation invariant is enforced on every stock transition:
  $$\text{Total Listed} = \text{Available Servings} + \text{Reserved Servings} + \text{In-Transit Servings} + \text{Delivered Servings} + \text{Spoiled/Cancelled}$$
- Atomic reservation locks prevent race-condition overbooking. Attempting to reserve more servings than available returns HTTP 400 with an explicit rejection explanation.

---

## 7. B2B SAAS FINANCIAL ENGINE & SEPARATION OF METRICS

- **Pricing Tiers:**
  - `COMMUNITY_FREE`: ₹0/month (Basic redistribution, 100% free forever for grassroots)
  - `FOOD_PARTNER_PRO`: ₹4,999/month (Automated dispatch, FSSAI certificates, WhatsApp integration)
  - `ENTERPRISE_CUSTOM`: ₹14,999/month (Multi-kitchen API, dedicated logistics, custom reporting)
  - `CSR_IMPACT_PARTNER`: ₹29,999/month (Audited ESG ESG BRSR reports, carbon offset registry)
- **Webhook HMAC Security:** All payment events require cryptographic SHA-256 HMAC verification. Missing or invalid signatures trigger HTTP 401 Unauthorized.
- **Financial Metric Integrity:** MRR and ARR are strictly tracked in currency (₹ INR) and are never conflated with food weight (kg) or meal portion counts.

---

## 8. VERIFICATION AND TEST STATUS

All 46 tests across 3 comprehensive suites run cleanly:
```bash
& "C:\Users\yogit\AppData\Local\Python\pythoncore-3.14-64\python.exe" -m unittest discover -s backend/tests -p "test_*.py" -v
# 46 tests passed in 2.213s — OK
```

All required modules are verified and operational.
