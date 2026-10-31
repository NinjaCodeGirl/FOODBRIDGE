import React, { useState } from 'react';
import PageHeader from '../ui/PageHeader';
import StatCard from '../ui/StatCard';
import UrgencyBanner from '../ui/UrgencyBanner';
import StatusBadge from '../ui/StatusBadge';
import LiveMap from '../LiveMap';
import RequestFoodModal from './RequestFoodModal';
import RecordDistributionModal from './RecordDistributionModal';
import RecipientMap from './RecipientMap';
import DistributionCentre from './DistributionCentre';
import WitnessVerificationModal from '../witness/WitnessVerificationModal';
import TrustChainTimeline from '../timeline/TrustChainTimeline';
import WeeklyActivitySection from '../common/WeeklyActivitySection';
import UnifiedLeaderboardSection from '../common/UnifiedLeaderboardSection';
import { generateImpactCertificate } from '../../utils/pdfGenerator';
import { 
  Search, 
  MapPin, 
  Utensils, 
  Clock, 
  QrCode, 
  PhoneCall, 
  Split, 
  CheckCircle2, 
  Building2, 
  HeartHandshake, 
  Sliders, 
  ArrowRight, 
  Layers, 
  ShieldCheck,
  Star,
  Users,
  Leaf,
  Package,
  History,
  Sparkles,
  Award
} from 'lucide-react';
import { createWhatsAppLink, getPickupArrivalMessage } from '../../utils/whatsapp';

export default function RecipientDashboard({
  ngoUser,
  listings = [],
  onRequestFood,
  onOpenQR,
  onOpenContact,
  onOpenRating,
  onTriggerSplit,
  onShowToast,
  externalTab = null
}) {
  const [activeTab, setActiveTab] = useState(externalTab || 'browse');

  React.useEffect(() => {
    if (externalTab) {
      if (['browse', 'find-food'].includes(externalTab)) setActiveTab('browse');
      else if (['map'].includes(externalTab)) setActiveTab('map');
      else if (['requests'].includes(externalTab)) setActiveTab('requests');
      else if (['distributions'].includes(externalTab)) setActiveTab('distributions');
      else if (['distribution-centre'].includes(externalTab)) setActiveTab('distribution-centre');
      else if (['trustchain'].includes(externalTab)) setActiveTab('trustchain');
    }
  }, [externalTab]);
  const [radiusFilter, setRadiusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedListingForRequest, setSelectedListingForRequest] = useState(null);
  const [selectedRequestForDistribution, setSelectedRequestForDistribution] = useState(null);
  const [witnessModalEvent, setWitnessModalEvent] = useState(null);

  // NGO's active requests state
  const [myRequests, setMyRequests] = useState([
    {
      id: 'req-201',
      listingId: 'list-001',
      foodTitle: 'Fresh Cooked Dal Makhani & Rice',
      donorName: 'NSUT Campus Dining Hall',
      donorPhone: '+91 98765 43210',
      servings: 80,
      status: 'IN_TRANSIT',
      volunteerName: 'Arjun Sharma (Van DL-3C-9821)',
      volunteerPhone: '+91 98234 56789',
      etaMins: 18,
      requestedAt: new Date(Date.now() - 35 * 60 * 1000).toISOString()
    }
  ]);

  // Active priority offers received via automatic escalation
  const [priorityOffers, setPriorityOffers] = useState([
    {
      id: 'offer-101',
      listing_id: 'list-001',
      food_title: 'Fresh Cooked Dal Makhani & Rice',
      donor_name: 'NSUT Campus Dining Hall',
      offered_servings: 100,
      status: 'OFFERED',
      seconds_remaining: 280,
      escalation_level: 1,
      pickup_address: 'NSUT Main Campus, Sector 3, Dwarka, New Delhi'
    }
  ]);
  const [partialServingsInput, setPartialServingsInput] = useState(60);

  // Tick down offers countdown timer
  React.useEffect(() => {
    const timer = setInterval(() => {
      setPriorityOffers(prev => prev.map(o => {
        if (o.status !== 'OFFERED') return o;
        const next = o.seconds_remaining - 1;
        if (next <= 0) {
          return { ...o, status: 'EXPIRED', seconds_remaining: 0 };
        }
        return { ...o, seconds_remaining: next };
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRespondOffer = (offerId, action, servings = null) => {
    const offer = priorityOffers.find(o => o.id === offerId);
    if (!offer) return;

    if (action === 'ACCEPT') {
      const acceptedCount = servings || offer.offered_servings;
      setPriorityOffers(prev => prev.map(o => o.id === offerId ? { ...o, status: 'ACCEPTED', accepted_servings: acceptedCount } : o));
      setMyRequests(prev => [
        {
          id: `req-${Date.now()}`,
          listingId: offer.listing_id,
          foodTitle: offer.food_title,
          donorName: offer.donor_name,
          donorPhone: '+91 98765 43210',
          servings: acceptedCount,
          status: 'ACCEPTED',
          volunteerName: 'Dispatch Queue (Assigning...)',
          volunteerPhone: '+91 1800 200 4567',
          etaMins: 20,
          requestedAt: new Date().toISOString()
        },
        ...prev
      ]);
      if (onShowToast) onShowToast(`Accepted ${acceptedCount} servings! Pickup assignment queued.`);
    } else if (action === 'REJECT') {
      setPriorityOffers(prev => prev.map(o => o.id === offerId ? { ...o, status: 'REJECTED' } : o));
      if (onShowToast) onShowToast('Offer declined. Automatically reallocated to next shelter partner.');
    } else if (action === 'REQUEST_TIME') {
      setPriorityOffers(prev => prev.map(o => o.id === offerId ? { ...o, seconds_remaining: o.seconds_remaining + 300, status: 'TIME_EXTENSION_REQUESTED' } : o));
      if (onShowToast) onShowToast('Requested +5m extension. Kitchen supervisor notified.');
    }

    // Call backend API
    fetch('/api/escalation/respond', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        offer_id: offerId,
        action,
        accepted_servings: servings,
        extension_minutes: 5
      })
    }).catch(() => {});
  };

  // Distribution records state
  const [distributions, setDistributions] = useState([
    {
      id: 'dist-101',
      requestId: 'req-200',
      foodTitle: 'Assorted Bread Loaves & Vegetable Cutlets',
      servingsDistributed: 120,
      beneficiaryCount: 110,
      distributionCenter: 'Dwarka Sector 10 Hub',
      witnessName: 'Rajesh Kumar',
      timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
    }
  ]);

  // Filter listings based on radius, search query and category
  const filteredListings = listings.filter(item => {
    const matchesCategory = categoryFilter === 'ALL' || item.classification === categoryFilter;
    const lowerQuery = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      item.food_title.toLowerCase().includes(lowerQuery) ||
      item.donor_name.toLowerCase().includes(lowerQuery) ||
      item.pickup_address.toLowerCase().includes(lowerQuery);

    // Simulated distance filter: compute pseudo-distance based on coordinates
    let matchesRadius = true;
    if (radiusFilter !== 'ALL') {
      const ngoLat = ngoUser?.latitude || 28.5833;
      const ngoLon = ngoUser?.longitude || 77.0500;
      const dLat = (item.latitude || 28.6100) - ngoLat;
      const dLon = (item.longitude || 77.0380) - ngoLon;
      const distKm = Math.round(Math.sqrt(dLat * dLat + dLon * dLon) * 111);
      matchesRadius = distKm <= Number(radiusFilter);
    }

    return matchesCategory && matchesSearch && matchesRadius;
  });

  const handleCreateRequest = (requestData) => {
    setMyRequests(prev => [
      {
        id: `req-${Date.now()}`,
        ...requestData,
        status: 'REQUESTED',
        volunteerName: 'Dispatch Queue (Assigning...)',
        volunteerPhone: '+91 1800 200 4567'
      },
      ...prev
    ]);
    if (onRequestFood) onRequestFood(requestData);
    if (onShowToast) onShowToast(`Food request for "${requestData.foodTitle}" submitted!`);
  };

  const handleRecordDistribution = (record) => {
    setDistributions(prev => [record, ...prev]);
    if (onShowToast) onShowToast(`Distribution of ${record.servingsDistributed} meals recorded in civic ledger!`);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      
      {/* 1. Header with Active NGO Info */}
      <PageHeader
        title={`Welcome, ${ngoUser?.organizationName || 'Akshaya Patra Foundation'}`}
        subtitle="Recipient Shelter Operations • Real-time food intake and distribution ledger"
        badge="Verified NGO Partner"
      />

      {/* 2. Top Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Active Intake"
          value={`${myRequests.filter(r => r.status !== 'DELIVERED').length} Pickups`}
          subtext="In transit or reserved"
          icon={Clock}
        />
        <StatCard
          title="Meals Rescued"
          value="4,820"
          subtext="Served to shelter residents"
          icon={Utensils}
        />
        <StatCard
          title="CO₂ Avoided"
          value="12.05 T"
          subtext="Landfill diversion audited"
          icon={Leaf}
        />
        <StatCard
          title="Shelter Capacity"
          value={`${ngoUser?.capacityMeals || 500} Meals`}
          subtext="Cold storage available"
          icon={Building2}
        />
      </div>

      {/* 3. Operational Active Deliveries Alert */}
      {myRequests.some(r => r.status === 'IN_TRANSIT') && (
        <UrgencyBanner
          title="Courier En Route with 80 Meals (Dal Makhani & Rice)"
          subtitle="Volunteer Arjun Sharma (Insulated Van DL-3C-9821) is ~18 minutes away."
          timeLeft="ETA 18 min"
          actionLabel="Show Handover QR"
          onAction={() => onOpenQR && onOpenQR(listings[0])}
        />
      )}

      {/* 4. Tab Navigation Strip */}
      <div className="flex border-b border-border space-x-1 sm:space-x-4 text-xs sm:text-sm font-bold overflow-x-auto">
        <button
          onClick={() => setActiveTab('browse')}
          className={`py-3 px-3.5 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'browse'
              ? 'border-primary text-primary'
              : 'border-transparent text-txt-secondary hover:text-txt-primary'
          }`}
        >
          <Utensils className="w-4 h-4" />
          <span>Browse Available Surplus ({filteredListings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('map')}
          className={`py-3 px-3.5 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'map'
              ? 'border-primary text-primary'
              : 'border-transparent text-txt-secondary hover:text-txt-primary'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Nearby Proximity Map</span>
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`py-3 px-3.5 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'requests'
              ? 'border-primary text-primary'
              : 'border-transparent text-txt-secondary hover:text-txt-primary'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>My Requests & Pickups ({myRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('distributions')}
          className={`py-3 px-3.5 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'distributions'
              ? 'border-primary text-primary'
              : 'border-transparent text-txt-secondary hover:text-txt-primary'
          }`}
        >
          <HeartHandshake className="w-4 h-4" />
          <span>Distribution Records ({distributions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('distribution-centre')}
          className={`py-3 px-3.5 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'distribution-centre'
              ? 'border-primary text-primary'
              : 'border-transparent text-txt-secondary hover:text-txt-primary'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Distribution Centre</span>
        </button>

        <button
          onClick={() => setActiveTab('trustchain')}
          className={`py-3 px-3.5 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'trustchain'
              ? 'border-primary text-primary'
              : 'border-transparent text-txt-secondary hover:text-txt-primary'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>TrustChain Timeline</span>
        </button>

        <button
          onClick={() => setActiveTab('offers')}
          className={`py-3 px-3.5 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'offers'
              ? 'border-primary text-primary'
              : 'border-transparent text-txt-secondary hover:text-txt-primary'
          }`}
        >
          <Sparkles className="w-4 h-4 text-primary" />
          <span>Priority Offers ({priorityOffers.filter(o => o.status === 'OFFERED').length} Live)</span>
        </button>

        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`py-3 px-3.5 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'leaderboard'
              ? 'border-primary text-primary'
              : 'border-transparent text-txt-secondary hover:text-txt-primary'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Weekly Activity & Leaderboard</span>
        </button>
      </div>

      {/* 5. TAB 1: BROWSE FOOD SURPLUS WITH RADIUS FILTER */}
      {activeTab === 'browse' && (
        <div className="space-y-6">
          
          {/* Controls Bar: Search + Category + Radius Filter */}
          <div className="fb-card p-4 sm:p-5 space-y-3">
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
              
              {/* Search Box */}
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-txt-muted absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by dish, kitchen, or locality..."
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-border bg-white text-xs sm:text-sm font-medium focus:border-primary"
                />
              </div>

              {/* Radius Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                <span className="text-xs font-bold text-txt-secondary whitespace-nowrap mr-1">Radius:</span>
                {[
                  { id: 'ALL', label: 'All Distances' },
                  { id: 3, label: '3 km' },
                  { id: 5, label: '5 km' },
                  { id: 10, label: '10 km' },
                  { id: 25, label: '25 km' },
                ].map(r => (
                  <button
                    key={r.id}
                    onClick={() => setRadiusFilter(r.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                      radiusFilter === r.id
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-surface-subtle border border-border text-txt-secondary hover:bg-gray-200'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
                <button
                  onClick={() => setCategoryFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    categoryFilter === 'ALL' ? 'bg-navy text-white' : 'bg-surface-subtle text-txt-secondary hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setCategoryFilter('CATEGORY_A')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    categoryFilter === 'CATEGORY_A' ? 'bg-emerald-600 text-white' : 'bg-surface-subtle text-txt-secondary hover:bg-gray-200'
                  }`}
                >
                  Cat A (Ambient)
                </button>
                <button
                  onClick={() => setCategoryFilter('CATEGORY_B')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    categoryFilter === 'CATEGORY_B' ? 'bg-blue-600 text-white' : 'bg-surface-subtle text-txt-secondary hover:bg-gray-200'
                  }`}
                >
                  Cat B (Cold Chain)
                </button>
              </div>

            </div>
          </div>

          {/* Surplus Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredListings.length === 0 ? (
              <div className="md:col-span-2 fb-card p-12 text-center text-txt-secondary">
                No surplus food donations currently matched within this search radius. Try expanding the radius or clearing filters.
              </div>
            ) : (
              filteredListings.map((item) => (
                <div key={item.id} className="fb-card fb-card-hover p-5 sm:p-6 flex flex-col justify-between space-y-4">
                  
                  {/* Photo Preview if available */}
                  {item.photo_url && (
                    <div className="relative w-full h-44 rounded-xl overflow-hidden bg-gray-100 -mt-1 shadow-inner">
                      <img 
                        src={item.photo_url} 
                        alt={item.food_title} 
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                      <div className="absolute top-2 right-2 bg-slate-900/85 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>AI Verified: {item.freshness_score}%</span>
                      </div>
                    </div>
                  )}

                  {/* Top: Donor & Tag */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-navy text-base">{item.donor_name}</span>
                        <span className="text-xs text-txt-muted">({item.donor_phone || '+91 98765 43210'})</span>
                      </div>
                      <h3 className="text-lg font-bold text-primary mt-1">{item.food_title}</h3>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      item.classification === 'CATEGORY_B'
                        ? 'bg-blue-50 text-blue-800 border border-blue-200'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    }`}>
                      {item.classification === 'CATEGORY_B' ? '❄️ Cold Chain' : '🌾 Ambient'}
                    </span>
                  </div>

                  {/* Middle Stats Grid */}
                  <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-surface-subtle border border-border text-xs">
                    <div>
                      <span className="text-txt-muted block">Quantity</span>
                      <strong className="text-navy text-sm font-extrabold">{item.quantity_servings}</strong>
                      <span className="text-[10px] text-txt-secondary block">servings ({item.weight_kg} kg)</span>
                    </div>

                    <div>
                      <span className="text-txt-muted block">AI Freshness</span>
                      <strong className="text-status-success text-sm font-extrabold">{item.freshness_score}%</strong>
                      <span className="text-[10px] text-txt-secondary block">Risk: {item.risk_level || 'LOW'}</span>
                    </div>

                    <div>
                      <span className="text-txt-muted block">Safe Shelf-Life</span>
                      <strong className="text-navy text-sm font-extrabold">{item.estimated_shelf_life_hours}h</strong>
                      <span className="text-[10px] text-txt-secondary block">remaining</span>
                    </div>
                  </div>

                  {/* Address & Logistics */}
                  <div className="space-y-1 text-xs text-txt-secondary">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                      <span className="truncate">{item.pickup_address}</span>
                    </div>
                    {item.allergens && (
                      <div className="flex items-center gap-1.5 pt-1">
                        <span className="font-bold text-amber-700">Allergens:</span>
                        <span>{item.allergens.join(', ')}</span>
                      </div>
                    )}
                  </div>

                  {/* Primary Action Buttons */}
                  <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-2">
                    
                    {/* High Priority: Request Food CTA */}
                    <button
                      onClick={() => setSelectedListingForRequest(item)}
                      className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-extrabold text-xs flex items-center gap-1.5 shadow-orange transition-all touch-target"
                    >
                      <Utensils className="w-4 h-4 stroke-[2.5]" />
                      <span>Request Food</span>
                    </button>

                    {/* WhatsApp Coordinator Link */}
                    <a
                      href={createWhatsAppLink(item.donor_phone, `Hello ${item.donor_name}, this is ${ngoUser?.organizationName || 'our NGO shelter'} regarding food donation: ${item.food_title} (${item.quantity_servings} servings).`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-status-success border border-emerald-200 font-bold text-xs flex items-center gap-1 transition-colors"
                    >
                      <span>WhatsApp Alert</span>
                    </a>

                    {/* Auto-Split Trigger */}
                    <button
                      onClick={() => onTriggerSplit && onTriggerSplit(item)}
                      className="px-3 py-2 rounded-xl bg-surface-subtle hover:bg-gray-200 border border-border text-txt-primary font-bold text-xs flex items-center gap-1 transition-colors"
                    >
                      <Split className="w-3.5 h-3.5 text-primary" />
                      <span>Auto-Split</span>
                    </button>

                    {/* Rate Donor Button */}
                    <button
                      onClick={() => onOpenRating && onOpenRating(item)}
                      className="px-3 py-2 rounded-xl text-amber-600 hover:bg-amber-50 border border-amber-200 font-bold text-xs flex items-center gap-1 transition-colors"
                    >
                      <Star className="w-3.5 h-3.5 fill-amber-500" />
                      <span>Rate</span>
                    </button>

                  </div>

                </div>
              ))
            )}
          </div>

        </div>
      )}

      {/* 6. TAB 2: SMART RECIPIENT MAP — Multi-tier radius, smart matching & OSRM routing */}
      {activeTab === 'map' && (
        <RecipientMap
          ngoData={{
            name: ngoUser?.organizationName || 'Akshaya Patra Foundation Shelter',
            address: 'Dwarka Sector 10 Hub, New Delhi',
            lat: ngoUser?.latitude || 28.5833,
            lon: ngoUser?.longitude || 77.0500,
            capacity: ngoUser?.capacityMeals || 500
          }}
          listings={listings}
          onRequestFood={(item) => setSelectedListingForRequest(item)}
          onOpenContact={onOpenContact}
        />
      )}

      {/* 7. TAB 3: MY REQUESTS & TRANSIT COORDINATION */}
      {activeTab === 'requests' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myRequests.map((req) => (
              <div key={req.id} className="fb-card p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">{req.status}</span>
                    <h4 className="text-base font-extrabold text-navy mt-0.5">{req.foodTitle}</h4>
                    <span className="text-xs text-txt-secondary block">From: {req.donorName}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-orange-100 text-primary text-xs font-extrabold">
                    {req.servings} Servings
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-surface-subtle border border-border text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-txt-muted">Assigned Volunteer:</span>
                    <span className="font-bold text-txt-primary">{req.volunteerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-txt-muted">Estimated Arrival:</span>
                    <span className="font-bold text-primary">~{req.etaMins} Minutes</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => onOpenQR && onOpenQR(listings[0])}
                    className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-orange touch-target"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Confirm Handover (QR)</span>
                  </button>

                  <button
                    onClick={() => setSelectedRequestForDistribution(req)}
                    className="px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-status-success border border-emerald-200 font-bold text-xs flex items-center gap-1 touch-target"
                  >
                    <HeartHandshake className="w-4 h-4" />
                    <span>Record Distribution</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. TAB 4: DISTRIBUTION AUDIT RECORDS */}
      {activeTab === 'distributions' && (
        <div className="space-y-6">
          <div className="fb-card p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-border">
              <div>
                <h3 className="font-extrabold text-base text-navy">Verified Beneficiary Distribution Ledger</h3>
                <p className="text-xs text-txt-secondary">Records of food actually consumed by end recipients</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                {distributions.length} Audited Receipts
              </span>
            </div>

            <div className="space-y-3">
              {distributions.map((d) => (
                <div key={d.id} className="p-4 rounded-xl border border-border bg-surface-subtle flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                  <div>
                    <h5 className="font-extrabold text-navy text-sm">{d.foodTitle}</h5>
                    <div className="text-txt-secondary mt-0.5">
                      Served at <strong>{d.distributionCenter}</strong> • Witness: {d.witnessName}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-extrabold text-status-success block">
                      {d.servingsDistributed} Meals Distributed
                    </span>
                    <span className="text-[11px] text-txt-muted">{d.beneficiaryCount} Beneficiaries Fed</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 8. TAB 4: DISTRIBUTION AUDIT RECORDS */}
      {activeTab === 'distributions' && (
        <div className="space-y-6">
          <div className="fb-card p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-border">
              <div>
                <h3 className="font-extrabold text-base text-navy">Verified Beneficiary Distribution Ledger</h3>
                <p className="text-xs text-txt-secondary">Records of food actually consumed by end recipients</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                {distributions.length} Audited Receipts
              </span>
            </div>

            <div className="space-y-3">
              {distributions.map((d) => (
                <div key={d.id} className="p-4 rounded-xl border border-border bg-surface-subtle flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                  <div>
                    <h5 className="font-extrabold text-navy text-sm">{d.foodTitle}</h5>
                    <div className="text-txt-secondary mt-0.5">
                      Served at <strong>{d.distributionCenter}</strong> • Witness: {d.witnessName}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-extrabold text-status-success block">
                      {d.servingsDistributed} Meals Distributed
                    </span>
                    <span className="text-[11px] text-txt-muted">{d.beneficiaryCount} Beneficiaries Fed</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 9. TAB 5: DISTRIBUTION CENTRE — Multi-session splitting & reconciliation */}
      {activeTab === 'distribution-centre' && (
        <DistributionCentre
          onGeneratePDF={(evt, sess) => generateImpactCertificate(evt, sess, { name: ngoUser?.organizationName })}
          onWitnessVerify={(evt) => setWitnessModalEvent(evt)}
        />
      )}

      {/* 10. TAB 6: TRUSTCHAIN TIMELINE */}
      {activeTab === 'trustchain' && (
        <TrustChainTimeline donationId="list-001" />
      )}

      {/* 11. TAB 7: PRIORITY OFFERS & ESCALATION COUNTDOWN */}
      {activeTab === 'offers' && (
        <div className="space-y-6">
          <div className="fb-card p-6 bg-white border border-border space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
              <div>
                <h3 className="font-extrabold text-base text-navy flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <span>Incoming Priority Surplus Food Offers</span>
                </h3>
                <p className="text-xs text-txt-secondary mt-0.5">
                  Surplus food offered directly to your shelter. Unaccepted offers automatically escalate to the next NGO after the response window.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-orange-100 text-primary font-bold text-xs">
                {priorityOffers.filter(o => o.status === 'OFFERED').length} Active Windows
              </span>
            </div>

            {priorityOffers.length === 0 ? (
              <div className="p-8 text-center text-txt-muted">
                <Clock className="w-8 h-8 text-txt-muted/50 mx-auto mb-2" />
                <p>No active priority offers right now. Check back when kitchens post fresh surplus.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {priorityOffers.map((o) => {
                  const mins = Math.floor(o.seconds_remaining / 60);
                  const secs = o.seconds_remaining % 60;
                  const timeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
                  const isOffered = o.status === 'OFFERED';

                  return (
                    <div
                      key={o.id}
                      className={`p-5 rounded-2xl border transition-all ${
                        isOffered 
                          ? 'border-orange-200 bg-orange-50/40 shadow-sm' 
                          : o.status === 'ACCEPTED'
                          ? 'border-emerald-200 bg-emerald-50/40'
                          : 'border-border bg-surface-subtle opacity-75'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/80">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-primary">
                              Escalation Level {o.escalation_level} (Priority Match)
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                              isOffered
                                ? 'bg-orange-100 text-primary border-orange-200'
                                : o.status === 'ACCEPTED'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                : 'bg-gray-100 text-gray-700 border-gray-200'
                            }`}>
                              {o.status}
                            </span>
                          </div>
                          <h4 className="text-base font-extrabold text-navy mt-1">{o.food_title}</h4>
                          <span className="text-xs text-txt-secondary">
                            Offered by <strong>{o.donor_name}</strong> • {o.pickup_address}
                          </span>
                        </div>

                        {/* 5-Minute Response Countdown Box */}
                        {isOffered && (
                          <div className="bg-white border border-orange-200 px-4 py-2 rounded-xl text-center flex-shrink-0 shadow-sm">
                            <span className="text-[10px] uppercase font-bold text-txt-muted block">Response Window</span>
                            <span className={`font-mono text-xl font-extrabold ${o.seconds_remaining < 60 ? 'text-status-danger animate-pulse' : 'text-primary'}`}>
                              {timeFormatted}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Offer Details */}
                      <div className="py-3 flex flex-wrap items-center gap-4 text-xs font-semibold text-txt-secondary">
                        <span>Total Offered: <strong className="text-navy">{o.offered_servings} Servings</strong></span>
                        <span>•</span>
                        <span>Safe Category: <strong className="text-emerald-700">Category A (Ambient)</strong></span>
                        <span>•</span>
                        <span>Automatic Escalation: <strong className="text-txt-primary">Next Nearby Shelter on Timeout</strong></span>
                      </div>

                      {/* Interactive Decision Actions */}
                      {isOffered ? (
                        <div className="pt-3 border-t border-border/80 flex flex-wrap items-center justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-2">
                            {/* Accept Full */}
                            <button
                              type="button"
                              onClick={() => handleRespondOffer(o.id, 'ACCEPT')}
                              className="px-4 py-2 rounded-xl bg-status-success hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 touch-target"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Accept All ({o.offered_servings} Meals)</span>
                            </button>

                            {/* Partial Allocation Input */}
                            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-border">
                              <input
                                type="number"
                                min={10}
                                max={o.offered_servings}
                                value={partialServingsInput}
                                onChange={(e) => setPartialServingsInput(Number(e.target.value))}
                                className="w-16 px-2 py-1 text-xs font-bold text-center border-none focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => handleRespondOffer(o.id, 'ACCEPT', partialServingsInput)}
                                className="px-3 py-1 rounded-lg bg-primary hover:bg-primary-dark text-white font-bold text-xs"
                                title="Accept partial; remainder is automatically offered to next shelter"
                              >
                                Accept Partial
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Request Time */}
                            <button
                              type="button"
                              onClick={() => handleRespondOffer(o.id, 'REQUEST_TIME')}
                              className="px-3 py-2 rounded-xl border border-border bg-white hover:bg-surface-subtle text-txt-secondary font-bold text-xs flex items-center gap-1"
                            >
                              <Clock className="w-3.5 h-3.5 text-status-warning" />
                              <span>+5m Time Extension</span>
                            </button>

                            {/* Reject / Pass */}
                            <button
                              type="button"
                              onClick={() => handleRespondOffer(o.id, 'REJECT')}
                              className="px-3 py-2 rounded-xl border border-border bg-white hover:bg-red-50 text-status-danger font-bold text-xs"
                            >
                              Decline & Reallocate
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="pt-2 text-xs font-semibold text-txt-muted">
                          {o.status === 'ACCEPTED' && `✓ Accepted ${o.accepted_servings || o.offered_servings} servings. Pickup assignment is queued.`}
                          {o.status === 'EXPIRED' && 'Offer timed out without response. Reallocated to next eligible partner.'}
                          {o.status === 'REJECTED' && 'Declined. Reallocated to next partner.'}
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 12. TAB 8: WEEKLY ACTIVITY & LEADERBOARD */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-6">
          <WeeklyActivitySection role="NGO" />
          <UnifiedLeaderboardSection initialRole="NGOS" />
        </div>
      )}

      {/* MODALS */}
      {selectedListingForRequest && (
        <RequestFoodModal
          listing={selectedListingForRequest}
          onClose={() => setSelectedListingForRequest(null)}
          onSubmitRequest={handleCreateRequest}
        />
      )}

      {selectedRequestForDistribution && (
        <RecordDistributionModal
          requestItem={selectedRequestForDistribution}
          onClose={() => setSelectedRequestForDistribution(null)}
          onRecordSubmitted={handleRecordDistribution}
        />
      )}

      {witnessModalEvent && (
        <WitnessVerificationModal
          isOpen={!!witnessModalEvent}
          onClose={() => setWitnessModalEvent(null)}
          event={witnessModalEvent}
          onVerified={(data) => {
            if (onShowToast) onShowToast('Independent witness attestation recorded on TrustChain ledger.');
            setWitnessModalEvent(null);
          }}
        />
      )}

    </div>
  );
}

