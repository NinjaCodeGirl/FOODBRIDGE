import React from 'react';
import { 
  Utensils, 
  Leaf, 
  Scale, 
  Building2, 
  ShieldCheck, 
  Clock, 
  ArrowUpRight, 
  TrendingUp,
  Sparkles,
  ArrowRight,
  Truck,
  CheckCircle2,
  Users
} from 'lucide-react';
import StatCard from './ui/StatCard';

export default function Dashboard({ metrics, onExploreListings, onPostFood, role = 'DONOR' }) {
  const stats = [
    {
      title: 'Meals Rescued',
      value: metrics?.total_meals_rescued ? metrics.total_meals_rescued.toLocaleString() : '15,420',
      change: '+14% this week',
      subtext: 'Safe human consumption',
      icon: Utensils,
      isDemo: true,
    },
    {
      title: 'CO₂ Mitigated',
      value: metrics?.total_co2_avoided_kg ? `${(metrics.total_co2_avoided_kg / 1000).toFixed(1)}t` : '38.5t',
      subtext: '2.5 kg CO₂ / rescued meal',
      change: 'Landfill Diversion',
      icon: Leaf,
      isDemo: true,
    },
    {
      title: 'Food Diverted',
      value: metrics?.total_food_saved_tonnes ? `${metrics.total_food_saved_tonnes} T` : '4.6 T',
      subtext: 'Zero food waste target',
      change: '+0.8T this month',
      icon: Scale,
      isDemo: true,
    },
    {
      title: 'Active NGO Shelters',
      value: metrics?.active_ngo_partners || 54,
      subtext: 'Verified distribution partners',
      change: 'Delhi NCR Hub',
      icon: Building2,
      isDemo: true,
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      
      {/* Hero Operational Banner */}
      <div className="relative rounded-2xl bg-gradient-to-br from-primary via-[#064E3B] to-primary-darker text-white p-6 sm:p-8 overflow-hidden shadow-elevation">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-emerald-200 text-xs font-semibold uppercase tracking-wider mb-4">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            <span>Operational Redistribution Ledger</span>
          </div>
          
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
            Universal Surplus Food Network for <span className="text-emerald-300">Verified Shelters</span>
          </h1>
          
          <p className="text-emerald-100/90 text-xs sm:text-sm md:text-base mt-3 leading-relaxed max-w-2xl">
            Bridging commercial donors with shelters and certified volunteers in real-time. Automated eligibility checks, multi-recipient batch splitting, and QR/OTP handshakes.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {onPostFood && (
              <button
                onClick={onPostFood}
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-emerald-50 text-primary font-bold text-xs sm:text-sm transition-all shadow-md flex items-center gap-2 touch-target"
              >
                <span>+ Post Surplus Food</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onExploreListings}
              className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/20 font-semibold text-xs sm:text-sm transition-all flex items-center gap-2 touch-target"
            >
              <span>Explore Active Feed</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>

            <div className="hidden md:flex items-center gap-2 text-xs text-emerald-200 bg-black/20 px-3.5 py-2 rounded-xl border border-white/10">
              <Clock className="w-3.5 h-3.5 text-emerald-300" />
              <span>Average NGO Match: <strong className="text-white">12.4 Mins</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Stat Cards Grid: Desktop 4, Tablet 2x2, Mobile 2-col */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat, idx) => (
          <StatCard
            key={idx}
            title={stat.title}
            value={stat.value}
            subtext={stat.subtext}
            change={stat.change}
            icon={stat.icon}
            isDemo={stat.isDemo}
          />
        ))}
      </div>

      {/* Live Redistribution Stream & Architecture Blueprint */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Activity Stream */}
        <div className="lg:col-span-2 fb-card p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-txt-primary flex items-center gap-2">
                  <span>Live Redistribution Stream</span>
                  <span className="w-2 h-2 rounded-full bg-status-success animate-pulse" />
                </h2>
                <p className="text-xs text-txt-secondary mt-0.5">
                  Verified handshakes across Delhi NCR
                </p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-txt-secondary border border-border">
                Demo Activity
              </span>
            </div>

            <div className="space-y-3">
              {[
                { time: '2 mins ago', donor: 'NSUT Campus Dining Hall', ngo: 'Akshaya Patra Foundation', servings: 180, status: 'QR Verified', type: 'Category A' },
                { time: '14 mins ago', donor: 'Taj Palace Banquet Kitchen', ngo: 'Robin Hood Army Janakpuri', servings: 350, status: 'Auto Split (3 NGOs)', type: 'Category B' },
                { time: '32 mins ago', donor: 'Haldiram Sweets & Kitchen', ngo: 'Feeding India Shelter', servings: 120, status: 'Delivered', type: 'Category A' },
                { time: '1 hr ago', donor: 'Bikanervala Sweets Dwarka', ngo: 'Roti Bank Community Kitchen', servings: 90, status: 'Delivered', type: 'Category A' }
              ].map((activity, idx) => (
                <div 
                  key={idx} 
                  className="p-3 sm:p-3.5 rounded-xl border border-border hover:border-primary/40 bg-surface-subtle/50 transition-colors flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-primary-light text-primary flex items-center justify-center font-bold text-xs flex-shrink-0">
                      {activity.servings}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-txt-primary truncate">
                        {activity.donor} <span className="text-txt-muted font-normal">→</span> <span className="text-primary font-semibold">{activity.ngo}</span>
                      </div>
                      <div className="text-txt-secondary text-[11px] mt-0.5">
                        {activity.servings} meals • {activity.time}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                      activity.type === 'Category B' 
                        ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    }`}>
                      {activity.type}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold">
                      {activity.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs">
            <span className="text-txt-secondary">4 successful pickups completed today</span>
            <button
              onClick={onExploreListings}
              className="text-primary font-bold hover:underline inline-flex items-center gap-1"
            >
              <span>View All Records</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Operational Flow Card */}
        <div className="fb-card p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-txt-primary mb-1">
              FoodBridge Operating Pipeline
            </h2>
            <p className="text-xs text-txt-secondary leading-relaxed mb-4">
              End-to-end transparent surplus food redistribution cycle.
            </p>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-surface-subtle border border-border">
                <span className="w-5 h-5 rounded-full bg-primary-light text-primary font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                <div>
                  <span className="font-bold text-txt-primary block">Food Eligibility Check</span>
                  <span className="text-txt-secondary text-[11px]">Preparation timestamp, storage temperature & shelf-life calculation.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-surface-subtle border border-border">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                <div>
                  <span className="font-bold text-txt-primary block">Intelligent NGO Matching</span>
                  <span className="text-txt-secondary text-[11px]">Deterministic proximity, capacity fit & cold chain verification.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-surface-subtle border border-border">
                <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                <div>
                  <span className="font-bold text-txt-primary block">Multi-Shelter Batch Splitting</span>
                  <span className="text-txt-secondary text-[11px]">Prevents local oversupply by splitting large volumes.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-surface-subtle border border-border">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">4</span>
                <div>
                  <span className="font-bold text-txt-primary block">QR / OTP Verified Handover</span>
                  <span className="text-txt-secondary text-[11px]">Cryptographically signed tokens confirm donor-to-courier handoff.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-border text-[11px] text-txt-secondary text-center">
            FoodBridge Universal Surplus Network
          </div>
        </div>

      </div>

    </div>
  );
}
