import React, { useState } from 'react';
import { 
  ShieldCheck, X, AlertTriangle, CheckCircle2, User, 
  Phone, Building2, Flag, FileText, Eye, ChevronDown, ChevronUp 
} from 'lucide-react';

/**
 * Independent Witness Verification Modal.
 * Enforces Anti-Self-Witnessing Rule: NGO cannot verify its own distribution event.
 */
export default function WitnessVerificationModal({ isOpen, onClose, event, onVerified }) {
  const [witnessName, setWitnessName] = useState('');
  const [witnessPhone, setWitnessPhone] = useState('');
  const [witnessOrg, setWitnessOrg] = useState('');
  const [observedQty, setObservedQty] = useState(event?.servings_distributed || '');
  const [witnessNotes, setWitnessNotes] = useState('');
  const [discrepancyFlagged, setDiscrepancyFlagged] = useState(false);
  const [discrepancyNotes, setDiscrepancyNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [orgValidationError, setOrgValidationError] = useState('');
  const [showEventDetails, setShowEventDetails] = useState(false);

  const ngoName = event?.ngo_name || 'Akshaya Patra Foundation Shelter';

  const handleSubmit = () => {
    setOrgValidationError('');

    // Anti-Self-Witnessing Rule enforcement (client-side preview; server also validates)
    if (witnessOrg && ngoName && ngoName.toLowerCase().split(' ').some(word => 
      word.length > 3 && witnessOrg.toLowerCase().includes(word)
    )) {
      setOrgValidationError(
        `Independent Verification Violation: "${witnessOrg}" appears to be the same organisation as the NGO host "${ngoName}". An NGO cannot independently verify its own distribution event. Please provide a genuinely independent community observer, civic coordinator, or FoodBridge field auditor.`
      );
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      if (onVerified) {
        onVerified({
          eventId: event?.id,
          witnessName,
          witnessPhone,
          witnessOrganization: witnessOrg,
          witnessConfirmed: true,
          witnessNotes: discrepancyFlagged
            ? `DISCREPANCY FLAGGED: ${discrepancyNotes}. Observer notes: ${witnessNotes}`
            : witnessNotes,
          discrepancyFlagged,
          observedQuantity: Number(observedQty)
        });
      }
      onClose();
    }, 800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-border shadow-2xl overflow-hidden animate-scaleUp my-8">
        {/* Header */}
        <div className="bg-navy text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Independent Witness Verification</h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Anti-Self-Witnessing Rule enforced. Third-party only.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Anti-Self-Witnessing Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-amber-900">
              <strong>Independence Requirement:</strong> The witness organisation must be completely independent from <strong>{ngoName}</strong>. Eligible witnesses include: community welfare councils, school principals, municipal supervisors, religious trust coordinators, or a FoodBridge registered field auditor.
            </div>
          </div>

          {/* Distribution Event Summary (Collapsible) */}
          <div className="fb-card p-3 border border-border rounded-xl bg-surface-subtle text-xs">
            <button
              type="button"
              onClick={() => setShowEventDetails(prev => !prev)}
              className="w-full flex items-center justify-between font-bold text-navy"
            >
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-primary" />
                Distribution Event: {event?.event_code || 'DIST-202610-9941'}
              </span>
              {showEventDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showEventDetails && (
              <div className="mt-3 grid grid-cols-2 gap-2 pt-2 border-t border-border text-[11px]">
                <div><span className="text-txt-muted">NGO Host:</span> <strong className="text-navy">{ngoName}</strong></div>
                <div><span className="text-txt-muted">Location:</span> <strong className="text-navy">{event?.actual_location || 'Janakpuri Block B'}</strong></div>
                <div><span className="text-txt-muted">Received:</span> <strong className="text-navy">{event?.quantity_received || 350} Servings</strong></div>
                <div><span className="text-txt-muted">Distributed:</span> <strong className="text-primary">{event?.servings_distributed || 280} Servings</strong></div>
                <div><span className="text-txt-muted">Beneficiaries:</span> <strong className="text-navy">{event?.beneficiary_count || 270}</strong></div>
                <div><span className="text-txt-muted">Date:</span> <strong className="text-navy">{event?.distribution_date || new Date().toLocaleDateString()}</strong></div>
              </div>
            )}
          </div>

          {/* Witness Details Form */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-navy uppercase tracking-wider">Witness Identity & Credentials</h4>

            <div>
              <label className="block text-[11px] font-bold text-txt-secondary mb-1">
                <User className="inline w-3.5 h-3.5 mr-1" /> Full Name of Witness *
              </label>
              <input
                type="text"
                value={witnessName}
                onChange={(e) => setWitnessName(e.target.value)}
                placeholder="Dr. Priya Sharma"
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-border text-navy focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-txt-secondary mb-1">
                  <Phone className="inline w-3.5 h-3.5 mr-1" /> Mobile Number *
                </label>
                <input
                  type="tel"
                  value={witnessPhone}
                  onChange={(e) => setWitnessPhone(e.target.value)}
                  placeholder="+91 98111 22334"
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-border text-navy focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-txt-secondary mb-1">
                  <Building2 className="inline w-3.5 h-3.5 mr-1" /> Organisation / Institution *
                </label>
                <input
                  type="text"
                  value={witnessOrg}
                  onChange={(e) => {
                    setWitnessOrg(e.target.value);
                    setOrgValidationError('');
                  }}
                  placeholder="Delhi Civic Welfare Council"
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-border text-navy focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>

            {/* Self-witnessing validation error */}
            {orgValidationError && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{orgValidationError}</span>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-txt-secondary mb-1">
                Observed Quantity During Distribution
              </label>
              <input
                type="number"
                min="0"
                value={observedQty}
                onChange={(e) => setObservedQty(e.target.value)}
                placeholder="Meals visually verified..."
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-border text-navy focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-txt-secondary mb-1">
                Independent Witness Statement *
              </label>
              <textarea
                value={witnessNotes}
                onChange={(e) => setWitnessNotes(e.target.value)}
                placeholder="I observed the distribution at the stated location. The food was properly maintained. Approximately X beneficiaries received meals in an orderly manner..."
                rows={3}
                className="w-full text-xs p-3 rounded-xl border border-border text-navy focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Discrepancy Flag Option */}
          <div className={`p-3.5 rounded-xl border transition-all ${discrepancyFlagged ? 'bg-red-50 border-red-300' : 'bg-surface-subtle border-border'}`}>
            <button
              type="button"
              onClick={() => setDiscrepancyFlagged(prev => !prev)}
              className="flex items-center gap-2 text-xs font-bold w-full"
            >
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${discrepancyFlagged ? 'bg-red-600 border-red-600' : 'border-gray-400'}`}>
                {discrepancyFlagged && <CheckCircle2 className="w-3 h-3 text-white" />}
              </div>
              <Flag className={`w-3.5 h-3.5 ${discrepancyFlagged ? 'text-red-600' : 'text-txt-muted'}`} />
              <span className={discrepancyFlagged ? 'text-red-700' : 'text-txt-muted'}>
                Flag a discrepancy or concern for Admin review
              </span>
            </button>

            {discrepancyFlagged && (
              <textarea
                value={discrepancyNotes}
                onChange={(e) => setDiscrepancyNotes(e.target.value)}
                placeholder="Describe what you observed that differs from the claimed report (missing quantities, different beneficiary count, food quality concerns, etc.)"
                rows={2}
                className="mt-2.5 w-full text-xs p-2.5 rounded-xl border border-red-300 text-red-900 focus:outline-none focus:ring-2 focus:ring-red-400 bg-white"
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-surface-subtle border-t border-border flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-txt-secondary hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !witnessName || !witnessPhone || !witnessOrg || !witnessNotes}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-status-success hover:bg-emerald-700 disabled:opacity-50 text-white shadow-md flex items-center gap-2 transition-transform active:scale-95"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{submitting ? 'Recording Attestation...' : 'Submit Independent Verification'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

