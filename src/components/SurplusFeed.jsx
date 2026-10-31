import React, { useState } from 'react';
import { Utensils, MapPin, Clock, PhoneCall, QrCode, Split, Search, Star, Share2 } from 'lucide-react';
import { createWhatsAppLink } from '../utils/whatsapp';

export default function SurplusFeed({ 
  listings = [], 
  onTriggerSplit, 
  onOpenContactModal, 
  onOpenQRModal, 
  onOpenRatingModal,
  onRequestFood
}) {
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
      {/* Search & Filter Bar */}
      <div className="fb-card p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-lg text-navy font-display flex items-center gap-2">
            <Utensils className="w-5 h-5 text-primary" />
            <span>Active Surplus Food Feed</span>
          </h3>
          <p className="text-xs text-txt-secondary mt-0.5">Real-time available donations ready for verified community shelter pickup</p>
        </div>

        {/* Search Input & Pills */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-txt-muted absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes or donor..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-white text-xs font-medium focus:border-primary"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-surface-subtle p-1 rounded-xl border border-border text-xs">
            <button
              onClick={() => setFilterCategory('ALL')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                filterCategory === 'ALL' ? 'bg-primary text-white shadow-sm' : 'text-txt-secondary hover:text-txt-primary'
              }`}
            >
              All ({listings.length})
            </button>

            <button
              onClick={() => setFilterCategory('CATEGORY_A')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                filterCategory === 'CATEGORY_A' ? 'bg-emerald-600 text-white shadow-sm' : 'text-txt-secondary hover:text-txt-primary'
              }`}
            >
              Cat A (Ambient)
            </button>

            <button
              onClick={() => setFilterCategory('CATEGORY_B')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                filterCategory === 'CATEGORY_B' ? 'bg-blue-600 text-white shadow-sm' : 'text-txt-secondary hover:text-txt-primary'
              }`}
            >
              Cat B (Cold Chain)
            </button>
          </div>

        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredListings.length === 0 ? (
          <div className="md:col-span-2 fb-card p-12 text-center text-txt-secondary">
            No surplus food donations currently matched your search criteria.
          </div>
        ) : (
          filteredListings.map((item) => (
            <div key={item.id} className="fb-card fb-card-hover p-6 flex flex-col justify-between space-y-4">
              
              {/* Header: Donor & Badge */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-navy text-base">{item.donor_name}</span>
                    <span className="text-xs text-txt-muted">({item.donor_phone || '+91 98765 43210'})</span>
                  </div>
                  <h4 className="text-lg font-extrabold text-primary mt-1">{item.food_title}</h4>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  item.classification === 'CATEGORY_B'
                    ? 'bg-blue-50 text-blue-800 border border-blue-200'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}>
                  {item.classification === 'CATEGORY_B' ? '❄️ Cold Chain' : '🌾 Category A'}
                </span>
              </div>

              {/* Stats Box */}
              <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-surface-subtle border border-border text-xs">
                <div>
                  <span className="text-txt-muted block">Quantity</span>
                  <strong className="text-navy text-sm font-extrabold">{item.quantity_servings}</strong>
                  <span className="text-[10px] text-txt-secondary block">servings ({item.weight_kg} kg)</span>
                </div>

                <div>
                  <span className="text-txt-muted block">Freshness</span>
                  <strong className="text-status-success text-sm font-extrabold">{item.freshness_score}%</strong>
                  <span className="text-[10px] text-txt-secondary block">Risk: {item.risk_level || 'LOW'}</span>
                </div>

                <div>
                  <span className="text-txt-muted block">Safe Window</span>
                  <strong className="text-navy text-sm font-extrabold">{item.estimated_shelf_life_hours}h</strong>
                  <span className="text-[10px] text-txt-secondary block">remaining</span>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-1 text-xs text-txt-secondary">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                  <span className="truncate">{item.pickup_address}</span>
                </div>
                {item.allergens && item.allergens.length > 0 && (
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="font-bold text-amber-700">Allergens:</span>
                    <span className="text-txt-secondary">{item.allergens.join(', ')}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-2">
                
                {/* Request Food CTA */}
                {onRequestFood && (
                  <button
                    onClick={() => onRequestFood(item)}
                    className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-extrabold text-xs flex items-center gap-1.5 shadow-orange transition-all touch-target"
                  >
                    <Utensils className="w-4 h-4" />
                    <span>Request Food</span>
                  </button>
                )}

                {/* Direct Call / Contact */}
                {onOpenContactModal && (
                  <button
                    onClick={() => onOpenContactModal(item)}
                    className="px-3 py-2 rounded-xl bg-surface-subtle hover:bg-gray-200 text-txt-primary border border-border text-xs font-bold flex items-center gap-1"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-primary" />
                    <span>Call Donor</span>
                  </button>
                )}

                {/* Auto-Split Trigger */}
                {onTriggerSplit && (
                  <button
                    onClick={() => onTriggerSplit(item)}
                    className="px-3 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-primary border border-orange-200 text-xs font-bold flex items-center gap-1"
                  >
                    <Split className="w-3.5 h-3.5" />
                    <span>Auto-Split</span>
                  </button>
                )}

                {/* WhatsApp Alert */}
                <a
                  href={createWhatsAppLink(item.donor_phone, `Hi ${item.donor_name}, this is an inquiry regarding surplus donation: *${item.food_title}* (${item.quantity_servings} servings).`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-xl text-emerald-700 hover:bg-emerald-50 border border-emerald-200 text-xs font-bold flex items-center gap-1"
                >
                  <Share2 className="w-3.5 h-3.5 text-status-success" />
                  <span>WhatsApp</span>
                </a>

                {/* Rate Donor */}
                {onOpenRatingModal && (
                  <button
                    onClick={() => onOpenRatingModal(item)}
                    className="px-3 py-2 rounded-xl text-amber-700 hover:bg-amber-50 border border-amber-200 text-xs font-bold flex items-center gap-1"
                  >
                    <Star className="w-3.5 h-3.5 fill-amber-500" />
                    <span>Rate</span>
                  </button>
                )}

              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
}
