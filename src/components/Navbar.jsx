import React from 'react';
import { Utensils, MapPin, BarChart3, Award, PlusCircle, ShieldCheck, HelpCircle } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, activeRole, setActiveRole, liveMetrics, onOpenOnboarding }) {
  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-[#1f2b1f]/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Eyebrow */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('feed')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-700 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Utensils className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-display font-bold text-xl tracking-tight text-white">Food<span className="text-emerald-400">Bridge</span></span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  AI Ledger
                </span>
              </div>
              <p className="text-xs text-emerald-300/70 hidden sm:block">Universal Surplus Redistribution</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('feed')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                activeTab === 'feed'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'
              }`}
            >
              <Utensils className="w-4 h-4" />
              <span>Surplus Feed</span>
            </button>

            <button
              onClick={() => setActiveTab('donate')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                activeTab === 'donate'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>List Surplus</span>
            </button>

            <button
              onClick={() => setActiveTab('map')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                activeTab === 'map'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Live Map</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                activeTab === 'analytics'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Impact</span>
            </button>

            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                activeTab === 'leaderboard'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Leaderboard</span>
            </button>
          </nav>

          {/* Right Actions: How it Works Guide & Role Switcher */}
          <div className="flex items-center space-x-3">
            
            {/* How it Works Button */}
            <button
              onClick={onOpenOnboarding}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center space-x-1.5 transition-all"
            >
              <HelpCircle className="w-4 h-4" />
              <span className="hidden sm:inline">How It Works</span>
            </button>

            {/* Role Switcher */}
            <select
              value={activeRole}
              onChange={(e) => setActiveRole(e.target.value)}
              className="bg-[#141a14] text-xs font-semibold text-emerald-400 border border-emerald-500/30 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="RESTAURANT">🍽️ Donor (Restaurant)</option>
              <option value="NGO">🤝 Verified NGO</option>
              <option value="ADMIN">📊 Platform Admin</option>
            </select>
          </div>

        </div>
      </div>
    </header>
  );
}
