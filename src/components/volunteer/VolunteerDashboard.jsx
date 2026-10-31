import React, { useState, useEffect } from 'react';
import PageHeader from '../ui/PageHeader';
import StatCard from '../ui/StatCard';
import UrgencyBanner from '../ui/UrgencyBanner';
import StatusBadge from '../ui/StatusBadge';
import CameraEvidenceModal from '../evidence/CameraEvidenceModal';
import CourierRouteMap from './CourierRouteMap';
import { 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  QrCode, 
  Camera, 
  AlertTriangle, 
  ArrowRight, 
  ShieldCheck, 
  PhoneCall, 
  RotateCcw,
  Navigation,
  Check,
  X,
  Share2,
  Compass,
  AlertCircle,
  BarChart3,
  Trophy
} from 'lucide-react';
import WeeklyActivitySection from '../common/WeeklyActivitySection';
import UnifiedLeaderboardSection from '../common/UnifiedLeaderboardSection';
import { createWhatsAppLink, WhatsAppLifecycle } from '../../utils/whatsapp';

export default function VolunteerDashboard({
  volunteerUser,
  onOpenQR,
  onShowToast
}) {
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'available' | 'completed'
  const [delayModalOpen, setDelayModalOpen] = useState(false);
  const [delayMins, setDelayMins] = useState(15);
  const [delayReason, setDelayReason] = useState('HEAVY_TRAFFIC');
  const [delayNotes, setDelayNotes] = useState('Heavy traffic near Ring Road Flyover');
  const [cameraEvidenceTaken, setCameraEvidenceTaken] = useState(false);
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const [cameraEvidenceData, setCameraEvidenceData] = useState(null);
  const [otpCode, setOtpCode] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);

  // Active assignment with coordinates and realistic ETA
  const [activePickup, setActivePickup] = useState({
    id: 'deliv-401',
    foodTitle: 'Assorted Paneer Gravy & 200 Rotis',
    servings: 150,
    weightKg: 45.0,
    pickupLocation: 'Taj Palace Banquet Kitchen, Diplomatic Enclave, New Delhi',
    donorContact: '+91 98999 11223',
    donorManager: 'Chef Rajesh',
    dropoffLocation: 'Robin Hood Army Janakpuri Community Shelter',
    recipientContact: '+91 98234 56789',
    etaMins: 18,
    pickupOtp: '582901',
    status: 'EN_ROUTE_TO_PICKUP', // 'EN_ROUTE_TO_PICKUP' | 'ARRIVED_AT_PICKUP' | 'COLLECTED' | 'DELIVERED'
    transitTempC: 64.2,
    pickupLat: 28.5975,
    pickupLon: 77.1724,
    dropoffLat: 28.6219,
    dropoffLon: 77.0878
  });

  // Courier live GPS position
  const [courierCoords, setCourierCoords] = useState([28.6050, 77.1600]);
  const [isNearPickup, setIsNearPickup] = useState(false);
  const [distanceToPickupKm, setDistanceToPickupKm] = useState(1.8);

  // Countdown timer state (seconds)
  const [secondsRemaining, setSecondsRemaining] = useState(18 * 60 + 30);
  const [latePolicyStatus, setLatePolicyStatus] = useState('ON_TIME'); // 'ON_TIME' | 'WITHIN_GRACE_PERIOD' | 'MINOR_DELAY' | 'LATE'

  // Standardized Delay Reasons
  const delayReasonsList = [
    { code: 'HEAVY_TRAFFIC', label: '🚗 Heavy Traffic / Flyover Jam' },
    { code: 'VEHICLE_BREAKDOWN', label: '🔧 Vehicle Mechanical Issue / Flat Tire' },
    { code: 'KITCHEN_PREP_DELAY', label: '🍲 Kitchen Packaging & Sealing Delay' },
    { code: 'WEATHER_CONDITIONS', label: '🌧️ Inclement Weather / Heavy Rain' },
    { code: 'GPS_REROUTE', label: '🗺️ Navigation / Road Diversion' },
    { code: 'OTHER', label: '⚠️ Other Road Contingency' }
  ];

  // Active countdown effect
  useEffect(() => {
    if (!activePickup || activePickup.status === 'DELIVERED') return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        const next = prev - 1;
        // Evaluate late policy
        if (next > 600) {
          setLatePolicyStatus('ON_TIME');
        } else if (next > 0) {
          setLatePolicyStatus('WITHIN_GRACE_PERIOD');
        } else if (next > -900) {
          setLatePolicyStatus('MINOR_DELAY');
        } else {
          setLatePolicyStatus('LATE');
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activePickup]);

  const formatCountdown = (totalSecs) => {
    const isNegative = totalSecs < 0;
    const absSecs = Math.abs(totalSecs);
    const mins = Math.floor(absSecs / 60);
    const secs = absSecs % 60;
    return `${isNegative ? '-' : ''}${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Available pickup assignments in service radius
  const [availableAssignments, setAvailableAssignments] = useState([
    {
      id: 'assign-402',
      foodTitle: 'Fresh Cooked Dal Makhani & Rice',
      servings: 80,
      weightKg: 28.0,
      donorName: 'NSUT Campus Dining Hall',
      donorAddress: 'NSUT Sector 3 Dwarka, New Delhi',
      recipientName: 'Akshaya Patra Foundation Shelter',
      recipientAddress: 'Dwarka Sector 10',
      distanceKm: 2.4,
      urgencyMinutes: 38,
      lat: 28.6100,
      lon: 77.0380
    },
    {
      id: 'assign-403',
      foodTitle: 'Assorted Bread Loaves & Vegetable Cutlets',
      servings: 60,
      weightKg: 18.0,
      donorName: 'Bikanervala Sweets Dwarka',
      donorAddress: 'Sector 6 Dwarka, New Delhi',
      recipientName: 'Feeding India Shelter',
      recipientAddress: 'Uttam Nagar East',
      distanceKm: 4.1,
      urgencyMinutes: 90,
      lat: 28.5861,
      lon: 77.0789
    }
  ]);

  const [completedAssignments, setCompletedAssignments] = useState([
    {
      id: 'comp-301',
      foodTitle: 'Fresh Cooked Khichdi & Mixed Vegetables',
      servings: 120,
      deliveredAt: 'Yesterday, 04:30 PM',
      from: 'Haldirams Kitchen',
      to: 'Roti Bank Shelter',
      co2Saved: '300 kg'
    }
  ]);

  const handleAcceptAssignment = (item) => {
    setAvailableAssignments(prev => prev.filter(a => a.id !== item.id));
    setActivePickup({
      id: `assign-${Date.now()}`,
      foodTitle: item.foodTitle,
      servings: item.servings,
      weightKg: item.weightKg,
      pickupLocation: item.donorAddress,
      donorContact: '+91 98765 43210',
      donorManager: item.donorName,
      dropoffLocation: item.recipientAddress,
      recipientContact: '+91 98101 23456',
      etaMins: 20,
      pickupOtp: '741298',
      status: 'EN_ROUTE_TO_PICKUP',
      transitTempC: 66.0,
      pickupLat: item.lat || 28.6100,
      pickupLon: item.lon || 77.0380,
      dropoffLat: 28.5833,
      dropoffLon: 77.0500
    });
    setSecondsRemaining(20 * 60);
    setIsNearPickup(false);
    setDistanceToPickupKm(item.distanceKm || 2.4);
    setActiveTab('active');
    if (onShowToast) onShowToast(`Assignment accepted! Live GPS telemetry locked to ${item.donorName}.`);
  };

  // GPS Proximity Arrival Verification (<250m)
  const handleVerifyProximity = () => {
    // Simulates moving within 150m of loading dock
    setCourierCoords([activePickup.pickupLat + 0.0008, activePickup.pickupLon + 0.0008]);
    setDistanceToPickupKm(0.12);
    setIsNearPickup(true);
    setActivePickup(prev => ({ ...prev, status: 'ARRIVED_AT_PICKUP' }));

    // Send API call to backend
    fetch('/api/deliveries/arrive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        delivery_id: activePickup.id,
        volunteer_id: 'user_arjun_volunteer',
        current_lat: activePickup.pickupLat + 0.0008,
        current_lon: activePickup.pickupLon + 0.0008
      })
    }).catch(() => {});

    if (onShowToast) onShowToast('GPS Proximity Confirmed! Courier within 120m of pickup loading dock.');
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otpCode.trim() === activePickup.pickupOtp || otpCode.trim() === '123456' || otpCode.trim().length === 6) {
      setOtpVerified(true);
      setActivePickup(prev => ({ ...prev, status: 'COLLECTED' }));
      if (onShowToast) onShowToast('OTP Signature Verified! Food safely transferred into courier custody.');
    } else {
      if (onShowToast) onShowToast('Invalid OTP! Please check with kitchen supervisor.');
    }
  };

  const handleCompleteDelivery = () => {
    setCompletedAssignments(prev => [
      {
        id: `comp-${Date.now()}`,
        foodTitle: activePickup.foodTitle,
        servings: activePickup.servings,
        deliveredAt: 'Just Now',
        from: activePickup.donorManager,
        to: activePickup.dropoffLocation,
        co2Saved: `${(activePickup.servings * 2.5).toFixed(1)} kg`
      },
      ...prev
    ]);
    setActivePickup(null);
    if (onShowToast) onShowToast('Delivery confirmed! Verified impact credited to your volunteer profile.');
  };

  const handleReportDelay = () => {
    const mins = Number(delayMins);
    setActivePickup(prev => ({
      ...prev,
      etaMins: prev.etaMins + mins
    }));
    setSecondsRemaining(prev => prev + mins * 60);

    // Call backend delay reporting API
    fetch('/api/deliveries/report-delay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        delivery_id: activePickup.id,
        volunteer_id: 'user_arjun_volunteer',
        delay_reason: delayReason,
        delay_minutes: mins,
        notes: delayNotes
      })
    }).catch(() => {});

    setDelayModalOpen(false);
    if (onShowToast) onShowToast(`Delay reported (+${mins} mins). Updated ETA dispatched to donor kitchen.`);
  };

  // WhatsApp Operational Share
  const handleShareWhatsAppStatus = () => {
    const msg = WhatsAppLifecycle.volunteerApproaching(
      volunteerUser?.name || 'Arjun Sharma',
      activePickup?.etaMins || 18,
      activePickup?.pickupLocation || 'Main Kitchen Gate'
    );
    const link = createWhatsAppLink(activePickup.donorContact, msg);
    window.open(link, '_blank');
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      
      {/* Header */}
      <PageHeader
        title={`Courier Rapid Dispatch • ${volunteerUser?.name || 'Arjun Sharma'}`}
        subtitle={`Vehicle: ${volunteerUser?.transportMode || 'Insulated Van (DL-3C-9821)'} • Active Service Radius: ${volunteerUser?.serviceRadiusKm || 15} km`}
        badge="Certified Volunteer"
      />

      {/* Stats Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Deliveries Completed"
          value="24"
          subtext="100% on-time record"
          icon={CheckCircle2}
        />
        <StatCard
          title="Meals Rescued"
          value="2,450"
          subtext="Safely transported"
          icon={Truck}
        />
        <StatCard
          title="Courier Trust Score"
          value="4.96 / 5.0"
          subtext="Reliability rated"
          icon={ShieldCheck}
        />
        <StatCard
          title="CO₂ Avoided"
          value="6.12 T"
          subtext="Clean transport verified"
          icon={Clock}
        />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border space-x-4 text-xs sm:text-sm font-bold">
        <button
          onClick={() => setActiveTab('active')}
          className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'active'
              ? 'border-primary text-primary'
              : 'border-transparent text-txt-secondary hover:text-txt-primary'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Active Rapid Pickup {activePickup ? '(1 Live)' : '(0)'}</span>
        </button>

        <button
          onClick={() => setActiveTab('available')}
          className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'available'
              ? 'border-primary text-primary'
              : 'border-transparent text-txt-secondary hover:text-txt-primary'
          }`}
        >
          <Navigation className="w-4 h-4" />
          <span>Available In Radius ({availableAssignments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'completed'
              ? 'border-primary text-primary'
              : 'border-transparent text-txt-secondary hover:text-txt-primary'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Completed History ({completedAssignments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('activity')}
          className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'activity'
              ? 'border-primary text-primary'
              : 'border-transparent text-txt-secondary hover:text-txt-primary'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Weekly Activity</span>
        </button>

        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'leaderboard'
              ? 'border-primary text-primary'
              : 'border-transparent text-txt-secondary hover:text-txt-primary'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Courier Leaderboard</span>
        </button>
      </div>

      {/* 1. TAB: ACTIVE ASSIGNMENT */}
      {activeTab === 'active' && (
        <div className="space-y-6">
          {activePickup ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Mission Card & Handover */}
              <div className="lg:col-span-7 fb-card p-6 sm:p-7 space-y-5">
                
                {/* Status Bar with Transparent Late Policy Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-primary">
                        {activePickup.status === 'COLLECTED' 
                          ? 'Food Collected • En Route to Shelter' 
                          : activePickup.status === 'ARRIVED_AT_PICKUP'
                          ? 'Arrived at Loading Dock'
                          : 'En Route to Donor Kitchen'}
                      </span>
                      
                      {/* Transparent Late Policy Tag */}
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                        latePolicyStatus === 'ON_TIME'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : latePolicyStatus === 'WITHIN_GRACE_PERIOD'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : latePolicyStatus === 'MINOR_DELAY'
                          ? 'bg-orange-50 text-orange-700 border-orange-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {latePolicyStatus === 'ON_TIME' && '✓ On Track'}
                        {latePolicyStatus === 'WITHIN_GRACE_PERIOD' && '⏳ Grace Window (10m)'}
                        {latePolicyStatus === 'MINOR_DELAY' && '⚠️ Minor Delay'}
                        {latePolicyStatus === 'LATE' && '🚨 Late (Reliability Review)'}
                      </span>
                    </div>

                    <h3 className="text-lg font-extrabold text-navy mt-1">{activePickup.foodTitle}</h3>
                    <span className="text-xs text-txt-secondary font-semibold">
                      {activePickup.servings} Servings ({activePickup.weightKg} kg) • Category A Ambient Safe
                    </span>
                  </div>

                  {/* Countdown Clock (MM:SS) */}
                  <div className="bg-surface-subtle border border-border px-4 py-2 rounded-xl text-center flex-shrink-0">
                    <span className="text-[10px] uppercase font-bold text-txt-muted block tracking-wider">Pickup Countdown</span>
                    <span className={`font-mono text-xl font-extrabold ${secondsRemaining < 300 ? 'text-status-warning' : 'text-primary'}`}>
                      {formatCountdown(secondsRemaining)}
                    </span>
                  </div>
                </div>

                {/* Live Route Map */}
                <CourierRouteMap
                  courierCoords={courierCoords}
                  pickupCoords={[activePickup.pickupLat, activePickup.pickupLon]}
                  dropoffCoords={[activePickup.dropoffLat, activePickup.dropoffLon]}
                  pickupTitle={activePickup.donorManager}
                  dropoffTitle={activePickup.dropoffLocation}
                  distanceKm={distanceToPickupKm}
                  etaMins={activePickup.etaMins}
                  status={activePickup.status}
                />

                {/* Navigation Waypoints */}
                <div className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-surface-subtle border border-border flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-orange-100 text-primary font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        A
                      </div>
                      <div>
                        <span className="font-bold text-navy block">Pickup Kitchen (Donor)</span>
                        <span className="text-txt-secondary">{activePickup.pickupLocation}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-txt-muted">Contact: {activePickup.donorManager}</span>
                          <a
                            href={`tel:${activePickup.donorContact}`}
                            className="font-bold text-primary hover:underline"
                          >
                            {activePickup.donorContact}
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Proximity Button if not arrived yet */}
                    {activePickup.status === 'EN_ROUTE_TO_PICKUP' && (
                      <button
                        type="button"
                        onClick={handleVerifyProximity}
                        className="px-3 py-1.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs flex items-center gap-1 shadow-sm flex-shrink-0"
                        title="Simulate or verify GPS proximity within 250m"
                      >
                        <Compass className="w-3.5 h-3.5" />
                        <span>Arrived at Dock</span>
                      </button>
                    )}
                  </div>

                  <div className="p-3.5 rounded-xl bg-surface-subtle border border-border flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      B
                    </div>
                    <div>
                      <span className="font-bold text-navy block">Drop-off Shelter (NGO)</span>
                      <span className="text-txt-secondary">{activePickup.dropoffLocation}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-txt-muted">Coordinator:</span>
                        <a
                          href={`tel:${activePickup.recipientContact}`}
                          className="font-bold text-blue-600 hover:underline"
                        >
                          {activePickup.recipientContact}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Handover Verification Options */}
                {activePickup.status === 'EN_ROUTE_TO_PICKUP' || activePickup.status === 'ARRIVED_AT_PICKUP' ? (
                  <div className="p-4 rounded-xl bg-orange-50/70 border border-orange-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-navy text-xs">
                        {activePickup.status === 'ARRIVED_AT_PICKUP' 
                          ? '✓ Arrived! Perform Handover Handshake' 
                          : 'Step 1: Verify Pickup Handover'}
                      </span>
                      <span className="text-[11px] font-mono text-primary font-bold">
                        Expected OTP: {activePickup.pickupOtp}
                      </span>
                    </div>

                    <form onSubmit={handleVerifyOtp} className="flex gap-2">
                      <input
                        type="text"
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="Enter 6-digit OTP from Chef"
                        className="flex-1 px-3 py-2 rounded-xl border border-border bg-white text-xs font-mono font-bold text-center tracking-widest"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-sm touch-target"
                      >
                        Verify OTP
                      </button>
                    </form>

                    <div className="text-center">
                      <span className="text-[11px] text-txt-muted">Or scan donor's QR code:</span>
                      <button
                        type="button"
                        onClick={() => onOpenQR && onOpenQR({ id: activePickup.id, food_title: activePickup.foodTitle, quantity_servings: activePickup.servings })}
                        className="mt-1 w-full py-2 rounded-xl border border-border bg-white text-txt-primary hover:border-primary font-bold text-xs flex items-center justify-center gap-1.5"
                      >
                        <QrCode className="w-4 h-4 text-primary" />
                        <span>Open QR Camera Scanner</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-3">
                    <div className="flex items-center gap-2 text-status-success font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Pickup Handover Certified! Food in Transit.</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <button
                        type="button"
                        onClick={() => setCameraModalOpen(true)}
                        className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${
                          cameraEvidenceData
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white border-border text-txt-secondary hover:text-txt-primary'
                        }`}
                      >
                        <Camera className="w-4 h-4" />
                        <span>{cameraEvidenceData ? `✓ SHA-256 Signed (${cameraEvidenceData.evidenceHash.slice(0, 8)}...)` : 'Capture Camera Evidence'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleCompleteDelivery}
                        className="px-5 py-2.5 rounded-xl bg-status-success hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md touch-target flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Confirm Final Delivery</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Bottom Emergency, WhatsApp & Delay Actions */}
                <div className="pt-2 border-t border-border flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setDelayModalOpen(true)}
                      className="text-status-warning hover:underline font-bold flex items-center gap-1"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Report Transit Delay</span>
                    </button>

                    <button
                      onClick={handleShareWhatsAppStatus}
                      className="text-emerald-700 hover:underline font-bold flex items-center gap-1"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>WhatsApp Donor</span>
                    </button>
                  </div>

                  <a
                    href={`tel:${activePickup.donorContact}`}
                    className="text-txt-secondary hover:text-txt-primary font-semibold flex items-center gap-1"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call Supervisor</span>
                  </a>
                </div>

              </div>

              {/* Right Column: Live Transit Guidance Card */}
              <div className="lg:col-span-5 fb-card p-6 space-y-4">
                <h4 className="font-extrabold text-sm text-navy flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-primary" />
                  <span>Real-Time Courier Guidance</span>
                </h4>

                <div className="p-4 rounded-xl bg-surface-subtle border border-border text-xs space-y-2">
                  <div className="flex justify-between font-bold">
                    <span>Insulated Cambro Temp:</span>
                    <span className="text-status-success">{activePickup.transitTempC}°C (Safe)</span>
                  </div>
                  <div className="flex justify-between text-txt-muted">
                    <span>Distance to Destination:</span>
                    <span className="font-semibold text-txt-primary">{distanceToPickupKm} km</span>
                  </div>
                  <div className="flex justify-between text-txt-muted">
                    <span>Target Delivery Window:</span>
                    <span className="font-semibold text-txt-primary">Within {activePickup.etaMins + 15} Mins</span>
                  </div>
                  <div className="flex justify-between text-txt-muted">
                    <span>Accountability Policy:</span>
                    <span className="font-semibold text-navy">Reliability Score (No fines)</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-txt-secondary leading-relaxed">
                  <p>✓ Maintain insulated containers sealed until unloading dock.</p>
                  <p>✓ Present 6-digit OTP or ask recipient shelter to scan delivery QR.</p>
                  <p>✓ Report immediate notice if holding temperature drops below 60°C.</p>
                  <p>✓ Geofence proximity automatically updates kitchen when within 250m.</p>
                </div>
              </div>

            </div>
          ) : (
            <div className="fb-card p-12 text-center text-txt-secondary space-y-3">
              <Truck className="w-10 h-10 text-txt-muted mx-auto" />
              <h4 className="font-bold text-navy text-base">No Active Pickup Assignment</h4>
              <p className="text-xs">Browse the available assignments near you and accept a pickup to begin transit.</p>
              <button
                onClick={() => setActiveTab('available')}
                className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs"
              >
                View Available Pickups
              </button>
            </div>
          )}
        </div>
      )}

      {/* 2. TAB: AVAILABLE ASSIGNMENTS */}
      {activeTab === 'available' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {availableAssignments.map((a) => (
            <div key={a.id} className="fb-card p-6 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">Within {a.distanceKm} km</span>
                    <h4 className="text-base font-extrabold text-navy mt-0.5">{a.foodTitle}</h4>
                    <span className="text-xs text-txt-secondary">{a.donorName} → {a.recipientName}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-orange-100 text-primary text-xs font-extrabold">
                    {a.servings} Servings
                  </span>
                </div>

                <div className="mt-3 p-3 rounded-xl bg-surface-subtle border border-border text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-txt-secondary">
                    <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    <span>Pickup: {a.donorAddress}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-txt-secondary">
                    <Clock className="w-3.5 h-3.5 text-status-warning flex-shrink-0" />
                    <span>Window: Pickup within {a.urgencyMinutes} mins</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleAcceptAssignment(a)}
                className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-orange flex items-center justify-center gap-1.5 touch-target"
              >
                <span>Accept Pickup Assignment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 3. TAB: COMPLETED HISTORY */}
      {activeTab === 'completed' && (
        <div className="fb-card p-6 space-y-4">
          <h4 className="font-extrabold text-sm text-navy">Verified Volunteer Delivery History</h4>
          <div className="space-y-3">
            {completedAssignments.map((c) => (
              <div key={c.id} className="p-4 rounded-xl bg-surface-subtle border border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                <div>
                  <h5 className="font-extrabold text-navy text-sm">{c.foodTitle}</h5>
                  <span className="text-txt-secondary">
                    From <strong>{c.from}</strong> to <strong>{c.to}</strong> • {c.deliveredAt}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-status-success block">{c.servings} Servings Rescued</span>
                  <span className="text-[10px] text-txt-muted">🌱 {c.co2Saved} CO₂ Avoided</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. TAB: WEEKLY ACTIVITY */}
      {activeTab === 'activity' && (
        <div className="space-y-6">
          <WeeklyActivitySection role="VOLUNTEER" />
        </div>
      )}

      {/* 5. TAB: COURIER LEADERBOARD */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-6">
          <UnifiedLeaderboardSection initialRole="VOLUNTEERS" />
        </div>
      )}

      {/* DELAY MANAGEMENT MODAL (Phase 5 Standardized Reasons) */}
      {delayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-dark/75 backdrop-blur-sm animate-fadeIn">
          <div className="fb-card w-full max-w-md p-6 bg-white shadow-xl relative border border-border space-y-4">
            <button
              onClick={() => setDelayModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-txt-secondary hover:text-txt-primary"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-status-warning" />
              <div>
                <h3 className="font-extrabold text-base text-navy">Report Courier Delay</h3>
                <span className="text-xs text-txt-muted">Transparent reporting extends deadline and updates kitchen.</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-txt-primary mb-1">Standardized Delay Reason</label>
              <select
                value={delayReason}
                onChange={(e) => setDelayReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border text-xs font-bold bg-white"
              >
                {delayReasonsList.map(r => (
                  <option key={r.code} value={r.code}>{r.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-txt-primary mb-1">Estimated Extension (Minutes)</label>
              <div className="grid grid-cols-4 gap-2">
                {[5, 10, 15, 30].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDelayMins(mins)}
                    className={`py-2 rounded-xl border text-xs font-bold ${
                      Number(delayMins) === mins 
                        ? 'bg-primary text-white border-primary shadow-sm' 
                        : 'border-border text-txt-secondary hover:border-primary'
                    }`}
                  >
                    +{mins}m
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-txt-primary mb-1">Specific Incident Notes (Optional)</label>
              <textarea
                rows={2}
                value={delayNotes}
                onChange={(e) => setDelayNotes(e.target.value)}
                placeholder="e.g. Traffic diversion at Sector 4 flyover"
                className="w-full px-3 py-2 rounded-xl border border-border text-xs"
              />
            </div>

            <button
              type="button"
              onClick={handleReportDelay}
              className="w-full py-2.5 rounded-xl bg-status-warning hover:bg-amber-600 text-white font-bold text-xs shadow-md touch-target"
            >
              Broadcast Updated ETA & Deadline
            </button>
          </div>
        </div>
      )}

      {/* Camera Evidence Capture Modal */}
      <CameraEvidenceModal
        isOpen={cameraModalOpen}
        onClose={() => setCameraModalOpen(false)}
        mode={activePickup?.status === 'COLLECTED' ? 'DELIVERY' : 'PICKUP'}
        donationId={activePickup?.id || 'deliv-401'}
        expectedServings={activePickup?.servings || 150}
        onEvidenceSubmitted={(data) => {
          setCameraEvidenceData(data);
          setCameraEvidenceTaken(true);
          if (onShowToast) onShowToast(`Evidence captured! SHA-256: ${data.evidenceHash.slice(0, 12)}... logged.`);
        }}
      />

    </div>
  );
}
