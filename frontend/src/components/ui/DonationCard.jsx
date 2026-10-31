import React from 'react';
import StatusBadge from './StatusBadge';
import { 
  Clock, 
  MapPin, 
  Scale, 
  Building2, 
  PhoneCall, 
  QrCode, 
  Split, 
  RotateCcw, 
  ShieldCheck, 
  AlertTriangle,
  ChevronRight,
  Eye
} from 'lucide-react';

export default function DonationCard({
  donation,
  onView,
  onAction,
  onQuickDonateAgain,
  onTriggerSplit,
  onOpenQR,
  onOpenContact,
  role = 'DONOR',
  className = ''
}) {
  if (!donation) return null;

  // Calculate time remaining / expiry
  const deadlineDate = donation.pickup_deadline 
    ? new Date(donation.pickup_deadline) 
    : new Date(Date.now() + (donation.estimated_shelf_life_hours || 4) * 3600 * 1000);
  
  const diffMinutes = Math.round((deadlineDate.getTime() - Date.now()) / (1000 * 60));
  const isExpired = diffMinutes <= 0 || donation.status === 'EXPIRED';
  const isUrgent = diffMinutes > 0 && diffMinutes <= 60;

  const timeRemainingText = isExpired
    ? 'Expired'
    : diffMinutes < 60
    ? `${diffMinutes}m remaining`
    : `${Math.floor(diffMinutes / 60)}h ${diffMinutes % 60}m remaining`;

  const isCompleted = donation.status === 'DELIVERED' || donation.status === 'COMPLETED';

  return (
    <div className={`fb-card fb-card-hover p-4 sm:p-5 flex flex-col justify-between space-y-4 ${className}`}>
      
      {/* Top Header: Food Title & Status Badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <h3 className="font-bold text-base sm:text-lg text-txt-primary hover:text-primary transition-colors">
              {donation.food_title}
            </h3>
            {donation.classification === 'CATEGORY_B' && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                Cold Chain
              </span>
            )}
          </div>
          <p className="text-xs text-txt-secondary flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 flex-shrink-0 text-txt-muted" />
            <span className="truncate">{donation.donor_name || 'Commercial Donor'}</span>
            {donation.matched_ngo && (
              <>
                <span className="text-txt-muted">→</span>
                <span className="font-semibold text-primary">{donation.matched_ngo}</span>
              </>
            )}
          </p>
        </div>
        <StatusBadge status={donation.status || 'POSTED'} />
      </div>

      {/* Metrics Row: Servings, Weight, Storage */}
      <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-surface-subtle text-xs border border-border/60">
        <div>
          <span className="text-txt-secondary block text-[11px]">Quantity</span>
          <span className="font-bold text-txt-primary text-xs sm:text-sm">
            {donation.quantity_servings || donation.quantity || 0}
          </span>
          <span className="text-[10px] text-txt-muted block">servings</span>
        </div>

        <div>
          <span className="text-txt-secondary block text-[11px]">Est. Weight</span>
          <span className="font-bold text-txt-primary text-xs sm:text-sm">
            {donation.weight_kg ? `${donation.weight_kg} kg` : 'N/A'}
          </span>
          <span className="text-[10px] text-txt-muted block">approx.</span>
        </div>

        <div>
          <span className="text-txt-secondary block text-[11px]">Storage</span>
          <span className="font-bold text-txt-primary text-xs sm:text-sm truncate block">
            {donation.storage_condition || donation.storageType || 'Ambient'}
          </span>
          <span className="text-[10px] text-txt-muted block">condition</span>
        </div>
      </div>

      {/* Deadline & Location */}
      <div className="space-y-1.5 text-xs text-txt-secondary">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Clock className={`w-3.5 h-3.5 ${isUrgent ? 'text-status-warning' : isExpired ? 'text-status-danger' : 'text-primary'}`} />
            <span>Pickup Deadline</span>
          </span>
          <span className={`font-semibold px-2 py-0.5 rounded-full text-[11px] ${
            isExpired 
              ? 'bg-red-50 text-status-danger border border-red-200' 
              : isUrgent 
              ? 'bg-amber-50 text-status-warning border border-amber-300 font-bold' 
              : 'bg-emerald-50 text-primary border border-emerald-200'
          }`}>
            {timeRemainingText}
          </span>
        </div>

        {donation.pickup_address && (
          <div className="flex items-center gap-1.5 text-txt-muted truncate">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-primary" />
            <span className="truncate">{donation.pickup_address}</span>
          </div>
        )}

        {donation.allergens && donation.allergens.length > 0 && (
          <div className="flex flex-wrap items-center gap-1 pt-1 text-[11px]">
            <span className="font-medium text-txt-secondary">Allergens:</span>
            {donation.allergens.map((alg, i) => (
              <span key={i} className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[10px]">
                {alg}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons Row */}
      <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {onView && (
            <button
              onClick={() => onView(donation)}
              className="px-3 py-1.5 rounded-lg border border-border hover:bg-gray-50 text-txt-primary text-xs font-semibold flex items-center gap-1 transition-colors touch-target"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Details</span>
            </button>
          )}

          {onOpenContact && (
            <button
              onClick={() => onOpenContact(donation)}
              className="px-2.5 py-1.5 rounded-lg border border-border hover:bg-gray-50 text-txt-secondary text-xs font-medium flex items-center gap-1 transition-colors touch-target"
              title="Call contact"
            >
              <PhoneCall className="w-3.5 h-3.5 text-primary" />
              <span className="hidden sm:inline">Call</span>
            </button>
          )}

          {onTriggerSplit && role !== 'VOLUNTEER' && (
            <button
              onClick={() => onTriggerSplit(donation)}
              className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold flex items-center gap-1 transition-colors touch-target"
              title="Split allocation"
            >
              <Split className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Split</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isCompleted && onQuickDonateAgain && (
            <button
              onClick={() => onQuickDonateAgain(donation)}
              className="px-3 py-1.5 rounded-lg bg-primary-light hover:bg-primary-light/80 text-primary font-bold text-xs flex items-center gap-1 transition-all touch-target"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Donate Again</span>
            </button>
          )}

          {onOpenQR && (
            <button
              onClick={() => onOpenQR(donation)}
              className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-dark text-white font-semibold text-xs flex items-center gap-1 transition-all shadow-sm touch-target"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>QR Handover</span>
            </button>
          )}
        </div>
      </div>

    </div>
  );
}
