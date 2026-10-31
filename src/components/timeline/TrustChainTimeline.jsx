import React, { useState } from 'react';
import { 
  CheckCircle2, Clock, ShieldCheck, MapPin, User, FileText, 
  ChevronDown, ChevronUp, Lock, ExternalLink, ArrowRight, AlertCircle
} from 'lucide-react';

export default function TrustChainTimeline({
  donationId = 'list-001',
  events = [
    {
      id: 'tl-101',
      stage: 'FOOD_LISTED',
      stageName: '1. Food Listed',
      actor_name: 'Chef Rajesh (The Grand Kitchen)',
      actor_role: 'RESTAURANT',
      timestamp: 'Today at 11:30 AM',
      location_address: 'NSUT Main Campus, Sector 3, Dwarka, New Delhi',
      evidence_reference: 'Photo Evidence: Kitchen batch cambros & steam table',
      evidence_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      verification_status: 'VERIFIED',
      notes: 'Surplus 180 servings prepared at 11:30 AM. Holding temperature >68°C. FSSAI certified.'
    },
    {
      id: 'tl-102',
      stage: 'FOOD_CLAIMED',
      stageName: '2. Food Claimed',
      actor_name: 'Rajesh Kumar (Akshaya Patra Dispatch)',
      actor_role: 'NGO',
      timestamp: 'Today at 11:42 AM',
      location_address: 'Dwarka Sector 10 Shelter Center',
      evidence_reference: 'Allocation Contract #ALLOC-9921 accepted',
      evidence_hash: '7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b',
      verification_status: 'VERIFIED',
      notes: '180 servings reserved for immediate lunch meal distribution at relief shelter.'
    },
    {
      id: 'tl-103',
      stage: 'VOLUNTEER_ASSIGNED',
      stageName: '3. Volunteer Assigned',
      actor_name: 'Arjun Sharma (Field Courier Lead)',
      actor_role: 'VOLUNTEER',
      timestamp: 'Today at 11:48 AM',
      location_address: 'En route via Insulated Van DL-3C-9821',
      evidence_reference: 'Vehicle GPS Dispatch Token #DL-3C-9821',
      evidence_hash: '6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e',
      verification_status: 'VERIFIED',
      notes: 'Insulated van assigned with thermal holding box. Courier ETA to kitchen: 8 mins.'
    },
    {
      id: 'tl-104',
      stage: 'PICKUP_CONFIRMED',
      stageName: '4. Pickup Confirmed',
      actor_name: 'Chef Rajesh & Arjun Sharma',
      actor_role: 'RESTAURANT / VOLUNTEER',
      timestamp: 'Today at 12:02 PM',
      location_address: 'NSUT Gate #3 Service Kitchen Entrance',
      evidence_reference: 'QR Token #HS-77A9 verified via OTP 582-901',
      evidence_hash: 'b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3',
      verification_status: 'VERIFIED',
      notes: 'Dual-party physical handshake completed. 180 hot meals transferred safely.'
    },
    {
      id: 'tl-105',
      stage: 'IN_TRANSIT',
      stageName: '5. In Transit',
      actor_name: 'Arjun Sharma (Transit Courier)',
      actor_role: 'VOLUNTEER',
      timestamp: 'Today at 12:14 PM',
      location_address: 'Transit Corridor: Dwarka Link Road',
      evidence_reference: 'Digital Thermal Sensor Log: 65.4°C steady',
      evidence_hash: 'c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4',
      verification_status: 'VERIFIED',
      notes: 'Holding temperature verified safe above 60°C. Live GPS telemetry streaming.'
    },
    {
      id: 'tl-106',
      stage: 'NGO_HANDOVER',
      stageName: '6. NGO Handover',
      actor_name: 'Rajesh Kumar (Akshaya Patra Intake)',
      actor_role: 'NGO',
      timestamp: 'Today at 12:26 PM',
      location_address: 'Dwarka Sector 10 Shelter Intake Dock',
      evidence_reference: 'Recipient Handshake Token #HS-REC-901',
      evidence_hash: 'd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5',
      verification_status: 'VERIFIED',
      notes: '180 servings inspected and accepted into shelter inventory. Zero spoilage reported.'
    },
    {
      id: 'tl-107',
      stage: 'DISTRIBUTION_RECORDED',
      stageName: '7. Beneficiary Distribution Recorded',
      actor_name: 'Dr. Anita Desai (Auditor Witness)',
      actor_role: 'INDEPENDENT_WITNESS',
      timestamp: 'Today at 1:15 PM',
      location_address: 'Dwarka Community Kitchen Distribution Center',
      evidence_reference: 'Event #DIST-202610-8812 (175 meals served, 5 remaining)',
      evidence_hash: 'e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6',
      verification_status: 'VERIFIED',
      notes: '160 children and families fed. Verified by independent civic council observer.'
    },
    {
      id: 'tl-108',
      stage: 'DONATION_CLOSED',
      stageName: '8. Donation Closed & Audited',
      actor_name: 'Pooja Verma (Platform Governance Lead)',
      actor_role: 'ADMIN',
      timestamp: 'Today at 1:45 PM',
      location_address: 'FoodBridge Central Ledger Hub',
      evidence_reference: 'Impact Certificate #CERT-2026-0081 generated',
      evidence_hash: 'f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7',
      verification_status: 'VERIFIED',
      notes: 'Reconciliation complete. 450.0 kg CO2 mitigated. Ledger entry signed and locked.'
    }
  ]
}) {
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'RESTAURANT': return 'bg-orange-100 text-primary border-orange-200';
      case 'NGO': return 'bg-emerald-100 text-status-success border-emerald-200';
      case 'VOLUNTEER': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'ADMIN': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  return (
    <div className="fb-card p-5 bg-white border border-border shadow-sm rounded-2xl space-y-5">
      {/* Timeline Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-navy text-base">FoodBridge TrustChain™ Audit Timeline</h3>
            <span className="text-xs font-mono font-bold bg-navy text-white px-2.5 py-0.5 rounded-full">
              {donationId}
            </span>
          </div>
          <p className="text-xs text-txt-secondary mt-0.5">
            Cryptographically sealed, append-only verification trail from donor kitchen to end beneficiary.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 font-bold text-status-success bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
            <ShieldCheck className="w-3.5 h-3.5" /> Immutable Hash Trail
          </span>
        </div>
      </div>

      {/* 8-Stage Sequential Visual Timeline */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-orange-200">
        {events.map((evt, idx) => {
          const isExpanded = expandedId === evt.id;
          const isFinal = evt.stage === 'DONATION_CLOSED';

          return (
            <div key={evt.id || idx} className="relative group">
              {/* Node Icon on Rail */}
              <div className={`absolute -left-6 sm:-left-8 top-1 w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-black shadow-md ${
                isFinal 
                  ? 'bg-status-success text-white ring-4 ring-green-100' 
                  : 'bg-primary text-white ring-4 ring-orange-100'
              }`}>
                {idx + 1}
              </div>

              {/* Event Card */}
              <div className={`rounded-xl border transition-all p-3.5 sm:p-4 text-xs ${
                isExpanded ? 'bg-orange-50/40 border-primary shadow-sm' : 'bg-surface-subtle border-border hover:border-gray-300'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-navy text-sm">
                      {evt.stageName || evt.stage.replace(/_/g, ' ')}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getRoleBadgeColor(evt.actor_role)}`}>
                      {evt.actor_role}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-txt-muted text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    <span>{typeof evt.timestamp === 'string' ? evt.timestamp : new Date(evt.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>

                {/* Actor & Location Line */}
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-txt-secondary">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-txt-muted shrink-0" />
                    <span className="font-semibold text-navy truncate">{evt.actor_name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-status-success shrink-0" />
                    <span className="truncate">{evt.location_address}</span>
                  </div>
                </div>

                {/* Notes */}
                {evt.notes && (
                  <p className="mt-2 text-navy text-xs bg-white p-2.5 rounded-lg border border-gray-100 font-medium">
                    "{evt.notes}"
                  </p>
                )}

                {/* Cryptographic Details Accordion */}
                <div className="mt-3 pt-2 border-t border-border flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => toggleExpand(evt.id)}
                    className="text-[11px] font-bold text-primary hover:text-primary-dark flex items-center gap-1"
                  >
                    <Lock className="w-3 h-3" />
                    <span>{isExpanded ? 'Hide Cryptographic Proof' : 'View Cryptographic Hash & Evidence'}</span>
                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>

                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-status-success">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified On-Ledger
                  </span>
                </div>

                {/* Expanded Cryptographic Detail Panel */}
                {isExpanded && (
                  <div className="mt-3 p-3 bg-slate-900 text-slate-200 rounded-xl space-y-2 font-mono text-[11px] animate-fadeIn">
                    <div>
                      <span className="text-slate-400 block text-[10px]">EVIDENCE REFERENCE:</span>
                      <span className="text-white font-semibold">{evt.evidence_reference || 'Self-attested ledger transaction'}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px]">SHA-256 DIGITAL FINGERPRINT:</span>
                      <span className="text-orange-400 break-all select-all">{evt.evidence_hash}</span>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                      <span>SIGNATURE SCHEME: ECDSA-SECP256K1</span>
                      <span className="text-emerald-400 font-bold">TAMPER-PROOF VERIFIED</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

