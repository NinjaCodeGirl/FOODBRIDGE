import React, { useState, useEffect } from 'react';
import { QrCode, ShieldCheck, CheckCircle2, AlertTriangle, X, Sparkles, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function QRModal({ listing, onClose, API_URL }) {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifiedResult, setVerifiedResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (listing) {
      generateQR();
    }
  }, [listing]);

  const generateQR = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`${API_URL}/api/qr/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          allocation_id: `alloc-${listing.id}`,
          donor_id: listing.donor_name,
          recipient_ngo_id: 'Akshaya Patra Foundation',
          servings: listing.quantity_servings
        })
      });

      if (!res.ok) throw new Error('Failed to generate QR verification token');
      const data = await res.json();
      setQrData(data);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateScan = async () => {
    if (!qrData?.verification_token) return;
    setVerifying(true);
    try {
      const res = await fetch(`${API_URL}/api/qr/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verification_token: qrData.verification_token,
          scanned_by_role: 'NGO'
        })
      });

      if (!res.ok) throw new Error('Verification failed');
      const result = await res.json();
      setVerifiedResult(result);

      // Trigger celebratory confetti animation
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // ignore
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setVerifying(false);
    }
  };

  if (!listing) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel w-full max-w-md rounded-2xl p-6 border border-emerald-500/40 shadow-2xl relative space-y-5 text-center">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-2">
            <QrCode className="w-6 h-6" />
          </div>
          <h3 className="font-display font-bold text-xl text-white">QR Verification Handoff</h3>
          <p className="text-xs text-zinc-400 mt-1">Cryptographic Token: FoodBridge-Ledger-v1</p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center justify-center space-x-1">
            <AlertTriangle className="w-4 h-4" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* QR Code Container */}
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center space-y-2 text-zinc-400 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
            <span>Generating cryptographic JWT payload...</span>
          </div>
        ) : qrData ? (
          <div className="space-y-4">
            <div className="p-4 bg-white rounded-2xl inline-block shadow-xl border-4 border-emerald-500/30">
              <img src={qrData.qr_code_base64} alt="Pickup Verification QR" className="w-48 h-48 mx-auto" />
            </div>

            <div className="text-xs text-zinc-400 space-y-1">
              <div>Handshake ID: <span className="text-emerald-400 font-mono font-semibold">{qrData.handshake_id}</span></div>
              <div>Item: <strong className="text-white">{listing.food_title}</strong> ({listing.quantity_servings} Servings)</div>
            </div>

            {/* Verified Result Banner */}
            {verifiedResult ? (
              <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs space-y-1.5 animate-fadeIn">
                <div className="flex items-center justify-center space-x-1 font-bold text-sm text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Pickup Handshake Verified!</span>
                </div>
                <div>{verifiedResult.message}</div>
                <div className="text-[11px] text-emerald-200">
                  🌱 CO₂ Mitigated: <strong>{verifiedResult.co2_mitigated_kg} kg</strong> • Trust Ledger Updated (+1.0)
                </div>
              </div>
            ) : (
              <button
                onClick={handleSimulateScan}
                disabled={verifying}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{verifying ? 'Verifying Token Signature...' : 'Simulate NGO Pickup QR Scan'}</span>
              </button>
            )}

          </div>
        ) : null}

      </div>
    </div>
  );
}
