import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { getMapData } from '../api/client.js';
import { riskInfo } from '../utils/risk.js';

// Fallback center if there's no data yet — swap for your demo city.
const DEFAULT_CENTER = [24.8607, 67.0011]; // Karachi

export default function MapView() {
  const [locations, setLocations] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    getMapData()
      .then((data) => {
        setLocations(data);
        setStatus('ready');
      })
      .catch((err) => {
        setErrorMsg(err.message);
        setStatus('error');
      });
  }, []);

  if (status === 'loading') {
    return <div className="text-center mt-16 text-ink/60">Loading map data…</div>;
  }

  if (status === 'error') {
    return (
      <div className="text-center mt-16 text-risk">
        Couldn't load map data: {errorMsg}
      </div>
    );
  }

  const center =
    locations.length > 0 ? [locations[0].latitude, locations[0].longitude] : DEFAULT_CENTER;

  return (
    <div className="h-[calc(100vh-57px)]">
      <MapContainer center={center} zoom={13} scrollWheelZoom>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {locations.map((loc, i) => {
          const info = riskInfo(loc.safety_score, loc.insufficient_data);
          return (
            <CircleMarker
              key={i}
              center={[loc.latitude, loc.longitude]}
              radius={10}
              pathOptions={{ color: info.color, fillColor: info.color, fillOpacity: 0.8 }}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-medium">{loc.location_text}</p>
                  <p style={{ color: info.color }}>{info.label}</p>
                  {!loc.insufficient_data && (
                    <p className="text-ink/60">Score: {loc.safety_score}/100</p>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
