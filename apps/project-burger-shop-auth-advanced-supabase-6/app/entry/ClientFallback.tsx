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
        const supabase = createBrowserClient();
        if (!supabase) {
          setError('Supabase not configured in browser');
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
        // try profiles first
        const { data: profile } = await supabase.from('profiles').select('name').eq('user_id', session.user.id).maybeSingle();
        const n = profile?.name || (session.user.user_metadata as any)?.name || session.user.email || null;
        setName(n);
      } catch (e: any) {
        setError(e?.message || 'Failed to resolve session');
      } finally {
        setLoading(false);
      }
    }
    run();
  }, []);

  if (loading) return <div className="rounded border bg-white p-4 text-sm">Loading...</div>;
  // If no Supabase session or not configured, render nothing
  if (error || !name) return null;
  return (
    <div className="rounded border bg-white p-4">
      <div className="font-semibold">恭喜你加入, 你的名字是 {name}</div>
      {userId && <div className="text-sm text-neutral-600 mt-1">id: {userId}</div>}
      {email && <div className="text-sm text-neutral-600">email: {email}</div>}
    </div>
  );
}
