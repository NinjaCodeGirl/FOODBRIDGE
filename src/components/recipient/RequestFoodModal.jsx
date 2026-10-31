import React, { useState } from 'react';
import { X, Utensils, Clock, MapPin, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function RequestFoodModal({ listing, onClose, onSubmitRequest }) {
  const [requestedServings, setRequestedServings] = useState(listing ? Math.min(listing.quantity_servings, 50) : 50);
  const [recipientContact, setRecipientContact] = useState('+91 98101 23456');
  const [etaMins, setEtaMins] = useState(25);
  const [beneficiaryGroup, setBeneficiaryGroup] = useState('Community Shelter Residents');
  const [notes, setNotes] = useState('Insulated cambro warmers will be brought for transit.');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!listing) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (requestedServings <= 0) {
      setErrorMsg('Please specify at least 1 serving.');
      return;
    }
    if (requestedServings > listing.quantity_servings) {
      setErrorMsg(`Cannot request more than total available (${listing.quantity_servings} servings).`);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      onSubmitRequest({
        listingId: listing.id,
        foodTitle: listing.food_title,
        donorName: listing.donor_name,
        requestedServings: Number(requestedServings),
        recipientContact,
        etaMins: Number(etaMins),
        beneficiaryGroup,
        notes,
        requestedAt: new Date().toISOString()
      });
      setLoading(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-dark/75 backdrop-blur-sm animate-fadeIn">
      <div className="fb-card w-full max-w-lg p-6 sm:p-8 bg-white shadow-xl relative border border-border">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-txt-secondary hover:text-txt-primary rounded-xl hover:bg-surface-subtle transition-colors touch-target"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-orange-100 text-primary flex items-center justify-center font-bold">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-navy font-display">
              Request Food Donation
            </h3>
            <p className="text-xs text-txt-secondary">
              Reserve servings for verified distribution at your shelter
            </p>
          </div>
        </div>

        {/* Selected Donation Brief */}
        <div className="p-4 rounded-xl bg-surface-subtle border border-border space-y-2 mb-5">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Surplus Item</span>
              <h4 className="text-sm font-extrabold text-navy mt-0.5">{listing.food_title}</h4>
              <span className="text-xs text-txt-secondary block">{listing.donor_name}</span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
              {listing.freshness_score}% Fresh
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-txt-muted pt-1 border-t border-border">
            <span>Available: <strong>{listing.quantity_servings} Servings</strong></span>
            <span>Category: <strong>{listing.classification === 'CATEGORY_B' ? 'Cold Chain' : 'Ambient'}</strong></span>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-status-danger text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          
          <div>
            <label className="block font-bold text-txt-primary mb-1">
              Servings Needed (Max: {listing.quantity_servings}) *
            </label>
            <input
              type="number"
              min={1}
              max={listing.quantity_servings}
              value={requestedServings}
              onChange={(e) => setRequestedServings(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white text-txt-primary font-bold focus:border-primary text-base"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-txt-primary mb-1">Pickup ETA (Minutes) *</label>
              <input
                type="number"
                min={5}
                max={180}
                value={etaMins}
                onChange={(e) => setEtaMins(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-white text-xs font-semibold"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-txt-primary mb-1">Contact Phone *</label>
              <input
                type="text"
                value={recipientContact}
                onChange={(e) => setRecipientContact(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-white text-xs font-semibold"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-txt-primary mb-1">Target Beneficiary Group</label>
            <input
              type="text"
              value={beneficiaryGroup}
              onChange={(e) => setBeneficiaryGroup(e.target.value)}
              placeholder="e.g. Children's shelter, Migrant families, Community kitchen"
              className="w-full px-3 py-2 rounded-xl border border-border bg-white text-xs font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-txt-primary mb-1">Pickup Logistics Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Vehicle type, loading dock instructions"
              className="w-full px-3 py-2 rounded-xl border border-border bg-white text-xs"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-border hover:bg-surface-subtle font-semibold text-txt-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-orange flex items-center gap-1.5 touch-target"
            >
              {loading ? 'Submitting...' : 'Confirm Request & Reserve'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
