import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

// CORS headers for preflight requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Resend API call helper
async function callResend(to: string, subject: string, html: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'onboarding@resend.dev', // NOTE: This must be a verified domain in Resend
      to,
      subject,
      html,
    }),
  });

  if (!res.ok) {
    // Handle HTTP errors (e.g., 400, 401, 500)
    const errorData = await res.json().catch(() => ({ message: 'Network response was not ok' }));
    return { error: { message: errorData.message || `HTTP error! status: ${res.status}` } };
  }

  return await res.json();
}

Deno.serve(async (req: Request) => {
  console.log(`[DEBUG] === New request received ===`);
  console.log(`[DEBUG] Method: ${req.method}`);
  console.log(`[DEBUG] URL: ${req.url}`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log(`[DEBUG] Request body:`, JSON.stringify(body, null, 2));
    const { to, subject, html } = body;

    if (!to) {
      return new Response(JSON.stringify({ error: '"to" field is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!subject) {
      return new Response(JSON.stringify({ error: '"subject" field is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!html) {
      return new Response(JSON.stringify({ error: '"html" field is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[DEBUG] About to send email to: ${to}`);
    console.log(`[DEBUG] Subject: ${subject}`);
    console.log(`[DEBUG] HTML preview: ${html.substring(0, 200)}...`);

    // Send the email
    const resendResponse = await callResend(to, subject, html);
    console.log(`[DEBUG] Resend API response:`, JSON.stringify(resendResponse, null, 2));

    // Check if Resend API returned an error
    if (!resendResponse || resendResponse.error) {
      const errorMessage = resendResponse?.error?.message || 'Resend API call failed';
      console.log(`[DEBUG] Resend API error: ${errorMessage}`);
      return new Response(JSON.stringify({ error: errorMessage }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[DEBUG] Email sent successfully! ID: ${resendResponse.id}`);

    // Return success response with Resend data
    return new Response(JSON.stringify(resendResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
