import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

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
        width: 34px;
        height: 34px;
        border-radius: 50%;
        border: 2px solid #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 700;
        font-size: 11px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.7);
        cursor: pointer;
      ">
        ${labelText}
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -17]
  });
};

const categoryAIcon = createCustomIcon('#16a34a', 'A');
const categoryBIcon = createCustomIcon('#2563eb', 'B');
const ngoIcon = createCustomIcon('#d97706', 'NGO');

// Helper component to trigger map invalidateSize on render
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 200);
  }, [map]);
  return null;
}

export default function LiveMap({ listings, onOpenContactModal, onTriggerSplit }) {
  const defaultCenter = [28.6100, 77.0500]; // Delhi NCR / Dwarka Focus

  const ngoLocations = [
    { id: 'ngo-101', name: 'Akshaya Patra Foundation Shelter', lat: 28.5833, lon: 77.0500, capacity: 200, phone: '+91 98101 23456' },
    { id: 'ngo-102', name: 'Robin Hood Army Janakpuri', lat: 28.6219, lon: 77.0878, capacity: 150, phone: '+91 98234 56789' },
    { id: 'ngo-103', name: 'Feeding India Shelter Home', lat: 28.6254, lon: 77.0645, capacity: 180, phone: '+91 98345 67890' },
    { id: 'ngo-104', name: 'Roti Bank Community Kitchen', lat: 28.5861, lon: 77.0789, capacity: 100, phone: '+91 98456 78901' }
  ];

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Header Bar */}
      <div className="glass-panel p-4 rounded-xl border border-[#1f2b1f] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <h2 className="font-display font-bold text-xl text-white">Live Proximity Food Map</h2>
          <p className="text-xs text-zinc-400">Interactive live pins for surplus food listings and nearby NGO shelters</p>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-600 border border-white" />
            <span className="text-zinc-300">Category A (Ambient)</span>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-600 border border-white" />
            <span className="text-zinc-300">Category B (Cold Chain)</span>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-600 border border-white" />
            <span className="text-zinc-300">Verified NGO</span>
          </div>
        </div>
      </div>

      {/* Leaflet Map Box */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-[#1f2b1f] h-[550px] relative w-full">
        <MapContainer
          center={defaultCenter}
          zoom={12}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <MapResizer />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Donor Food Listings Pins */}
          {listings.map((item) => (
            <Marker
              key={item.id}
              position={[item.latitude || 28.6100, item.longitude || 77.0380]}
              icon={item.classification === 'CATEGORY_B' ? categoryBIcon : categoryAIcon}
            >
              <Popup>
                <div className="p-1 space-y-2 text-xs min-w-[200px]">
                  <div>
                    <div className="font-bold text-sm text-emerald-400">{item.food_title}</div>
                    <div className="font-semibold text-white">{item.donor_name}</div>
                  </div>

                  <div className="text-zinc-300">
                    {item.quantity_servings} Servings ({item.weight_kg} kg)
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-zinc-400">
                    <span>Score: <strong className="text-emerald-400">{item.freshness_score}%</strong></span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                      {item.classification === 'CATEGORY_B' ? 'Cold Chain' : 'Ambient'}
                    </span>
                  </div>

                  <div className="text-zinc-400 font-mono text-[10px] truncate">{item.pickup_address}</div>

                  <div className="pt-2 border-t border-zinc-800 flex gap-2">
                    <button
                      onClick={() => onOpenContactModal(item)}
                      className="w-full py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-semibold"
                    >
                      Call / Contact
                    </button>
                    <button
                      onClick={() => onTriggerSplit(item)}
                      className="w-full py-1 bg-zinc-800 hover:bg-zinc-700 text-emerald-300 rounded text-[10px] font-semibold"
                    >
                      Auto-Split
                    </button>
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
                  <div className="font-bold text-amber-400 text-sm">{ngo.name}</div>
                  <div className="text-zinc-300">Verified NGO Shelter</div>
                  <div className="text-zinc-400">Capacity: <strong>{ngo.capacity} Meals</strong></div>
                  <div className="text-emerald-400 font-mono text-[11px]">📞 {ngo.phone}</div>
                </div>
              </Popup>
            </Marker>
          ))}

        </MapContainer>
      </div>
    </div>
  );
}
