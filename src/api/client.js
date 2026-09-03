// Single source of truth for talking to the n8n backend.
// Every webhook call for the whole app goes through this file —
// if Person A changes a field name or a route, this is the only
// place that needs to change.

const BASE_URL = import.meta.env.VITE_N8N_BASE_URL;

if (!BASE_URL) {
  // Fails loudly in dev instead of silently sending requests to "undefined/report"
  console.warn(
    'VITE_N8N_BASE_URL is not set. Copy .env.example to .env and fill in your n8n webhook base URL.'
  );
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    // n8n webhook errors usually come back as { message } or plain text —
    // surface whatever we get so the UI can show something useful.
    const text = await res.text().catch(() => '');
    throw new Error(`Request to ${path} failed (${res.status}): ${text || res.statusText}`);
  }

  return res.json();
}

/**
 * Workflow 1 — Submit Report
 * POST /report
 * Body matches Agent 1's input in AGENTS.md exactly.
 */
export function submitReport({
  city,
  location_text,
  travel_time, // "day" | "evening" | "night" | "unspecified"
  transport_method,
  safety_rating, // 1-5
  description,
}) {
  return request('/report', {
    method: 'POST',
    body: JSON.stringify({
      city,
      location_text,
      travel_time,
      transport_method,
      safety_rating,
      description,
    }),
  });
}

/**
 * Workflow 2 — Get Map Data
 * GET /reports
 * Returns an array of locations with computed safety scores.
 * Each item: { location_text, latitude, longitude, safety_score, risk_level, insufficient_data? }
 */
export function getMapData() {
  return request('/reports', { method: 'GET' });
}

/**
 * Workflow 3 — Compare Routes
 * POST /compare
 * Returns { routes: [...], recommended_route, explanation }
 * routes.length is 2 or 3 — never assume exactly 2.
 */
export function compareRoutes({ origin, destination }) {
  return request('/compare', {
    method: 'POST',
    body: JSON.stringify({ origin, destination }),
  });
}
