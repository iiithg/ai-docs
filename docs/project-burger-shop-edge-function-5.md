# project-burger-shop-edge-function-5 — Weather Edge Function

Path: `apps/project-burger-shop-edge-function-5`

Edge Function demo that proxies Open‑Meteo and returns current weather. The frontend calls `/functions/v1/weather?lat=..&lon=..` directly — no custom server required.

## Pages
- `/weather` — enter lat/lon and fetch via Edge Function

## Function
- Route: `/functions/v1/weather?lat=<lat>&lon=<lon>`
- Behavior: validate params → call Open‑Meteo → return only `current_weather` with CORS and cache headers

Example (Deno): `apps/project-burger-shop-edge-function-5/supabase/functions/weather/index.ts`
```ts
import { serve } from 'https://deno.land/std/http/server.ts'

serve(async (req) => {
  const url = new URL(req.url)
  const lat = url.searchParams.get('lat')
  const lon = url.searchParams.get('lon')
  if (!lat || !lon) return new Response(JSON.stringify({ error: 'missing lat/lon' }), { status: 400, headers: { 'content-type': 'application/json' } })

  const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`)
  const data = await r.json()
  return new Response(JSON.stringify({ current: data.current_weather }), {
    headers: {
      'content-type': 'application/json',
      'cache-control': 'public, max-age=300',
      'access-control-allow-origin': '*'
    }
  })
})
```

## Deploy with Supabase CLI
```bash
supabase functions deploy weather
supabase functions list
supabase functions serve weather --env-file supabase/.env   # local debug (optional)
```

## RPC vs Edge Function
- Use Postgres RPC for pure in‑DB logic with RLS.
- Use Edge Functions to call external APIs, handle secrets, multi‑step logic, or add caching.
