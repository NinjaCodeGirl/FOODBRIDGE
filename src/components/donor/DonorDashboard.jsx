import React, { useState } from 'react';
import PageHeader from '../ui/PageHeader';
import StatCard from '../ui/StatCard';
import UrgencyBanner from '../ui/UrgencyBanner';
import DonationTable from '../ui/DonationTable';
import StatusBadge from '../ui/StatusBadge';
import Timeline from '../ui/Timeline';
import EmptyState from '../ui/EmptyState';
import { 
  PlusCircle, 
  Clock, 
  Truck, 
  CheckCircle2, 
  Utensils, 
  AlertTriangle, 
  ShieldCheck, 
  MapPin, 
  PhoneCall, 
  QrCode, 
  RotateCcw, 
  ArrowRight, 
  Leaf, 
  Building2,
  ChevronRight,
  Info,
  Calendar,
  Sparkles,
  ExternalLink,
  Share2
} from 'lucide-react';
import { createWhatsAppLink, getPickupArrivalMessage } from '../../utils/whatsapp';
import { useAuth } from '../../context/AuthContext';

export default function DonorDashboard({
  donorName = 'Taj Palace Banquet Kitchen',
  donations = [],
  onPostFood,
  onViewDonation,
  onOpenQR,
  onOpenContact,
  onTrackPickup,
  onViewFullImpact,
  onTriggerSplit,
  onQuickDonateAgain,
  currentPlan = 'FOOD_PARTNER_PRO',
  onNavigateToPricing,
  onNavigateToSubscription,
  onNavigateToCompliance
}) {
  const { currentUser } = useAuth();
  const displayDonorName = currentUser?.organizationName || donorName;
  // Derive operational statistics from actual database records
  const activeDonationsCount = donations.filter(d => 
    ['POSTED', 'MATCHED', 'UNDER_REVIEW', 'ACCEPTED', 'PICKUP_ASSIGNED'].includes(d.status)
  ).length;

  const pendingPickupsCount = donations.filter(d => 
    ['MATCHED', 'ACCEPTED', 'PICKUP_ASSIGNED'].includes(d.status)
  ).length;

  const successfulDeliveriesCount = donations.filter(d => 
    ['COLLECTED', 'DELIVERED', 'COMPLETED'].includes(d.status)
  ).length;

  const totalMealsDonated = donations.reduce((acc, curr) => 
    acc + (Number(curr.quantity_servings || curr.quantity) || 0), 0
  );

  // Active pickup item (if any is in transit / assigned)
  const currentPickupItem = donations.find(d => 
    ['ACCEPTED', 'PICKUP_ASSIGNED', 'COLLECTED'].includes(d.status)
  ) || donations[1]; // Fallback to list-002 for demo demonstration

  // Needs your attention alerts
  const urgencyAlerts = [
    {
      id: 'alert-1',
      title: '350 prepared meals — pickup deadline in 47 min',
      subtitle: 'Robin Hood Army courier is currently 3.2 km away heading to your loading dock.',
      timeLeft: '47 min left',
      severity: 'warning',
      actionLabel: 'Track Pickup',
      onAction: () => {
        if (onTrackPickup) onTrackPickup(currentPickupItem);
      }
    },
    {
      id: 'alert-2',
      title: 'NGO acceptance pending for NSUT Dining surplus',
      subtitle: 'Akshaya Patra Foundation received the allocation notice. Window expires in 30 min.',
      timeLeft: '30 min window',
      severity: 'info',
      actionLabel: 'View Match',
      onAction: () => {
        if (onViewDonation) onViewDonation(donations[0]);
      }
    }
  ];

  // Current pickup timeline steps
  const pickupTimelineSteps = [
    {
      title: 'Allocation Accepted',
      description: 'Robin Hood Army confirmed receipt of 350 meals.',
      timestamp: '12:45 PM',
      actor: 'Priya Sharma (NGO Lead)'
    },
    {
      title: 'Courier Assigned',
      description: 'Volunteer vehicle DL-3C-9821 dispatched.',
      timestamp: '1:02 PM',
      actor: 'Arjun Sharma (Courier)'
    },
    {
      title: 'Food Inspection & Pickup Handover',
      description: 'Cryptographic QR token scan required at loading dock.',
      timestamp: 'Est. 1:25 PM',
      actor: 'Loading Dock #2'
    },
    {
      title: 'Delivered to Shelter',
      description: 'Distribution to 350 families at Janakpuri Shelter.',
      timestamp: 'Est. 1:45 PM',
      actor: 'Shelter Coordinator'
    }
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      
      {/* 1. OPERATIONAL CONTROL CENTER HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy tracking-tight font-display">
              Good morning, {displayDonorName}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-primary border border-orange-200">
              {currentUser?.fssaiNumber ? `FSSAI: ${currentUser.fssaiNumber}` : 'Commercial Donor Hub'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-txt-secondary mt-1">
            Active surplus redistribution, verification tokens, and compliance ledger.
          </p>
        </div>

        {/* Primary Top-Right CTAs */}
        <div className="flex flex-wrap items-center gap-2.5">
          {onNavigateToSubscription && (
            <button
              onClick={onNavigateToSubscription}
              className="px-3.5 py-2 rounded-xl bg-white border border-border hover:bg-gray-50 text-txt-primary font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
              title="Manage B2B SaaS Plan"
            >
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>{currentPlan === 'BUSINESS_PLUS' ? 'Business Plus' : currentPlan === 'COMMUNITY_FREE' ? 'Free Tier' : 'Pro Partner'}</span>
            </button>
          )}
          <button
            onClick={() => onPostFood && onPostFood()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md touch-target"
          >
            <PlusCircle className="w-4 h-4 stroke-[2.5]" />
            <span>+ Post Surplus Food</span>
          </button>
        </div>
      </div>

      {/* 2. NEEDS YOUR ATTENTION SECTION (Immediately below header on mobile/desktop) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-txt-secondary flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-status-warning" />
            <span>Needs Your Attention ({urgencyAlerts.length})</span>
          </h2>
          <span className="text-[11px] text-txt-muted">Sorted by urgency</span>
        </div>

        <div className="space-y-2.5">
          {urgencyAlerts.map(alert => (
            <UrgencyBanner
              key={alert.id}
              title={alert.title}
              subtitle={alert.subtitle}
              timeLeft={alert.timeLeft}
              severity={alert.severity}
              actionLabel={alert.actionLabel}
              onAction={alert.onAction}
            />
          ))}
        </div>
      </div>

      {/* 3. TOP STAT CARDS: Desktop 4 in row, Tablet 2x2, Mobile 2-col */}
      <div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            title="Active Donations"
            value={activeDonationsCount}
            subtext="Available on network"
            icon={Utensils}
            isDemo={false}
          />
          <StatCard
            title="Pending Pickups"
            value={pendingPickupsCount}
            subtext="In dispatch queue"
            icon={Truck}
            isDemo={false}
            change={pendingPickupsCount > 0 ? `${pendingPickupsCount} approaching` : null}
            isPositive={true}
          />
          <StatCard
            title="Successful Deliveries"
            value={successfulDeliveriesCount}
            subtext="Verified handovers"
            icon={CheckCircle2}
            isDemo={false}
          />
          <StatCard
            title="Meals Donated"
            value={totalMealsDonated.toLocaleString()}
            subtext="Rescued surplus portions"
            icon={Leaf}
            isDemo={false}
            change="+280 this week"
            isPositive={true}
          />
        </div>
      </div>

      {/* 4. CURRENT PICKUP TRACKER (When applicable) */}
      {currentPickupItem && (
        <div className="fb-card p-5 sm:p-6 border-l-4 border-l-primary space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-border">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-primary-light text-primary border border-primary/20">
                  Active Dispatch
                </span>
                <span className="text-[10px] font-bold text-txt-muted uppercase px-1.5 py-0.5 rounded bg-gray-100 border border-gray-200">
                  Demo tracking
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-txt-primary mt-1">
                Current Pickup: {currentPickupItem.food_title} ({currentPickupItem.quantity_servings} servings)
              </h2>
              <p className="text-xs text-txt-secondary flex items-center gap-1.5 mt-0.5">
                <Building2 className="w-3.5 h-3.5 text-primary" />
                <span>Destination: <strong>{currentPickupItem.matched_ngo || 'Robin Hood Army Janakpuri'}</strong></span>
                <span>•</span>
                <Clock className="w-3.5 h-3.5 text-status-warning" />
                <span className="font-semibold text-status-warning">Estimated Arrival: 18 mins</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => onOpenQR && onOpenQR(currentPickupItem)}
                className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold flex items-center gap-1.5 shadow-orange transition-all touch-target"
              >
                <QrCode className="w-4 h-4" />
                <span>Show Handover QR</span>
              </button>
              <a
                href={createWhatsAppLink('+919823456789', getPickupArrivalMessage(currentPickupItem, 'Arjun Sharma (Van DL-3C-9821)', 18))}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-status-success border border-emerald-200 text-xs font-bold flex items-center gap-1.5 transition-colors touch-target"
              >
                <Share2 className="w-4 h-4" />
                <span>WhatsApp Notice</span>
              </a>
              <button
                onClick={() => onOpenContact && onOpenContact(currentPickupItem)}
                className="px-3 py-2 rounded-xl border border-border hover:bg-gray-50 text-txt-secondary text-xs font-medium flex items-center gap-1.5 transition-colors touch-target"
              >
                <PhoneCall className="w-4 h-4 text-primary" />
                <span>Call Courier</span>
              </button>
            </div>
          </div>

          {/* Courier Snapshot & Live Progress Timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-1">
            
            {/* Courier Details Card */}
            <div className="p-4 rounded-xl bg-surface-subtle border border-border space-y-3">
              <div className="text-[11px] font-bold text-txt-secondary uppercase tracking-wider">
                Assigned Courier Details
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-primary font-bold text-sm">
                  AS
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-txt-primary">Arjun Sharma</h4>
                  <p className="text-[11px] text-txt-secondary">+91 98234 56789 • 4.9★ Rating</p>
                </div>
              </div>
              
              <div className="text-xs space-y-1.5 pt-2 border-t border-border/80">
                <div className="flex justify-between">
                  <span className="text-txt-secondary">Vehicle:</span>
                  <span className="font-semibold text-txt-primary">Insulated Van (DL-3C-9821)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-txt-secondary">Handshake OTP:</span>
                  <span className="font-extrabold text-primary font-mono text-sm tracking-wider">482 913</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-txt-secondary">Pickup Dock:</span>
                  <span className="font-medium text-txt-primary">Loading Dock #2 (Back Gate)</span>
                </div>
              </div>
            </div>

            {/* Handover Timeline */}
            <div className="lg:col-span-2">
              <div className="text-[11px] font-bold text-txt-secondary uppercase tracking-wider mb-3">
                Live Pickup & Handover Timeline
              </div>
              <Timeline steps={pickupTimelineSteps} currentStepIndex={1} />
            </div>

          </div>
        </div>
      )}

      {/* 5. ACTIVE DONATIONS LIST & TABLE */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-txt-primary">
              Active Donations Ledger
            </h2>
            <p className="text-xs text-txt-secondary mt-0.5">
              Live status, allocated shelters, and pickup countdown timers
            </p>
          </div>
          <button
            onClick={() => onPostFood && onPostFood()}
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            <span>+ Post Another Dish</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <DonationTable
          donations={donations}
          onView={onViewDonation}
          onOpenQR={onOpenQR}
          onOpenContact={onOpenContact}
          onTriggerSplit={onTriggerSplit}
          onQuickDonateAgain={(item) => {
            if (onQuickDonateAgain) onQuickDonateAgain(item);
          }}
          role="DONOR"
        />
      </div>

      {/* 6. BOTTOM ROW: SMART MATCH PREVIEW & MINI IMPACT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Smart Match Preview Card */}
        <div className="fb-card p-5 sm:p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>Intelligent Proximity Match Preview</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                Deterministic
              </span>
            </div>

            <div className="mt-3 p-3.5 rounded-xl bg-surface-subtle border border-border">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-txt-primary">
                    Akshaya Patra Foundation Shelter
                  </h3>
                  <p className="text-xs text-txt-secondary mt-0.5">
                    Dwarka Sector 10, New Delhi • Trust Score: 4.95★
                  </p>
                </div>
                <span className="text-xs font-bold text-primary bg-primary-light/50 px-2.5 py-1 rounded-lg border border-primary/20">
                  Top Ranked Match
                </span>
              </div>

              {/* Match Factors Grid */}
              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-border text-xs">
                <div>
                  <span className="text-txt-secondary block text-[11px]">Distance:</span>
                  <span className="font-bold text-txt-primary">1.8 km away</span>
                </div>
                <div>
                  <span className="text-txt-secondary block text-[11px]">Intake Capacity:</span>
                  <span className="font-bold text-txt-primary">Can accept 200 meals</span>
                </div>
                <div>
                  <span className="text-txt-secondary block text-[11px]">Pickup Availability:</span>
                  <span className="font-bold text-status-success">Available within 25 min</span>
                </div>
                <div>
                  <span className="text-txt-secondary block text-[11px]">Storage Compat:</span>
                  <span className="font-bold text-txt-primary">Ambient & Heated Holding</span>
                </div>
              </div>
            </div>

            {/* Why This Match Explanation */}
            <div className="mt-3.5 space-y-1.5">
              <span className="text-xs font-bold text-txt-primary block">
                Why this match?
              </span>
              <ul className="text-xs text-txt-secondary space-y-1">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                  <span><strong>1.8 km distance</strong> ensures hot food reaches the shelter within 20 mins.</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                  <span><strong>Capacity fit</strong>: Shelter has capacity for 200 portions (request: 180).</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                  <span><strong>Food requirement</strong>: Accepts prepared vegetarian cooked meals.</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
            <span className="text-txt-muted">Transparent deterministic scoring</span>
            <button
              onClick={() => onPostFood && onPostFood()}
              className="text-primary font-bold hover:underline inline-flex items-center gap-1"
            >
              <span>Match New Donation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Mini Impact Card */}
        <div className="fb-card p-5 sm:p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-txt-secondary flex items-center gap-1.5">
                <Leaf className="w-4 h-4 text-primary" />
                <span>Your Impact This Month</span>
              </span>
              <span className="text-[11px] font-semibold text-primary">
                Calculated from completed deliveries
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="p-3.5 rounded-xl bg-surface-subtle border border-border text-center">
                <div className="text-xl sm:text-2xl font-extrabold text-txt-primary">
                  143
                </div>
                <div className="text-[11px] text-txt-secondary mt-0.5">
                  Meals Delivered
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-subtle border border-border text-center">
                <div className="text-xl sm:text-2xl font-extrabold text-primary">
                  38 kg
                </div>
                <div className="text-[11px] text-txt-secondary mt-0.5">
                  Food Rescued
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-subtle border border-border text-center">
                <div className="text-xl sm:text-2xl font-extrabold text-txt-primary">
                  6
                </div>
                <div className="text-[11px] text-txt-secondary mt-0.5">
                  Pickups Completed
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/80 text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-950 font-bold">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>Estimated emissions avoided: 95 kg CO₂</span>
              </div>
              <p className="text-emerald-800 text-[11px] leading-relaxed">
                Based on diverting edible surplus food from anaerobic landfill decomposition (standard factor: 2.5 kg CO₂ equivalent per rescued meal).
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-border flex items-center justify-between">
            <span className="text-[11px] text-txt-muted">Audited delivery certificates</span>
            <button
              onClick={onViewFullImpact}
              className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all touch-target"
            >
              <span>View Full Impact</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
