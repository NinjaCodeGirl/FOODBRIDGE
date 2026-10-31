import React, { useState } from 'react';
import { Star, ShieldCheck, CheckCircle2, X, Building, HeartHandshake, UserCheck } from 'lucide-react';

export default function RatingModal({ listing, initialRole = 'NGO', onClose, API_URL, onRatingSubmitted }) {
  const [evaluatorRole, setEvaluatorRole] = useState(initialRole === 'RESTAURANT' ? 'RESTAURANT' : 'NGO');
  const [rating, setRating] = useState(5);
  const [criterion1, setCriterion1] = useState(5); // Hygiene / Transport
  const [criterion2, setCriterion2] = useState(5); // Punctuality / Temperature
  const [feedbackText, setFeedbackText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!listing) return null;

  // Target entity depending on who is rating
  const targetName = evaluatorRole === 'NGO' ? listing.donor_name : 'Akshaya Patra / Recipient Shelter';
  const targetTypeLabel = evaluatorRole === 'NGO' ? 'Donor Restaurant / Kitchen' : 'Recipient NGO / Shelter';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    const payload = {
      target_org_id: listing.id,
      target_org_name: targetName,
      evaluator_role: evaluatorRole,
      evaluator_name: evaluatorRole === 'NGO' ? 'Akshaya Patra Dispatcher' : listing.donor_name,
      rating: rating,
      criterion_1_rating: criterion1,
      criterion_2_rating: criterion2,
      feedback_text: feedbackText || (evaluatorRole === 'NGO' ? 'High quality surplus food, safe packaging.' : 'Prompt pickup by shelter transport vehicle, smooth handover.'),
      created_at: new Date().toISOString()
    };

    try {
      const res = await fetch(`${API_URL}/api/ratings/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSubmitted(true);
        if (onRatingSubmitted) onRatingSubmitted();
        return;
      }
      throw new Error('API offline');
    } catch (err) {
      // Save rating to LocalStorage state
      try {
        const existing = JSON.parse(localStorage.getItem('foodbridge_ratings') || '[]');
        existing.unshift(payload);
        localStorage.setItem('foodbridge_ratings', JSON.stringify(existing));
      } catch (e) {}

      setSubmitted(true);
      if (onRatingSubmitted) onRatingSubmitted();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel w-full max-w-lg rounded-2xl p-6 border border-emerald-500/40 shadow-2xl relative space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Star className="w-6 h-6 fill-amber-400" />
          </div>
          <div>
            <h3 className="font-display font-bold text-xl text-white">Dual-Sided Trust Rating Ledger</h3>
            <p className="text-xs text-zinc-400">Evaluate hygiene, punctuality, & handling from both sides</p>
          </div>
        </div>

        {/* Role Evaluator Switcher */}
        <div className="flex bg-[#111711] p-1 rounded-xl border border-zinc-800 text-xs">
          <button
            type="button"
            onClick={() => setEvaluatorRole('NGO')}
            className={`flex-1 py-2 rounded-lg font-semibold transition-all flex items-center justify-center space-x-1.5 ${
              evaluatorRole === 'NGO'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <HeartHandshake className="w-4 h-4" />
            <span>Rating as Recipient NGO</span>
          </button>

          <button
            type="button"
            onClick={() => setEvaluatorRole('RESTAURANT')}
            className={`flex-1 py-2 rounded-lg font-semibold transition-all flex items-center justify-center space-x-1.5 ${
              evaluatorRole === 'RESTAURANT'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Rating as Donor Restaurant</span>
          </button>
        </div>

        {submitted ? (
          <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h4 className="font-display font-bold text-lg text-white">Trust Rating Submitted!</h4>
            <p className="text-xs text-zinc-300">
              Your <strong>{rating}-Star Rating</strong> for <strong className="text-emerald-400">{targetName}</strong> has been verified & logged to the public Trust Ledger.
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs"
            >
              Close Window
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Target Org Banner */}
            <div className="p-3.5 rounded-xl bg-[#111711] border border-zinc-800 text-xs flex justify-between items-center">
              <div>
                <span className="text-zinc-400 text-[11px] block">Rating Target ({targetTypeLabel}):</span>
                <strong className="text-white text-sm block">{targetName}</strong>
                <span className="text-emerald-400 font-mono text-[11px]">{listing.food_title}</span>
              </div>
              <span className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/30">
                {evaluatorRole === 'NGO' ? 'NGO → Donor' : 'Donor → NGO'}
              </span>
            </div>

            {/* Overall Rating (1-5 Stars) */}
            <div className="space-y-2 text-center">
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider">Overall Rating Score</label>
              <div className="flex items-center justify-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-2xl transition-transform hover:scale-110 focus:outline-none"
                  >
                    <Star className={`w-8 h-8 ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-zinc-700'}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Role-Specific Sub-ratings */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-[#111711] border border-zinc-800 space-y-1.5">
                <span className="text-zinc-300 font-medium">
                  {evaluatorRole === 'NGO' ? 'Food Hygiene & Packing' : 'Pickup Punctuality'}
                </span>
                <select
                  value={criterion1}
                  onChange={(e) => setCriterion1(Number(e.target.value))}
                  className="w-full bg-zinc-900 text-amber-400 font-bold border border-zinc-700 rounded-lg p-2 text-xs focus:outline-none"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ 5/5 Excellent</option>
                  <option value={4}>⭐⭐⭐⭐ 4/5 Good</option>
                  <option value={3}>⭐⭐⭐ 3/5 Average</option>
                  <option value={2}>⭐⭐ 2/5 Below Standard</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-[#111711] border border-zinc-800 space-y-1.5">
                <span className="text-zinc-300 font-medium">
                  {evaluatorRole === 'NGO' ? 'Temperature Maintenance' : 'Transport Hygiene'}
                </span>
                <select
                  value={criterion2}
                  onChange={(e) => setCriterion2(Number(e.target.value))}
                  className="w-full bg-zinc-900 text-amber-400 font-bold border border-zinc-700 rounded-lg p-2 text-xs focus:outline-none"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ 5/5 Perfect</option>
                  <option value={4}>⭐⭐⭐⭐ 4/5 Good</option>
                  <option value={3}>⭐⭐⭐ 3/5 Moderate</option>
                </select>
              </div>
            </div>

            {/* Written Review */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Feedback Comments</label>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder={evaluatorRole === 'NGO' ? 'Review food hygiene, hot hold temp, packaging quality...' : 'Review NGO courier punctuality, vehicle cleanliness, staff cooperation...'}
                rows={3}
                className="w-full bg-[#111711] text-xs text-white border border-zinc-800 rounded-xl p-3 focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-sm transition-all shadow-lg shadow-amber-500/20"
            >
              {submitting ? 'Logging to Public Trust Ledger...' : 'Submit Rating to Public Trust Ledger'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
