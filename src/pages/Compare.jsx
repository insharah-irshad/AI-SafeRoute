import { useState } from 'react';
import { compareRoutes } from '../api/client.js';
import { riskInfo } from '../utils/risk.js';

export default function Compare() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | ready | error
  const [result, setResult] = useState(null); // { routes, recommended_route, explanation }
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSearch(e) {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');
    try {
      const data = await compareRoutes({ origin, destination });
      setResult(data);
      setStatus('ready');
    } catch (err) {
      setErrorMsg(err.message);
      setStatus('error');
    }
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 px-4">
      <h1 className="text-xl font-semibold mb-1">Compare routes</h1>
      <p className="text-ink/70 text-sm mb-6">
        See safety scores for real route options, not just the fastest one.
      </p>

      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-8">
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

      {status === 'error' && <p className="text-risk text-sm mb-6">{errorMsg}</p>}

      {status === 'ready' && result && (
        <div className="space-y-4">
          {/* routes.length is 2 or 3 — this grid handles either without changes */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {result.routes.map((route) => {
              const info = riskInfo(route.safety_score, route.report_count < 2);
              const isRecommended = route.label === result.recommended_route;
              return (
                <div
                  key={route.label}
                  className={`rounded-lg border p-4 ${
                    isRecommended ? 'border-ink ring-1 ring-ink' : 'border-ink/15'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">{route.label}</span>
                    {isRecommended && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-ink text-paper">
                        Recommended
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-ink/70 mb-3">{route.duration_min} min</p>

                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: info.color }}
                    />
                    <span className="text-sm font-medium">{info.label}</span>
                    <span className="text-sm text-ink/50">({route.safety_score}/100)</span>
                  </div>

                  {route.report_count < 2 && (
                    <p className="text-xs text-unknown mb-2">Based on limited data</p>
                  )}

                  {route.top_issues.length > 0 && (
                    <ul className="text-xs text-ink/70 list-disc list-inside">
                      {route.top_issues.map((issue) => (
                        <li key={issue}>{issue}</li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>

          <div className="rounded-lg bg-ink/5 p-4 text-sm">
            <span className="font-medium">Why: </span>
            {result.explanation}
          </div>
        </div>
      )}
    </div>
  );
}
