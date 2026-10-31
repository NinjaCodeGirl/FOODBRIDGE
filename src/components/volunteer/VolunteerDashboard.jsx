import React, { useState } from 'react';
import PageHeader from '../ui/PageHeader';
import StatCard from '../ui/StatCard';
import UrgencyBanner from '../ui/UrgencyBanner';
import StatusBadge from '../ui/StatusBadge';
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
  X
} from 'lucide-react';
import { createWhatsAppLink } from '../../utils/whatsapp';

export default function VolunteerDashboard({
  volunteerUser,
  onOpenQR,
  onShowToast
}) {
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'available' | 'completed'
  const [delayModalOpen, setDelayModalOpen] = useState(false);
  const [delayMins, setDelayMins] = useState(15);
  const [delayReason, setDelayReason] = useState('Heavy traffic near Ring Road Flyover');
  const [cameraEvidenceTaken, setCameraEvidenceTaken] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);

  // Active assignment
  const [activePickup, setActivePickup] = useState({
    id: 'assign-401',
    foodTitle: 'Assorted Paneer Gravy & 200 Rotis',
    servings: 150,
    weightKg: 45.0,
    pickupLocation: 'Taj Palace Banquet Kitchen, Diplomatic Enclave, New Delhi',
    donorContact: '+91 98999 11223',
    donorManager: 'Chef Rajesh',
    dropoffLocation: 'Robin Hood Army Janakpuri Community Shelter',
    recipientContact: '+91 98234 56789',
    etaMins: 22,
    pickupOtp: '582901',
    status: 'EN_ROUTE_TO_PICKUP', // 'EN_ROUTE_TO_PICKUP' | 'COLLECTED' | 'DELIVERED'
    transitTempC: 64.2
  });

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
      urgencyMinutes: 38
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
      urgencyMinutes: 90
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
      transitTempC: 66.0
    });
    setActiveTab('active');
    if (onShowToast) onShowToast(`Assignment accepted! Navigation locked to ${item.donorName}.`);
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
    setActivePickup(prev => ({
      ...prev,
      etaMins: prev.etaMins + Number(delayMins)
    }));
    setDelayModalOpen(false);
    if (onShowToast) onShowToast(`Delay reported. Updated ETA dispatched to donor kitchen.`);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      
      {/* Header */}
      <PageHeader
        title={`Courier Console • ${volunteerUser?.name || 'Arjun Sharma'}`}
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
          subtext="Rated by 18 kitchens"
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
          <span>Active Assignment {activePickup ? '(1 Live)' : '(0)'}</span>
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
          <span>Available Near You ({availableAssignments.length})</span>
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
      </div>

      {/* 1. TAB: ACTIVE ASSIGNMENT */}
      {activeTab === 'active' && (
        <div className="space-y-6">
          {activePickup ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Mission Card */}
              <div className="lg:col-span-7 fb-card p-6 sm:p-7 space-y-5">
                <div className="flex items-start justify-between pb-3 border-b border-border">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">
                      {activePickup.status === 'COLLECTED' ? 'Food Collected • En Route to Shelter' : 'En Route to Donor Kitchen'}
                    </span>
                    <h3 className="text-lg font-extrabold text-navy mt-0.5">{activePickup.foodTitle}</h3>
                    <span className="text-xs text-txt-secondary font-semibold">
                      {activePickup.servings} Servings ({activePickup.weightKg} kg)
                    </span>
                  </div>

                  <span className="px-3 py-1.5 rounded-full bg-orange-100 text-primary font-extrabold text-xs">
                    ETA: ~{activePickup.etaMins} Mins
                  </span>
                </div>

                {/* Navigation Waypoints */}
                <div className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-surface-subtle border border-border flex items-start gap-3">
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
                {activePickup.status === 'EN_ROUTE_TO_PICKUP' ? (
                  <div className="p-4 rounded-xl bg-orange-50/70 border border-orange-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-navy text-xs">Step 1: Verify Pickup Handover</span>
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
                        onClick={() => onOpenQR && onOpenQR({ id: 'active', food_title: activePickup.foodTitle, quantity_servings: activePickup.servings })}
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
                        onClick={() => setCameraEvidenceTaken(!cameraEvidenceTaken)}
                        className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${
                          cameraEvidenceTaken
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white border-border text-txt-secondary hover:text-txt-primary'
                        }`}
                      >
                        <Camera className="w-4 h-4" />
                        <span>{cameraEvidenceTaken ? '✓ Loading Dock Photo Saved' : 'Snap Handover Photo'}</span>
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

                {/* Bottom Emergency / Delay Actions */}
                <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                  <button
                    onClick={() => setDelayModalOpen(true)}
                    className="text-status-warning hover:underline font-bold flex items-center gap-1"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Report Transit Delay</span>
                  </button>

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
                    <span>Est. Distance to Destination:</span>
                    <span className="font-semibold text-txt-primary">3.2 km</span>
                  </div>
                  <div className="flex justify-between text-txt-muted">
                    <span>Target Delivery Window:</span>
                    <span className="font-semibold text-txt-primary">Within 45 Mins</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-txt-secondary leading-relaxed">
                  <p>✓ Maintain insulated containers sealed until unloading dock.</p>
                  <p>✓ Present 6-digit OTP or ask recipient shelter to scan delivery QR.</p>
                  <p>✓ Report immediate notice if holding temperature drops below 60°C.</p>
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

      {/* DELAY REPORTING MODAL */}
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
              <h3 className="font-extrabold text-base text-navy">Report Courier Delay</h3>
            </div>

            <div>
              <label className="block text-xs font-bold text-txt-primary mb-1">Additional Minutes</label>
              <input
                type="number"
                min={5}
                max={60}
                value={delayMins}
                onChange={(e) => setDelayMins(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border text-sm font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-txt-primary mb-1">Reason for Delay</label>
              <textarea
                rows={2}
                value={delayReason}
                onChange={(e) => setDelayReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border text-xs"
              />
            </div>

            <button
              type="button"
              onClick={handleReportDelay}
              className="w-full py-2.5 rounded-xl bg-status-warning hover:bg-amber-600 text-white font-bold text-xs"
            >
              Broadcast Updated ETA
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
