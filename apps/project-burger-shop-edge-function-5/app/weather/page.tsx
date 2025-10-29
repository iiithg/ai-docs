"use client";
import { useState } from 'react';

type Weather = { temperature: number; windspeed: number; winddirection: number; weathercode: number; time: string } | null;

export default function WeatherPage() {
  const [lat, setLat] = useState('37.7749');
  const [lon, setLon] = useState('-122.4194');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [current, setCurrent] = useState<Weather>(null);

  async function fetchWeather() {
    setLoading(true); setError(''); setCurrent(null);
    try {
      const res = await fetch(`/functions/v1/weather?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Request failed');
      setCurrent(data?.current || null);
    } catch (e: any) {
      setError(e?.message || 'Failed to fetch');
    } finally { setLoading(false); }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Weather via Edge Function</h1>
      <div className="grid grid-cols-2 gap-3 max-w-md">
        <div>
          <label className="block text-sm mb-1">Latitude</label>
          <input value={lat} onChange={e=>setLat(e.target.value)} className="w-full rounded border px-3 py-2" placeholder="e.g. 37.7749" />
        </div>
        <div>
          <label className="block text-sm mb-1">Longitude</label>
          <input value={lon} onChange={e=>setLon(e.target.value)} className="w-full rounded border px-3 py-2" placeholder="e.g. -122.4194" />
        </div>
      </div>
      <button onClick={fetchWeather} disabled={loading} className="px-4 py-2 bg-burger-red text-white rounded disabled:bg-neutral-300">
        {loading ? 'Loading...' : 'Fetch weather'}
      </button>
      {error && <div className="text-sm text-red-700 bg-red-50 border border-red-200 p-3 rounded">{error}</div>}
      {current && (
        <div className="p-4 rounded border bg-white max-w-md">
          <div className="font-medium">Current</div>
          <div className="text-sm text-neutral-700">Temp: {current.temperature} °C</div>
          <div className="text-sm text-neutral-700">Wind: {current.windspeed} km/h • Dir {current.winddirection}°</div>
          <div className="text-xs text-neutral-500">At: {current.time}</div>
        </div>
      )}
      <div className="text-xs text-neutral-500">Calls <code>/functions/v1/weather</code> which proxies Open‑Meteo and returns <code>current_weather</code>.</div>
    </div>
  );
}

