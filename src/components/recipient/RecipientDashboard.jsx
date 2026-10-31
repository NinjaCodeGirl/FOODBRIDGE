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
  History
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
                <div key={item.id} className="fb-card fb-card-hover p-6 flex flex-col justify-between space-y-4">
                  
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

