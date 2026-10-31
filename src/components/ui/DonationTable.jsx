import React from 'react';
import StatusBadge from './StatusBadge';
import DonationCard from './DonationCard';
import { Eye, RotateCcw, QrCode, Split, PhoneCall, Clock } from 'lucide-react';

export default function DonationTable({
  donations = [],
  onView,
  onAction,
  onQuickDonateAgain,
  onTriggerSplit,
  onOpenQR,
  onOpenContact,
  role = 'DONOR',
  emptyMessage = 'No active donations found.'
}) {
  if (!donations || donations.length === 0) {
    return (
      <div className="fb-card p-8 text-center text-txt-secondary text-sm">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div>
      {/* Mobile & Tablet Card View (< 768px) */}
      <div className="md:hidden space-y-4">
        {donations.map((donation) => (
          <DonationCard
            key={donation.id}
            donation={donation}
            onView={onView}
            onAction={onAction}
            onQuickDonateAgain={onQuickDonateAgain}
            onTriggerSplit={onTriggerSplit}
            onOpenQR={onOpenQR}
            onOpenContact={onOpenContact}
            role={role}
          />
        ))}
      </div>

      {/* Desktop Table View (>= 768px) */}
      <div className="hidden md:block fb-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-surface-subtle border-b border-border text-txt-secondary uppercase tracking-wider text-[11px] font-semibold">
                <th scope="col" className="py-3.5 px-4 font-semibold">Food</th>
                <th scope="col" className="py-3.5 px-4 font-semibold">Quantity</th>
                <th scope="col" className="py-3.5 px-4 font-semibold">Pickup Deadline</th>
                <th scope="col" className="py-3.5 px-4 font-semibold">Matched NGO</th>
                <th scope="col" className="py-3.5 px-4 font-semibold">Status</th>
                <th scope="col" className="py-3.5 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-white">
              {donations.map((donation) => {
                const deadlineDate = donation.pickup_deadline 
                  ? new Date(donation.pickup_deadline) 
                  : new Date(Date.now() + (donation.estimated_shelf_life_hours || 4) * 3600 * 1000);
                const diffMinutes = Math.round((deadlineDate.getTime() - Date.now()) / (1000 * 60));
                const isUrgent = diffMinutes > 0 && diffMinutes <= 60;
                const isExpired = diffMinutes <= 0 || donation.status === 'EXPIRED';

                const isCompleted = donation.status === 'DELIVERED' || donation.status === 'COMPLETED';

                return (
                  <tr key={donation.id} className="hover:bg-gray-50/80 transition-colors">
                    
                    {/* Food column */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-txt-primary">
                        {donation.food_title}
                      </div>
                      <div className="text-xs text-txt-secondary flex items-center gap-1.5 mt-0.5">
                        <span>{donation.food_category || 'Cooked Food'}</span>
                        {donation.classification === 'CATEGORY_B' && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                            Cold Chain
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Quantity column */}
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-txt-primary">
                        {donation.quantity_servings || donation.quantity || 0}
                      </span>
                      <span className="text-xs text-txt-secondary block">
                        {donation.weight_kg ? `(${donation.weight_kg} kg)` : 'servings'}
                      </span>
                    </td>

                    {/* Pickup deadline column */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Clock className={`w-3.5 h-3.5 ${isUrgent ? 'text-status-warning' : isExpired ? 'text-status-danger' : 'text-primary'}`} />
                        <span className={isUrgent ? 'text-status-warning font-bold' : isExpired ? 'text-status-danger' : 'text-txt-primary'}>
                          {isExpired ? 'Expired' : `${Math.max(1, diffMinutes)}m remaining`}
                        </span>
                      </div>
                      <span className="text-[11px] text-txt-secondary block mt-0.5">
                        {deadlineDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>

                    {/* Matched NGO */}
                    <td className="py-3.5 px-4">
                      {donation.matched_ngo ? (
                        <div>
                          <span className="font-semibold text-primary block">
                            {donation.matched_ngo}
                          </span>
                          <span className="text-[11px] text-txt-secondary">
                            Confirmed Partner
                          </span>
                        </div>
                      ) : (
                        <span className="text-txt-muted italic text-xs">
                          Matching in progress...
                        </span>
                      )}
                    </td>

                    {/* Status badge */}
                    <td className="py-3.5 px-4">
                      <StatusBadge status={donation.status || 'POSTED'} size="sm" />
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {onView && (
                          <button
                            onClick={() => onView(donation)}
                            className="p-1.5 rounded-lg border border-border hover:bg-gray-100 text-txt-secondary hover:text-txt-primary transition-colors"
                            title="View details"
                            aria-label={`View details for ${donation.food_title}`}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}

                        {onOpenQR && (
                          <button
                            onClick={() => onOpenQR(donation)}
                            className="px-2.5 py-1.5 rounded-lg bg-primary hover:bg-primary-dark text-white text-xs font-semibold flex items-center gap-1 shadow-sm transition-all"
                            title="QR Handover"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>QR</span>
                          </button>
                        )}

                        {isCompleted && onQuickDonateAgain && (
                          <button
                            onClick={() => onQuickDonateAgain(donation)}
                            className="px-2.5 py-1.5 rounded-lg bg-primary-light hover:bg-primary-light/80 text-primary text-xs font-bold flex items-center gap-1 transition-all"
                            title="Quick Donate Again"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Again</span>
                          </button>
                        )}
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
