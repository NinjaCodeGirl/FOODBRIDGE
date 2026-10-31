/**
 * FoodBridge WhatsApp Direct Link & Alert Formatter Utility
 * Provides instantaneous click-to-chat operational links without third-party SMS gateway delays.
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

export function getDonationAlertMessage(donation) {
  return `🍱 *FoodBridge Surplus Alert*
*Item:* ${donation.food_title}
*Category:* ${donation.food_category || 'COOKED_MEALS'}
*Servings:* ${donation.quantity_servings} (${donation.weight_kg || 25} kg)
*Storage:* ${donation.storage_condition || 'REFRIGERATED'}
*Pickup Address:* ${donation.pickup_address}
*Donor:* ${donation.donor_name} (${donation.donor_phone || 'Contact via App'})
*Freshness Score:* ${donation.freshness_score}% (Safe Human Consumption)
*Status:* Available for verified NGO pickup now!
_View on FoodBridge Ledger:_ https://union-food-bridge.vercel.app/`;
}

export function getPickupArrivalMessage(donation, volunteerName = 'Arjun Sharma', etaMins = 20) {
  return `🚚 *FoodBridge Volunteer Dispatch Notice*
Hello ${donation.donor_name},
Volunteer courier *${volunteerName}* is en route to collect *${donation.food_title}* (${donation.quantity_servings} servings).
*Estimated Arrival:* ~${etaMins} minutes
*Pickup Gate:* ${donation.pickup_address}
Please keep the loading dock ready with the handover QR code or 6-digit OTP.`;
}

export function getHandshakeConfirmationMessage(donation, servings, co2Kg) {
  return `✅ *FoodBridge Verified Handover Handshake*
Donation *${donation.food_title}* (${servings} servings) successfully transferred and verified!
🌱 *Environmental Impact:* ${co2Kg} kg CO₂ mitigated from landfill.
Thank you for fighting food waste with FoodBridge!`;
}
