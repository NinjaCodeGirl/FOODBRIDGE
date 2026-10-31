import React from 'react';
import { Award, Star, ShieldCheck, Trophy, Heart } from 'lucide-react';

export default function Leaderboard() {
  const topDonors = [
    { rank: 1, name: 'Taj Palace Hotel & Caterers', meals: 3420, trust: 4.98, type: 'Hotel' },
    { rank: 2, name: 'NSUT Campus Dining Hall', meals: 2150, trust: 4.95, type: 'University' },
    { rank: 3, name: "Haldiram's Sweets & Kitchen", meals: 1890, trust: 4.92, type: 'Restaurant' },
    { rank: 4, name: 'Bikanervala Sweets Dwarka', meals: 1450, trust: 4.89, type: 'Bakery' },
    { rank: 5, name: 'Dominos Pizza Dwarka Hub', meals: 1120, trust: 4.86, type: 'Cloud Kitchen' }
  ];

  const topNGOs = [
    { rank: 1, name: 'Akshaya Patra Foundation', distributed: 5120, punctuality: 4.97 },
    { rank: 2, name: 'Robin Hood Army Delhi', distributed: 4310, punctuality: 4.94 },
    { rank: 3, name: 'Feeding India Shelter', distributed: 3280, punctuality: 4.91 },
    { rank: 4, name: 'Roti Bank Care Center', distributed: 2740, punctuality: 4.88 },
    { rank: 5, name: 'Gunj Care & Relief Shelter', distributed: 1980, punctuality: 4.85 }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-[#1f2b1f]">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-display font-bold text-2xl text-white">Trust Score & Impact Leaderboards</h2>
            <p className="text-xs text-zinc-400 mt-0.5">Recognizing top food donors and verified NGO partners across Delhi NCR</p>
          </div>
        </div>
      </div>

      {/* Grid: Top Donors & Top NGOs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Top Donors Card */}
        <div className="glass-panel rounded-2xl p-6 border border-[#1f2b1f] space-y-4">
          <h3 className="font-display font-bold text-lg text-white flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span>Top Food Donors</span>
            </span>
            <span className="text-xs text-emerald-400 font-normal">8G Tax Certified</span>
          </h3>

          <div className="space-y-3">
            {topDonors.map((donor) => (
              <div key={donor.rank} className="flex items-center justify-between p-3.5 rounded-xl bg-[#111711] border border-zinc-800 text-xs hover:border-amber-500/30 transition-all">
                <div className="flex items-center space-x-3">
                  <div className={`w-7 h-7 rounded-lg font-bold flex items-center justify-center text-xs ${
                    donor.rank === 1 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                    donor.rank === 2 ? 'bg-zinc-300/20 text-zinc-200 border border-zinc-300/30' :
                    donor.rank === 3 ? 'bg-amber-800/20 text-amber-600 border border-amber-800/30' :
                    'bg-zinc-800 text-zinc-400'
                  }`}>
                    #{donor.rank}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{donor.name}</div>
                    <div className="text-[11px] text-zinc-400">{donor.type} • {donor.meals.toLocaleString()} Meals Donated</div>
                  </div>
                </div>

                <div className="flex items-center space-x-1 text-amber-400 font-bold bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{donor.trust}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top NGOs Card */}
        <div className="glass-panel rounded-2xl p-6 border border-[#1f2b1f] space-y-4">
          <h3 className="font-display font-bold text-lg text-white flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <Heart className="w-5 h-5 text-emerald-400" />
              <span>Verified Recipient NGOs</span>
            </span>
            <span className="text-xs text-emerald-400 font-normal">100% Verified</span>
          </h3>

          <div className="space-y-3">
            {topNGOs.map((ngo) => (
              <div key={ngo.rank} className="flex items-center justify-between p-3.5 rounded-xl bg-[#111711] border border-zinc-800 text-xs hover:border-emerald-500/30 transition-all">
                <div className="flex items-center space-x-3">
                  <div className={`w-7 h-7 rounded-lg font-bold flex items-center justify-center text-xs ${
                    ngo.rank === 1 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                    ngo.rank === 2 ? 'bg-zinc-300/20 text-zinc-200 border border-zinc-300/30' :
                    ngo.rank === 3 ? 'bg-amber-800/20 text-amber-600 border border-amber-800/30' :
                    'bg-zinc-800 text-zinc-400'
                  }`}>
                    #{ngo.rank}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{ngo.name}</div>
                    <div className="text-[11px] text-zinc-400">{ngo.distributed.toLocaleString()} Meals Distributed</div>
                  </div>
                </div>

                <div className="flex items-center space-x-1 text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{ngo.punctuality}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
