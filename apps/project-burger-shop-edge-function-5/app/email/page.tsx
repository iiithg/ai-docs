"use client";
import { useState } from 'react';
import { fetchJsonVerbose, formatUnknownError } from '@/app/lib/fetcher';

function getBaseUrl() {
  if (typeof window === 'undefined') return '';
  return (
    localStorage.getItem('supabase_url') ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    ''
  );
}

export default function EmailPage() {
  const [to, setTo] = useState('dev@example.com');
  const [templateName, setTemplateName] = useState<'welcome' | 'reset-password' | 'invite-code' | ''>('welcome');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState(false);
  const [endpoint, setEndpoint] = useState('');

  async function sendEmail() {
    setLoading(true); setError(''); setOk(false);
    try {
      const base = getBaseUrl();
      const url = (endpoint && endpoint.trim().length > 0)
        ? endpoint.trim()
        : ((base ? `${base}` : '') + '/functions/v1/send-email');
      const body: any = { to, priority: 'normal' };
      if (templateName) {
        body.templateName = templateName;
        body.templateData = templateName === 'reset-password'
          ? { resetLink: 'https://example.com/reset' }
          : templateName === 'invite-code'
          ? { inviteCode: 'ABCD1234', fullName: to.split('@')[0] }
          : { fullName: to.split('@')[0], email: to };
      } else {
        body.subject = subject || 'Hello from Burger Shop Demo';
        body.content = content || 'Plain text body (no template).';
      }
      const data = await fetchJsonVerbose(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        tag: 'send-email'
      });
      // Show a compact success notice instead of raw JSON
      setOk(true);
    } catch (e: any) {
      setError(e?.message || formatUnknownError(e));
    } finally { setLoading(false); }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Email Service (Edge Function)</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm">To</label>
          <input className="w-full rounded border px-3 py-2" value={to} onChange={e=>setTo(e.target.value)} />
          <label className="block text-sm">Template</label>
          <select className="w-full rounded border px-3 py-2" value={templateName} onChange={(e)=>setTemplateName(e.target.value as any)}>
            <option value="welcome">welcome</option>
            <option value="reset-password">reset-password</option>
            <option value="invite-code">invite-code</option>
            <option value="">(no template)</option>
          </select>
          {!templateName && (
            <>
              <label className="block text-sm">Subject</label>
              <input className="w-full rounded border px-3 py-2" value={subject} onChange={e=>setSubject(e.target.value)} />
              <label className="block text-sm">Content</label>
              <textarea className="w-full rounded border px-3 py-2 h-24" value={content} onChange={e=>setContent(e.target.value)} />
            </>
          )}
          <label className="block text-sm">Endpoint URL (可选，覆盖默认)</label>
          <input className="w-full rounded border px-3 py-2" placeholder="https://<project>.supabase.co/functions/v1/send-email" value={endpoint} onChange={e=>setEndpoint(e.target.value)} />
          <button onClick={sendEmail} disabled={loading} className="px-4 py-2 bg-burger-red text-white rounded disabled:bg-neutral-300">
            {loading ? 'Sending...' : 'Queue Email'}
          </button>
        </div>
        <div>
          {error && <div className="text-sm text-red-700 bg-red-50 border border-red-200 p-3 rounded mb-2">{error}</div>}
          {ok && <div className="text-sm text-green-700 bg-green-50 border border-green-200 p-3 rounded">Email queued successfully.</div>}
        </div>
      </div>
      <div className="text-xs text-neutral-500">Calls <code>/functions/v1/send-email</code>. Function queues emails into `email_queue` table.</div>
    </div>
  );
}
