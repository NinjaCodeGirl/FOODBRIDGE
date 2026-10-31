import React from 'react';
import { HelpCircle, Utensils, Split, PhoneCall, QrCode, ShieldCheck, X, ArrowRight } from 'lucide-react';

export default function OnboardingModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel w-full max-w-2xl rounded-2xl p-6 sm:p-8 border border-emerald-500/40 shadow-2xl relative space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display font-bold text-2xl text-white">How FoodBridge Works</h3>
            <p className="text-xs text-zinc-400">3-Step Zero Food Waste & Real-Time Redistribution Guide</p>
          </div>
        </div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          
          {/* Step 1 */}
          <div className="p-4 rounded-xl bg-[#111711] border border-emerald-500/30 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center">1</span>
              <Utensils className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">List Surplus Food</h4>
              <p className="text-zinc-400 mt-1 leading-relaxed">
                Restaurants & caterers list surplus meals. Gemini AI evaluates shelf-life and assigns a freshness hash.
              </p>
            </div>
            <span className="text-[10px] font-semibold text-emerald-400">30 Sec Quick Form</span>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-xl bg-[#111711] border border-blue-500/30 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center">2</span>
              <Split className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Auto-Split & Ola Call</h4>
              <p className="text-zinc-400 mt-1 leading-relaxed">
                Algorithmic matching splits large batches across nearby NGOs. Direct phone calls logged for transparency.
              </p>
            </div>
            <span className="text-[10px] font-semibold text-blue-400">Proximity Dispatch</span>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-xl bg-[#111711] border border-amber-500/30 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center">3</span>
              <QrCode className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">QR Pickup Handshake</h4>
              <p className="text-zinc-400 mt-1 leading-relaxed">
                Volunteer scans JWT QR code at pickup. Transaction verified, trust rating updated, 2.5 kg CO₂/meal mitigated!
              </p>
            </div>
            <span className="text-[10px] font-semibold text-amber-400">Cryptographic Ledger</span>
          </div>

        </div>

        {/* Footer Button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center space-x-2 shadow-lg shadow-emerald-600/30"
          >
            <span>Start Exploring App</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
