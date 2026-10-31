# UNION FOOD BRIDGE — BROKEN FUNCTIONALITY & GAPS AUDIT (PHASE 0)
**Audit Date:** October 31, 2026  
**Repository:** `NinjaCodeGirl/Union_FoodBridge`  
**Purpose:** Identify every non-functioning, broken, incomplete, or mock feature in the existing codebase with technical root-cause analysis and explicit repair strategies.

---

## 1. LOGIN & REGISTRATION FAILURES

### Root Cause
1. **Zero Authentication Infrastructure**: There is no user authentication system implemented in the application. Neither the FastAPI backend nor the React frontend has endpoints or forms for user registration, login, logout, password reset, or session validation.
2. **Mock Dropdown Switcher**: In `src/components/navigation/TopNavbar.jsx`, lines 93-108 render an unauthenticated HTML `<select id="role-select">` with options `DONOR`, `NGO`, `VOLUNTEER`, `ADMIN`. Selecting a role simply updates a React state variable (`activeRole`), allowing any unauthenticated visitor to view privileged admin revenue numbers or donor details without credentials.
3. **Missing Role-Specific Registration**: The platform requires different onboarding information per role:
   - **Restaurant**: FSSAI registration number, kitchen address, GPS coordinates, contact manager, daily surplus volume.
   - **NGO / Recipient**: Trust registration / 80G number, beneficiary capacity, cold storage facility, operational hours.
   - **Volunteer / Courier**: Service radius, vehicle type (bike, insulated van, walk), photo identity, emergency phone.
   None of these registration flows exist.

### Repair Strategy
- Implement a complete authentication subsystem with persistent sessions (`localStorage` + JWT token validation).
- Create role-specific registration forms capturing all legal and operational attributes (FSSAI license, NGO capacity, vehicle type).
- Protect sensitive routes (Admin Revenue, Donor Settings, Claimed Pickups) based on verified roles.
- Provide a clear Login / Register modal and persistent user profile state.

---

## 2. RECIPIENT & RESTAURANT DASHBOARD GAPS

### Recipient Dashboard Gaps
1. **No "Request Food" or "Claim Portions" Action**: In `SurplusFeed.jsx`, recipient NGOs can view cards, but the only actions available are "Call Donor", "Auto-Split", "QR Handoff", and "Rate Donor". An NGO cannot directly claim or request a specific number of servings from an available listing.
2. **Missing Claims Tab Linkage**: When an NGO views the "My Claims" tab (`activeTab === 'claims'`), `App.jsx` simply slices the first two generic listings (`listings.slice(0, 2)`) with hardcoded mock status rather than reflecting donations that the specific logged-in NGO actually requested.
3. **No Distribution Record Confirmation**: NGOs need to record actual meals served to end-beneficiaries to complete the civic redistribution chain. Currently, this distribution logging does not exist.

### Restaurant Dashboard Gaps
1. **Hardcoded Organization Identity**: In `DonorDashboard.jsx`, the donor name is hardcoded as `"Taj Palace Banquet Kitchen"` throughout the UI.
2. **Missing Live Delivery Tracking View**: The dashboard mentions active transit, but has no live route map showing courier ETA and location relative to the restaurant's loading dock.

### Repair Strategy
- Add an interactive "Request Food" modal in `SurplusFeed.jsx` allowing NGOs to specify servings requested, target beneficiaries, and estimated arrival time.
- Update listing status to `MATCHED` or `CLAIMED` upon request, deducting requested quantities.
- Create a "Record Distribution" modal for NGOs to log meals handed out to children, families, or shelters.
- Dynamically bind the restaurant dashboard to the logged-in restaurant profile.

---

## 3. PROXIMITY MAPS & RADIUS-BASED SEARCH GAPS

### Root Cause
1. **Visual Style Conflict in `LiveMap.jsx`**: `LiveMap.jsx` was built using old dark-theme CSS classes (`glass-panel`, `border-[#1f2b1f]`, `text-white`, `text-zinc-400`, `bg-[#111711]`), clashing with the light SaaS theme of the rest of the application.
2. **Zero Radius-Based Search**: Although the audit instructions and hackathon requirements emphasize radius-based search (e.g., finding all food within 5 km, 10 km, or 25 km of an NGO shelter), there is **no radius slider or distance filter anywhere in the codebase**.
3. **Static Coordinates**: The map always centers on `[28.6100, 77.0500]` (Dwarka, New Delhi). It does not request browser geolocation (`navigator.geolocation`) to center on the user's real location or calculate dynamic distances.

### Repair Strategy
- Redesign `LiveMap.jsx` to match the clean light/navy SaaS aesthetic with crisp controls.
- Add an interactive Radius Search Filter (All, 3 km, 5 km, 10 km, 25 km) that filters both the map pins and the surplus feed cards.
- Add browser geolocation detection with a "Locate Me" button that places the user's pin and draws a circular search radius overlay.

---

## 4. QR GENERATION & VALIDATION DEFICIENCIES

### Root Cause
1. **Simulation-Only Workflow**: `QRModal.jsx` generates a valid cryptographic QR code via `/api/qr/generate`, but the verification button simply triggers a mock API call (`/api/qr/verify`) labeled "Simulate NGO Pickup QR Scan".
2. **No Hardware Camera Access**: There is no live camera scanner (using WebRTC video stream or HTML5 QR scanner) for a volunteer or NGO worker on their smartphone to physically scan the donor's QR code at the loading dock.
3. **No 6-Digit OTP Fallback**: If the camera is damaged or lighting is poor, there is no manual 6-digit numeric OTP verification code displayed alongside the QR code.

### Repair Strategy
- Integrate camera-based QR scanning via WebRTC / `html5-qrcode` or video stream capture.
- Display a prominent 6-digit cryptographic OTP fallback code on every QR handshake card.
- Allow volunteers or NGOs to verify pickup by either scanning with their camera OR entering the 6-digit OTP.

---

## 5. AI FOOD FRESHNESS ENGINE LIMITATIONS

### Root Cause
1. **Deprecated Gemini Model Candidates**: In `backend/app/services/freshness_ai.py` (lines 16-19), the initialization code checks:
   ```python
   for model_candidate in ['gemini-1.5-flash-latest', 'gemini-1.5-flash', 'gemini-pro']:
   ```
   `gemini-pro` is a legacy v1 model that often fails with 404 or quota errors on current Gemini endpoints.
2. **Text-Only Heuristic**: The backend only evaluates the text string of the food title, storage conditions, and timestamps. It does not inspect the uploaded food photo.
3. **Client-Server Disconnect**: In `DonationWizard.jsx`, when the user posts food, if the backend call fails, the client uses a local heuristic (`baseFreshness = 98.0 - (hoursAgo * 3.5)`). While reliable as a fallback, there is no visual indicator informing the user whether the score was verified by Gemini AI or computed locally.

### Repair Strategy
- Upgrade Gemini client configuration to use modern model endpoints (`gemini-1.5-flash`, `gemini-2.0-flash`).
- Add image preview and visual freshness validation tips in the 4-step wizard.
- Add clear user-facing explanations: *"We inspect the uploaded food image and storage logs for visible quality concerns. This is an initial screening, not a substitute for food safety inspection."*

---

## 6. WHATSAPP INTEGRATION (COMPLETE ABSENCE)

### Root Cause
- The feature is mentioned across marketing copy, pricing tables, and unit economics dashboards ("Instant WhatsApp & SMS operational alerts"), but **no implementation exists**.
- There is no Twilio or WhatsApp Business API configuration, no webhook handler, and no click-to-WhatsApp link generator in the entire codebase.

### Repair Strategy
- Implement instantaneous WhatsApp coordination links (`https://wa.me/<phone>?text=<encoded_message>`) in:
  1. `ContactSharingModal.jsx`: Button to message donor with pre-formatted pickup details.
  2. `DonorDashboard.jsx` & `DonationTable.jsx`: "Share on WhatsApp" button to dispatch listing summary and pickup link to volunteer groups.
  3. `QRModal.jsx`: "Send QR link via WhatsApp" button.

---

## 7. FOOD QUANTITY ALLOCATION & SPLITTING DISCONNECT

### Root Cause
1. **Algorithm Executes, but State is Ephemeral**: `SmartMatchingEngine.allocate_surplus` correctly computes multi-recipient allocations (e.g. 180 servings split as 81, 63, and 36 servings across 3 NGOs based on capacity and distance).
2. **Zero Backend Persistence**: The allocated portions are never saved to the database or written to `SURPLUS_DB`. The original listing retains its original total quantity, creating a data inconsistency where an item marked "MATCHED" still shows 100% available servings.

### Repair Strategy
- When an allocation is confirmed in `App.jsx`, update the listing's allocated portions and status in both state and backend storage.
- Create child allocation records with their individual pickup tokens and assign them to respective recipient NGOs.

---

## 8. BACKEND PERSISTENCE & DATA STORAGE GAPS

### Root Cause
1. **In-Memory Storage (`SURPLUS_DB`)**: In `backend/app/routers/donations.py`, `SURPLUS_DB` is a Python module-level list initialized with two mock entries. Any newly posted donation is lost on server reboot.
2. **Supabase Schema Unused by API**: The PostgreSQL schema in `database/schema.sql` defines 8 tables, but the FastAPI route handlers (`donations.py`, `qr.py`, `ratings.py`) do not execute SQL queries against Supabase.
3. **Frontend Over-Reliance on LocalStorage**: The client compensates for backend resets by caching in `foodbridge_listings_v2`. If a user clears their browser cache or switches devices, their donations disappear.

### Repair Strategy
- Ensure robust local state synchronization with deterministic mock seed data, automatic `localStorage` synchronization, and clean REST API bridges with fallback resilience.

---

## 9. MOBILE RESPONSIVENESS DEFICIENCIES

### Root Cause
1. `LiveMap.jsx`: Fixed height of `h-[550px]` causes vertical scroll locking on mobile devices.
2. `DonationTable.jsx` & `ComplianceRecords.jsx`: Data tables without responsive horizontal wrappers overflow and cause mobile page clipping.
3. Top navigation bar on mobile lacks quick actions for non-donor roles.

### Repair Strategy
- Replace fixed map heights with viewport-relative responsive sizing (`h-[360px] sm:h-[450px] lg:h-[550px]`).
- Ensure card-based mobile views for tables (`DonationCard.jsx` on mobile, table on desktop).
- Add sticky touch-optimized bottom navigation controls.

---

## 10. MISSING DEDICATED LANDING PAGE

### Root Cause
- The application currently lacks a public landing page. Any user visiting `https://union-food-bridge.vercel.app/` lands directly inside an internal dashboard.
- First-time visitors do not see what FoodBridge is, how it works, why it matters, who it is for, or how to register.

### Repair Strategy
- Build a high-converting, responsive Landing Page with:
  - Navbar: Logo, Home, About Us, How It Works, Impact, Pricing, Login / Join Now CTA.
  - Hero Section: Mission statement, food donation illustrations, verified badge, dual CTA ("List Surplus Food" & "Join as Recipient/Volunteer").
  - How It Works Section: 3-step visual workflow (List & AI Inspect → Smart Proximity Match → Cryptographic QR Handshake).
  - AI Freshness & Food Safety Section with visual explanation.
  - QR-Based Verification Section with security explanation.
  - Live Proximity & Tracking Section.
  - Verified Impact Statistics (meals rescued, CO2 mitigated, NGO partners).
  - Transparent B2B SaaS Pricing Section.
  - Comprehensive Footer with legal, FSSAI compliance, contact, and copyright details.
