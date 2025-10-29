import { serve } from 'https://deno.land/std/http/server.ts'

serve(async (req) => {
  const url = new URL(req.url)
  const lat = url.searchParams.get('lat')
  const lon = url.searchParams.get('lon')
  if (!lat || !lon) return new Response(JSON.stringify({ error: 'missing lat/lon' }), { status: 400, headers: { 'content-type': 'application/json' } })

  try {
    const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`)
    const data = await r.json()
    return new Response(JSON.stringify({ current: data.current_weather }), {
      headers: {
        'content-type': 'application/json',
        'cache-control': 'public, max-age=300',
        'access-control-allow-origin': '*'
      }
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: 'upstream failed' }), { status: 502, headers: { 'content-type': 'application/json' } })
  }
})

