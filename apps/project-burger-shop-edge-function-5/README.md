# project-burger-shop-edge-function-5 — Weather Edge Function

Edge Function demo that proxies Open‑Meteo and returns current weather. Frontend calls `/functions/v1/weather?lat=..&lon=..` directly, no custom server needed.

App path: `apps/project-burger-shop-edge-function-5`

## Run the App
```bash
cd apps/project-burger-shop-edge-function-5
npm install
npm run dev
```

Environment
- Optional (only for authenticated calls or other features):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Otherwise, the weather function works without auth.

Routes
- `/weather` — enter lat/lon and fetch via Edge Function

## Edge Function: `weather`

Source example included at `apps/project-burger-shop-edge-function-5/supabase/functions/weather/index.ts`:
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

Deploy via Supabase CLI
```bash
# from your project root (with supabase CLI installed)
supabase functions deploy weather
supabase functions list

# local serve (optional)
supabase functions serve weather --env-file supabase/.env
```

## RPC vs Edge Function
- Use Postgres RPC for pure in‑DB logic with RLS.
- Use Edge Functions to call external APIs, use secrets, do multi‑step logic, or add caching.

