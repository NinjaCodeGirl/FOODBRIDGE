-- ============================================================================
-- FoodBridge PostgreSQL Database Schema (Supabase Engine)
-- End-to-End Surplus Food Redistribution Ledger
-- ============================================================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS & PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) CHECK (role IN ('RESTAURANT', 'NGO', 'COURIER', 'ADMIN')) NOT NULL,
    phone_number VARCHAR(20),
    organization_name VARCHAR(255),
    trust_score DECIMAL(3,2) DEFAULT 5.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. ORGANIZATIONS (DONORS & RECIPIENTS) TABLE
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    org_type VARCHAR(50) CHECK (org_type IN ('RESTAURANT', 'HOTEL', 'CATERER', 'NGO', 'SHELTER', 'ORPHANAGE')) NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    storage_capability VARCHAR(100) CHECK (storage_capability IN ('COLD_STORAGE', 'AMBIENT', 'HOT_HOLDING')) DEFAULT 'AMBIENT',
    max_capacity_meals INT DEFAULT 200,
    verified BOOLEAN DEFAULT TRUE,
    trust_score DECIMAL(3,2) DEFAULT 5.00,
    contact_person VARCHAR(255),
    phone VARCHAR(20)
);

-- 3. SURPLUS FOOD LISTINGS TABLE
CREATE TABLE IF NOT EXISTS public.surplus_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    donor_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    food_title VARCHAR(255) NOT NULL,
    food_category VARCHAR(100) CHECK (food_category IN ('COOKED_MEALS', 'BAKERY', 'PRODUCE', 'PACKAGED', 'DAIRY')) NOT NULL,
    classification VARCHAR(50) DEFAULT 'CATEGORY_A',
    quantity_servings INT NOT NULL,
    weight_kg DECIMAL(8,2) NOT NULL,
    preparation_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    storage_condition VARCHAR(50) CHECK (storage_condition IN ('REFRIGERATED', 'HEATED', 'ROOM_TEMP')) NOT NULL,
    freshness_score DECIMAL(5,2) NOT NULL, -- 0.00 to 100.00 AI generated
    validation_hash VARCHAR(64) NOT NULL, -- SHA256 Azure AI / Gemini Validation Hash
    estimated_shelf_life_hours DECIMAL(4,1) NOT NULL,
    status VARCHAR(50) CHECK (status IN ('AVAILABLE', 'MATCHED', 'IN_TRANSIT', 'COMPLETED', 'EXPIRED')) DEFAULT 'AVAILABLE',
    pickup_address TEXT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. SMART MATCHING ALLOCATIONS TABLE
CREATE TABLE IF NOT EXISTS public.allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID REFERENCES public.surplus_listings(id) ON DELETE CASCADE,
    recipient_ngo_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    allocated_servings INT NOT NULL,
    allocated_weight_kg DECIMAL(8,2) NOT NULL,
    distance_km DECIMAL(6,2) NOT NULL,
    estimated_transit_mins INT NOT NULL,
    status VARCHAR(50) CHECK (status IN ('ASSIGNED', 'ACCEPTED', 'PICKED_UP', 'DELIVERED', 'CANCELLED')) DEFAULT 'ASSIGNED',
    allocated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. OLA-STYLE CONTACT & CALL LOGS TABLE
CREATE TABLE IF NOT EXISTS public.call_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id VARCHAR(255),
    caller_role VARCHAR(50) NOT NULL,
    caller_name VARCHAR(255) NOT NULL,
    caller_phone VARCHAR(50) NOT NULL,
    recipient_name VARCHAR(255) NOT NULL,
    recipient_phone VARCHAR(50) NOT NULL,
    duration_seconds INT DEFAULT 45,
    status VARCHAR(50) DEFAULT 'COMPLETED',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. QR CRYPTOGRAPHIC HANDSHAKES TABLE
CREATE TABLE IF NOT EXISTS public.handshakes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    allocation_id UUID REFERENCES public.allocations(id) ON DELETE CASCADE,
    verification_token VARCHAR(255) UNIQUE NOT NULL,
    donor_signature VARCHAR(255),
    recipient_signature VARCHAR(255),
    scanned_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) CHECK (status IN ('PENDING_PICKUP', 'VERIFIED_HANDOVER', 'FAILED')) DEFAULT 'PENDING_PICKUP',
    co2_mitigated_kg DECIMAL(8,2) NOT NULL,
    meals_rescued INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. TRUST & RATINGS TABLE
CREATE TABLE IF NOT EXISTS public.trust_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    handshake_id UUID REFERENCES public.handshakes(id) ON DELETE CASCADE,
    evaluator_id UUID REFERENCES public.users(id),
    target_org_id UUID REFERENCES public.organizations(id),
    rating INT CHECK (rating BETWEEN 1 AND 5),
    punctuality_rating INT CHECK (rating BETWEEN 1 AND 5),
    hygiene_rating INT CHECK (rating BETWEEN 1 AND 5),
    feedback_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. LIVE IMPACT AGGREGATION LOGS
CREATE TABLE IF NOT EXISTS public.impact_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    total_meals_rescued INT DEFAULT 0,
    total_co2_avoided_kg DECIMAL(10,2) DEFAULT 0.00,
    total_food_saved_tonnes DECIMAL(8,2) DEFAULT 0.00,
    active_ngo_partners INT DEFAULT 0,
    verified_pickups_count INT DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_surplus_status_freshness ON public.surplus_listings(status, freshness_score DESC);
CREATE INDEX IF NOT EXISTS idx_surplus_coords ON public.surplus_listings(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_org_coords ON public.organizations(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_call_logs_listing ON public.call_logs(listing_id);

-- INITIAL SEED DATA FOR IMPACT METRICS
INSERT INTO public.impact_logs (total_meals_rescued, total_co2_avoided_kg, total_food_saved_tonnes, active_ngo_partners, verified_pickups_count)
VALUES (15420, 38550.00, 4.62, 54, 3210)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PHASES 3 & 4 & DISTRIBUTION PROOF EXTENSIONS
-- ============================================================================

-- 9. BENEFICIARY DISTRIBUTION EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.distribution_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_code VARCHAR(64) UNIQUE NOT NULL,
    donation_id VARCHAR(255) NOT NULL,
    ngo_id VARCHAR(255) NOT NULL,
    ngo_name VARCHAR(255) NOT NULL,
    food_category VARCHAR(100) NOT NULL,
    quantity_received INT NOT NULL,
    servings_distributed INT NOT NULL DEFAULT 0,
    servings_remaining INT NOT NULL DEFAULT 0,
    servings_spoiled INT NOT NULL DEFAULT 0,
    servings_rejected INT NOT NULL DEFAULT 0,
    beneficiary_count INT DEFAULT 0,
    distribution_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    planned_location TEXT,
    actual_location TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    session_number INT DEFAULT 1,
    evidence_hashes JSONB DEFAULT '[]'::jsonb,
    witness_name VARCHAR(255),
    witness_phone VARCHAR(50),
    witness_organization VARCHAR(255),
    witness_confirmed BOOLEAN DEFAULT FALSE,
    witness_notes TEXT,
    witness_verified_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) CHECK (status IN ('PLANNED', 'IN_PROGRESS', 'DISTRIBUTED', 'VERIFIED', 'FLAGGED', 'REJECTED')) DEFAULT 'PLANNED',
    audit_status VARCHAR(50) CHECK (audit_status IN ('PENDING_AUDIT', 'SYSTEM_CHECKS_PASSED', 'INDEPENDENTLY_VERIFIED', 'ADMIN_AUDITED', 'DISPUTED', 'REJECTED')) DEFAULT 'PENDING_AUDIT',
    admin_audit_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. TRUSTCHAIN TIMELINE AUDIT EVENTS TABLE (Append-Only Ledger)
CREATE TABLE IF NOT EXISTS public.trustchain_timeline_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    donation_id VARCHAR(255) NOT NULL,
    stage VARCHAR(50) CHECK (stage IN (
        'FOOD_LISTED',
        'FOOD_CLAIMED',
        'VOLUNTEER_ASSIGNED',
        'PICKUP_CONFIRMED',
        'IN_TRANSIT',
        'NGO_HANDOVER',
        'RECIPIENT_CONFIRMED',
        'DISTRIBUTION_RECORDED',
        'DONATION_CLOSED'
    )) NOT NULL,
    actor_id VARCHAR(255) NOT NULL,
    actor_name VARCHAR(255) NOT NULL,
    actor_role VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    location_address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    evidence_reference TEXT,
    evidence_hash VARCHAR(64),
    verification_status VARCHAR(50) DEFAULT 'VERIFIED',
    event_signature VARCHAR(128),
    notes TEXT
);

-- 11. MEDIA & EVIDENCE UPLOADS (PHOTO / VIDEO / DOC HASH LEDGER)
CREATE TABLE IF NOT EXISTS public.evidence_uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id VARCHAR(255),
    donation_id VARCHAR(255) NOT NULL,
    evidence_type VARCHAR(50) CHECK (evidence_type IN ('PICKUP_PHOTO', 'PICKUP_VIDEO', 'DELIVERY_PHOTO', 'DELIVERY_VIDEO', 'DISTRIBUTION_MEAL_PHOTO', 'DISTRIBUTION_SERVING_PHOTO', 'SUPPORTING_DOC')) NOT NULL,
    file_hash VARCHAR(64) NOT NULL,
    file_url TEXT NOT NULL,
    uploader_id VARCHAR(255) NOT NULL,
    uploader_role VARCHAR(50) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_duplicate_flagged BOOLEAN DEFAULT FALSE,
    captured_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. IMMUTABLE QUANTITY RECONCILIATION LEDGER
-- Formula: Total Received = Distributed + Remaining + Spoiled + Rejected + Other Adjustments
CREATE TABLE IF NOT EXISTS public.quantity_reconciliation_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    donation_id VARCHAR(255) NOT NULL,
    ngo_id VARCHAR(255) NOT NULL,
    transaction_type VARCHAR(50) CHECK (transaction_type IN ('INITIAL_RECEIPT', 'DISTRIBUTION_SESSION', 'SPOILAGE_ADJUSTMENT', 'REJECTION_ADJUSTMENT', 'TRANSFER')) NOT NULL,
    quantity_servings INT NOT NULL,
    balance_servings INT NOT NULL,
    reason TEXT NOT NULL,
    authorized_by VARCHAR(255) NOT NULL,
    evidence_hash VARCHAR(64),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- EXTENDED INDEXES
CREATE INDEX IF NOT EXISTS idx_dist_events_donation ON public.distribution_events(donation_id);
CREATE INDEX IF NOT EXISTS idx_dist_events_ngo ON public.distribution_events(ngo_id);
CREATE INDEX IF NOT EXISTS idx_timeline_donation ON public.trustchain_timeline_events(donation_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_evidence_hash ON public.evidence_uploads(file_hash);
CREATE INDEX IF NOT EXISTS idx_reconciliation_donation ON public.quantity_reconciliation_ledger(donation_id);
