"use client";
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Settings from '../../components/Settings';
import { createBrowserClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [supabase, setSupabase] = useState<any>(null);
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const ready = useMemo(() => Boolean(supabase), [supabase]);

  useEffect(() => {
    const client = createBrowserClient();
    setSupabase(client);
    setSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL || '');
    setSupabaseKey(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');
    // Session listener
    if (client) {
      client.auth.getSession().then(({ data }) => setAccessToken(data.session?.access_token ?? null));
      const { data: sub } = client.auth.onAuthStateChange((_event, session) => {
        setAccessToken(session?.access_token ?? null);
      });
      return () => { sub.subscription.unsubscribe(); };
    }
  }, []);

  const handleSettingsChange = (url: string, key: string) => {
    // Recreate client with new settings by reloading page (keeps demo simple)
    if (typeof window !== 'undefined') {
      localStorage.setItem('supabase_url', url);
      localStorage.setItem('supabase_anon_key', key);
      window.location.reload();
    }
  };

  async function signInWith(provider: 'google' | 'github') {
    setErr(null);
    setMessage(null);
    if (!supabase) return;
    const redirectTo = `${window.location.origin}/auth/callback`;
    const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo } });
    if (error) setErr(error.message);
  }

  async function signOut() {
    setErr(null);
    setMessage(null);
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) setErr(error.message); else setMessage('Signed out');
  }

  async function callJwtEcho() {
    setErr(null); setMessage(null);
    if (!accessToken) { setErr('No access token'); return; }
    const res = await fetch('/api/jwt-echo', { headers: { Authorization: `Bearer ${accessToken}` } });
    const json = await res.json();
    if (!res.ok) { setErr(json.error || 'Request failed'); return; }
    setMessage(`Verified for sub=${json.sub}, exp=${json.exp}`);
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Advanced Login</h1>
        <p className="text-sm text-neutral-600">Google / GitHub OAuth + JWT protected API.</p>
      </div>

      {!ready && (
        <div className="rounded border bg-yellow-50 text-yellow-800 p-3 text-sm mb-4">Configure Supabase (⚙️ top right) or env vars.</div>
      )}

      {err && <div className="mb-3 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{err}</div>}
      {message && <div className="mb-3 rounded border border-green-200 bg-green-50 p-3 text-sm text-green-700">{message}</div>}

      <div className="rounded-lg border bg-white p-4 space-y-3">
        <button onClick={()=>signInWith('google')} className="w-full rounded bg-white border px-3 py-2 hover:bg-neutral-50 flex items-center justify-center gap-2">
          <span>🔐</span>
          <span>Sign in with Google</span>
        </button>
        <button onClick={()=>signInWith('github')} className="w-full rounded bg-neutral-900 text-white px-3 py-2 hover:bg-black flex items-center justify-center gap-2">
          <span>🐙</span>
          <span>Sign in with GitHub</span>
        </button>
        <button onClick={signOut} className="w-full rounded bg-burger-red text-white px-3 py-2">Sign out</button>
      </div>

      <div className="mt-4 rounded-lg border bg-white p-4 text-sm">
        <div className="font-semibold mb-2">Session</div>
        <div className="break-all text-neutral-700">{accessToken ? `Access Token: ${accessToken}` : 'Not signed in'}</div>
        <div className="mt-3 flex gap-2">
          <button onClick={callJwtEcho} className="rounded bg-blue-600 text-white px-3 py-2">Call /api/jwt-echo</button>
          <Link href="/protected" className="rounded bg-green-600 text-white px-3 py-2">Go to protected page →</Link>
        </div>
      </div>

      <div className="mt-6">
        <Settings onSettingsChange={handleSettingsChange} currentUrl={supabaseUrl} currentKey={supabaseKey} />
      </div>
    </div>
  );
}

