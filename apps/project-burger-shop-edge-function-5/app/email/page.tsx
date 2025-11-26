"use client";
import { useState } from 'react';
import { fetchJsonVerbose, formatUnknownError } from '@/app/lib/fetcher';

// Helper to get the Supabase URL from localStorage or environment variables
function getBaseUrl() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('supabase_url') || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
}

// Helper to get the Supabase Anon Key from localStorage or environment variables
function getSupabaseAnonKey() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('supabase_anon_key') || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
}

type SendMode = 'template' | 'custom';

export default function EmailPage() {
  // Form state
  const [mode, setMode] = useState<SendMode>('template');
  const [to, setTo] = useState('dev@example.com');
  const [templateName, setTemplateName] = useState<'welcome' | 'reset-password' | 'invite-code'>('welcome');
  const [subject, setSubject] = useState('Hello from Burger Shop');
  const [html, setHtml] = useState('<p>This is a <strong>custom</strong> email.</p>');
  const [endpoint, setEndpoint] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function sendEmail() {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const baseUrl = getBaseUrl();
      const anonKey = getSupabaseAnonKey();
      const url = (endpoint.trim() || `${baseUrl}/functions/v1/send-email`);

      if (!baseUrl || !anonKey) {
        throw new Error('Supabase URL or Anon Key is not configured. Please use the ⚙️ settings panel.');
      }

      let body: any;

      if (mode === 'template' && templateName) {
        // 前端生成完整的模板内容
        let templateSubject = '';
        let templateHtml = '';
        
        if (templateName === 'welcome') {
          templateSubject = 'Welcome to The Burger Shop!';
          templateHtml = `<!DOCTYPE html>
<html>
  <head><meta charset="utf-8"><title>Welcome</title></head>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #d32f2f;">Welcome ${to.split('@')[0]}!</h2>
      <p>Thanks for signing up at The Burger Shop. We're excited to have you on board!</p>
      <p>Get ready for the best burgers in town! 🍔</p>
    </div>
  </body>
</html>`;
        } else if (templateName === 'reset-password') {
            templateSubject = 'Password Reset Request';
            templateHtml = `<!DOCTYPE html>
<html>
  <head><meta charset="utf-8"><title>Password Reset</title></head>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2>Password Reset</h2>
      <p>Hello,</p>
      <p>We received a request to reset your password. To proceed, please copy the verification code below and paste it into the password reset form:</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; font-family: monospace; font-size: 18px; letter-spacing: 2px;">
        <strong>ABC123XYZ</strong>
      </div>
      <p style="font-size: 14px; color: #666;">This code will expire in 1 hour for security reasons.</p>
      <p>If you didn't request this password reset, please ignore this email or contact our support team.</p>
      <p>Best regards,<br>The Burger Shop Team</p>
    </div>
  </body>
</html>`;
        } else if (templateName === 'invite-code') {
          templateSubject = 'You have an invite!';
          templateHtml = `<!DOCTYPE html>
<html>
  <head><meta charset="utf-8"><title>Invitation</title></head>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #d32f2f;">You're Invited! 🎉</h2>
      <p>You've received an invitation to join The Burger Shop family!</p>
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
        <h3 style="margin: 0 0 10px 0;">Your Invite Code:</h3>
        <div style="font-size: 24px; font-weight: bold; color: #d32f2f; font-family: monospace;">ABCD1234</div>
      </div>
      <p>Welcome to the team, ${to.split('@')[0]}!</p>
    </div>
  </body>
</html>`;
        }
        
        body = { 
          to, 
          subject: templateSubject, 
          html: templateHtml 
        };
      } else if (mode === 'custom') {
        body = { to, subject, html };
      } else {
        throw new Error('Invalid mode or missing template name');
      }

      const result = await fetchJsonVerbose(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${anonKey}`,
        },
        body: JSON.stringify(body),
        tag: 'send-email',
      });

      if (result.error) {
        throw new Error(result.error.message || 'An unknown error from Resend occurred.');
      }
      
      setSuccess(`Email sent successfully! (Resend ID: ${result.id})`);

    } catch (e: any) {
      setError(e?.message || formatUnknownError(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Email Service</h1>
        <p className="text-neutral-500">
          Directly sends emails via a Supabase Edge Function using Resend.
        </p>
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">🔑 Configuration Required</h3>
          <p className="text-sm text-blue-700 mb-2">
            To use this email service, you need to configure a Resend API key:
          </p>
          <ol className="text-sm text-blue-700 list-decimal list-inside space-y-1">
            <li>Sign up for a free account at <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-900">resend.com</a></li>
            <li>Generate an API key from your Resend dashboard</li>
            <li>Go to your Supabase project dashboard → Edge Functions → Settings</li>
            <li>Add environment variable: <code className="bg-blue-100 px-1 rounded">RESEND_API_KEY</code> with your API key</li>
          </ol>
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-lg shadow-sm p-6">
        <div className="space-y-6">
          {/* To Field */}
          <div>
            <label htmlFor="to-email" className="block text-sm font-medium text-neutral-700 mb-1">
              Recipient Email
            </label>
            <input
              id="to-email"
              type="email"
              className="w-full rounded-md border-neutral-300 shadow-sm focus:border-burger-red focus:ring-burger-red"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-4">
            <label className="block text-sm font-medium text-neutral-700">Send Mode</label>
            <div className="flex items-center gap-2">
              {(['template', 'custom'] as SendMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    mode === m
                      ? 'bg-burger-red text-white font-semibold'
                      : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                  }`}
                >
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Conditional Fields */}
          {mode === 'template' ? (
            <div>
              <label htmlFor="template-name" className="block text-sm font-medium text-neutral-700 mb-1">
                Template
              </label>
              <select
                id="template-name"
                className="w-full rounded-md border-neutral-300 shadow-sm focus:border-burger-red focus:ring-burger-red"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value as any)}
              >
                <option value="welcome">Welcome</option>
                <option value="reset-password">Reset Password</option>
                <option value="invite-code">Invite Code</option>
              </select>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-neutral-700 mb-1">
                  Subject
                </label>
                <input
                  id="subject"
                  type="text"
                  className="w-full rounded-md border-neutral-300 shadow-sm focus:border-burger-red focus:ring-burger-red"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="html-content" className="block text-sm font-medium text-neutral-700 mb-1">
                  HTML Content
                </label>
                <textarea
                  id="html-content"
                  rows={5}
                  className="w-full rounded-md border-neutral-300 shadow-sm focus:border-burger-red focus:ring-burger-red font-mono text-sm"
                  value={html}
                  onChange={(e) => setHtml(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Endpoint Override */}
          <div>
            <label htmlFor="endpoint" className="block text-sm font-medium text-neutral-700 mb-1">
              Endpoint URL <span className="text-neutral-500">(Optional)</span>
            </label>
            <input
              id="endpoint"
              type="text"
              className="w-full rounded-md border-neutral-300 shadow-sm focus:border-burger-red focus:ring-burger-red"
              placeholder="Default: /functions/v1/send-email"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
            />
          </div>

          {/* Action Button */}
          <div className="flex items-center justify-between">
            <button
              onClick={sendEmail}
              disabled={loading}
              className="px-5 py-2.5 bg-burger-red text-white font-bold rounded-lg shadow-md hover:bg-red-700 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Sending...' : 'Send Email'}
            </button>
            {loading && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-burger-red"></div>}
          </div>
        </div>
      </div>

      {/* Result Display */}
      <div>
        {error && <div className="text-sm text-red-700 bg-red-50 border border-red-200 p-3 rounded-md">{error}</div>}
        {success && <div className="text-sm text-green-700 bg-green-50 border border-green-200 p-3 rounded-md break-all">{success}</div>}
      </div>
    </div>
  );
}
