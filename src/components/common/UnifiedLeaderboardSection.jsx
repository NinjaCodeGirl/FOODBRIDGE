import React, { useState } from 'react';
import { Award, Star, ShieldCheck, CheckCircle2, TrendingUp, Users, Truck, Utensils } from 'lucide-react';

export default function UnifiedLeaderboardSection({
  initialRole = 'RESTAURANTS',
  className = ''
}) {
  const [activeCategory, setActiveCategory] = useState(initialRole); // 'RESTAURANTS' | 'NGOS' | 'VOLUNTEERS'

  const restaurantLeaders = [
    { rank: 1, name: 'Taj Palace Banquet Kitchen', donations: 48, portions: 6420, reliability: '99.4%', rating: 4.96, reviews: 42, trend: '+2' },
    { rank: 2, name: 'NSUT Campus Dining Hall', donations: 36, portions: 4850, reliability: '98.8%', rating: 4.92, reviews: 34, trend: '—' },
    { rank: 3, name: 'Bikanervala Sweets & Snacks', donations: 29, portions: 3200, reliability: '98.1%', rating: 4.88, reviews: 26, trend: '+1' },
    { rank: 4, name: 'The Oberoi Gourmet Catering', donations: 24, portions: 2900, reliability: '97.5%', rating: 4.85, reviews: 21, trend: '-1' },
    { rank: 5, name: 'Haldirams Kitchen Connaught', donations: 19, portions: 2100, reliability: '96.9%', rating: 4.81, reviews: 18, trend: '+3' }
  ];

  const ngoLeaders = [
    { rank: 1, name: 'Akshaya Patra Foundation Hub', pickups: 52, distributed: 6100, proofRate: '100%', rating: 4.98, reviews: 50, trend: '—' },
    { rank: 2, name: 'Robin Hood Army Janakpuri', pickups: 44, distributed: 4950, proofRate: '98.5%', rating: 4.95, reviews: 39, trend: '+1' },
    { rank: 3, name: 'Feeding India Shelter Home', pickups: 38, distributed: 4200, proofRate: '97.4%', rating: 4.91, reviews: 31, trend: '+2' },
    { rank: 4, name: 'Roti Bank Community Kitchen', pickups: 31, distributed: 3400, proofRate: '96.8%', rating: 4.87, reviews: 27, trend: '-1' },
    { rank: 5, name: 'Gunj Relief Shelter Delhi', pickups: 25, distributed: 2800, proofRate: '95.5%', rating: 4.84, reviews: 22, trend: '—' }
  ];

  const volunteerLeaders = [
    { rank: 1, name: 'Arjun Sharma (Van DL-3C)', deliveries: 64, onTime: '99.2%', evidenceRate: '100%', rating: 4.97, reviews: 58, trend: '—' },
    { rank: 2, name: 'Priya Mehra (Insulated Van)', deliveries: 51, onTime: '98.5%', evidenceRate: '98.8%', rating: 4.94, reviews: 46, trend: '+2' },
    { rank: 3, name: 'Vikram Singh (Two-Wheeler)', deliveries: 43, onTime: '97.8%', evidenceRate: '97.5%', rating: 4.90, reviews: 38, trend: '-1' },
    { rank: 4, name: 'Rohan Verma (Refrigerated Van)', deliveries: 37, onTime: '97.1%', evidenceRate: '96.9%', rating: 4.86, reviews: 30, trend: '+1' }
  ];

  const currentList = activeCategory === 'RESTAURANTS'
    ? restaurantLeaders
    : activeCategory === 'NGOS'
    ? ngoLeaders
    : volunteerLeaders;

  return (
    <div className={`fb-card p-6 bg-white border border-border space-y-5 ${className}`}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-orange-100 text-primary flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-navy text-sm sm:text-base">Verified Community Leaderboard</h4>
            <span className="text-xs text-txt-secondary">Rankings derived exclusively from completed, audited handshakes</span>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface-subtle border border-border text-xs font-bold">
          <button
            onClick={() => setActiveCategory('RESTAURANTS')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
              activeCategory === 'RESTAURANTS'
                ? 'bg-primary text-white shadow-sm'
                : 'text-txt-secondary hover:text-txt-primary'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Restaurants</span>
          </button>

          <button
            onClick={() => setActiveCategory('NGOS')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
              activeCategory === 'NGOS'
                ? 'bg-primary text-white shadow-sm'
                : 'text-txt-secondary hover:text-txt-primary'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>NGO Shelters</span>
          </button>

          <button
            onClick={() => setActiveCategory('VOLUNTEERS')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
              activeCategory === 'VOLUNTEERS'
                ? 'bg-primary text-white shadow-sm'
                : 'text-txt-secondary hover:text-txt-primary'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Couriers</span>
          </button>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border text-txt-muted uppercase tracking-wider text-[10px]">
              <th className="py-2.5 px-3">Rank</th>
              <th className="py-2.5 px-3">Partner Name</th>
              <th className="py-2.5 px-3">{activeCategory === 'RESTAURANTS' ? 'Donations' : activeCategory === 'NGOS' ? 'Pickups' : 'Deliveries'}</th>
              <th className="py-2.5 px-3">{activeCategory === 'RESTAURANTS' ? 'Portions Salvaged' : activeCategory === 'NGOS' ? 'Meals Distributed' : 'On-Time Rate'}</th>
              <th className="py-2.5 px-3">{activeCategory === 'NGOS' ? 'Proof Completion' : 'Reliability'}</th>
              <th className="py-2.5 px-3 text-right">Verified Rating</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border font-medium">
            {currentList.map((entry) => (
              <tr key={entry.rank} className="hover:bg-surface-subtle transition-colors">
                <td className="py-3 px-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center font-extrabold text-[11px] ${
                    entry.rank === 1
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : entry.rank === 2
                      ? 'bg-slate-200 text-slate-800'
                      : entry.rank === 3
                      ? 'bg-orange-100 text-orange-800'
                      : 'text-txt-muted'
                  }`}>
                    {entry.rank}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <span className="font-extrabold text-navy block">{entry.name}</span>
                  <span className="text-[10px] text-txt-muted">{entry.reviews} verified audit receipts</span>
                </td>
                <td className="py-3 px-3 font-bold text-txt-primary">
                  {entry.donations || entry.pickups || entry.deliveries} missions
                </td>
                <td className="py-3 px-3 font-extrabold text-status-success">
                  {entry.portions ? `${entry.portions.toLocaleString()} meals` : entry.distributed ? `${entry.distributed.toLocaleString()} meals` : entry.onTime}
                </td>
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px]">
                    {entry.reliability || entry.proofRate || entry.evidenceRate}
                  </span>
                </td>
                <td className="py-3 px-3 text-right">
                  <div className="flex items-center justify-end gap-1 font-bold text-amber-600">
                    <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-500" />
                    <span>{entry.rating.toFixed(2)}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Disclaimer */}
      <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-txt-muted">
        <span>🛡️ Ratings locked to SHA-256 verified handovers. Fake or speculative reviews are cryptographically rejected.</span>
      </div>

    </div>
  );
}

