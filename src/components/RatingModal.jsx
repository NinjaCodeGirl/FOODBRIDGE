import React, { useState } from 'react';
import { Star, ShieldCheck, CheckCircle2, X } from 'lucide-react';

export default function RatingModal({ listing, onClose, API_URL, onRatingSubmitted }) {
  const [rating, setRating] = useState(5);
  const [hygieneRating, setHygieneRating] = useState(5);
  const [punctualityRating, setPunctualityRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!listing) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/ratings/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_org_id: listing.id,
          target_org_name: listing.donor_name,
          evaluator_role: 'NGO',
          evaluator_name: 'Akshaya Patra Dispatcher',
          rating: rating,
          hygiene_rating: hygieneRating,
          punctuality_rating: punctualityRating,
          feedback_text: feedbackText || 'High quality surplus food, safe packaging and prompt pickup.'
        })
      });

      if (res.ok) {
        setSubmitted(true);
        if (onRatingSubmitted) onRatingSubmitted();
      }
    } catch (err) {
      setSubmitted(true);
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
            <h3 className="font-display font-bold text-xl text-white">Submit Trust Rating & Review</h3>
            <p className="text-xs text-zinc-400">Evaluate donor hygiene, packaging, & pickup experience</p>
          </div>
        </div>

        {submitted ? (
          <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h4 className="font-display font-bold text-lg text-white">Thank You for Your Feedback!</h4>
            <p className="text-xs text-zinc-300">
              Your 5-star rating for <strong className="text-emerald-400">{listing.donor_name}</strong> has been logged to the public Trust Ledger.
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
            <div className="p-3.5 rounded-xl bg-[#111711] border border-zinc-800 text-xs">
              <span className="text-zinc-400 block">Rating Target:</span>
              <strong className="text-white text-sm block">{listing.donor_name}</strong>
              <span className="text-emerald-400 font-mono">{listing.food_title}</span>
            </div>

            {/* Overall Rating (1-5 Stars) */}
            <div className="space-y-2 text-center">
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider">Overall Trust Score</label>
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

            {/* Sub-ratings: Hygiene & Punctuality */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-[#111711] border border-zinc-800 space-y-1.5">
                <span className="text-zinc-300 font-medium">Food Hygiene & Packing</span>
                <select
                  value={hygieneRating}
                  onChange={(e) => setHygieneRating(Number(e.target.value))}
                  className="w-full bg-zinc-900 text-amber-400 font-bold border border-zinc-700 rounded-lg p-2 text-xs focus:outline-none"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ 5/5 Excellent</option>
                  <option value={4}>⭐⭐⭐⭐ 4/5 Good</option>
                  <option value={3}>⭐⭐⭐ 3/5 Average</option>
                  <option value={2}>⭐⭐ 2/5 Needs Improvement</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-[#111711] border border-zinc-800 space-y-1.5">
                <span className="text-zinc-300 font-medium">Pickup Punctuality</span>
                <select
                  value={punctualityRating}
                  onChange={(e) => setPunctualityRating(Number(e.target.value))}
                  className="w-full bg-zinc-900 text-amber-400 font-bold border border-zinc-700 rounded-lg p-2 text-xs focus:outline-none"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ 5/5 On Time</option>
                  <option value={4}>⭐⭐⭐⭐ 4/5 Slight Delay</option>
                  <option value={3}>⭐⭐⭐ 3/5 Moderate Delay</option>
                </select>
              </div>
            </div>

            {/* Written Review */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Feedback Comments</label>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Write optional review details (e.g. food was well stored, temperature intact)..."
                rows={3}
                className="w-full bg-[#111711] text-xs text-white border border-zinc-800 rounded-xl p-3 focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-sm transition-all shadow-lg shadow-amber-500/20"
            >
              {submitting ? 'Submitting Rating...' : 'Submit Rating to Public Trust Ledger'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
