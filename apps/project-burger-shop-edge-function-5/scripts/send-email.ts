// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Access-Control-Max-Age': '86400',
};

interface Body {
  to: string | string[];
  subject?: string;
  content?: string;
  templateName?: 'welcome' | 'reset-password' | 'invite-code';
  templateData?: Record<string, unknown>;
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const templates = {
  welcome: (data: any) => ({ subject: `Welcome to ${data?.appName || 'Our App'}!`, html: `<h2>Welcome ${data?.fullName || 'there'}</h2>` }),
  'reset-password': (data: any) => ({ subject: 'Reset Your Password', html: `<p>Reset: ${data?.resetLink || '#'}</p>` }),
  'invite-code': (data: any) => ({ subject: 'Your Invite Code', html: `<p>Code: <strong>${data?.inviteCode || ''}</strong></p>` }),
} as const;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  try {
    const { to, subject, content, templateName, templateData }: Body = await req.json();
    if (!to) return new Response(JSON.stringify({ error: 'to is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const sb = createClient(SUPABASE_URL, SERVICE_ROLE);
    const recipients = Array.isArray(to) ? to : [to];

    let finalSubject = subject || '';
    let finalContent = content || '';
    if (templateName && templates[templateName]) {
      const t = templates[templateName](templateData || {});
      finalSubject = t.subject; finalContent = t.html;
    }

    await Promise.allSettled(
      recipients.map((email) => sb.from('email_queue').insert({
        to_email: email,
        subject: finalSubject,
        content: finalContent,
        template_name: templateName,
        template_data: templateData || {},
        status: 'pending'
      }))
    );

    return new Response(JSON.stringify({ success: true, queuedCount: recipients.length, recipients }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (err) {
    const msg = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
