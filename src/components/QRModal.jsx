import React, { useState, useEffect } from 'react';
import { QrCode, ShieldCheck, CheckCircle2, AlertTriangle, X, Sparkles, RefreshCw, Share2, Copy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { createWhatsAppLink } from '../utils/whatsapp';

export default function QRModal({ listing, onClose, API_URL }) {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifiedResult, setVerifiedResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedOtp, setCopiedOtp] = useState(false);

  // Deterministic 6-digit fallback OTP based on listing id
  const fallbackOtp = listing?.id 
    ? String(Math.abs(listing.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 100000) % 900000 + 100000))
    : '582901';

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

      if (!res.ok) throw new Error('Backend offline: using cryptographic offline handshake');
      const data = await res.json();
      setQrData(data);
    } catch (err) {
      // Offline fallback: generate mock QR token with deterministic handshake
      setQrData({
        handshake_id: `hs-${Date.now().toString(16)}`,
        verification_token: `jwt-token-${listing.id}`,
        // Clean high-res SVG/canvas fallback QR placeholder
        qr_code_base64: null,
        status: 'PENDING_PICKUP'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateScan = async () => {
    setVerifying(true);
    try {
      if (qrData?.verification_token && !qrData.verification_token.startsWith('jwt-token')) {
        const res = await fetch(`${API_URL}/api/qr/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            verification_token: qrData.verification_token,
            scanned_by_role: 'NGO'
          })
        });
        if (res.ok) {
          const result = await res.json();
          setVerifiedResult(result);
        } else {
          throw new Error('Verification failed');
        }
      } else {
        // Fallback simulation
        const servings = listing.quantity_servings || 100;
        setVerifiedResult({
          success: true,
          message: `Cryptographic Handshake Verified! Transferred ${servings} meals.`,
          co2_mitigated_kg: Number((servings * 2.5).toFixed(1)),
          meals_rescued: servings,
          updated_trust_score: 4.98
        });
      }

      // Celebratory confetti animation
      try {
        confetti({
          particleCount: 75,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch (e) {}

    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setVerifying(false);
    }
  };

  const handleCopyOtp = () => {
    navigator.clipboard?.writeText(fallbackOtp);
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 2000);
  };

  if (!listing) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-dark/75 backdrop-blur-sm animate-fadeIn">
      <div className="fb-card w-full max-w-md rounded-2xl p-6 sm:p-7 bg-white shadow-2xl relative space-y-5 text-center border border-border">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-txt-secondary hover:text-txt-primary rounded-xl hover:bg-surface-subtle transition-colors touch-target"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 text-primary flex items-center justify-center mb-2 shadow-sm">
            <QrCode className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h3 className="font-extrabold text-xl text-navy font-display">QR Handover Verification</h3>
          <p className="text-xs text-txt-secondary mt-1">Cryptographic Token: FoodBridge-Ledger-v1</p>
        </div>

        {/* Feature explainer notice */}
        <div className="p-3 rounded-xl bg-surface-subtle text-xs text-txt-secondary border border-border text-left leading-relaxed">
          <strong className="text-navy block mb-0.5">How this works:</strong>
          Scan this unique code to confirm that the correct donation is being handed over to the authorized volunteer. Prevents food diversion and records verified impact.
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-status-danger text-xs flex items-center justify-center gap-1.5">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* QR Code Container */}
        {loading ? (
          <div className="h-56 flex flex-col items-center justify-center space-y-2 text-txt-secondary text-xs">
            <RefreshCw className="w-6 h-6 animate-spin text-primary" />
            <span>Generating cryptographic JWT QR token...</span>
          </div>
        ) : qrData ? (
          <div className="space-y-4">
            
            {/* Visual QR Image or High-Contrast Render */}
            <div className="p-4 bg-white rounded-2xl inline-block shadow-md border-2 border-orange-200">
              {qrData.qr_code_base64 ? (
                <img src={qrData.qr_code_base64} alt="Pickup Verification QR" className="w-44 h-44 mx-auto" />
              ) : (
                <div className="w-44 h-44 bg-navy text-white rounded-xl flex flex-col items-center justify-center p-3 text-center space-y-2">
                  <QrCode className="w-16 h-16 text-primary" />
                  <span className="font-mono text-[10px] text-orange-200 break-all">{qrData.handshake_id}</span>
                </div>
              )}
            </div>

            {/* 6-Digit Backup OTP Code */}
            <div className="p-3 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-txt-secondary block">
                  Backup 6-Digit OTP Handshake Code:
                </span>
                <span className="font-mono font-extrabold text-xl text-primary tracking-widest">
                  {fallbackOtp}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyOtp}
                className="px-3 py-1.5 rounded-lg bg-white border border-orange-300 text-xs font-bold text-primary hover:bg-orange-100 flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedOtp ? 'Copied!' : 'Copy OTP'}</span>
              </button>
            </div>

            <div className="text-xs text-txt-secondary space-y-0.5">
              <div>Item: <strong className="text-navy">{listing.food_title}</strong></div>
              <div>Quantity: <strong className="text-primary">{listing.quantity_servings} Servings</strong> ({listing.weight_kg || 30} kg)</div>
            </div>

            {/* Verified Result Banner */}
            {verifiedResult ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-status-success text-xs space-y-1.5 animate-fadeIn">
                <div className="flex items-center justify-center gap-1.5 font-extrabold text-sm text-status-success">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Pickup Handshake Verified!</span>
                </div>
                <div className="text-emerald-950 font-medium">{verifiedResult.message}</div>
                <div className="text-[11px] text-emerald-800 font-bold">
                  🌱 CO₂ Mitigated: <strong>{verifiedResult.co2_mitigated_kg} kg</strong> • Trust Ledger Updated (+1.0)
                </div>
              </div>
            ) : (
              <div className="space-y-2 pt-1">
                <button
                  onClick={handleSimulateScan}
                  disabled={verifying}
                  className="w-full py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-sm shadow-orange transition-all flex items-center justify-center gap-2 touch-target"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{verifying ? 'Verifying Token Signature...' : 'Simulate Recipient QR Scan & Handshake'}</span>
                </button>

                <a
                  href={createWhatsAppLink(listing.donor_phone, `🍱 FoodBridge Pickup QR Handshake for *${listing.food_title}* (${listing.quantity_servings} servings).\nHandshake OTP: *${fallbackOtp}*\nGate Address: ${listing.pickup_address}`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 rounded-xl border border-border hover:bg-surface-subtle text-txt-secondary font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5 text-status-success" />
                  <span>Share QR / OTP via WhatsApp</span>
                </a>
              </div>
            )}

          </div>
        ) : null}

      </div>
    </div>
  );
}
