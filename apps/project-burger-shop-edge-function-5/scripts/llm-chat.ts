// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { OpenAI } from "npm:openai@4.8.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Access-Control-Max-Age': '86400',
};

// 默认 OpenAI 客户端，使用环境变量配置
const createOpenAIClient = (baseURL?: string) => new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY') || '',
  baseURL: baseURL || Deno.env.get('OPENAI_API_BASE_URL') || undefined
});

interface Body {
  prompt?: string;
  messages?: Array<{ role: 'system'|'user'|'assistant'; content: string }>;
  model?: string;
  temperature?: number;
  max_tokens?: number;
  baseURL?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  try {
    const { prompt, messages, model = Deno.env.get('OPENAI_MODEL') || 'gpt-3.5-turbo', temperature = 0.7, max_tokens = 512, baseURL } = await req.json() as Body;

    const finalMessages = messages && messages.length ? messages : [
      { role: 'user', content: prompt || 'Hello' }
    ];

    // 创建动态 OpenAI 客户端，支持请求级别的 baseURL
    const client = createOpenAIClient(baseURL);

    const response = await client.chat.completions.create({
      model,
      messages: finalMessages,
      temperature,
      max_tokens,
    });

    // 根据 OPENAI_MODE 决定返回格式
    const mode = Deno.env.get('OPENAI_MODE') || 'default';
    let responseData: any = {
      text: response.choices?.[0]?.message?.content ?? '',
      id: response.id,
      usage: response.usage,
    };
    if (mode === 'verbose') {
      responseData = {
        ...responseData,
        object: response.object,
      };
    }

    return new Response(JSON.stringify(responseData), {
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
