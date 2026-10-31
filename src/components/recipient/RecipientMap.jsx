import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { 
  MapPin, Navigation, Search, Filter, Sparkles, Clock, AlertTriangle, 
  CheckCircle2, ArrowRight, ShieldCheck, Flame, UtensilsCrossed, SlidersHorizontal
} from 'lucide-react';
import { calculateHaversineDistance, searchAddressGeocoding, getRouteDetails, calculateSmartMatchScore } from '../../utils/geoUtils';

// Fix Leaflet Default Icon Path issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Pins
const createIcon = (bgGradient, iconEmoji, size = 38) => {
  return L.divIcon({
    className: 'custom-map-pin',
    html: `
      <div style="
        background: ${bgGradient};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        border: 2.5px solid #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 800;
        font-size: 13px;
        box-shadow: 0 4px 14px rgba(15, 23, 42, 0.35);
        cursor: pointer;
      ">
        ${iconEmoji}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2]
  });
};

const ngoIcon = createIcon('linear-gradient(135deg, #10B981, #059669)', '🏢', 42);
const foodCatAIcon = createIcon('linear-gradient(135deg, #EA580C, #C2410C)', '🌾', 36);
const foodCatBIcon = createIcon('linear-gradient(135deg, #3B82F6, #1D4ED8)', '❄️', 36);
const matchedIdealIcon = createIcon('linear-gradient(135deg, #F59E0B, #D97706)', '⭐', 40);

// Map Click Listener
function LocationPickerEvents({ onLocationSelected }) {
  useMapEvents({
    click(e) {
      onLocationSelected([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

// Map Centering Controller
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    if (center) {
      map.setView(center, zoom || 13);
    }
  }, [map, center, zoom]);
  return null;
}

export default function RecipientMap({
  ngoData = {
    name: 'Akshaya Patra Foundation Shelter',
    address: 'Dwarka Sector 10 Hub, New Delhi',
    lat: 28.5833,
    lon: 77.0500,
    capacity: 500
  },
  listings = [],
  onRequestFood,
  onOpenContact
}) {
  const [ngoPos, setNgoPos] = useState([ngoData.lat || 28.5833, ngoData.lon || 77.0500]);
  const [radiusKm, setRadiusKm] = useState(10);
  const [customRadius, setCustomRadius] = useState(10);
  const [dietFilter, setDietFilter] = useState('ALL'); // ALL, VEG, NON_VEG
  const [categoryFilter, setCategoryFilter] = useState('ALL'); // ALL, COOKED_MEALS, RAW_PRODUCE, BAKERY
  const [minPortions, setMinPortions] = useState(0);
  const [selectedListing, setSelectedListing] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [locating, setLocating] = useState(false);
  const [addressSearch, setAddressSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Radius Tier presets required by Phase 3: 1 km, 2 km, 5 km, 10 km, 15 km, 25 km
  const radiusPresets = [1, 2, 5, 10, 15, 25];

  // Geolocation
  const handleLocateNgo = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setNgoPos(coords);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Address search
  const handleSearchAddress = async (e) => {
    e.preventDefault();
    if (!addressSearch.trim()) return;
    setIsSearching(true);
    const results = await searchAddressGeocoding(addressSearch);
    setSearchResults(results);
    setIsSearching(false);
  };

  const handleSelectSearchResult = (res) => {
    setNgoPos([res.lat, res.lon]);
    setSearchResults([]);
    setAddressSearch('');
  };

  // Smart Matching and Filtering of Listings
  const processedListings = useMemo(() => {
    return listings.map(item => {
      const lat = item.latitude || 28.6100;
      const lon = item.longitude || 77.0380;
      const distance = calculateHaversineDistance(ngoPos[0], ngoPos[1], lat, lon);

      const matchAnalysis = calculateSmartMatchScore(item, {
        latitude: ngoPos[0],
        longitude: ngoPos[1],
        capacity: ngoData.capacity,
        dietary_preference: dietFilter
      });

      return {
        ...item,
        distance,
        matchScore: matchAnalysis.matchScore,
        matchTier: matchAnalysis.matchTier,
        matchReasons: matchAnalysis.reasons
      };
    }).filter(item => {
      // Radius Filter
      if (item.distance > radiusKm) return false;

      // Diet Filter
      if (dietFilter === 'VEG' && (item.food_title?.toLowerCase().includes('chicken') || item.food_title?.toLowerCase().includes('meat') || item.is_veg === false)) {
        return false;
      }
      if (dietFilter === 'NON_VEG' && item.is_veg === true && !item.food_title?.toLowerCase().includes('chicken') && !item.food_title?.toLowerCase().includes('meat')) {
        return false;
      }

      // Category Filter
      if (categoryFilter !== 'ALL' && item.food_type && item.food_type !== categoryFilter) {
        return false;
      }

      // Min Portions Filter
      if (minPortions > 0 && Number(item.quantity_servings || 0) < minPortions) {
        return false;
      }

      return true;
    }).sort((a, b) => b.matchScore - a.matchScore); // Rank highest smart match first
  }, [listings, ngoPos, radiusKm, dietFilter, categoryFilter, minPortions, ngoData.capacity]);

  // Recalculate route whenever selected listing changes
  useEffect(() => {
    if (selectedListing) {
      getRouteDetails([selectedListing.latitude || 28.6100, selectedListing.longitude || 77.0380], ngoPos).then(res => {
        setRouteInfo(res);
      });
    } else {
      setRouteInfo(null);
    }
  }, [selectedListing, ngoPos]);

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Search, Radius & Smart Matching Filters Bar */}
      <div className="fb-card p-4 bg-white border border-border shadow-sm space-y-4">
        {/* Top Line: Location & Geocoding */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-status-success font-black shadow-inner">
              🏢
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-navy text-sm md:text-base">{ngoData.name}</h3>
                <span className="text-[11px] font-bold text-status-success bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                  Intake Capacity: {ngoData.capacity} Meals
                </span>
              </div>
              <p className="text-xs text-txt-secondary flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-status-success shrink-0" />
                <span>GPS: {ngoPos[0].toFixed(4)}, {ngoPos[1].toFixed(4)} • Click on map to reposition your shelter center</span>
              </p>
            </div>
          </div>

          {/* Location Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <form onSubmit={handleSearchAddress} className="relative flex-1 sm:w-60">
              <input
                type="text"
                value={addressSearch}
                onChange={(e) => setAddressSearch(e.target.value)}
                placeholder="Search shelter location..."
                className="w-full text-xs pl-8 pr-3 py-1.5 rounded-xl border border-border focus:ring-2 focus:ring-primary focus:outline-none"
              />
              <Search className="w-3.5 h-3.5 text-txt-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto">
                  {searchResults.map((r, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectSearchResult(r)}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-surface-subtle text-navy border-b border-gray-100 last:border-b-0"
                    >
                      {r.displayName}
                    </button>
                  ))}
                </div>
              )}
            </form>

            <button
              type="button"
              onClick={handleLocateNgo}
              disabled={locating}
              className="px-3 py-1.5 rounded-xl border border-border hover:bg-surface-subtle text-txt-primary font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Navigation className={`w-3.5 h-3.5 text-status-success ${locating ? 'animate-spin' : ''}`} />
              <span>{locating ? 'Locating...' : 'GPS Detect'}</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Row: Radius Tiers + Custom Slider + Category + Veg */}
        <div className="pt-3 border-t border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
          {/* Radius Tiers Presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-bold text-txt-muted mr-1 flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-primary" /> Radius:
            </span>
            {radiusPresets.map(preset => (
              <button
                key={preset}
                type="button"
                onClick={() => { setRadiusKm(preset); setCustomRadius(preset); }}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all ${
                  radiusKm === preset
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-surface-subtle hover:bg-gray-200 text-txt-secondary border border-border'
                }`}
              >
                {preset} km
              </button>
            ))}

            {/* Custom Radius Slider */}
            <div className="flex items-center gap-1.5 ml-2 pl-2 border-l border-border">
              <span className="text-[11px] text-txt-muted">Custom:</span>
              <input
                type="range"
                min="1"
                max="30"
                value={customRadius}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setCustomRadius(val);
                  setRadiusKm(val);
                }}
                className="w-20 accent-primary cursor-pointer"
              />
              <span className="font-mono font-bold text-primary">{customRadius} km</span>
            </div>
          </div>

          {/* Dietary & Category Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Diet Filter */}
            <div className="flex items-center rounded-lg border border-border overflow-hidden">
              <button
                type="button"
                onClick={() => setDietFilter('ALL')}
                className={`px-2 py-1 text-xs font-bold ${dietFilter === 'ALL' ? 'bg-navy text-white' : 'bg-white text-txt-muted hover:bg-surface-subtle'}`}
              >
                All Diets
              </button>
              <button
                type="button"
                onClick={() => setDietFilter('VEG')}
                className={`px-2 py-1 text-xs font-bold ${dietFilter === 'VEG' ? 'bg-status-success text-white' : 'bg-white text-txt-muted hover:bg-surface-subtle'}`}
              >
                🌱 Veg Only
              </button>
              <button
                type="button"
                onClick={() => setDietFilter('NON_VEG')}
                className={`px-2 py-1 text-xs font-bold ${dietFilter === 'NON_VEG' ? 'bg-red-500 text-white' : 'bg-white text-txt-muted hover:bg-surface-subtle'}`}
              >
                🍗 Non-Veg
              </button>
            </div>

            {/* Category Select */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1 text-xs rounded-lg border border-border bg-white font-semibold text-navy focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="ALL">All Categories</option>
              <option value="COOKED_MEALS">Cooked Meals</option>
              <option value="RAW_PRODUCE">Raw Produce</option>
              <option value="BAKERY">Bakery & Breads</option>
              <option value="PACKAGED">Packaged Goods</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Map (Left) + Smart Ranked Surplus Feed (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Leaflet Inbound Discovery Map */}
        <div className="lg:col-span-2 fb-card rounded-2xl overflow-hidden border border-border h-[480px] sm:h-[560px] relative shadow-md">
          <MapContainer
            center={ngoPos}
            zoom={13}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
          >
            <MapController center={ngoPos} zoom={13} />
            <LocationPickerEvents onLocationSelected={(coords) => setNgoPos(coords)} />

            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* NGO Shelter Intake Pin */}
            <Marker position={ngoPos} icon={ngoIcon}>
              <Popup>
                <div className="p-1 space-y-1 text-xs">
                  <div className="font-extrabold text-navy text-sm">{ngoData.name}</div>
                  <div className="text-status-success font-semibold">Your Shelter Intake Center</div>
                  <div className="text-txt-muted text-[11px]">{ngoData.address}</div>
                  <div className="text-primary font-bold">Capacity: {ngoData.capacity} Meals</div>
                </div>
              </Popup>
            </Marker>

            {/* Radius Circle Overlay */}
            <Circle
              center={ngoPos}
              radius={radiusKm * 1000}
              pathOptions={{
                fillColor: '#EA580C',
                fillOpacity: 0.07,
                color: '#EA580C',
                weight: 2,
                dashArray: '4, 8'
              }}
            />

            {/* Food Surplus Listings Pins */}
            {processedListings.map((item) => {
              const lat = item.latitude || 28.6100;
              const lon = item.longitude || 77.0380;
              const isIdeal = item.matchTier === 'IDEAL';
              const isCatB = item.classification === 'CATEGORY_B';
              const pinIcon = isIdeal ? matchedIdealIcon : (isCatB ? foodCatBIcon : foodCatAIcon);

              return (
                <Marker
                  key={item.id}
                  position={[lat, lon]}
                  icon={pinIcon}
                  eventHandlers={{
                    click: () => setSelectedListing(item)
                  }}
                >
                  <Popup>
                    <div className="p-1.5 space-y-2 text-xs min-w-[220px]">
                      <div className="flex items-start justify-between gap-1">
                        <div>
                          <div className="font-extrabold text-navy text-sm">{item.food_title}</div>
                          <div className="text-primary font-semibold text-[11px]">{item.donor_name}</div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800">
                          {item.matchScore}% Match
                        </span>
                      </div>

                      <div className="bg-surface-subtle p-2 rounded-lg space-y-1 text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-txt-secondary">Available Servings:</span>
                          <strong className="text-navy">{item.quantity_servings} portions</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-txt-secondary">Distance:</span>
                          <strong className="text-primary">{item.distance} km</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-txt-secondary">AI Freshness:</span>
                          <strong className="text-status-success">{item.freshness_score}%</strong>
                        </div>
                      </div>

                      <div className="pt-1 flex gap-2">
                        {onRequestFood && (
                          <button
                            type="button"
                            onClick={() => onRequestFood(item)}
                            className="w-full py-1.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-xs font-bold shadow-sm"
                          >
                            Claim Portions
                          </button>
                        )}
                        {onOpenContact && (
                          <button
                            type="button"
                            onClick={() => onOpenContact(item)}
                            className="w-full py-1.5 bg-surface-subtle hover:bg-gray-200 text-navy rounded-lg text-xs font-bold border border-border"
                          >
                            Contact
                          </button>
                        )}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* Transit Route Polyline if listing selected */}
            {selectedListing && (
              <Polyline
                positions={[
                  [selectedListing.latitude || 28.6100, selectedListing.longitude || 77.0380],
                  ngoPos
                ]}
                pathOptions={{
                  color: '#EA580C',
                  weight: 4,
                  opacity: 0.85,
                  dashArray: '5, 8'
                }}
              />
            )}
          </MapContainer>

          {/* Floating Map Legend */}
          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-lg border border-border z-[1000] text-[11px] flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-status-success" />
              <span className="font-bold text-navy">Your Shelter</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="font-bold text-navy">Smart Ideal Match (⭐)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-primary" />
              <span className="font-bold text-navy">Ambient (🌾)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span className="font-bold text-navy">Cold Chain (❄️)</span>
            </div>
          </div>
        </div>

        {/* Right: Smart Matched Ranked Surplus Feed */}
        <div className="space-y-3 flex flex-col justify-between">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h4 className="font-extrabold text-navy text-sm">Smart Matched Surplus</h4>
            </div>
            <span className="text-xs bg-orange-100 text-primary font-bold px-2 py-0.5 rounded-full">
              {processedListings.length} within {radiusKm} km
            </span>
          </div>

          {/* Selected Listing Dispatch / Routing Card */}
          {selectedListing && (
            <div className="fb-card p-3.5 bg-orange-50/50 border border-orange-200 rounded-xl space-y-2.5 animate-fadeIn">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-primary">Selected Route Target</span>
                  <h5 className="font-extrabold text-navy text-xs sm:text-sm">{selectedListing.food_title}</h5>
                  <p className="text-[11px] text-txt-secondary">{selectedListing.donor_name}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs font-black bg-amber-500 text-white shadow-sm">
                  {selectedListing.matchScore}% Match
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-white p-2.5 rounded-lg border border-orange-100 text-xs">
                <div>
                  <span className="text-[10px] text-txt-muted block">Road Travel</span>
                  <strong className="text-navy font-black">
                    {routeInfo ? `${routeInfo.distanceKm} km` : `${selectedListing.distance} km`}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-txt-muted block">Transit ETA</span>
                  <strong className="text-primary font-black flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {routeInfo ? `${routeInfo.durationMinutes} min` : '12 min'}
                  </strong>
                </div>
              </div>

              <div className="text-[11px] text-txt-secondary">
                {selectedListing.matchReasons?.slice(0, 2).map((r, i) => (
                  <div key={i} className="flex items-center gap-1 text-emerald-800 font-medium">
                    <CheckCircle2 className="w-3 h-3 text-status-success shrink-0" />
                    <span className="truncate">{r}</span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => onRequestFood && onRequestFood(selectedListing)}
                className="w-full py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-xs font-bold shadow-md flex items-center justify-center gap-1.5 transition-transform active:scale-95"
              >
                Claim This Surplus Allocation
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Ranked List */}
          <div className="space-y-2.5 overflow-y-auto max-h-[360px] pr-1">
            {processedListings.length === 0 ? (
              <div className="text-center py-10 fb-card p-4 border border-dashed border-border rounded-xl">
                <UtensilsCrossed className="w-8 h-8 mx-auto text-txt-muted/50 mb-2" />
                <p className="text-xs font-bold text-navy">No surplus matching within {radiusKm} km</p>
                <p className="text-[11px] text-txt-muted mt-1">
                  Try expanding your search radius using the presets above or adjust your dietary filter.
                </p>
              </div>
            ) : (
              processedListings.map((item) => {
                const isSelected = selectedListing?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedListing(item)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'border-primary bg-orange-50/70 shadow-sm'
                        : 'border-border bg-white hover:border-gray-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="truncate">
                        <div className="font-extrabold text-navy truncate">{item.food_title}</div>
                        <div className="text-[11px] text-txt-muted truncate">{item.donor_name}</div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                        item.matchTier === 'IDEAL'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-orange-100 text-primary'
                      }`}>
                        {item.matchScore}% Match
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[11px]">
                      <span className="font-bold text-navy">
                        {item.quantity_servings} Servings ({item.weight_kg || 15} kg)
                      </span>
                      <span className="font-mono font-bold text-primary">
                        📍 {item.distance} km
                      </span>
                    </div>

                    <div className="mt-1 flex items-center justify-between text-[10px] text-txt-muted">
                      <span>AI Score: <strong className="text-status-success">{item.freshness_score}%</strong></span>
                      <span className="font-medium text-emerald-700">
                        {item.classification === 'CATEGORY_B' ? '❄️ Cold Chain' : '🌾 Ambient'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

