import React from 'react';
import { HelpCircle, Utensils, Split, PhoneCall, QrCode, ShieldCheck, X, ArrowRight, HeartHandshake } from 'lucide-react';

export default function OnboardingModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-dark/75 backdrop-blur-sm animate-fadeIn">
      <div className="fb-card w-full max-w-2xl rounded-2xl p-6 sm:p-8 bg-white shadow-2xl relative space-y-6 border border-border">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-txt-secondary hover:text-navy rounded-xl hover:bg-surface-subtle transition-all touch-target"
          aria-label="Close tutorial"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 text-primary flex items-center justify-center shadow-sm">
            <HelpCircle className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="font-extrabold text-2xl text-navy font-display">How FoodBridge Works</h3>
            <p className="text-xs text-txt-secondary">Universal 3-Step Food Redistribution & Trust Ledger</p>
          </div>
        </div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          
          {/* Step 1 */}
          <div className="p-4 rounded-xl bg-surface-subtle border border-border flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="w-7 h-7 rounded-lg bg-orange-100 text-primary font-extrabold flex items-center justify-center text-xs">1</span>
              <Utensils className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h4 className="font-extrabold text-navy text-sm">List Surplus Food</h4>
              <p className="text-txt-secondary mt-1 leading-relaxed">
                Restaurants and banquets enter prepared dishes. AI evaluates thermal safety and assigns a freshness hash.
              </p>
            </div>
            <span className="text-[10px] font-bold text-primary">30 Second Quick Form</span>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-xl bg-surface-subtle border border-border flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 font-extrabold flex items-center justify-center text-xs">2</span>
              <Split className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h4 className="font-extrabold text-navy text-sm">Auto-Split & Match</h4>
              <p className="text-txt-secondary mt-1 leading-relaxed">
                Smart algorithm pairs food with nearby recipient shelters. Large batches are auto-split to avoid local food waste.
              </p>
            </div>
            <span className="text-[10px] font-bold text-blue-600">Proximity Dispatch</span>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-xl bg-surface-subtle border border-border flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="w-7 h-7 rounded-lg bg-emerald-100 text-status-success font-extrabold flex items-center justify-center text-xs">3</span>
              <QrCode className="w-4 h-4 text-status-success" />
            </div>
            <div>
              <h4 className="font-extrabold text-navy text-sm">QR Pickup Handshake</h4>
              <p className="text-txt-secondary mt-1 leading-relaxed">
                Volunteers scan cryptographic JWT QR or enter 6-digit OTP code at the loading dock. Verified impact logged!
              </p>
            </div>
            <span className="text-[10px] font-bold text-status-success">Cryptographic Ledger</span>
          </div>

        </div>

        {/* Footer Guidance */}
        <div className="p-3.5 rounded-xl bg-orange-50 border border-orange-200 text-xs text-orange-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0" />
            <span>You can reopen this tutorial at any time by clicking "How It Works" in the top bar.</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-orange flex items-center gap-1.5 touch-target flex-shrink-0"
          >
            <span>Got It, Let's Go</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
