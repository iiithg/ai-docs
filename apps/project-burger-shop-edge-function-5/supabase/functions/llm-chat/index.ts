import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface ChatRequest {
  messages: ChatMessage[]
  model?: string
  temperature?: number
  max_tokens?: number
}

interface ChatResponse {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    message: ChatMessage
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { messages, model = 'gpt-3.5-turbo', temperature = 0.7, max_tokens = 1000 }: ChatRequest = await req.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid messages format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate messages structure
    const isValidMessages = messages.every(msg =>
      msg.role && ['system', 'user', 'assistant'].includes(msg.role) &&
      typeof msg.content === 'string'
    )

    if (!isValidMessages) {
      return new Response(
        JSON.stringify({ error: 'Invalid message structure' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get API key from environment variables
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client for logging
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Log the chat request
    const authHeader = req.headers.get('Authorization')
    let userId = null

    if (authHeader) {
      const { data: { user }, error } = await supabaseClient.auth.getUser(
        authHeader.replace('Bearer ', '')
      )
      if (!error && user) {
        userId = user.id
      }
    }

    // Make request to OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens,
      }),
    })

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text()
      console.error('OpenAI API error:', error)

      // Log failed request
      if (userId) {
        await supabaseClient
          .from('audit_logs')
          .insert({
            user_id: userId,
            action: 'llm_chat_failed',
            table_name: 'chat_requests',
            old_values: { error, model },
            new_values: { messages_count: messages.length },
          })
      }

      return new Response(
        JSON.stringify({ error: 'Failed to process chat request' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const chatResponse: ChatResponse = await openaiResponse.json()

    // Log successful request
    if (userId) {
      await supabaseClient
        .from('audit_logs')
        .insert({
          user_id: userId,
          action: 'llm_chat_success',
          table_name: 'chat_requests',
          new_values: {
            model,
            messages_count: messages.length,
            response_tokens: chatResponse.usage.total_tokens,
          },
        })
    }

    return new Response(
      JSON.stringify({
        id: chatResponse.id,
        message: chatResponse.choices[0].message,
        usage: chatResponse.usage,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      }
    )

  } catch (error) {
    console.error('Chat function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})