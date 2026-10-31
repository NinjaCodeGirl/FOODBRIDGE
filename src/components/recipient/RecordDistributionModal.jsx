import React, { useState } from 'react';
import { X, CheckCircle2, Users, HeartHandshake, FileText, ArrowRight, ShieldCheck } from 'lucide-react';

export default function RecordDistributionModal({ requestItem, onClose, onRecordSubmitted }) {
  const [servingsDistributed, setServingsDistributed] = useState(requestItem?.servings || 50);
  const [beneficiaryCount, setBeneficiaryCount] = useState(Math.round((requestItem?.servings || 50) * 0.9));
  const [distributionCenter, setDistributionCenter] = useState('Dwarka Sector 10 Community Hub');
  const [witnessName, setWitnessName] = useState('Pooja Verma (Field Supervisor)');
  const [distributionNotes, setDistributionNotes] = useState('All hot meals consumed within 90 minutes of arrival. Zero spoilage.');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      onRecordSubmitted({
        requestId: requestItem?.id || `req-${Date.now()}`,
        foodTitle: requestItem?.food_title || 'Assorted Meals',
        servingsDistributed: Number(servingsDistributed),
        beneficiaryCount: Number(beneficiaryCount),
        distributionCenter,
        witnessName,
        distributionNotes,
        timestamp: new Date().toISOString()
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
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-status-success flex items-center justify-center font-bold">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-navy font-display">
              Record Final Distribution
            </h3>
            <p className="text-xs text-txt-secondary">
              Certify meals handed over to beneficiaries to issue impact receipt
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-txt-primary mb-1">Meals Distributed *</label>
              <input
                type="number"
                min={1}
                value={servingsDistributed}
                onChange={(e) => setServingsDistributed(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white text-txt-primary font-bold focus:border-primary text-base"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-txt-primary mb-1">Beneficiaries Served *</label>
              <input
                type="number"
                min={1}
                value={beneficiaryCount}
                onChange={(e) => setBeneficiaryCount(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white text-txt-primary font-bold focus:border-primary text-base"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-txt-primary mb-1">Distribution Center Location *</label>
            <input
              type="text"
              value={distributionCenter}
              onChange={(e) => setDistributionCenter(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-border bg-white text-xs font-semibold"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-txt-primary mb-1">Distribution Field Supervisor / Witness *</label>
            <input
              type="text"
              value={witnessName}
              onChange={(e) => setWitnessName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-border bg-white text-xs font-semibold"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-txt-primary mb-1">Distribution Verification Notes</label>
            <textarea
              rows={2}
              value={distributionNotes}
              onChange={(e) => setDistributionNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-border bg-white text-xs"
            />
          </div>

          <div className="p-3 rounded-xl bg-orange-50 border border-orange-200 text-xs text-orange-950 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0" />
            <span>This log automatically updates the public Carbon Mitigation & Meals Rescued Ledger.</span>
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
              className="px-6 py-2.5 rounded-xl bg-status-success hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5 touch-target"
            >
              {loading ? 'Recording...' : 'Certify & Record Distribution'}
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

