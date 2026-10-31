import React, { useState } from 'react';
import { Utensils, MapPin, Clock, PhoneCall, QrCode, Split, Search, Star } from 'lucide-react';

export default function SurplusFeed({ listings, onTriggerSplit, onOpenContactModal, onOpenQRModal, onOpenRatingModal }) {
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredListings = listings.filter(item => {
    const matchesCategory = filterCategory === 'ALL' || item.classification === filterCategory;
    const lowerQuery = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      item.food_title.toLowerCase().includes(lowerQuery) ||
      item.donor_name.toLowerCase().includes(lowerQuery) ||
      item.pickup_address.toLowerCase().includes(lowerQuery);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header, Search & Filter Row */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-panel p-4 rounded-xl border border-[#1f2b1f]">
        <div>
          <h2 className="font-display font-bold text-xl text-white flex items-center space-x-2">
            <Utensils className="w-5 h-5 text-emerald-400" />
            <span>Active Surplus Food Feed</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">Real-time available food donations across Delhi NCR</p>
        </div>

        {/* Search Bar & Filter Pills */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          
          {/* Live Search Input */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by dish, donor, or area..."
              className="w-full bg-[#111711] text-xs text-white pl-9 pr-3 py-2 rounded-xl border border-zinc-800 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-1.5 bg-[#111711] p-1 rounded-xl border border-zinc-800 text-xs">
            <button
              onClick={() => setFilterCategory('ALL')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                filterCategory === 'ALL' ? 'bg-emerald-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              All ({listings.length})
            </button>

            <button
              onClick={() => setFilterCategory('CATEGORY_A')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center space-x-1 ${
                filterCategory === 'CATEGORY_A' ? 'bg-emerald-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Cat A</span>
            </button>

            <button
              onClick={() => setFilterCategory('CATEGORY_B')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center space-x-1 ${
                filterCategory === 'CATEGORY_B' ? 'bg-blue-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span>Cat B</span>
            </button>
          </div>

        </div>
      </div>

      {/* Feed Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredListings.length === 0 ? (
          <div className="md:col-span-2 glass-panel p-12 text-center text-zinc-400 rounded-2xl border border-zinc-800">
            No surplus listings matched your search filter. Try clearing the search bar or listing new surplus.
          </div>
        ) : (
          filteredListings.map((item) => (
            <div key={item.id} className="glass-panel glass-panel-hover rounded-2xl p-6 border border-[#1f2b1f] flex flex-col justify-between space-y-4">
              
              {/* Top Row: Donor & Badges */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-white text-base">{item.donor_name}</span>
                    <span className="text-xs text-zinc-400">({item.donor_phone || '+91 98765 43210'})</span>
                  </div>
                  <h3 className="font-display font-bold text-lg text-emerald-400 mt-1">{item.food_title}</h3>
                </div>

                {/* Classification Tag */}
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide ${
                  item.classification === 'CATEGORY_B'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {item.classification === 'CATEGORY_B' ? '❄️ Category B (Cold Chain)' : '🌾 Category A (Ambient)'}
                </span>
              </div>

              {/* Middle Stats Grid */}
              <div className="grid grid-cols-3 gap-2 text-xs bg-[#111711] p-3 rounded-xl border border-zinc-800/80">
                <div>
                  <span className="text-zinc-400 block">Quantity</span>
                  <span className="font-bold text-white text-sm">{item.quantity_servings} Servings</span>
                  <span className="text-[10px] text-zinc-500 block">({item.weight_kg} kg)</span>
                </div>

                <div>
                  <span className="text-zinc-400 block">AI Freshness</span>
                  <span className="font-bold text-emerald-400 text-sm">{item.freshness_score}%</span>
                  <span className="text-[10px] text-zinc-500 block">Risk: {item.risk_level || 'LOW'}</span>
                </div>

                <div>
                  <span className="text-zinc-400 block flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-emerald-400" />
                    <span>Safe Until</span>
                  </span>
                  <span className="font-bold text-white text-sm">{item.estimated_shelf_life_hours}h Remaining</span>
                  <span className="text-[10px] text-zinc-500 block">Shelf life</span>
                </div>
              </div>

              {/* Address & Allergens */}
              <div className="space-y-1.5 text-xs text-zinc-300">
                <div className="flex items-center space-x-1.5 text-zinc-400">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span className="truncate">{item.pickup_address}</span>
                </div>

                {item.allergens && item.allergens.length > 0 && (
                  <div className="flex items-center space-x-2 pt-1 text-[11px]">
                    <span className="text-amber-400 font-semibold">Allergens:</span>
                    <div className="flex gap-1">
                      {item.allergens.map((alg, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          {alg}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2">
                
                {/* Ola-style Direct Contact Button */}
                <button
                  onClick={() => onOpenContactModal(item)}
                  className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center space-x-1 transition-all"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call Donor</span>
                </button>

                {/* Smart Auto-Split Trigger */}
                <button
                  onClick={() => onTriggerSplit(item)}
                  className="px-3 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center space-x-1 transition-all"
                >
                  <Split className="w-3.5 h-3.5" />
                  <span>Auto-Split</span>
                </button>

                {/* QR Verification Scanner */}
                <button
                  onClick={() => onOpenQRModal(item)}
                  className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center space-x-1 transition-all shadow-md shadow-emerald-600/20"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>QR Handoff</span>
                </button>

                {/* Rate Donor Button */}
                <button
                  onClick={() => onOpenRatingModal(item)}
                  className="px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold flex items-center space-x-1 transition-all"
                >
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>Rate Donor</span>
                </button>

              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
}
