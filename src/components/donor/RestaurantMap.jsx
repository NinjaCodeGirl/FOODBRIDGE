import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { 
  MapPin, Navigation, Search, CheckCircle2, Truck, Building2, 
  Phone, Clock, ShieldCheck, ArrowRight, Compass, RefreshCw, Send
} from 'lucide-react';
import { calculateHaversineDistance, searchAddressGeocoding, getRouteDetails } from '../../utils/geoUtils';

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

const restaurantIcon = createIcon('linear-gradient(135deg, #EA580C, #C2410C)', '🍽️', 44);
const ngoIcon = createIcon('linear-gradient(135deg, #10B981, #059669)', '🏢', 36);
const volunteerIcon = createIcon('linear-gradient(135deg, #3B82F6, #1D4ED8)', '🛵', 34);

// Map Click Listener to update kitchen position
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

export default function RestaurantMap({
  restaurantData = {
    name: 'The Grand Kitchen & Banquets',
    address: 'NSUT Campus, Sector 3, Dwarka, New Delhi',
    lat: 28.6100,
    lon: 77.0380,
    fssai: '10019011000452'
  },
  onLocationUpdate,
  onAssignPickup
}) {
  const [kitchenPos, setKitchenPos] = useState([restaurantData.lat || 28.6100, restaurantData.lon || 77.0380]);
  const [addressSearch, setAddressSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Pre-seeded Verified NGOs in Delhi NCR corridor
  const nearbyNGOs = [
    {
      id: 'ngo-101',
      name: 'Akshaya Patra Foundation Shelter',
      type: 'Central Community Shelter',
      lat: 28.5833,
      lon: 77.0500,
      capacity: 500,
      currentOccupancy: 340,
      contact: '+91 98101 23456',
      contactPerson: 'Rajesh Kumar',
      verifiedDarpan: 'DL/2021/029182',
      serviceRadiusKm: 15
    },
    {
      id: 'ngo-102',
      name: 'Robin Hood Army Janakpuri',
      type: 'Youth Food Rescue chapter',
      lat: 28.6219,
      lon: 77.0878,
      capacity: 250,
      currentOccupancy: 190,
      contact: '+91 98234 56789',
      contactPerson: 'Megha Sen',
      verifiedDarpan: 'DL/2019/018742',
      serviceRadiusKm: 12
    },
    {
      id: 'ngo-103',
      name: 'Feeding India Dwarka Hub',
      type: 'Hunger Relief Base',
      lat: 28.6254,
      lon: 77.0645,
      capacity: 200,
      currentOccupancy: 80,
      contact: '+91 98345 67890',
      contactPerson: 'Vikas Taneja',
      verifiedDarpan: 'DL/2022/034112',
      serviceRadiusKm: 10
    },
    {
      id: 'ngo-104',
      name: 'Roti Bank Palam Unit',
      type: 'Mobile Night Kitchen',
      lat: 28.5861,
      lon: 77.0789,
      capacity: 120,
      currentOccupancy: 110,
      contact: '+91 98456 78901',
      contactPerson: 'Sukhdev Singh',
      verifiedDarpan: 'DL/2020/004918',
      serviceRadiusKm: 8
    }
  ];

  // Active Volunteer Couriers in proximity
  const activeVolunteers = [
    {
      id: 'vol-001',
      name: 'Arjun Sharma',
      vehicle: 'Insulated Delivery Van (DL-3C-9821)',
      lat: 28.6040,
      lon: 77.0420,
      status: 'AVAILABLE',
      rating: 4.9,
      completedPickups: 142,
      phone: '+91 98765 43210'
    },
    {
      id: 'vol-002',
      name: 'Priya Verma',
      vehicle: 'Thermal Box Electric Scooter (DL-9S-4412)',
      lat: 28.6180,
      lon: 77.0320,
      status: 'ON_DISPATCH',
      rating: 4.8,
      completedPickups: 98,
      phone: '+91 98112 33445'
    }
  ];

  // Recalculate route whenever selected recipient changes
  useEffect(() => {
    if (selectedRecipient) {
      getRouteDetails(kitchenPos, [selectedRecipient.lat, selectedRecipient.lon]).then(res => {
        setRouteInfo(res);
      });
    } else {
      setRouteInfo(null);
    }
  }, [selectedRecipient, kitchenPos]);

  // Geolocation detection
  const handleLocateKitchen = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setKitchenPos(coords);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Search Address via Nominatim
  const handleSearchAddress = async (e) => {
    e.preventDefault();
    if (!addressSearch.trim()) return;
    setIsSearching(true);
    const results = await searchAddressGeocoding(addressSearch);
    setSearchResults(results);
    setIsSearching(false);
  };

  const handleSelectSearchResult = (res) => {
    setKitchenPos([res.lat, res.lon]);
    setSearchResults([]);
    setAddressSearch('');
  };

  const handleSaveKitchenLocation = () => {
    if (onLocationUpdate) {
      onLocationUpdate({
        lat: kitchenPos[0],
        lon: kitchenPos[1]
      });
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Cockpit Header with Location Controls */}
      <div className="fb-card p-4 bg-white border border-border shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Left: Kitchen Details */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-primary font-black shadow-inner">
            🍽️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-navy text-sm md:text-base">{restaurantData.name}</h2>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-status-success bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                <ShieldCheck className="w-3 h-3" /> FSSAI Verified
              </span>
            </div>
            <p className="text-xs text-txt-secondary flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>GPS: {kitchenPos[0].toFixed(4)}, {kitchenPos[1].toFixed(4)} • Click anywhere on map to reposition pin</span>
            </p>
          </div>
        </div>

        {/* Right: Geolocation & Pin Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Address Search Form */}
          <form onSubmit={handleSearchAddress} className="relative flex-1 sm:w-64">
            <input
              type="text"
              value={addressSearch}
              onChange={(e) => setAddressSearch(e.target.value)}
              placeholder="Search kitchen address..."
              className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-border focus:ring-2 focus:ring-primary focus:outline-none"
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

          {/* GPS Auto-Detect */}
          <button
            type="button"
            onClick={handleLocateKitchen}
            disabled={locating}
            className="px-3 py-2 rounded-xl border border-border hover:bg-surface-subtle text-txt-primary font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Navigation className={`w-3.5 h-3.5 text-primary ${locating ? 'animate-spin' : ''}`} />
            <span>{locating ? 'Locating...' : 'GPS Auto-Detect'}</span>
          </button>

          {/* Save Coordinates */}
          <button
            type="button"
            onClick={handleSaveKitchenLocation}
            className={`px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm ${
              saveSuccess ? 'bg-status-success text-white' : 'bg-primary hover:bg-primary-dark text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{saveSuccess ? 'Position Saved!' : 'Save Position'}</span>
          </button>
        </div>
      </div>

      {/* Main Map Box & Side Dispatch Intelligence Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Leaflet Outbound Dispatch Map (2 Columns on Desktop) */}
        <div className="lg:col-span-2 fb-card rounded-2xl overflow-hidden border border-border h-[460px] sm:h-[540px] relative shadow-md">
          <MapContainer
            center={kitchenPos}
            zoom={13}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
          >
            <MapController center={kitchenPos} zoom={13} />
            <LocationPickerEvents onLocationSelected={(coords) => setKitchenPos(coords)} />

            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Restaurant Dispatch Hub Pin */}
            <Marker position={kitchenPos} icon={restaurantIcon}>
              <Popup>
                <div className="p-1 space-y-1 text-xs">
                  <div className="font-extrabold text-navy text-sm">{restaurantData.name}</div>
                  <div className="text-primary font-semibold">Dispatch Origin Kitchen</div>
                  <div className="text-txt-muted text-[11px]">{restaurantData.address}</div>
                  <div className="text-status-success font-mono text-[10px]">FSSAI: {restaurantData.fssai}</div>
                </div>
              </Popup>
            </Marker>

            {/* Service & Delivery Corridor Circles */}
            <Circle
              center={kitchenPos}
              radius={5000} // 5 km direct dispatch zone
              pathOptions={{
                fillColor: '#EA580C',
                fillOpacity: 0.05,
                color: '#EA580C',
                weight: 1.5,
                dashArray: '3, 6'
              }}
            />

            <Circle
              center={kitchenPos}
              radius={12000} // 12 km maximum cold-chain transit radius
              pathOptions={{
                fillColor: '#3B82F6',
                fillOpacity: 0.03,
                color: '#3B82F6',
                weight: 1,
                dashArray: '4, 8'
              }}
            />

            {/* Verified NGO Shelter Pins */}
            {nearbyNGOs.map((ngo) => {
              const distance = calculateHaversineDistance(kitchenPos[0], kitchenPos[1], ngo.lat, ngo.lon);
              const isSelected = selectedRecipient?.id === ngo.id;

              return (
                <Marker
                  key={ngo.id}
                  position={[ngo.lat, ngo.lon]}
                  icon={ngoIcon}
                  eventHandlers={{
                    click: () => setSelectedRecipient(ngo)
                  }}
                >
                  <Popup>
                    <div className="p-1.5 space-y-2 text-xs min-w-[210px]">
                      <div>
                        <div className="font-extrabold text-navy text-sm">{ngo.name}</div>
                        <div className="text-txt-muted text-[11px]">{ngo.type}</div>
                      </div>

                      <div className="bg-surface-subtle p-2 rounded-lg space-y-1 text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-txt-secondary">Distance:</span>
                          <strong className="text-primary">{distance} km</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-txt-secondary">Intake Capacity:</span>
                          <strong className="text-navy">{ngo.capacity} Meals</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-txt-secondary">Darpan ID:</span>
                          <span className="font-mono text-txt-muted">{ngo.verifiedDarpan}</span>
                        </div>
                      </div>

                      <div className="text-primary font-mono font-bold text-[11px] flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {ngo.contact} ({ngo.contactPerson})
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedRecipient(ngo)}
                        className="w-full py-1.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-xs font-bold shadow-sm flex items-center justify-center gap-1"
                      >
                        Select For Outbound Dispatch
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* Volunteer Couriers Pins */}
            {activeVolunteers.map((vol) => (
              <Marker
                key={vol.id}
                position={[vol.lat, vol.lon]}
                icon={volunteerIcon}
              >
                <Popup>
                  <div className="p-1 space-y-1 text-xs">
                    <div className="font-extrabold text-navy text-sm">{vol.name}</div>
                    <div className="text-txt-secondary">{vol.vehicle}</div>
                    <div className="flex items-center gap-2 text-[11px] text-txt-muted">
                      <span>⭐ {vol.rating}</span>
                      <span>•</span>
                      <span>{vol.completedPickups} pickups</span>
                    </div>
                    <div className="text-status-success font-bold text-[11px]">Status: {vol.status}</div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Active Delivery Corridor Polyline (when NGO is selected) */}
            {selectedRecipient && (
              <Polyline
                positions={[
                  kitchenPos,
                  [selectedRecipient.lat, selectedRecipient.lon]
                ]}
                pathOptions={{
                  color: '#EA580C',
                  weight: 4,
                  opacity: 0.8,
                  dashArray: '6, 10'
                }}
              />
            )}
          </MapContainer>

          {/* Quick Floating Map Legend */}
          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-lg border border-border z-[1000] text-[11px] flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-primary" />
              <span className="font-bold text-navy">Your Kitchen</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-status-success" />
              <span className="font-bold text-navy">Verified NGO Shelter</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span className="font-bold text-navy">Volunteer Courier</span>
            </div>
          </div>
        </div>

        {/* Right: Outbound Dispatch Corridor & NGO Intake Queue */}
        <div className="space-y-4 flex flex-col justify-between">
          {/* Active Target NGO Card */}
          <div className="fb-card p-4 bg-white border border-border shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase font-black tracking-wider text-primary">
                Outbound Corridor
              </span>
              {selectedRecipient && (
                <span className="text-xs bg-orange-50 text-primary font-bold px-2 py-0.5 rounded-full border border-orange-200">
                  Target Selected
                </span>
              )}
            </div>

            {selectedRecipient ? (
              <div className="space-y-3">
                <div>
                  <h3 className="font-extrabold text-navy text-sm">{selectedRecipient.name}</h3>
                  <p className="text-xs text-txt-secondary">{selectedRecipient.type}</p>
                </div>

                {/* Real Route Matrix */}
                <div className="grid grid-cols-2 gap-2 bg-surface-subtle p-3 rounded-xl border border-gray-100">
                  <div>
                    <span className="text-[11px] text-txt-muted block">Road Distance</span>
                    <strong className="text-navy font-black text-sm">
                      {routeInfo ? `${routeInfo.distanceKm} km` : `${calculateHaversineDistance(kitchenPos[0], kitchenPos[1], selectedRecipient.lat, selectedRecipient.lon)} km`}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-txt-muted block">Estimated ETA</span>
                    <strong className="text-primary font-black text-sm flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {routeInfo ? `${routeInfo.durationMinutes} min` : '14 min'}
                    </strong>
                  </div>
                </div>

                <div className="text-xs text-txt-secondary space-y-1">
                  <div className="flex justify-between">
                    <span>Intake Capacity:</span>
                    <strong className="text-navy">{selectedRecipient.capacity} Portions</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Coordinator:</span>
                    <span className="font-semibold">{selectedRecipient.contactPerson} ({selectedRecipient.contact})</span>
                  </div>
                </div>

                {/* Dispatch Trigger Buttons */}
                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={() => onAssignPickup && onAssignPickup(selectedRecipient)}
                    className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Broadcast Direct Dispatch Request
                  </button>

                  <a
                    href={`https://wa.me/${selectedRecipient.contact.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${selectedRecipient.contactPerson}, this is ${restaurantData.name}. We have surplus food ready for immediate handover. Coordinates: ${kitchenPos.join(',')}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Coordinate on WhatsApp
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-txt-muted space-y-2">
                <Building2 className="w-8 h-8 mx-auto text-txt-muted/50" />
                <p className="text-xs">
                  Click any green NGO shelter on the map or select from the list below to evaluate delivery distance, road travel time, and dispatch volunteers.
                </p>
              </div>
            )}
          </div>

          {/* Nearby NGOs Quick List */}
          <div className="fb-card p-3 bg-white border border-border shadow-sm flex-1 flex flex-col">
            <h4 className="text-xs font-bold text-navy mb-2 flex items-center justify-between">
              <span>Verified Shelter Intake Hubs</span>
              <span className="text-[10px] text-txt-muted">{nearbyNGOs.length} within 15 km</span>
            </h4>
            <div className="space-y-2 overflow-y-auto max-h-[190px] pr-1">
              {nearbyNGOs.map((ngo) => {
                const dist = calculateHaversineDistance(kitchenPos[0], kitchenPos[1], ngo.lat, ngo.lon);
                return (
                  <button
                    key={ngo.id}
                    type="button"
                    onClick={() => setSelectedRecipient(ngo)}
                    className={`w-full text-left p-2 rounded-xl text-xs border transition-all flex items-center justify-between ${
                      selectedRecipient?.id === ngo.id
                        ? 'border-primary bg-orange-50/60 font-semibold'
                        : 'border-border hover:bg-surface-subtle'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div className="font-bold text-navy truncate">{ngo.name}</div>
                      <div className="text-[11px] text-txt-muted">{ngo.capacity} Meals • {ngo.contactPerson}</div>
                    </div>
                    <span className="shrink-0 text-primary font-mono font-bold text-[11px]">
                      {dist} km
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

