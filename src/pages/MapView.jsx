import { useEffect, useState, useCallback, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  Polyline,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import { getMapData, compareRoutes } from '../api/client.js';
import { riskInfo } from '../utils/risk.js';

// Fallback center if there's no data yet — swap for your demo city.
const DEFAULT_CENTER = [24.8607, 67.0011]; // Karachi

// Standard OpenStreetMap tiles — no API key required, reliable.
const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const TILE_ATTRIBUTION = '&copy; OpenStreetMap contributors';

// Karachi-ish bounding box, used to keep search results relevant for the demo.
const SEARCH_VIEWBOX = '66.8,25.1,67.5,24.7';

// Captures map clicks while in "plan" mode and reports the lat/lng up.
function ClickCatcher({ active, onPick }) {
  useMapEvents({
    click(e) {
      if (!active) return;
      onPick(e.latlng);
    },
  });
  return null;
}

// Lets us call map.flyTo(...) from outside the MapContainer (e.g. after a
// search result or "use my location" is picked).
function FlyToController({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lng], 15);
  }, [target, map]);
  return null;
}

export default function MapView() {
  const [mode, setMode] = useState('reports'); // 'reports' | 'plan'

  // ---- "View Reports" mode state ----
  const [locations, setLocations] = useState([]);
  const [reportsStatus, setReportsStatus] = useState('loading'); // loading | ready | error
  const [reportsError, setReportsError] = useState('');

  // ---- "Plan Route" mode state ----
  const [origin, setOrigin] = useState(null); // { lat, lng }
  const [destination, setDestination] = useState(null);
  const [routeResult, setRouteResult] = useState(null); // { routes, recommended_route, explanation }
  const [routeStatus, setRouteStatus] = useState('idle'); // idle | picking-destination | loading | ready | error
  const [routeError, setRouteError] = useState('');
  const [flyTarget, setFlyTarget] = useState(null);

  // ---- Search state ----
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const searchDebounceRef = useRef(null);

  useEffect(() => {
    getMapData()
      .then((data) => {
        setLocations(data);
        setReportsStatus('ready');
      })
      .catch((err) => {
        setReportsError(err.message);
        setReportsStatus('error');
      });
  }, []);

  // Shared by map clicks, search selection, and "use my location" —
  // whichever point isn't set yet gets filled next.
  const assignPoint = useCallback(
    (latlng) => {
      if (!origin) {
        setOrigin(latlng);
        setRouteStatus('picking-destination');
        setFlyTarget(latlng);
        return;
      }
      if (!destination) {
        setDestination(latlng);
        setRouteStatus('loading');
        setFlyTarget(latlng);
        compareRoutes({
          originLat: origin.lat,
          originLng: origin.lng,
          destinationLat: latlng.lat,
          destinationLng: latlng.lng,
        })
          .then((data) => {
            setRouteResult(data);
            setRouteStatus('ready');
          })
          .catch((err) => {
            setRouteError(err.message);
            setRouteStatus('error');
          });
      }
    },
    [origin, destination]
  );

  const handlePick = useCallback((latlng) => assignPoint(latlng), [assignPoint]);

  // Used by search + "use my location" — if we're still in View Reports
  // mode, picking a point there kicks off route planning automatically.
  const handleLocationPicked = useCallback(
    (latlng) => {
      if (mode !== 'plan') setMode('plan');
      assignPoint(latlng);
    },
    [mode, assignPoint]
  );

  // ---- Search: debounced Nominatim lookup ----
  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    if (!searchQuery || searchQuery.trim().length < 3) {
      setSearchResults([]);
      return;
    }

    searchDebounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            searchQuery
          )}&countrycodes=pk&viewbox=${SEARCH_VIEWBOX}&bounded=1&limit=5`
        );
        const data = await res.json();
        setSearchResults(data);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(searchDebounceRef.current);
  }, [searchQuery]);

  function handleSelectSearchResult(result) {
    const latlng = { lat: parseFloat(result.lat), lng: parseFloat(result.lon) };
    setSearchQuery('');
    setSearchResults([]);
    handleLocationPicked(latlng);
  }

  function handleUseMyLocation() {
    if (!navigator.geolocation) {
      setRouteError('Location not supported in this browser');
      setRouteStatus('error');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        handleLocationPicked({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => {
        setLocating(false);
        setRouteError("Couldn't get your location: " + err.message);
        setRouteStatus('error');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function resetPlan() {
    setOrigin(null);
    setDestination(null);
    setRouteResult(null);
    setRouteStatus('idle');
    setRouteError('');
    setSearchQuery('');
    setSearchResults([]);
  }

  function switchMode(next) {
    setMode(next);
    if (next === 'reports') resetPlan();
  }

  // Only render pins for reports that actually have coordinates —
  // rows with null/undefined lat/lng (not yet geocoded) would crash Leaflet.
  const validLocations = locations.filter(
    (loc) => loc.latitude != null && loc.longitude != null
  );

  const center =
    validLocations.length > 0
      ? [validLocations[0].latitude, validLocations[0].longitude]
      : DEFAULT_CENTER;

  // Visible in both View Reports and Plan Route modes — only hides once a
  // route comparison is loading or a result is being shown.
  const showSearchBox = routeStatus !== 'loading' && routeStatus !== 'ready';

  return (
    <div className="relative h-[calc(100vh-57px)]">
      {/* Mode toggle */}
      <div className="absolute z-[1000] top-3 left-1/2 -translate-x-1/2 bg-paper rounded-full shadow-md border border-ink/10 flex p-1 gap-1">
        <button
          onClick={() => switchMode('reports')}
          className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
            mode === 'reports' ? 'bg-ink text-paper' : 'text-ink hover:bg-ink/10'
          }`}
        >
          View Reports
        </button>
        <button
          onClick={() => switchMode('plan')}
          className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
            mode === 'plan' ? 'bg-ink text-paper' : 'text-ink hover:bg-ink/10'
          }`}
        >
          Plan Route
        </button>
      </div>

      {/* Plan-mode: search + use-my-location panel */}
      {showSearchBox && (
        <div className="absolute z-[1000] top-16 left-1/2 -translate-x-1/2 w-[min(92vw,420px)] bg-paper rounded-lg shadow-md border border-ink/10 p-3">
          <p className="text-xs text-ink/60 mb-2">
            {!origin
              ? mode === 'reports'
                ? 'Search a location to start planning a route'
                : 'Search or tap the map to set your start'
              : 'Now search or tap the map for your destination'}
          </p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search a location…"
                className="w-full text-sm px-3 py-2 rounded-md border border-ink/15 bg-white focus:outline-none focus:ring-2 focus:ring-ink/20"
              />
              {searchResults.length > 0 && (
                <ul className="absolute left-0 right-0 mt-1 bg-white rounded-md shadow-md border border-ink/10 max-h-48 overflow-y-auto">
                  {searchResults.map((r) => (
                    <li
                      key={r.place_id}
                      onClick={() => handleSelectSearchResult(r)}
                      className="px-3 py-2 text-sm hover:bg-ink/5 cursor-pointer border-b border-ink/5 last:border-0"
                    >
                      {r.display_name}
                    </li>
                  ))}
                </ul>
              )}
              {isSearching && (
                <p className="absolute left-0 right-0 mt-1 text-xs text-ink/40 px-1">Searching…</p>
              )}
            </div>
            <button
              onClick={handleUseMyLocation}
              disabled={locating}
              title="Use my location"
              className="shrink-0 px-3 py-2 rounded-md border border-ink/15 bg-white text-sm hover:bg-ink/5 disabled:opacity-50"
            >
              {locating ? '…' : '📍'}
            </button>
          </div>
          {origin && (
            <button
              onClick={resetPlan}
              className="mt-2 text-xs text-ink/50 hover:text-ink underline"
            >
              Reset
            </button>
          )}
        </div>
      )}

      {/* Plan-mode: loading / error / result panel */}
      {mode === 'plan' && (routeStatus === 'loading' || routeStatus === 'error' || routeStatus === 'ready') && (
        <div className="absolute z-[1000] top-16 left-1/2 -translate-x-1/2 w-[min(92vw,420px)] bg-paper rounded-lg shadow-md border border-ink/10 p-4 text-sm">
          {routeStatus === 'loading' && <p>Comparing routes…</p>}

          {routeStatus === 'error' && (
            <>
              <p className="text-risk mb-2">Couldn't compare routes: {routeError}</p>
              <button
                onClick={resetPlan}
                className="px-3 py-1 rounded-md bg-ink text-paper text-xs"
              >
                Try again
              </button>
            </>
          )}

          {routeStatus === 'ready' && routeResult && (
            <div className="space-y-3">
              <div className="flex flex-col gap-1.5">
                {routeResult.routes.map((route) => {
                  const info = riskInfo(route.safety_score, route.used_city_fallback);
                  const isRecommended = route.label === routeResult.recommended_route;
                  return (
                    <div key={route.label} className="flex items-center gap-1.5">
                      <span
                        className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: info.color }}
                      />
                      <span className={isRecommended ? 'font-semibold' : ''}>
                        {route.label}
                        {isRecommended ? ' ★' : ''} — {route.duration_min} min, {route.safety_score}
                        /100
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="text-ink/70">{routeResult.explanation}</p>
              <button
                onClick={resetPlan}
                className="px-3 py-1 rounded-md bg-ink text-paper text-xs"
              >
                Plan another route
              </button>
            </div>
          )}
        </div>
      )}

      {reportsStatus === 'error' && mode === 'reports' && (
        <div className="absolute z-[1000] top-16 left-1/2 -translate-x-1/2 bg-paper rounded-lg shadow-md border border-ink/10 p-3 text-sm text-risk">
          Couldn't load map data: {reportsError}
        </div>
      )}

      <MapContainer center={center} zoom={12} scrollWheelZoom className="h-full w-full">
        <TileLayer attribution={TILE_ATTRIBUTION} url={TILE_URL} />

        <ClickCatcher
          active={mode === 'plan' && routeStatus !== 'loading' && routeStatus !== 'ready'}
          onPick={handlePick}
        />
        <FlyToController target={flyTarget} />

        {/* View Reports mode: safety report pins */}
        {mode === 'reports' &&
          validLocations.map((loc, i) => {
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

        {/* Plan Route mode: origin/destination pins */}
        {mode === 'plan' && origin && (
          <CircleMarker
            center={[origin.lat, origin.lng]}
            radius={8}
            pathOptions={{ color: '#1E1E1E', fillColor: '#1E1E1E', fillOpacity: 1 }}
          >
            <Popup>Start</Popup>
          </CircleMarker>
        )}
        {mode === 'plan' && destination && (
          <CircleMarker
            center={[destination.lat, destination.lng]}
            radius={8}
            pathOptions={{ color: '#1E1E1E', fillColor: '#1E1E1E', fillOpacity: 1 }}
          >
            <Popup>Destination</Popup>
          </CircleMarker>
        )}

        {/* Plan Route mode: colored route lines (green = safe, red = risky) */}
        {mode === 'plan' &&
          routeResult &&
          routeResult.routes.map((route) => {
            const info = riskInfo(route.safety_score, route.used_city_fallback);
            const isRecommended = route.label === routeResult.recommended_route;
            const positions = route.path.map((p) => [p.lat, p.lng]);
            return (
              <Polyline
                key={route.label}
                positions={positions}
                pathOptions={{
                  color: info.color,
                  weight: isRecommended ? 6 : 4,
                  opacity: isRecommended ? 0.9 : 0.55,
                }}
              />
            );
          })}
      </MapContainer>
    </div>
  );
}