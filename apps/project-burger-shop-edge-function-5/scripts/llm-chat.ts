// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { OpenAI } from "npm:openai@4.8.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Access-Control-Max-Age': '86400',
};

const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY') || ''
});

interface Body {
  prompt?: string;
  messages?: Array<{ role: 'system'|'user'|'assistant'; content: string }>;
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  try {
    const { prompt, messages, model = 'gpt-3.5-turbo', temperature = 0.7, max_tokens = 512 } = await req.json() as Body;

    const finalMessages = messages && messages.length ? messages : [
      { role: 'user', content: prompt || 'Hello' }
    ];

    const response = await openai.chat.completions.create({
      model,
      messages: finalMessages,
      temperature,
      max_tokens,
    });

    return new Response(JSON.stringify({
      text: response.choices?.[0]?.message?.content ?? '',
      id: response.id,
      usage: response.usage,
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Connection': 'keep-alive',
      }
    });
  } catch (err) {
    const msg = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
