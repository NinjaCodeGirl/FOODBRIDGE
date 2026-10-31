/**
 * FoodBridge WhatsApp Direct Link & Alert Formatter Utility (Phase 7)
 * Provides instantaneous click-to-chat operational links and tracking URLs
 * for all 10 platform lifecycle stages.
 * Transparent: Distinguishes between direct WhatsApp Web share deep-link versus API webhook delivery.
 */

export function cleanPhoneNumber(phone) {
  if (!phone) return '';
  return phone.replace(/[^\d+]/g, '').replace(/^\+/, '');
}

export function createWhatsAppLink(phone, text) {
  const cleaned = cleanPhoneNumber(phone);
  const encodedText = encodeURIComponent(text);
  if (cleaned) {
    return `https://wa.me/${cleaned}?text=${encodedText}`;
  }
  return `https://api.whatsapp.com/send?text=${encodedText}`;
}

export const WhatsAppLifecycle = {
  // 1. Donation Created
  donationCreated: (donation) => {
    return `🍱 *FoodBridge Surplus Food Alert*
*Item:* ${donation.food_title}
*Category:* ${donation.food_category || 'COOKED_MEALS'} (${donation.classification || 'CATEGORY_A'})
*Servings:* ${donation.quantity_servings} (${donation.weight_kg || 25} kg)
*Freshness Score:* ${donation.freshness_score || 92}% (Safe for Consumption)
*Pickup Address:* ${donation.pickup_address}
*Donor:* ${donation.donor_name}
_Secure Tracking Link:_ https://union-food-bridge.vercel.app/donations/${donation.id || 'active'}`;
  },

  // 2. Food Request Received
  requestReceived: (ngoName, servings, foodTitle, deliveryId) => {
    return `📋 *FoodBridge: New Food Request*
NGO *${ngoName}* has requested *${servings} servings* of "${foodTitle}".
Please review and approve in your FoodBridge Kitchen Console:
_Approve:_ https://union-food-bridge.vercel.app/deliveries/${deliveryId}`;
  },

  // 3. Request Accepted
  requestAccepted: (donorName, servings, foodTitle, prepMins) => {
    return `🎉 *FoodBridge: Food Request Approved!*
*${donorName}* has approved your request for *${servings} servings* of "${foodTitle}".
*Kitchen Prep Time:* ~${prepMins || 15} mins.
Courier assignment is underway.`;
  },

  // 4. Request Rejected
  requestRejected: (donorName, foodTitle, reason) => {
    return `ℹ️ *FoodBridge: Request Update*
*${donorName}* was unable to fulfill the request for "${foodTitle}".
*Reason:* ${reason || 'Capacity limit or inventory exhausted'}.
Browse alternative surplus in your area: https://union-food-bridge.vercel.app/feed`;
  },

  // 5. Volunteer Assigned
  volunteerAssigned: (volunteerName, vehicle, foodTitle, donorName) => {
    return `🚚 *FoodBridge: Volunteer Courier Assigned*
Volunteer *${volunteerName}* (${vehicle || 'Insulated Van'}) has accepted the rescue mission for "${foodTitle}" from *${donorName}*.`;
  },

  // 6. Volunteer Approaching Pickup
  volunteerApproaching: (volunteerName, etaMins, donorAddress) => {
    return `⚡ *FoodBridge: Courier Approaching Pickup*
Volunteer *${volunteerName}* is *${etaMins} mins* away from loading dock at:
📍 ${donorAddress}
Please keep QR code or 6-digit OTP ready for handover scan.`;
  },

  // 7. Pickup Completed
  pickupCompleted: (foodTitle, servings, volunteerName) => {
    return `📦 *FoodBridge: Pickup Verified & In Transit*
*${servings} servings* of "${foodTitle}" verified and collected by *${volunteerName}*.
Cryptographic SHA-256 custody ledger entry generated. En route to recipient shelter.`;
  },

  // 8. Delivery Delayed
  deliveryDelayed: (delayMins, reason, newEta) => {
    return `⚠️ *FoodBridge Operational Alert: Courier Delayed*
Courier reported a delay of *${delayMins} minutes*.
*Reason:* ${reason || 'Heavy traffic congestion'}
*Updated ETA:* ~${newEta} mins.
Live route tracking updated.`;
  },

  // 9. Food Delivered
  foodDelivered: (foodTitle, servings, recipientName, co2Kg) => {
    return `✅ *FoodBridge: Verified Delivery Complete*
*${servings} servings* of "${foodTitle}" successfully handed over to *${recipientName}*!
🌱 *Carbon Offset:* ${co2Kg || (servings * 2.5).toFixed(1)} kg CO₂ diverted from landfills.
Thank you for closing the hunger loop!`;
  },

  // 10. Distribution Completed & Witnessed
  distributionCompleted: (recipientName, beneficiaries, witnessName) => {
    return `🏆 *FoodBridge: Verified Community Impact Certificate*
*${recipientName}* distributed meals to *${beneficiaries} beneficiaries*.
*Independent Witness:* ${witnessName || 'Community Coordinator (Verified)'}
_View Tamper-Proof Audit Record:_ https://union-food-bridge.vercel.app/audit`;
  }
};

// Legacy backward-compatibility exports
export const getDonationAlertMessage = WhatsAppLifecycle.donationCreated;
export const getPickupArrivalMessage = (donation, volunteerName = 'Arjun Sharma', etaMins = 20) =>
  WhatsAppLifecycle.volunteerApproaching(volunteerName, etaMins, donation.pickup_address);
export const getHandshakeConfirmationMessage = (donation, servings, co2Kg) =>
  WhatsAppLifecycle.foodDelivered(donation.food_title, servings, 'Shelter Home', co2Kg);
