import React, { useState, useEffect } from 'react';
import AppShell from './components/layout/AppShell';
import Dashboard from './components/Dashboard';
import DonorDashboard from './components/donor/DonorDashboard';
import DonationWizard from './components/donor/DonationWizard';
import DonationForm from './components/DonationForm';
import PricingPage from './components/pricing/PricingPage';
import SubscriptionManager from './components/subscription/SubscriptionManager';
import AdminRevenueDashboard from './components/revenue/AdminRevenueDashboard';
import UnitEconomicsDashboard from './components/revenue/UnitEconomicsDashboard';
import ComplianceRecords from './components/compliance/ComplianceRecords';
import SurplusFeed from './components/SurplusFeed';
import LiveMap from './components/LiveMap';
import Leaderboard from './components/Leaderboard';
import ContactSharingModal from './components/ContactSharingModal';
import QRModal from './components/QRModal';
import RatingModal from './components/RatingModal';
import OnboardingModal from './components/OnboardingModal';
import DonationTable from './components/ui/DonationTable';
import PageHeader from './components/ui/PageHeader';
import StatCard from './components/ui/StatCard';
import UrgencyBanner from './components/ui/UrgencyBanner';
import EmptyState from './components/ui/EmptyState';
import { 
  Split, 
  X, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  PlusCircle, 
  Truck, 
  Utensils, 
  Clock, 
  Bell, 
  Check, 
  Settings as SettingsIcon,
  HelpCircle,
  Calendar,
  Layers
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const INITIAL_LISTINGS = [
  {
    id: 'list-001',
    donor_name: 'NSUT Campus Dining Hall',
    donor_phone: '+91 98765 43210',
    food_title: 'Fresh Cooked Dal Makhani & Rice',
    food_category: 'COOKED_MEALS',
    classification: 'CATEGORY_A',
    quantity_servings: 180,
    weight_kg: 54.0,
    freshness_score: 94.50,
    risk_level: 'LOW',
    storage_condition: 'HEATED',
    allergens: ['Dairy', 'Gluten'],
    validation_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    estimated_shelf_life_hours: 5.2,
    pickup_deadline: new Date(Date.now() + 47 * 60 * 1000).toISOString(),
    status: 'POSTED',
    matched_ngo: 'Akshaya Patra Foundation',
    pickup_address: 'NSUT Main Campus, Sector 3, Dwarka, New Delhi',
    latitude: 28.6100,
    longitude: 77.0380,
    created_at: new Date(Date.now() - 3600 * 1000).toISOString()
  },
  {
    id: 'list-002',
    donor_name: 'Taj Palace Banquet Kitchen',
    donor_phone: '+91 98999 11223',
    food_title: 'Assorted Paneer Gravy & Rotis',
    food_category: 'COOKED_MEALS',
    classification: 'CATEGORY_B',
    quantity_servings: 350,
    weight_kg: 105.0,
    freshness_score: 88.00,
    risk_level: 'LOW',
    storage_condition: 'REFRIGERATED',
    allergens: ['Dairy', 'Gluten'],
    validation_hash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
    estimated_shelf_life_hours: 4.5,
    pickup_deadline: new Date(Date.now() + 140 * 60 * 1000).toISOString(),
    status: 'PICKUP_ASSIGNED',
    matched_ngo: 'Robin Hood Army Janakpuri',
    pickup_address: 'Sardar Patel Marg, Diplomatic Enclave, New Delhi',
    latitude: 28.5975,
    longitude: 77.1724,
    created_at: new Date(Date.now() - 7200 * 1000).toISOString()
  },
  {
    id: 'list-003',
    donor_name: 'Bikanervala Sweets Dwarka',
    donor_phone: '+91 98222 33445',
    food_title: 'Assorted Bread Loaves & Vegetable Cutlets',
    food_category: 'BAKERY',
    classification: 'CATEGORY_A',
    quantity_servings: 120,
    weight_kg: 36.0,
    freshness_score: 96.00,
    risk_level: 'LOW',
    storage_condition: 'ROOM_TEMP',
    allergens: ['Gluten'],
    validation_hash: '3f211c4b7890aef481239c01289fe4217643a1290bb3412aef6789a12bc901a1',
    estimated_shelf_life_hours: 8.0,
    pickup_deadline: new Date(Date.now() + 240 * 60 * 1000).toISOString(),
    status: 'DELIVERED',
    matched_ngo: 'Feeding India Shelter Home',
    pickup_address: 'Sector 6 Dwarka, New Delhi',
    latitude: 28.5861,
    longitude: 77.0789,
    created_at: new Date(Date.now() - 14400 * 1000).toISOString()
  }
];

const INITIAL_METRICS = {
  total_meals_rescued: 15420,
  total_co2_avoided_kg: 38550.0,
  total_food_saved_tonnes: 4.62,
  active_ngo_partners: 54,
  verified_pickups_count: 3210,
  average_match_time_mins: 12.4
};

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [activeRole, setActiveRole] = useState('DONOR'); // 'DONOR', 'NGO', 'VOLUNTEER', 'ADMIN'

  // LocalStorage Persisted State
  const [listings, setListings] = useState(() => {
    try {
      const saved = localStorage.getItem('foodbridge_listings_v2');
      return saved ? JSON.parse(saved) : INITIAL_LISTINGS;
    } catch (e) {
      return INITIAL_LISTINGS;
    }
  });

  const [liveMetrics, setLiveMetrics] = useState(() => {
    try {
      const saved = localStorage.getItem('foodbridge_metrics_v2');
      return saved ? JSON.parse(saved) : INITIAL_METRICS;
    } catch (e) {
      return INITIAL_METRICS;
    }
  });

  const [currentPlan, setCurrentPlan] = useState(() => {
    try {
      return localStorage.getItem('foodbridge_plan_v2') || 'FOOD_PARTNER_PRO';
    } catch (e) {
      return 'FOOD_PARTNER_PRO';
    }
  });

  const handleUpdatePlan = (newPlan) => {
    setCurrentPlan(newPlan);
    try {
      localStorage.setItem('foodbridge_plan_v2', newPlan);
    } catch (e) {}
  };

  // Modal States
  const [contactModalListing, setContactModalListing] = useState(null);
  const [qrModalListing, setQrModalListing] = useState(null);
  const [ratingModalConfig, setRatingModalConfig] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [splitModalListing, setSplitModalListing] = useState(null);
  const [splitResult, setSplitResult] = useState(null);
  const [splitLoading, setSplitLoading] = useState(false);

  // Toast Notification
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('foodbridge_listings_v2', JSON.stringify(listings));
    } catch (e) {}
  }, [listings]);

  useEffect(() => {
    try {
      localStorage.setItem('foodbridge_metrics_v2', JSON.stringify(liveMetrics));
    } catch (e) {}
  }, [liveMetrics]);

  // Initial backend fetch attempt with graceful fallback
  useEffect(() => {
    const fetchActiveListings = async () => {
      try {
        const res = await fetch(`${API_URL}/api/donations/active`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setListings(prev => {
              const combined = [...data, ...prev.filter(p => !data.some(d => d.id === p.id))];
              return combined;
            });
          }
        }
      } catch (e) {
        // Backend offline, fallback state active
      }
    };

    const fetchMetrics = async () => {
      try {
        const res = await fetch(`${API_URL}/api/analytics/impact`);
        if (res.ok) {
          const data = await res.json();
          setLiveMetrics(data);
        }
      } catch (e) {}
    };

    fetchActiveListings();
    fetchMetrics();
  }, []);

  const handleListingCreated = (newListing) => {
    setListings(prev => [newListing, ...prev]);
    setLiveMetrics(prev => ({
      ...prev,
      total_meals_rescued: prev.total_meals_rescued + Number(newListing.quantity_servings || 0),
      total_co2_avoided_kg: prev.total_co2_avoided_kg + Number(((newListing.weight_kg || 10) * 2.5).toFixed(1)),
      total_food_saved_tonnes: Number((prev.total_food_saved_tonnes + ((newListing.weight_kg || 10) / 1000)).toFixed(2))
    }));
    showToast(`Donation posted successfully! ID: ${newListing.id}`);
    setActiveTab(activeRole === 'DONOR' ? 'donations' : 'overview');
  };

  const handleTriggerSplit = async (listing) => {
    setSplitModalListing(listing);
    setSplitLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/matching/allocate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listing_id: listing.id, max_recipients: 3 })
      });
      if (res.ok) {
        const data = await res.json();
        setSplitResult(data);
      } else {
        throw new Error('Fallback split calculation active');
      }
    } catch (e) {
      // Deterministic fallback split
      const total = listing.quantity_servings;
      const weight = listing.weight_kg || 50;
      const part1 = Math.round(total * 0.45);
      const part2 = Math.round(total * 0.35);
      const part3 = total - part1 - part2;

      setSplitResult({
        listing_id: listing.id,
        total_servings: total,
        allocations: [
          {
            ngo_id: 'ngo-101',
            ngo_name: 'Akshaya Patra Foundation Shelter',
            allocated_servings: part1,
            allocated_weight_kg: Number(((weight * part1) / total).toFixed(1)),
            distance_km: 1.8,
            estimated_transit_mins: 15,
            phone: '+91 98101 23456'
          },
          {
            ngo_id: 'ngo-102',
            ngo_name: 'Robin Hood Army Janakpuri',
            allocated_servings: part2,
            allocated_weight_kg: Number(((weight * part2) / total).toFixed(1)),
            distance_km: 3.4,
            estimated_transit_mins: 22,
            phone: '+91 98234 56789'
          },
          {
            ngo_id: 'ngo-103',
            ngo_name: 'Feeding India Community Kitchen',
            allocated_servings: part3,
            allocated_weight_kg: Number(((weight * part3) / total).toFixed(1)),
            distance_km: 4.1,
            estimated_transit_mins: 28,
            phone: '+91 98345 67890'
          }
        ]
      });
    } finally {
      setSplitLoading(false);
    }
  };

  // Quick Donate Again pre-fill state
  const [prefillDonationData, setPrefillDonationData] = useState(null);

  const handleQuickDonateAgain = (item) => {
    setPrefillDonationData({
      donor_name: item.donor_name || 'Taj Palace Banquet Kitchen',
      donor_phone: item.donor_phone || '+91 98999 11223',
      food_title: item.food_title,
      food_category: item.food_category,
      classification: item.classification || 'CATEGORY_A',
      quantity_servings: item.quantity_servings,
      weight_kg: item.weight_kg,
      storage_condition: item.storage_condition || 'REFRIGERATED',
      pickup_address: item.pickup_address,
      latitude: item.latitude,
      longitude: item.longitude,
      allergens: item.allergens || []
    });
    setActiveTab('post');
    showToast(`Pre-filled food details from previous donation: "${item.food_title}". Please confirm fresh preparation time.`);
  };

  // Switch role handler: auto-switch to relevant home tab
  const handleRoleChange = (newRole) => {
    setActiveRole(newRole);
    setActiveTab('overview');
    showToast(`Switched workspace role to: ${newRole}`);
  };

  return (
    <AppShell
      role={activeRole}
      setRole={handleRoleChange}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onOpenOnboarding={() => setShowOnboarding(true)}
      onPostFood={() => {
        setPrefillDonationData(null);
        setActiveTab('post');
      }}
      currentPlan={currentPlan}
      onNavigateToSubscription={() => setActiveTab('subscription')}
      onNavigateToPricing={() => setActiveTab('pricing')}
      toastMessage={toast.message}
      toastType={toast.type}
      onCloseToast={() => setToast({ message: '', type: 'success' })}
    >
      {/* 1. OVERVIEW / DASHBOARD TAB */}
      {activeTab === 'overview' && activeRole === 'DONOR' ? (
        <DonorDashboard
          donorName="Taj Palace Banquet Kitchen"
          donations={listings}
          onPostFood={() => {
            setPrefillDonationData(null);
            setActiveTab('post');
          }}
          onViewDonation={(d) => showToast(`Viewing details for: ${d.food_title}`)}
          onOpenQR={(d) => setQrModalListing(d)}
          onOpenContact={(d) => setContactModalListing(d)}
          onTrackPickup={() => setActiveTab('pickups')}
          onViewFullImpact={() => setActiveTab('impact')}
          onTriggerSplit={handleTriggerSplit}
          onQuickDonateAgain={handleQuickDonateAgain}
          currentPlan={currentPlan}
          onNavigateToPricing={() => setActiveTab('pricing')}
          onNavigateToSubscription={() => setActiveTab('subscription')}
          onNavigateToCompliance={() => setActiveTab('compliance')}
        />
      ) : activeTab === 'overview' ? (
        <Dashboard
          metrics={liveMetrics}
          onExploreListings={() => setActiveTab(activeRole === 'DONOR' ? 'donations' : 'find-food')}
          onPostFood={activeRole === 'DONOR' ? () => {
            setPrefillDonationData(null);
            setActiveTab('post');
          } : null}
          role={activeRole}
        />
      ) : null}

      {/* 2. DONOR: POST SURPLUS FOOD (4-STEP PROGRESSIVE WIZARD) */}
      {activeTab === 'post' && (
        <DonationWizard
          onListingCreated={handleListingCreated}
          API_URL={API_URL}
          initialData={prefillDonationData}
          onCancel={() => setActiveTab('overview')}
        />
      )}

      {/* 3. DONATIONS LIST / ACTIVE DONATIONS */}
      {activeTab === 'donations' && (
        <div className="space-y-6">
          <PageHeader
            title="My Food Donations"
            subtitle="Track live surplus listings, verification codes, and pickup status"
            badge={`${listings.length} Active`}
            action={
              <button
                onClick={() => setActiveTab('post')}
                className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm touch-target"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Post New Food</span>
              </button>
            }
          />

          {/* Urgency Section */}
          <UrgencyBanner
            title="40 prepared meals — pickup deadline in 47 min"
            subtitle="Akshaya Patra Foundation courier is en route to NSUT Gate 3."
            timeLeft="47 min left"
            actionLabel="Track Pickup"
            onAction={() => setActiveTab('pickups')}
          />

          <DonationTable
            donations={listings}
            onView={(d) => showToast(`Viewing details for: ${d.food_title}`)}
            onOpenQR={(d) => setQrModalListing(d)}
            onOpenContact={(d) => setContactModalListing(d)}
            onTriggerSplit={handleTriggerSplit}
            onQuickDonateAgain={handleQuickDonateAgain}
            role={activeRole}
          />
        </div>
      )}

      {/* 4. NGO: FIND FOOD / SURPLUS FEED */}
      {(activeTab === 'find-food' || activeTab === 'feed') && (
        <div className="space-y-6">
          <PageHeader
            title="Available Food Near You"
            subtitle="Surplus meals available for verified distribution shelters in Delhi NCR"
            badge={`${listings.filter(l => l.status !== 'DELIVERED').length} Available`}
          />
          <SurplusFeed
            listings={listings}
            onTriggerSplit={handleTriggerSplit}
            onOpenContactModal={(listing) => setContactModalListing(listing)}
            onOpenQRModal={(listing) => setQrModalListing(listing)}
            onOpenRatingModal={(listing) => setRatingModalConfig({ listing, role: activeRole })}
          />
        </div>
      )}

      {/* 5. PICKUPS & TRANSIT COORDINATION */}
      {activeTab === 'pickups' && (
        <div className="space-y-6">
          <PageHeader
            title={activeRole === 'VOLUNTEER' ? 'Available Pickups & Assignments' : 'Active Pickup Coordination'}
            subtitle="Coordinate courier dispatch, ETA tracking, and QR/OTP security handshakes"
            badge="Live Dispatch"
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Active Pickup Card */}
            <div className="fb-card p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">In Transit</span>
                  <h3 className="text-lg font-bold text-txt-primary mt-1">Assorted Paneer Gravy & Rotis (350 servings)</h3>
                  <p className="text-xs text-txt-secondary">Taj Palace Banquet Kitchen → Robin Hood Army Janakpuri</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold">
                  ETA 22 min
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span>Transit Status</span>
                  <span className="text-primary">Courier Assigned</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-primary h-2.5 rounded-full w-2/3 transition-all duration-500" />
                </div>
                <div className="flex justify-between text-[11px] text-txt-secondary">
                  <span>Accepted 12:45 PM</span>
                  <span>Pickup 1:15 PM</span>
                  <span>Est. Delivery 1:40 PM</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-surface-subtle text-xs space-y-1 border border-border">
                <div className="flex justify-between">
                  <span className="text-txt-secondary">Assigned Volunteer:</span>
                  <span className="font-bold text-txt-primary">Arjun Sharma (+91 98234 56789)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-txt-secondary">Vehicle / Transport:</span>
                  <span className="font-semibold text-txt-primary">Insulated Van (DL-3C-9821)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-txt-secondary">Verification Mode:</span>
                  <span className="font-semibold text-primary">QR Handshake & 6-Digit OTP</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setQrModalListing(listings[1] || listings[0])}
                  className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm touch-target"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify Handover</span>
                </button>
                <button
                  onClick={() => setActiveTab('map')}
                  className="px-4 py-2.5 rounded-xl border border-border hover:bg-gray-50 text-txt-primary font-semibold text-xs flex items-center gap-1.5 touch-target"
                >
                  <span>Route Map</span>
                </button>
              </div>
            </div>

            {/* Pickups Timeline & Verification Overview */}
            <div className="fb-card p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-txt-primary mb-1">
                  Handover Verification Process
                </h3>
                <p className="text-xs text-txt-secondary mb-4 leading-relaxed">
                  FoodBridge utilizes server-side cryptographic tokens to prevent double claims and food diversion during pickup.
                </p>

                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50/70 border border-emerald-200">
                    <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-emerald-950 block">Step 1: Allocation Confirmed</span>
                      <span className="text-emerald-800 text-[11px]">Recipient NGO accepts allocation within pickup window.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50/70 border border-amber-200">
                    <Clock className="w-4 h-4 text-status-warning flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-amber-950 block">Step 2: Volunteer Dispatch</span>
                      <span className="text-amber-800 text-[11px]">Certified courier arrives at commercial kitchen.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50/70 border border-blue-200">
                    <ShieldCheck className="w-4 h-4 text-status-info flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-blue-950 block">Step 3: Secure Handshake</span>
                      <span className="text-blue-800 text-[11px]">Donor scans volunteer QR code or enters 6-digit OTP.</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border text-[11px] text-txt-secondary text-center">
                Estimated routes and arrival times are calculated via proximity matrices.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. LIVE PROXIMITY MAP */}
      {activeTab === 'map' && (
        <div className="space-y-6">
          <PageHeader
            title="Surplus Proximity & Route Map"
            subtitle="Geographical distribution of active surplus listings and registered shelters across Delhi NCR"
            badge="Live Geocoding"
          />
          <LiveMap
            listings={listings}
            onOpenContactModal={(listing) => setContactModalListing(listing)}
            onTriggerSplit={handleTriggerSplit}
          />
        </div>
      )}

      {/* 7. IMPACT & LEADERBOARDS */}
      {(activeTab === 'impact' || activeTab === 'analytics' || activeTab === 'leaderboard') && (
        <div className="space-y-6">
          <PageHeader
            title="Environmental & Civic Impact"
            subtitle="Verified food diversion, carbon mitigation, and community trust metrics"
            badge="Audited Ledger"
          />
          <Leaderboard />
        </div>
      )}

      {/* 8. NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <PageHeader
            title="Notifications & Activity Alerts"
            subtitle="Operational updates on food matches, courier arrivals, and handovers"
            badge="2 Unread"
          />

          <div className="space-y-3">
            {[
              { id: 1, title: 'Donation Matched with Akshaya Patra', desc: '180 servings of Dal Makhani matched with Akshaya Patra Foundation.', time: '12 min ago', unread: true },
              { id: 2, title: 'Courier En Route to Taj Palace', desc: 'Arjun Sharma (Van DL-3C-9821) is 15 minutes away for pickup.', time: '28 min ago', unread: true },
              { id: 3, title: 'Handover Verified for Bikanervala Sweets', desc: '120 servings delivered to Feeding India Shelter. 90 kg CO2 mitigated.', time: '2 hours ago', unread: false },
              { id: 4, title: 'New Trust Rating Received', desc: 'Akshaya Patra Foundation rated your kitchen 5 stars for hygiene.', time: 'Yesterday', unread: false }
            ].map((n) => (
              <div 
                key={n.id}
                className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                  n.unread ? 'bg-primary-light/20 border-primary/30' : 'bg-white border-border'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    n.unread ? 'bg-primary text-white' : 'bg-gray-100 text-txt-secondary'
                  }`}>
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-txt-primary">{n.title}</h4>
                    <p className="text-xs text-txt-secondary mt-0.5">{n.desc}</p>
                    <span className="text-[10px] text-txt-muted block mt-1">{n.time}</span>
                  </div>
                </div>
                {n.unread && (
                  <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 9. SETTINGS & PROFILE */}
      {(activeTab === 'settings' || activeTab === 'profile') && (
        <div className="space-y-6">
          <PageHeader
            title="Organization & Account Settings"
            subtitle="Manage your profile, storage capabilities, notification channels, and verification credentials"
            badge={activeRole}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="fb-card p-6 space-y-4">
              <h3 className="text-sm font-bold text-txt-primary flex items-center gap-2">
                <SettingsIcon className="w-4 h-4 text-primary" />
                <span>Organization Details</span>
              </h3>
              
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-txt-secondary font-medium block">Organization Name</label>
                  <input
                    type="text"
                    disabled
                    value={activeRole === 'DONOR' ? 'Taj Palace Banquet Kitchen' : activeRole === 'NGO' ? 'Akshaya Patra Foundation' : 'Arjun Courier Service'}
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-surface-subtle border border-border text-txt-primary font-semibold"
                  />
                </div>
                <div>
                  <label className="text-txt-secondary font-medium block">Registered Address</label>
                  <input
                    type="text"
                    disabled
                    value="Sardar Patel Marg, Diplomatic Enclave, New Delhi"
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-surface-subtle border border-border text-txt-primary"
                  />
                </div>
                <div>
                  <label className="text-txt-secondary font-medium block">Verified Contact Phone</label>
                  <input
                    type="text"
                    disabled
                    value="+91 98999 11223"
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-surface-subtle border border-border text-txt-primary font-semibold"
                  />
                </div>
              </div>
            </div>

            <div className="fb-card p-6 space-y-4">
              <h3 className="text-sm font-bold text-txt-primary flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>Trust & Verification Status</span>
              </h3>

              <div className="p-4 rounded-xl bg-primary-light/40 border border-primary-light flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-primary block">Trust Score: 4.96 / 5.0</span>
                  <span className="text-[11px] text-txt-secondary">Verified by 34 pickup handshakes</span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-primary text-white text-xs font-bold shadow-sm">
                  Verified Tier A
                </span>
              </div>

              <div className="space-y-2 text-xs text-txt-secondary">
                <p>✓ Government FSSAI & NGO registration validated</p>
                <p>✓ Temperature compliance holding audited</p>
                <p>✓ 100% on-time pickup release record</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 10. CLAIMS & CAPACITY TABS FOR NGO */}
      {activeTab === 'claims' && (
        <div className="space-y-6">
          <PageHeader
            title="My Claimed Food Donations"
            subtitle="Active allocations reserved for your shelter"
            badge="1 Pending Pickup"
          />
          <DonationTable
            donations={listings.slice(0, 2)}
            onView={(d) => showToast(`Viewing claim for: ${d.food_title}`)}
            onOpenQR={(d) => setQrModalListing(d)}
            onOpenContact={(d) => setContactModalListing(d)}
            role={activeRole}
          />
        </div>
      )}

      {activeTab === 'capacity' && (
        <div className="space-y-6">
          <PageHeader
            title="Shelter Capacity & Intake Management"
            subtitle="Configure daily intake thresholds and cold storage availability"
            badge="Capacity: 85% Free"
          />
          <div className="fb-card p-6 space-y-4">
            <h3 className="text-sm font-bold text-txt-primary">Daily Capacity Tracker</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span>Active Intake (180 / 500 meals)</span>
                <span className="text-primary">320 meals remaining today</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div className="bg-primary h-3 rounded-full w-[36%]" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 11. HISTORY TAB FOR VOLUNTEER */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <PageHeader
            title="Volunteer Delivery History"
            subtitle="Past completed surplus food rescues and verified handovers"
            badge="14 Total Pickups"
          />
          <DonationTable
            donations={listings.filter(l => l.status === 'DELIVERED')}
            onView={(d) => showToast(`Viewing history for: ${d.food_title}`)}
            role={activeRole}
            emptyMessage="No completed pickup deliveries recorded yet."
          />
        </div>
      )}

      {/* 12. PRICING & SUBSCRIPTION TIERS */}
      {activeTab === 'pricing' && (
        <PricingPage
          currentPlan={currentPlan}
          onSelectPlan={(planId) => {
            handleUpdatePlan(planId);
            showToast(`Subscription plan updated to ${planId.replace(/_/g, ' ')}!`);
            setActiveTab('subscription');
          }}
          onOpenEnterpriseModal={(inquiryData) => {
            showToast('Enterprise quotation request submitted to sales queue!');
          }}
          role={activeRole}
        />
      )}

      {/* 13. SUBSCRIPTION & BILLING GOVERNANCE */}
      {activeTab === 'subscription' && (
        <SubscriptionManager
          currentPlan={currentPlan}
          onNavigateToPricing={() => setActiveTab('pricing')}
          onDowngradeToFree={() => {
            handleUpdatePlan('COMMUNITY_FREE');
            showToast('Downgraded to Community Free. Food donation remains 100% active!');
          }}
          orgName={activeRole === 'DONOR' ? 'Taj Palace Banquet Kitchen' : 'Akshaya Patra Foundation'}
        />
      )}

      {/* 14. ADMIN REVENUE ANALYTICS */}
      {activeTab === 'revenue' && (
        <AdminRevenueDashboard
          onNavigateToUnitEconomics={() => setActiveTab('unit-economics')}
        />
      )}

      {/* 15. UNIT ECONOMICS SIMULATOR */}
      {activeTab === 'unit-economics' && (
        <UnitEconomicsDashboard
          onNavigateToRevenue={() => setActiveTab('revenue')}
        />
      )}

      {/* 16. COMPLIANCE & DONATION RECORDS */}
      {activeTab === 'compliance' && (
        <ComplianceRecords
          listings={listings}
          role={activeRole}
        />
      )}

      {/* MODALS */}
      {contactModalListing && (
        <ContactSharingModal
          listing={contactModalListing}
          onClose={() => setContactModalListing(null)}
          API_URL={API_URL}
        />
      )}

      {qrModalListing && (
        <QRModal
          listing={qrModalListing}
          onClose={() => setQrModalListing(null)}
          API_URL={API_URL}
        />
      )}

      {ratingModalConfig && (
        <RatingModal
          listing={ratingModalConfig.listing}
          initialRole={ratingModalConfig.role}
          onClose={() => setRatingModalConfig(null)}
          API_URL={API_URL}
          onRatingSubmitted={() => showToast('Trust rating verified & recorded!')}
        />
      )}

      {showOnboarding && (
        <OnboardingModal onClose={() => setShowOnboarding(false)} />
      )}

      {/* Auto-Split Batch Modal */}
      {splitModalListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="fb-card w-full max-w-lg p-6 bg-white shadow-elevation relative space-y-5">
            <button
              onClick={() => { setSplitModalListing(null); setSplitResult(null); }}
              className="absolute top-4 right-4 p-2 text-txt-secondary hover:text-txt-primary rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Close auto-split modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center">
                <Split className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-txt-primary">
                  Multi-NGO Algorithmic Batch Splitting
                </h3>
                <p className="text-xs text-txt-secondary">
                  Distributes {splitModalListing.quantity_servings} meals across nearby verified shelters
                </p>
              </div>
            </div>

            {splitLoading ? (
              <div className="py-12 text-center text-xs text-txt-secondary space-y-2">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p>Computing optimal proximity and capacity routes...</p>
              </div>
            ) : splitResult ? (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-surface-subtle border border-border text-xs flex justify-between items-center">
                  <span className="font-semibold text-txt-secondary">Total Batch Quantity:</span>
                  <span className="font-bold text-primary text-sm">{splitResult.total_servings} Servings</span>
                </div>

                <div className="space-y-2.5">
                  <span className="text-xs font-bold text-txt-secondary uppercase tracking-wider block">
                    Recommended Allocations:
                  </span>
                  {splitResult.allocations.map((alloc, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl border border-border hover:border-primary/40 bg-white transition-colors flex items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="font-bold text-txt-primary">{alloc.ngo_name}</div>
                        <div className="text-[11px] text-txt-secondary mt-0.5">
                          ✓ {alloc.distance_km} km away • {alloc.estimated_transit_mins} min ETA
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="font-extrabold text-primary text-sm">{alloc.allocated_servings}</span>
                        <span className="text-[10px] text-txt-muted block">servings</span>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    setSplitModalListing(null);
                    showToast('Multi-NGO allocation batches assigned!');
                  }}
                  className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-sm transition-all touch-target"
                >
                  Confirm & Dispatch Batch Allocations
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}

    </AppShell>
  );
}
