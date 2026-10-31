# UNION FOOD BRIDGE — EXISTING FEATURES & PRESERVATION MATRIX (PHASE 0)
**Audit Date:** October 31, 2026  
**Repository:** `NinjaCodeGirl/Union_FoodBridge`  
**Preservation Principle:** All business logic, algorithms, API contracts, and working components must be preserved and integrated cleanly into the upgraded SaaS platform.

---

## 1. COMPREHENSIVE FEATURE INVENTORY & CLASSIFICATION

| # | Feature Name | Core Frontend Files | Core Backend Files | Technical Status | Preservation Plan |
|---|---|---|---|---|---|
| **1** | **Surplus Food Donation Wizard** | `DonationWizard.jsx`, `DonationForm.jsx` | `donations.py`, `schemas.py` | **Partially Working** | **PRESERVE & ENHANCE**: Maintain 4-step wizard, pre-fill logic, photo upload, category selection, and safety checks. Upgrade UI to orange/navy theme and step progress indicator. |
| **2** | **AI Freshness & Shelf-Life Engine** | `DonationWizard.jsx`, `SurplusFeed.jsx` | `freshness_ai.py`, `schemas.py` | **Partially Working** | **PRESERVE & UPGRADE**: Keep decay curve calculations and SHA256 validation hash. Upgrade Gemini API integration to current supported model endpoints and add image analysis. |
| **3** | **Food Quantity & Batch Allocation** | `DonationTable.jsx`, `DonorDashboard.jsx` | `donations.py`, `schemas.py` | **Fully Working** | **PRESERVE**: Retain servings, weight (kg), packaging types, and status transitions (`POSTED`, `MATCHED`, `IN_TRANSIT`, `DELIVERED`). |
| **4** | **Multi-NGO Algorithmic Batch Splitting** | `App.jsx` (Modal), `SurplusFeed.jsx` | `matching_engine.py`, `ngo.py` | **Fully Working** | **PRESERVE & PERSIST**: Keep Haversine distance, priority scoring formula, and Category B cold-chain matching. Add backend persistence for generated allocation records. |
| **5** | **Cryptographic QR Verification Handshake** | `QRModal.jsx`, `DonationTable.jsx` | `qr_service.py`, `qr.py` | **Fully Working** | **PRESERVE & EXPAND**: Keep PyJWT HS256 token encoding, Base64 QR generator, and CO2 calculation. Add real camera QR scanner and 6-digit OTP code fallback. |
| **6** | **Live Proximity Leaflet Map** | `LiveMap.jsx` | `matching_engine.py` (Registry) | **Partially Working** | **PRESERVE & FIX**: Keep `react-leaflet`, custom Category A/B and NGO pins. Upgrade from clashing dark theme to modern light SaaS theme and add radius filter slider (5km, 10km, 25km). |
| **7** | **Surplus Food Browse & Filter Feed** | `SurplusFeed.jsx` | `donations.py` | **Partially Working** | **PRESERVE & ENHANCE**: Keep search query and Category A/B filtering. Upgrade UI, add real "Request / Claim Food" action with portion selector, and distance radius filtering. |
| **8** | **Ola-Style Direct Contact Sharing** | `ContactSharingModal.jsx` | `calls.py`, `call_service.py` | **Fully Working** | **PRESERVE & EXPAND**: Keep call simulation, contact masking, and backend audit logging. Add direct WhatsApp click-to-chat button with pre-filled pickup details. |
| **9** | **Trust & Rating System** | `RatingModal.jsx`, `DonorDashboard.jsx` | `ratings.py`, `rating_service.py` | **Fully Working** | **PRESERVE**: Keep 5-star ratings for food hygiene, punctuality, and overall trust score recalculation. |
| **10** | **Civic Impact Tracker & Leaderboards** | `Dashboard.jsx`, `Leaderboard.jsx` | `analytics.py`, `impact_tracker.py` | **Fully Working** | **PRESERVE**: Keep formulas (2.5 kg CO2 per meal rescued, 0.3 kg food weight/meal) and donor/NGO top ranking boards. Modernize visual styling. |
| **11** | **B2B SaaS Pricing & Checkout Sandbox** | `PricingPage.jsx` | `subscriptions.py`, `subscription_service.py` | **Fully Working** | **PRESERVE**: Retain all 4 subscription tiers (`COMMUNITY_FREE`, `FOOD_PARTNER_PRO`, `BUSINESS_PLUS`, `ENTERPRISE_CSR`), GST checkout simulation, and entitlement checks. |
| **12** | **Subscription & Billing Governance** | `SubscriptionManager.jsx` | `subscriptions.py` | **Fully Working** | **PRESERVE**: Retain billing invoices, active feature entitlements, upgrade/downgrade flows, and plan management. |
| **13** | **Admin Revenue Analytics** | `AdminRevenueDashboard.jsx` | `revenue.py`, `revenue_service.py` | **Fully Working** | **PRESERVE**: Retain MRR, ARR, churn rate, cohort graphs, and enterprise customer breakdown. Ensure restricted access to Admin role only. |
| **14** | **Unit Economics Simulator** | `UnitEconomicsDashboard.jsx` | `revenue_service.py` | **Fully Working** | **PRESERVE**: Retain interactive cost-per-transaction, delivery subsidy, gross margin, and break-even projection models. |
| **15** | **FSSAI & Regulatory Compliance Ledger** | `ComplianceRecords.jsx` | `database/schema.sql` | **Fully Working** | **PRESERVE**: Retain tamper-evident SHA256 audit hashes, temperature excursion reporting, and PDF export simulation. |
| **16** | **Voice Assistant Dictation** | `VoiceAssistant.jsx` | Web Speech API | **Partially Working** | **PRESERVE**: Retain microphone speech-to-text dictation into food donation title field. Provide graceful fallback when browser microphone is unavailable. |
| **17** | **Platform Role Switcher** | `TopNavbar.jsx`, `AppShell.jsx` | Client State (`activeRole`) | **UI Only / Broken** | **REPLACE WITH REAL RBAC**: Replace the unauthenticated `<select>` dropdown with authenticated user login and server-verified roles (`RESTAURANT`, `NGO`, `VOLUNTEER`, `ADMIN`). |
| **18** | **WhatsApp Notification Alerts** | Mentioned in UI copy only | None | **Not Implemented** | **IMPLEMENT**: Add direct `wa.me` links with pre-formatted pickup, verification, and dispatch messages. |
| **19** | **User Registration & Authentication** | None | `database/schema.sql` (schema only) | **Not Implemented** | **IMPLEMENT**: Complete registration with role-specific data (FSSAI, NGO capacity, volunteer transport), login, logout, and persistent sessions. |
| **20** | **Public Landing Page** | None | None | **Not Implemented** | **IMPLEMENT**: Build high-converting, professional landing page with Hero, Mission, How It Works, AI Freshness, QR Verification, Live Tracking, Impact, Pricing, and Footer. |

---

## 2. DETAILED BREAKDOWN OF PRESERVED CORE ENGINES

### 2.1 AI Freshness & Shelf-Life Calculation Engine
- **Source**: `backend/app/services/freshness_ai.py`
- **Logic Preserved**:
  - Base shelf-lives: Cooked Meals (6h), Bakery (24h), Produce (48h), Packaged (72h), Dairy (12h).
  - Storage multipliers: Refrigerated (2.5x), Heated (1.2x), Room Temp (1.0x).
  - Category B cold-chain room-temperature penalty (0.4x).
  - Mathematical decay formula: `score = (remaining_hours / total_shelf_life) * 100.0`.
  - Safety thresholds: `HIGHLY_FRESH` (>=75%), `MODERATE_RESCUE` (>=45%), `URGENT_DISPATCH` (>=20%), `EXPIRED` (<20%).
  - Cryptographic SHA-256 validation hash generated from item parameters.
- **Enhancement**: Connect to current Google Gemini API with fallback heuristic so food inspection always yields actionable safety advice even when offline.

### 2.2 Smart Matching & Multi-NGO Batch Splitting Algorithm
- **Source**: `backend/app/services/matching_engine.py`
- **Logic Preserved**:
  - Haversine great-circle distance computation between donor coordinates and NGO shelter coordinates.
  - Priority scoring formula:
    $$\text{Score} = (\text{Trust Score} \times 20) - (\text{Distance} \times 3.0) + \left(\frac{\text{Capacity}}{50}\right) + \text{Cold Chain Bonus (15)}$$
  - Multi-recipient proportional quantity allocation based on remaining batch size and shelter capacity.
  - Category B cold-storage validation check.

### 2.3 Cryptographic Handshake & QR Verification
- **Source**: `backend/app/services/qr_service.py` & `src/components/QRModal.jsx`
- **Logic Preserved**:
  - PyJWT token encoding with HS256 algorithm and 6-hour expiration.
  - Embedded fields: `handshake_id`, `allocation_id`, `donor_id`, `recipient_ngo_id`, `servings`, `iat`, `exp`.
  - Base64 PNG QR code generation using `qrcode` library.
  - Server-side signature verification and environmental calculation:
    $$\text{CO}_2 \text{ Avoided (kg)} = \text{Servings} \times 2.5$$
- **Enhancement**: Add HTML5 camera scanning capability and 6-digit backup OTP.

### 2.4 B2B SaaS Subscription Engine & Unit Economics
- **Source**: `backend/app/services/subscription_service.py` & `revenue_service.py`
- **Logic Preserved**:
  - Four defined plans: Community Free (₹0), Food Partner Pro (₹1,999/mo), Business Plus (₹4,999/mo), Enterprise & CSR (Custom).
  - Plan entitlements validation (`has_entitlement` function).
  - GST-compliant invoice generation (18% CGST/SGST breakdown).
  - Unit economics models: Customer Acquisition Cost (CAC), Lifetime Value (LTV), payback period, and gross margin simulations.

---

## 3. PRESERVATION GUARANTEE

The following existing code, data models, and business logic will **NEVER be deleted**:
1. All Pydantic models in `backend/app/models/schemas.py`.
2. All 8 FastAPI routers in `backend/app/routers/`.
3. All algorithm and mathematical calculation services in `backend/app/services/`.
4. The 8-table relational database schema in `database/schema.sql`.
5. The 4-step progressive donation creation workflow.
6. The interactive Leaflet live map coordinates and pin popups.
7. The Ola-style phone coordination and call-logging mechanism.
8. The trust rating and review ledger.
9. All 4 SaaS subscription tiers and checkout simulator.
10. The CSR and Unit Economics simulation calculations.