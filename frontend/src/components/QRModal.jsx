import React, { useState, useEffect } from 'react';
import { QrCode, ShieldCheck, CheckCircle2, AlertTriangle, X, Sparkles, RefreshCw, Star } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function QRModal({ listing, onClose, API_URL, onVerified, onOpenRating }) {
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

  const generateQR = () => {
    setLoading(true);
    setErrorMsg('');
    setTimeout(() => {
      const handshakeId = `HS-${Math.floor(100000 + Math.random() * 900000)}`;
      const token = `FB-JWT-VERIFY-${listing.id}-${Date.now()}`;
      const payloadString = JSON.stringify({
        handshake_id: handshakeId,
        listing_id: listing.id,
        food: listing.food_title,
        servings: listing.quantity_servings,
        token: token
      });

      const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&color=059669&data=${encodeURIComponent(payloadString)}`;

      setQrData({
        handshake_id: handshakeId,
        verification_token: token,
        qr_code_base64: qrImageUrl
      });
      setLoading(false);
    }, 400);
  };

  const handleSimulateScan = () => {
    if (!qrData?.verification_token) return;
    setVerifying(true);
    setErrorMsg('');

    const co2Saved = Number(((listing.weight_kg || 20) * 2.5).toFixed(1));

    setTimeout(() => {
      setVerifiedResult({
        message: 'Cryptographic Handoff Signature Validated • Pickup Complete!',
        co2_mitigated_kg: co2Saved,
        verified_at: new Date().toISOString()
      });
      setVerifying(false);

      // Trigger celebratory confetti animation
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (e) {}

      if (onVerified) onVerified();
    }, 600);
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
            <span>Generating cryptographic QR payload...</span>
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
              <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs space-y-3 animate-fadeIn">
                <div className="flex items-center justify-center space-x-1 font-bold text-sm text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Pickup Handshake Verified!</span>
                </div>
                <div>{verifiedResult.message}</div>
                <div className="text-[11px] text-emerald-200">
                  🌱 CO₂ Mitigated: <strong>{verifiedResult.co2_mitigated_kg} kg</strong> • Trust Ledger Updated (+1.0)
                </div>

                {onOpenRating && (
                  <button
                    onClick={() => onOpenRating(listing)}
                    className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center justify-center space-x-1 transition-all shadow-md"
                  >
                    <Star className="w-4 h-4 fill-black" />
                    <span>Rate Transaction Now</span>
                  </button>
                )}
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

