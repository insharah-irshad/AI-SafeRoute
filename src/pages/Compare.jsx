
import { useState } from 'react';

import { compareRoutes } from '../api/client.js';
import { riskInfo } from '../utils/risk.js';

export default function Compare() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSearch(e) {
    e.preventDefault();

    setStatus('loading');
    setErrorMsg('');
    setResult(null);

    try {
      const data = await compareRoutes({ origin, destination });

      setResult(data);
      setStatus('ready');
    } catch (err) {
      setErrorMsg(err.message || 'Something went wrong.');
      setStatus('error');
    }
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 px-4">
      <h1 className="text-xl font-semibold mb-1">
        Compare routes
      </h1>

      <p className="text-ink/70 text-sm mb-6">
        See safety scores for real route options, not just the fastest one.
      </p>

      <form
        onSubmit={handleSearch}
        className="flex flex-col sm:flex-row gap-3 mb-8"
      >
        <input
          required
          className="flex-1 border border-ink/20 rounded-md px-3 py-2"
          placeholder="Origin"
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
        />

        <input
          required
          className="flex-1 border border-ink/20 rounded-md px-3 py-2"
          placeholder="Destination"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
        />

        <button
          type="submit"
          disabled={status === 'loading'}
          className="px-5 py-2 rounded-md bg-ink text-paper text-sm font-medium disabled:opacity-50"
        >
          {status === 'loading' ? 'Searching…' : 'Compare'}
        </button>
      </form>

      {status === 'error' && (
        <p className="text-risk text-sm mb-6">
          {errorMsg}
        </p>
      )}

      {status === 'ready' && result && (
        <div className="space-y-5">

          {/* SAFEST ROUTE RECOMMENDATION */}
          {result.recommended_route && (
            <div className="rounded-lg border border-ink bg-ink text-paper p-5">
              <p className="text-xs uppercase tracking-wide opacity-70 mb-1">
                Safest route
              </p>

              <h2 className="text-2xl font-semibold mb-2">
                {result.recommended_route}
              </h2>

              <p className="text-sm opacity-80">
                {result.explanation}
              </p>
            </div>
          )}

          {/* ROUTE CARDS */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {result.routes?.map((route) => {
              const info = riskInfo(
                route.safety_score,
                route.based_on_reports < 2
              );

              const isRecommended =
                route.label === result.recommended_route;

              return (
                <div
                  key={route.label}
                  className={`rounded-lg border p-4 ${
                    isRecommended
                      ? 'border-ink ring-2 ring-ink'
                      : 'border-ink/15'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold">
                      {route.label}
                    </span>

                    {isRecommended && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-ink text-paper">
                        Safest
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <p className="text-xs text-ink/50">
                        Time
                      </p>
                      <p className="font-medium">
                        {route.duration_min} min
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-ink/50">
                        Distance
                      </p>
                      <p className="font-medium">
                        {route.distance_km} km
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: info.color }}
                    />

                    <span className="text-sm font-medium">
                      {info.label}
                    </span>

                    <span className="text-sm text-ink/50">
                      ({route.safety_score}/100)
                    </span>
                  </div>

                  <p className="text-xs text-ink/50 mb-3">
                    Based on {route.based_on_reports || 0} safety report
                    {route.based_on_reports === 1 ? '' : 's'}
                  </p>

                  {route.matched_reports?.length > 0 && (
                    <div>
                      <p className="text-xs font-medium mb-1">
                        Nearby reports
                      </p>

                      <ul className="text-xs text-ink/70 space-y-1">
                        {route.matched_reports.slice(0, 3).map((report) => (
                          <li key={report.id}>
                            {report.location} — {report.risk_level}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {route.used_city_fallback && (
                    <p className="text-xs text-unknown mt-3">
                      Based on city-level data
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* WHY THIS ROUTE */}
          {result.explanation && (
            <div className="rounded-lg bg-ink/5 p-4 text-sm">
              <span className="font-medium">
                Why this route?
              </span>{' '}
              {result.explanation}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```
