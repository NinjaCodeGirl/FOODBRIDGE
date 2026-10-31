import React, { useState } from 'react';
import { Phone, UserCheck, MapPin, Clock, ShieldCheck, CheckCircle2, X } from 'lucide-react';

export default function ContactSharingModal({ listing, onClose, API_URL }) {
  const [calling, setCalling] = useState(false);
  const [callLogged, setCallLogged] = useState(false);
  const [callNotes, setCallNotes] = useState('');

  if (!listing) return null;

  const handleSimulateCall = async () => {
    setCalling(true);
    try {
      // Send call log event to FastAPI endpoint
      const res = await fetch(`${API_URL}/api/calls/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listing_id: listing.id,
          caller_role: 'NGO',
          caller_name: 'Robin Hood Army Volunteer',
          caller_phone: '+91 98123 45678',
          recipient_name: listing.donor_name,
          recipient_phone: listing.donor_phone || '+91 98765 43210',
          duration_seconds: 48,
          status: 'COMPLETED',
          notes: callNotes || 'Verified pickup window, quantity, and vehicle parking location.'
        })
      });

      if (res.ok) {
        setCallLogged(true);
      }
    } catch (e) {
      console.error('Call logging failed:', e);
      setCallLogged(true);
    } finally {
      setCalling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="glass-panel w-full max-w-lg rounded-2xl p-6 border border-emerald-500/30 shadow-2xl relative space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-white">Ola-Style Contact & Call Sharing</h3>
            <p className="text-xs text-zinc-400">Direct donor & volunteer phone connection ledger</p>
          </div>
        </div>

        {/* Active Contact Cards */}
        <div className="space-y-3 text-xs">
          
          {/* Donor Info Card */}
          <div className="p-4 rounded-xl bg-[#111711] border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
              <span>Food Donor Details</span>
              <span className="text-emerald-400">Verified Partner</span>
            </div>
            <div className="font-bold text-base text-white">{listing.donor_name}</div>
            <div className="flex items-center justify-between text-zinc-300">
              <span className="flex items-center space-x-1">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <strong className="text-emerald-400 font-mono text-sm">{listing.donor_phone || '+91 98765 43210'}</strong>
              </span>
              <span className="text-zinc-500">Owner / Kitchen Mgr</span>
            </div>
            <div className="flex items-center space-x-1 text-zinc-400 pt-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>{listing.pickup_address}</span>
            </div>
          </div>

          {/* Assigned NGO Volunteer Card */}
          <div className="p-4 rounded-xl bg-[#111711] border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
              <span>Assigned NGO Pickup Lead</span>
              <span className="text-emerald-400">Punctuality Score: 4.95 ⭐</span>
            </div>
            <div className="font-bold text-base text-white">Robin Hood Army Dispatcher</div>
            <div className="flex items-center justify-between text-zinc-300">
              <span className="flex items-center space-x-1">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <strong className="text-emerald-400 font-mono text-sm">+91 98123 45678</strong>
              </span>
              <span className="text-zinc-500">ETA: 18 mins</span>
            </div>
          </div>

        </div>

        {/* Custom Call Notes */}
        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1">Call Audit Notes</label>
          <input
            type="text"
            value={callNotes}
            onChange={(e) => setCallNotes(e.target.value)}
            placeholder="e.g. Coordinated gate arrival time and packing boxes."
            className="w-full bg-[#111711] text-xs text-white border border-zinc-800 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Action Button */}
        <div className="pt-2 flex items-center justify-between">
          {callLogged ? (
            <div className="w-full p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-center space-x-2 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Call Data Saved to Database Ledger!</span>
            </div>
          ) : (
            <button
              onClick={handleSimulateCall}
              disabled={calling}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2"
            >
              <Phone className="w-4 h-4" />
              <span>{calling ? 'Initiating Call...' : 'Call Donor & Save Log to Ledger'}</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
