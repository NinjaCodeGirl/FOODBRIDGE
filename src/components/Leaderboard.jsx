import React from 'react';
import { Award, Star, ShieldCheck, Trophy, Heart, Medal, Utensils, Building2 } from 'lucide-react';

export default function Leaderboard() {
  const topDonors = [
    { rank: 1, name: 'Taj Palace Hotel & Caterers', meals: 3420, trust: 4.98, type: 'Hospitality Partner' },
    { rank: 2, name: 'NSUT Campus Dining Hall', meals: 2150, trust: 4.95, type: 'University Donor' },
    { rank: 3, name: "Haldiram's Sweets & Kitchen", meals: 1890, trust: 4.92, type: 'Commercial Kitchen' },
    { rank: 4, name: 'Bikanervala Sweets Dwarka', meals: 1450, trust: 4.89, type: 'Bakery Surplus' },
    { rank: 5, name: 'Dominos Pizza Dwarka Hub', meals: 1120, trust: 4.86, type: 'Quick Service Hub' }
  ];

  const topNGOs = [
    { rank: 1, name: 'Akshaya Patra Foundation', distributed: 5120, punctuality: 4.97, type: 'Central Shelter' },
    { rank: 2, name: 'Robin Hood Army Delhi', distributed: 4310, punctuality: 4.94, type: 'Volunteer Brigade' },
    { rank: 3, name: 'Feeding India Shelter', distributed: 3280, punctuality: 4.91, type: 'Community Kitchen' },
    { rank: 4, name: 'Roti Bank Care Center', distributed: 2740, punctuality: 4.88, type: 'Emergency Relief' },
    { rank: 5, name: 'Gunj Care & Relief Shelter', distributed: 1980, punctuality: 4.85, type: 'Shelter Network' }
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="fb-card p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 text-primary flex items-center justify-center">
            <Trophy className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="font-extrabold text-xl sm:text-2xl text-navy font-display">Civic Trust & Impact Leaderboard</h2>
            <p className="text-xs text-txt-secondary mt-0.5">Audited food donation volumes, punctuality records, and hygiene scores</p>
          </div>
        </div>
        <span className="hidden sm:inline-flex px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
          Verified Carbon Offsets
        </span>
      </div>

      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Top Donors */}
        <div className="fb-card p-6 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-border">
            <h3 className="font-extrabold text-base text-navy flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              <span>Top Food Donors</span>
            </h3>
            <span className="text-xs font-bold text-status-success">Section 80G Audited</span>
          </div>

          <div className="space-y-2.5">
            {topDonors.map((donor) => (
              <div key={donor.rank} className="p-3.5 rounded-xl border border-border bg-surface-subtle flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-lg font-bold flex items-center justify-center text-xs ${
                    donor.rank === 1 ? 'bg-amber-100 text-amber-800' :
                    donor.rank === 2 ? 'bg-gray-200 text-gray-800' :
                    donor.rank === 3 ? 'bg-orange-100 text-orange-800' :
                    'bg-white text-txt-muted'
                  }`}>
                    #{donor.rank}
                  </div>
                  <div>
                    <div className="font-extrabold text-navy">{donor.name}</div>
                    <div className="text-[11px] text-txt-muted">{donor.type}</div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-extrabold text-primary text-sm block">{donor.meals.toLocaleString()}</span>
                  <span className="text-[10px] text-txt-secondary">⭐ {donor.trust} Trust</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top NGOs */}
        <div className="fb-card p-6 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-border">
            <h3 className="font-extrabold text-base text-navy flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <span>Top Recipient Shelters</span>
            </h3>
            <span className="text-xs font-bold text-blue-600">Verified Intake</span>
          </div>

          <div className="space-y-2.5">
            {topNGOs.map((ngo) => (
              <div key={ngo.rank} className="p-3.5 rounded-xl border border-border bg-surface-subtle flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-lg font-bold flex items-center justify-center text-xs ${
                    ngo.rank === 1 ? 'bg-blue-100 text-blue-800' :
                    ngo.rank === 2 ? 'bg-gray-200 text-gray-800' :
                    ngo.rank === 3 ? 'bg-orange-100 text-orange-800' :
                    'bg-white text-txt-muted'
                  }`}>
                    #{ngo.rank}
                  </div>
                  <div>
                    <div className="font-extrabold text-navy">{ngo.name}</div>
                    <div className="text-[11px] text-txt-muted">{ngo.type}</div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-extrabold text-blue-600 text-sm block">{ngo.distributed.toLocaleString()}</span>
                  <span className="text-[10px] text-txt-secondary">⚡ {ngo.punctuality} Punctuality</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
