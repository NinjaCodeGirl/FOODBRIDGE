# UNION FOOD BRIDGE — Automatic NGO Escalation & Food Reallocation Engine

**Architecture Document**: Section 4 Implementation  
**Status**: Fully Implemented & Verified  
**Endpoints**: `/api/escalation/*`

---

## 1. Objective & Threat Model

In urban food redistribution, cooked food has a strict safe consumption window (typically 4–6 hours). If an offer sits unacknowledged in an NGO's inbox, the food will spoil before delivery. 

The **FoodBridge Automatic Escalation Engine** solves this by:
1. Offering surplus meals to the **best-matching eligible NGO** first.
2. Running a **server-side response countdown** (default 5 minutes).
3. If unacknowledged at deadline, **automatically expiring the offer** and offering it to the **next eligible NGO in proximity**.
4. Supporting **partial acceptance** (e.g. accepting 60 portions out of 100) and immediately reallocating the remaining 40 portions to the next NGO.
5. Guaranteeing **atomic quantity locks** so no food portion is ever double-booked.
6. **Never reallocating food that is already collected or physically in transit**.

---

## 2. Escalation Workflow Diagram

```
                     Restaurant Lists 100 Surplus Meals
                                     │
                                     ▼
                    Proximity & Cold Chain Matching
                 (Rank NGOs: 1. Akshaya Patra, 2. Robin Hood Army, 3. Feeding India)
                                     │
                                     ▼
                      OFFER 1 Dispatched to NGO A
                     (100 portions • 5-Minute Window)
                                     │
               ┌─────────────────────┼─────────────────────┐
               │                     │                     │
               ▼                     ▼                     ▼
            ACCEPT                 REJECT             NO RESPONSE
               │                     │                     │
      ┌────────┴────────┐            │                     ▼
      │                 │            │                 TIMEOUT
   Full (100)      Partial (60)      │             (Deadline Passed)
      │                 │            │                     │
      ▼                 ▼            ▼                     ▼
Lock 100 Servings    Lock 60 Servings  Release 100 Servings   Mark EXPIRED
Pickup Scheduled     Remainder 40 ───────► Offer 2 to NGO B ───► Offer 2 to NGO B
                        │                 (5-Minute Window)     (5-Minute Window)
                        ▼                         │                     │
                 Auto-Offer 40                    ▼                     ▼
                  to NGO B                     ACCEPT                ACCEPT
                                                  │                     │
                                                  ▼                     ▼
                                          Lock Remaining         Lock Remaining
                                         Pickup Scheduled       Pickup Scheduled
```

---

## 3. Escalation Rules & State Machine

### A. Lifecycle Statuses
1. `AVAILABLE`: Food listed by restaurant; awaiting claim or matching.
2. `OFFERED`: Priority offer active with an NGO; countdown ticking.
3. `ACCEPTED`: NGO confirmed receipt commitment; quantity reserved.
4. `PICKUP_SCHEDULED`: Courier assigned with estimated arrival window.
5. `PICKUP_IN_PROGRESS`: Courier en route to donor loading dock.
6. `PICKED_UP`: Food verified via QR/OTP; in physical courier custody.
7. `DELIVERED`: Courier handed over food to NGO loading bay.
8. `DISTRIBUTION_PENDING`: Meals at shelter; awaiting physical meal distribution to beneficiaries.
9. `COMPLETED`: Food served, photographed, independently witnessed, and closed.

### B. Contingency Statuses
- `REJECTED`: NGO declined offer (e.g. at capacity); unallocated quantity immediately offered to next ranked NGO.
- `EXPIRED`: NGO failed to respond before server deadline; unallocated quantity immediately offered to next ranked NGO.
- `TIME_EXTENSION_REQUESTED`: NGO asked for 5–10 minutes to verify capacity; deadline extended.
- `PICKUP_DELAYED`: Courier reported traffic or vehicle delay; deadline updated, alerts dispatched.
- `REALLOCATION_PENDING`: Search underway for next eligible partner.

---

## 4. Critical Invariants

1. **Anti-Double-Booking**:
   $$\sum (\text{Allocated Portions}) + \text{Available Portions} \equiv \text{Total Listed Portions}$$
   The combined allocated quantity can never exceed available quantity.

2. **In-Transit Lock**:
   Once a volunteer verifies pickup via QR/OTP (`status == "PICKED_UP"`), the allocation is **physically locked**. The system will never reallocate food that is already in transit, regardless of travel delays.

3. **Server-Side Authority**:
   Offer expiry and timeout evaluations are calculated using server UTC timestamps (`datetime.now(timezone.utc)`), ensuring countdowns do not pause if a user closes their browser.

