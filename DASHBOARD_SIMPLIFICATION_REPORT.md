# UNION FOOD BRIDGE — Dashboard Simplification & Information Architecture Report

**Directive**: Section 7 — Simplify Dashboards & Remove Redundancy  
**Status**: Completed  
**Outcome**: Unified into **ONLY FOUR PRIMARY ROLE DASHBOARDS**

---

## 1. Problem Statement & Audit Findings

The previous interface suffered from fragmentation:
- A separate screen for `Leaderboard`.
- A separate screen for `PricingPage`.
- A separate screen for `ComplianceRecords`.
- A separate screen for `SurplusFeed`.
- A separate screen for `UnitEconomicsDashboard`.
- A separate screen for `TrustChainTimeline`.
- Users had to navigate between multiple disjointed screens to perform a single food rescue workflow.

---

## 2. Redesigned Information Architecture: Four Primary Role Workspaces

We consolidated the entire experience into **four dedicated role dashboards**:

```
                                FoodBridge Platform
                                         │
        ┌───────────────────┬────────────┴────────────┬───────────────────┐
        │                   │                         │                   │
        ▼                   ▼                         ▼                   ▼
    Restaurant             NGO                    Volunteer             Admin
     Dashboard          Dashboard                 Dashboard           Dashboard
 (`DonorDashboard`)  (`RecipientDashboard`)  (`VolunteerDashboard`) (`AdminDashboard`)
```

---

## 3. Role Dashboard Breakdown

### 🍽️ 1. Restaurant Dashboard (`DonorDashboard.jsx`)
- **Top Summary Cards**:
  - Active Food Listings
  - Food Claimed
  - Upcoming Pickups
  - Food Successfully Redistributed
  - Pending Actions
- **Main Integrated Sections**:
  1. **My Food Listings**: Real-time listing inventory, Category A/B tags, freshness scores.
  2. **Create New Listing**: Embedded multi-step donation wizard with Gemini AI screening.
  3. **Active Pickups & Live Timers**: Courier live GPS, distance, ETA countdown, late policy status.
  4. **NGO Allocation Status & Escalation**: Shows ranked NGOs, 5-minute response countdowns, and automatic reallocation logs.
  5. **Pickup and Distribution Evidence**: Clear inspection of whether food was merely collected or **actually distributed** to shelter residents.
  6. **Weekly Activity**: Embedded [`WeeklyActivitySection`](file:///c:/Users/yogit/OneDrive/Desktop/UNION/src/components/common/WeeklyActivitySection.jsx) showing Sunday–Saturday portions salvaged.
  7. **Ratings, Reputation & Leaderboard**: Embedded [`UnifiedLeaderboardSection`](file:///c:/Users/yogit/OneDrive/Desktop/UNION/src/components/common/UnifiedLeaderboardSection.jsx) with verified ratings.
  8. **Notification Centre**: Bell icon with unread count badge and real-time dropdown drawer.

---

### 🏢 2. NGO Recipient Dashboard (`RecipientDashboard.jsx`)
- **Top Summary Cards**:
  - Available Food Nearby
  - Active Accepted Allocations
  - Upcoming Pickups
  - Food Received
  - Food Distributed
  - Pending Distribution Proof
- **Main Integrated Sections**:
  1. **Available Food Marketplace**: Radius filtering (1km to 25km), dietary preferences, Category A/B tags.
  2. **My Accepted Food & Offers**: Real-time offers with live 5-minute countdown clock, Accept Full, Accept Partial, Reject, or Request Extension.
  3. **Pickup Schedule & Live Countdown**: Track courier arrival with route guidance.
  4. **Volunteer & Restaurant Contact**: Direct click-to-call and WhatsApp links.
  5. **Received Food**: Inventory of food delivered to shelter dock.
  6. **Distribution Centre (Actual Distribution Proof)**: Separate proof section for photos, videos, portion reconciliation, and independent witness verification. Delivery photos never count as actual distribution proof!
  7. **Weekly Food Distribution**: Visual Sunday–Saturday distribution trend.
  8. **Ratings & Community Leaderboard**: Audited trust score rankings.

---

### 🚚 3. Volunteer Courier Dashboard (`VolunteerDashboard.jsx`)
- **Top Summary Cards**:
  - Deliveries Completed
  - Meals Rescued
  - Courier Trust Score (no arbitrary monetary fines)
  - CO₂ Avoided
- **Main Integrated Sections**:
  1. **Active Rapid Pickup & Live Route Map**: Interactive Leaflet map with courier GPS, donor pin, recipient pin, route polyline, and 250m geofence proximity detection.
  2. **Available in Radius**: Local pickup opportunities sorted by urgency and distance.
  3. **Completed History & Photo Evidence**: Upload binary evidence directly to the server with SHA-256 validation.
  4. **Delay Management**: Standardized delay reporting with instant server deadline extensions.
  5. **Weekly Volunteer Activity & Leaderboard**: On-time delivery performance rankings.

---

### 🛡️ 4. Super-Admin Governance Dashboard (`AdminDashboard.jsx`)
- **Integrated Sections**:
  1. **Platform Overview & Key Metrics**: Rescued meals, active partners, landfill diversion.
  2. **Pending Verifications**: Review restaurant FSSAI licenses and NGO Darpan IDs.
  3. **Active Listings & Escalation Monitoring**: Monitor offer timeouts and automatic reallocations.
  4. **Pickup Delays & Live Operations**: Real-time delay notices and courier telemetry.
  5. **Distribution Evidence Audit**: Review uploaded photos and videos, verify portion reconciliation, inspect SHA-256 hashes.
  6. **B2B SaaS Revenue & Plans**: MRR, ARR, active subscriptions, edit plan pricing.
  7. **API & Integration Health**: Live connection status of Gemini API, maps, storage, and webhooks.
  8. **System Audit Logs**: Immutably logged admin actions.

---

## 4. UI/UX Consistency Standards

- **Navigation**: Clean top navbar with active persona switcher, language toggle (English/Hindi), notification bell, and responsive drawer on mobile.
- **Color System**: FoodBridge Warm Orange (`#EA580C`), Dark Slate Navy (`#0F172A`), Neutral White background, and status-colored alerts.
- **Zero Detached Pages**: Users never leave their primary role dashboard to inspect leaderboard, pricing, or compliance.

