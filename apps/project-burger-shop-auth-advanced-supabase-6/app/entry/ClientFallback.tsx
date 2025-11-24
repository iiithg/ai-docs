"use client";
import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';

export default function EntryClientFallback() {
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function run() {
      try {
        const urlLS = typeof window !== 'undefined' ? (localStorage.getItem('supabase_url') || '') : '';
        const keyLS = typeof window !== 'undefined' ? (localStorage.getItem('supabase_anon_key') || '') : '';
        const urlEnv = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const keyEnv = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
        const effectiveUrl = urlLS || urlEnv;
        const effectiveKey = keyLS || keyEnv;
        if (!effectiveUrl || !effectiveKey) {
          setError('Supabase configuration missing or invalid. Use ⚙️ Settings or check .env');
          setLoading(false);
          return;
        }
        const health = await fetch(`${effectiveUrl}/auth/v1/settings`, { headers: { apikey: effectiveKey } });
        if (!health.ok) {
          setError('Supabase configuration looks invalid. Verify Project URL and anon key');
          setLoading(false);
          return;
        }
        const supabase = createBrowserClient();
        if (!supabase) {
          setError('Supabase configuration missing or invalid. Use ⚙️ Settings or check .env');
          setLoading(false);
          return;
        }
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setError('Not signed in');
          setLoading(false);
          return;
        }
        setUserId(session.user.id);
        setEmail(session.user.email ?? null);
        const { data: profile } = await supabase.from('profiles').select('name').eq('id', session.user.id).maybeSingle();
        const meta = session.user.user_metadata as { name?: string } | null;
        const n = profile?.name || meta?.name || session.user.email || null;
        setName(n);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e ?? '');
        setError(msg || 'Failed to resolve session. Check Supabase config or login state');
      } finally {
        setLoading(false);
      }
    }
    run();
  }, []);

  if (loading) {
    return <div className="rounded border bg-white p-4 text-sm">Loading...</div>;
  }

  return (
    <>
      {name && (
        <div className="rounded border bg-white p-4">
          <div className="font-semibold">Welcome, your name is {name}</div>
          {userId && <div className="text-sm text-neutral-600 mt-1">id: {userId}</div>}
          {email && <div className="text-sm text-neutral-600">email: {email}</div>}
        </div>
      )}
      
      {!name && !error && (
        <div className="rounded border bg-yellow-50 p-4">
          <div className="text-sm text-yellow-800">
            Loading user info...
          </div>
        </div>
      )}
      
      {error && (
        <div className="rounded border bg-red-50 p-4">
          <div className="text-sm text-red-800">
            {error === 'Not signed in' ? 'Please sign in to view user info' : error}
          </div>
        </div>
      )}
    </>
  );
}
