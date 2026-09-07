import { useState } from 'react';
import { submitReport } from '../api/client.js';

const TRAVEL_TIMES = ['day', 'evening', 'night', 'unspecified'];
const TRANSPORT_METHODS = ['walking', 'rickshaw', 'bike', 'car', 'public transport', 'other'];

const initialForm = {
  city: '',
  location_text: '',
  travel_time: 'unspecified',
  transport_method: 'walking',
  safety_rating: 3,
  description: '',
};

export default function Survey() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [errorMsg, setErrorMsg] = useState('');

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');
    try {
      await submitReport(form);
      setStatus('success');
      setForm(initialForm);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message);
    }
  }

  if (status === 'success') {
    return (
      <div className="max-w-md mx-auto mt-16 text-center px-4">
        <h1 className="text-xl font-semibold mb-2">Thanks — your report was submitted.</h1>
        <p className="text-ink/70 mb-6">
          It's anonymous, and it's already helping build safer route recommendations.
        </p>
        <button
          className="px-4 py-2 rounded-md bg-ink text-paper text-sm font-medium"
          onClick={() => setStatus('idle')}
        >
          Submit another report
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 px-4">
      <h1 className="text-xl font-semibold mb-1">Share a safety report</h1>
      <p className="text-ink/70 text-sm mb-6">
        Fully anonymous. No login required.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">City</label>
          <input
            required
            className="w-full border border-ink/20 rounded-md px-3 py-2"
            value={form.city}
            onChange={(e) => update('city', e.target.value)}
            placeholder="Karachi"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Location / route</label>
          <input
            required
            className="w-full border border-ink/20 rounded-md px-3 py-2"
            value={form.location_text}
            onChange={(e) => update('location_text', e.target.value)}
            placeholder="Road near university"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Time of travel</label>
            <select
              className="w-full border border-ink/20 rounded-md px-3 py-2"
              value={form.travel_time}
              onChange={(e) => update('travel_time', e.target.value)}
            >
              {TRAVEL_TIMES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Transport</label>
            <select
              className="w-full border border-ink/20 rounded-md px-3 py-2"
              value={form.transport_method}
              onChange={(e) => update('transport_method', e.target.value)}
            >
              {TRANSPORT_METHODS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Safety rating: {form.safety_rating} / 5
          </label>
          <input
            type="range"
            min="1"
            max="5"
            value={form.safety_rating}
            onChange={(e) => update('safety_rating', Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">What happened?</label>
          <textarea
            required
            rows={4}
            className="w-full border border-ink/20 rounded-md px-3 py-2"
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            placeholder="Road near university has no lights and becomes empty after 9 PM."
          />
        </div>

        {status === 'error' && (
          <p className="text-risk text-sm">{errorMsg}</p>
        )}

        <button
          type="submit"
          disabled={status === 'submitting'}
          className="w-full py-2 rounded-md bg-ink text-paper text-sm font-medium disabled:opacity-50"
        >
          {status === 'submitting' ? 'Submitting…' : 'Submit report'}
        </button>
      </form>
    </div>
  );
}
