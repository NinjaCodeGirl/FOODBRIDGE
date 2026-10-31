import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, MapPin, Truck } from 'lucide-react';

// Custom Pin Factory
const createPinIcon = (bgColor, label) => {
  return L.divIcon({
    className: 'custom-route-pin',
    html: `
      <div style="
        background: ${bgColor};
        width: 34px;
        height: 34px;
        border-radius: 50%;
        border: 2.5px solid #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 800;
        font-size: 11px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      ">
        ${label}
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -17]
  });
};

const courierIcon = createPinIcon('#EA580C', '🚚');
const pickupIcon = createPinIcon('#F59E0B', 'A');
const dropoffIcon = createPinIcon('#3B82F6', 'B');

function MapRecenter({ center }) {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    if (center) {
      map.setView(center, 13);
    }
  }, [center, map]);
  return null;
}

export default function CourierRouteMap({
  courierCoords = [28.6050, 77.1600],
  pickupCoords = [28.5975, 77.1724],
  dropoffCoords = [28.6219, 77.0878],
  pickupTitle = "Taj Palace Kitchen",
  dropoffTitle = "Robin Hood Army Shelter",
  distanceKm = 1.8,
  etaMins = 12,
  status = "EN_ROUTE_TO_PICKUP"
}) {
  const center = courierCoords || pickupCoords;
  const polylineCoords = [
    courierCoords,
    pickupCoords,
    dropoffCoords
  ];

  return (
    <div className="relative w-full h-[320px] rounded-2xl overflow-hidden border border-border shadow-sm">
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={false}
        className="w-full h-full z-10"
      >
        <MapRecenter center={center} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Proximity Radius Circle around Pickup (250m) */}
        <Circle
          center={pickupCoords}
          radius={250}
          pathOptions={{
            color: '#EA580C',
            fillColor: '#EA580C',
            fillOpacity: 0.15,
            weight: 1.5,
            dashArray: '4, 4'
          }}
        />

        {/* Route Polyline */}
        <Polyline
          positions={polylineCoords}
          pathOptions={{
            color: status === 'COLLECTED' ? '#3B82F6' : '#EA580C',
            weight: 4,
            opacity: 0.8,
            dashArray: status === 'COLLECTED' ? '6, 6' : undefined
          }}
        />

        {/* Courier Position Marker */}
        <Marker position={courierCoords} icon={courierIcon}>
          <Popup>
            <div className="text-xs p-1">
              <strong>Your Van DL-3C-9821</strong>
              <br />
              Speed: ~28 km/h • GPS Active
            </div>
          </Popup>
        </Marker>

        {/* Pickup Marker */}
        <Marker position={pickupCoords} icon={pickupIcon}>
          <Popup>
            <div className="text-xs p-1">
              <strong>Pickup Point A</strong>
              <br />
              {pickupTitle}
              <br />
              <span className="text-primary font-bold">250m Geofence Active</span>
            </div>
          </Popup>
        </Marker>

        {/* Dropoff Marker */}
        <Marker position={dropoffCoords} icon={dropoffIcon}>
          <Popup>
            <div className="text-xs p-1">
              <strong>Drop-off Point B</strong>
              <br />
              {dropoffTitle}
            </div>
          </Popup>
        </Marker>
      </MapContainer>

      {/* Floating GPS HUD Banner */}
      <div className="absolute top-3 left-3 right-3 z-[400] bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-border shadow-md flex items-center justify-between text-xs font-bold text-navy">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live GPS Telemetry Locked</span>
        </div>
        <div className="flex items-center gap-3 text-txt-secondary">
          <span>Distance: <strong className="text-navy">{distanceKm} km</strong></span>
          <span>ETA: <strong className="text-primary">{etaMins} mins</strong></span>
        </div>
      </div>
    </div>
  );
}

