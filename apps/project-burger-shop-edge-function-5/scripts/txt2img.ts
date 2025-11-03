// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Access-Control-Max-Age': '86400',
};

interface Body {
  prompt: string;
  model?: string;
}

const API_URL = Deno.env.get('NANOBANANA_API_URL') || 'https://api.zyai.online/v1/chat/completions';
const API_KEY = Deno.env.get('NANOBANANA_API_KEY') || '';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const { prompt, model = 'gemini-2.5-flash-image' } = await req.json() as Body;
    if (!prompt) return new Response(JSON.stringify({ error: 'prompt is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const payload = {
      messages: [
        {
          role: 'user',
          content: [ { type: 'text', text: prompt } ]
        }
      ],
      model
    };

    const upstream = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const text = await upstream.text();
    const ct = upstream.headers.get('content-type') || '';

    if (!upstream.ok) {
      return new Response(JSON.stringify({ error: 'upstream_error', status: upstream.status, contentType: ct, body: text }), { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    let data: any = null; try { data = text ? JSON.parse(text) : null; } catch {}
    return new Response(JSON.stringify({ upstream: data ?? text }), { headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' } });
  } catch (err) {
    const msg = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
