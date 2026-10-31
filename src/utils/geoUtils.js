/**
 * FoodBridge Geographical Utilities & Smart Matching Engine
 * Implements Haversine distance, OSRM road routing with fallback, 
 * Nominatim reverse/forward geocoding, and multi-factor surplus matching.
 */

// Earth radius in kilometers
const EARTH_RADIUS_KM = 6371.0;

/**
 * Calculates great-circle distance between two GPS coordinates using Haversine formula.
 * @param {number} lat1 Latitude of point 1
 * @param {number} lon1 Longitude of point 1
 * @param {number} lat2 Latitude of point 2
 * @param {number} lon2 Longitude of point 2
 * @returns {number} Distance in kilometers (rounded to 2 decimal places)
 */
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  
  const toRad = (angle) => (angle * Math.PI) / 180;
  
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = EARTH_RADIUS_KM * c;
  
  return Math.round(distance * 100) / 100;
}

/**
 * Calculates estimated road travel distance and duration.
 * Attempts OSRM public routing API first; falls back to urban transit model (1.3x road winding factor).
 * @param {[number, number]} start [lat, lon]
 * @param {[number, number]} end [lat, lon]
 * @returns {Promise<{distanceKm: number, durationMinutes: number, routeGeoJson: any | null}>}
 */
export async function getRouteDetails(start, end) {
  const [lat1, lon1] = start;
  const [lat2, lon2] = end;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const url = `https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=full&geometries=geojson`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        return {
          distanceKm: Math.round((route.distance / 1000) * 10) / 10,
          durationMinutes: Math.round(route.duration / 60),
          routeGeoJson: route.geometry,
          isLiveOSRM: true
        };
      }
    }
  } catch (err) {
    // Offline or OSRM rate limited; proceed to mathematical fallback model
  }

  // Resilient fallback model:
  // Urban road network factor: 1.32x straight-line distance
  // Delhi/NCR average transit speed: 22 km/h + 6 min pickup buffer
  const straightDist = calculateHaversineDistance(lat1, lon1, lat2, lon2);
  const roadDist = Math.round(straightDist * 1.32 * 10) / 10;
  const durationMin = Math.max(5, Math.round((roadDist / 22) * 60 + 6));

  return {
    distanceKm: roadDist,
    durationMinutes: durationMin,
    routeGeoJson: null,
    isLiveOSRM: false
  };
}

/**
 * Searches coordinates for an address query using Nominatim OpenStreetMap geocoder.
 * @param {string} query Address string
 * @returns {Promise<Array<{displayName: string, lat: number, lon: number}>>}
 */
export async function searchAddressGeocoding(query) {
  if (!query || query.trim().length < 3) return [];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=in`;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'UnionFoodBridge-EmergencyDispatcher/2.0'
      }
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const list = await res.json();
      return list.map(item => ({
        displayName: item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon)
      }));
    }
  } catch (err) {
    // Return empty list on network error
  }

  return [];
}

/**
 * Multi-Factor Smart Matching Algorithm.
 * Evaluates candidates based on:
 * 1. Geographic distance & route time (Weight 30%)
 * 2. Food safety / Freshness score & remaining consumption window (Weight 25%)
 * 3. Portion capacity fit (offered servings vs NGO demand) (Weight 20%)
 * 4. Dietary compatibility (Veg/Non-Veg match) (Weight 15%)
 * 5. NGO verification tier & trust rating (Weight 10%)
 * 
 * @param {Object} listing Food surplus listing
 * @param {Object} recipient NGO requirements & coordinates
 * @returns {{matchScore: number, matchTier: 'IDEAL' | 'HIGH' | 'GOOD' | 'FAIR', reasons: string[]}}
 */
export function calculateSmartMatchScore(listing, recipient) {
  let score = 0;
  const reasons = [];

  // 1. Distance factor (30 pts max)
  const distKm = calculateHaversineDistance(
    listing.latitude || 28.6100,
    listing.longitude || 77.0380,
    recipient.latitude || 28.5833,
    recipient.longitude || 77.0500
  );

  if (distKm <= 3.0) {
    score += 30;
    reasons.push(`Super proximity (${distKm} km) - ultra fast dispatch under 15 min`);
  } else if (distKm <= 8.0) {
    score += 22;
    reasons.push(`Close transit corridor (${distKm} km)`);
  } else if (distKm <= 15.0) {
    score += 15;
    reasons.push(`Moderate radius (${distKm} km)`);
  } else {
    score += Math.max(5, Math.round(30 - (distKm - 15) * 1.5));
    reasons.push(`Extended dispatch radius (${distKm} km)`);
  }

  // 2. Freshness & Consumption Window (25 pts max)
  const freshness = Number(listing.freshness_score || 85);
  if (freshness >= 90) {
    score += 25;
    reasons.push(`Pristine AI Freshness Rating: ${freshness}%`);
  } else if (freshness >= 75) {
    score += 20;
    reasons.push(`Compliant AI Freshness: ${freshness}%`);
  } else {
    score += 12;
    reasons.push(`Expedited redistribution required (Freshness: ${freshness}%)`);
  }

  // 3. Portion / Capacity Fit (20 pts max)
  const offered = Number(listing.quantity_servings || 50);
  const needed = Number(recipient.capacity || recipient.requestedServings || 100);
  const ratio = Math.min(offered, needed) / Math.max(offered, needed);
  const portionScore = Math.round(ratio * 20);
  score += portionScore;
  if (ratio >= 0.75) {
    reasons.push(`Excellent capacity alignment (${offered} meals for ${needed} capacity)`);
  } else {
    reasons.push(`Partial capacity match (${offered} meals available)`);
  }

  // 4. Dietary Compatibility (15 pts max)
  const isVegListing = listing.is_veg !== false && !listing.food_title?.toLowerCase().includes('chicken') && !listing.food_title?.toLowerCase().includes('meat');
  const recipientPref = recipient.dietary_preference || 'ALL';

  if (recipientPref === 'VEG' && !isVegListing) {
    score += 0;
    reasons.push(`Dietary note: Non-veg listing for vegetarian shelter`);
  } else {
    score += 15;
    reasons.push(`Dietary preference fully satisfied`);
  }

  // 5. Verification & Trust (10 pts max)
  if (listing.fssai_verified || listing.fssai_license) {
    score += 10;
    reasons.push(`FSSAI certified commercial kitchen`);
  } else {
    score += 6;
  }

  // Final score clamping [0, 100]
  const finalScore = Math.min(100, Math.max(10, score));

  let matchTier = 'FAIR';
  if (finalScore >= 85) matchTier = 'IDEAL';
  else if (finalScore >= 72) matchTier = 'HIGH';
  else if (finalScore >= 55) matchTier = 'GOOD';

  return {
    matchScore: finalScore,
    matchTier,
    distanceKm: distKm,
    reasons
  };
}

