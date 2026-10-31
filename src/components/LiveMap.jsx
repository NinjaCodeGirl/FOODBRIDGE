import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, Compass, Layers } from 'lucide-react';

// Fix Leaflet Default Icon Path issues in React Vite builds
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Pins
const createCustomIcon = (bgColor, labelText) => {
  return L.divIcon({
    className: 'custom-map-pin',
    html: `
      <div style="
        background: ${bgColor};
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: 2px solid #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 800;
        font-size: 11px;
        box-shadow: 0 4px 12px rgba(15, 23, 42, 0.35);
        cursor: pointer;
      ">
        ${labelText}
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18]
  });
};

const categoryAIcon = createCustomIcon('#10B981', '🌾 A');
const categoryBIcon = createCustomIcon('#3B82F6', '❄️ B');
const ngoIcon = createCustomIcon('#EA580C', 'NGO');
const userIcon = createCustomIcon('#6366F1', 'YOU');

// Helper to trigger map size invalidation and re-center
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    if (center) {
      map.setView(center, zoom || 12);
    }
  }, [map, center, zoom]);
  return null;
}

export default function LiveMap({ 
  listings = [], 
  onOpenContactModal, 
  onTriggerSplit, 
  userCoords = null,
  radiusKm = null 
}) {
  const [mapCenter, setMapCenter] = useState([28.6100, 77.0500]); // Delhi NCR center
  const [activeUserPos, setActiveUserPos] = useState(userCoords || [28.6100, 77.0500]);
  const [locating, setLocating] = useState(false);

  const ngoLocations = [
    { id: 'ngo-101', name: 'Akshaya Patra Foundation Shelter', lat: 28.5833, lon: 77.0500, capacity: 500, phone: '+91 98101 23456' },
    { id: 'ngo-102', name: 'Robin Hood Army Janakpuri', lat: 28.6219, lon: 77.0878, capacity: 250, phone: '+91 98234 56789' },
    { id: 'ngo-103', name: 'Feeding India Shelter Home', lat: 28.6254, lon: 77.0645, capacity: 180, phone: '+91 98345 67890' },
    { id: 'ngo-104', name: 'Roti Bank Community Kitchen', lat: 28.5861, lon: 77.0789, capacity: 100, phone: '+91 98456 78901' }
  ];

  const handleLocateUser = () => {
    if (navigator.geolocation) {
      setLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPos = [pos.coords.latitude, pos.coords.longitude];
          setActiveUserPos(newPos);
          setMapCenter(newPos);
          setLocating(false);
        },
        () => {
          setLocating(false);
        },
        { timeout: 8000 }
      );
    }
  };

  return (
    <div className="space-y-3 animate-fadeIn">
      {/* Legend & Quick Geolocation Controls */}
      <div className="fb-card p-3.5 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        {/* Map Legend */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-status-success border border-white shadow-sm" />
            <span className="font-semibold text-txt-secondary">Category A (Ambient)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-status-info border border-white shadow-sm" />
            <span className="font-semibold text-txt-secondary">Category B (Cold Chain)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-primary border border-white shadow-sm" />
            <span className="font-semibold text-txt-secondary">Verified NGO Shelter</span>
          </div>
        </div>

        {/* Locate Me Button */}
        <button
          type="button"
          onClick={handleLocateUser}
          className="px-3 py-1.5 rounded-xl border border-border hover:bg-surface-subtle text-txt-primary font-bold text-xs flex items-center gap-1.5 transition-colors"
        >
          <Navigation className="w-3.5 h-3.5 text-primary" />
          <span>{locating ? 'Detecting GPS...' : 'Locate My Position'}</span>
        </button>
      </div>

      {/* Leaflet Map Box */}
      <div className="fb-card rounded-2xl overflow-hidden border border-border h-[420px] sm:h-[500px] lg:h-[550px] relative w-full shadow-md">
        <MapContainer
          center={mapCenter}
          zoom={12}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <MapController center={mapCenter} zoom={12} />
          
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* User Location Marker & Radius Circle */}
          {activeUserPos && (
            <>
              <Marker position={activeUserPos} icon={userIcon}>
                <Popup>
                  <div className="p-1 font-bold text-xs text-navy">
                    Your Location (GPS Center)
                  </div>
                </Popup>
              </Marker>

              {radiusKm && radiusKm !== 'ALL' && (
                <Circle
                  center={activeUserPos}
                  radius={Number(radiusKm) * 1000}
                  pathOptions={{
                    fillColor: '#EA580C',
                    fillOpacity: 0.08,
                    color: '#EA580C',
                    weight: 2,
                    dashArray: '4, 8'
                  }}
                />
              )}
            </>
          )}

          {/* Donor Food Listings Pins */}
          {listings.map((item) => (
            <Marker
              key={item.id}
              position={[item.latitude || 28.6100, item.longitude || 77.0380]}
              icon={item.classification === 'CATEGORY_B' ? categoryBIcon : categoryAIcon}
            >
              <Popup>
                <div className="p-1 space-y-2 text-xs min-w-[210px]">
                  <div>
                    <div className="font-extrabold text-sm text-navy">{item.food_title}</div>
                    <div className="font-semibold text-primary">{item.donor_name}</div>
                  </div>

                  <div className="text-txt-secondary">
                    <strong>{item.quantity_servings} Servings</strong> ({item.weight_kg} kg)
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-txt-muted">
                    <span>AI Freshness: <strong className="text-status-success">{item.freshness_score}%</strong></span>
                    <span className="px-1.5 py-0.5 rounded bg-orange-100 text-primary font-bold">
                      {item.classification === 'CATEGORY_B' ? 'Cold Chain' : 'Ambient'}
                    </span>
                  </div>

                  <div className="text-txt-secondary text-[11px] truncate">{item.pickup_address}</div>

                  <div className="pt-2 border-t border-border flex gap-2">
                    {onOpenContactModal && (
                      <button
                        onClick={() => onOpenContactModal(item)}
                        className="w-full py-1.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-[10px] font-bold shadow-sm"
                      >
                        Contact Donor
                      </button>
                    )}
                    {onTriggerSplit && (
                      <button
                        onClick={() => onTriggerSplit(item)}
                        className="w-full py-1.5 bg-surface-subtle hover:bg-gray-200 text-navy rounded-lg text-[10px] font-bold border border-border"
                      >
                        Auto-Split
                      </button>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* NGO Shelter Pins */}
          {ngoLocations.map((ngo) => (
            <Marker
              key={ngo.id}
              position={[ngo.lat, ngo.lon]}
              icon={ngoIcon}
            >
              <Popup>
                <div className="p-1 space-y-1 text-xs">
                  <div className="font-extrabold text-navy text-sm">{ngo.name}</div>
                  <div className="text-txt-secondary">Verified Shelter</div>
                  <div className="text-txt-muted">Intake Capacity: <strong>{ngo.capacity} Meals</strong></div>
                  <div className="text-primary font-mono font-bold text-[11px]">📞 {ngo.phone}</div>
                </div>
              </Popup>
            </Marker>
          ))}

        </MapContainer>
      </div>
    </div>
  );
}
