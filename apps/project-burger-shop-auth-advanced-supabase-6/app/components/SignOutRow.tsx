"use client";
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';

export default function SignOutRow() {
  const router = useRouter();
  const [msg, setMsg] = useState<string | null>(null);

  async function signOutSupabase() {
    try {
      const supabase = createBrowserClient();
      if (supabase) await supabase.auth.signOut();
      router.push('/auth/login');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e ?? '');
      setMsg(msg || 'Sign out failed');
    }
  }

  function clearLocalSettings() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('supabase_url');
      localStorage.removeItem('supabase_anon_key');
      setMsg('Local settings cleared.');
    }
  }

  return (
    <div className="mt-6 rounded border bg-white p-4 text-sm">
      <div className="font-semibold mb-2">Session & Settings</div>
      {msg && <div className="mb-2 rounded border border-yellow-200 bg-yellow-50 p-2 text-yellow-800">{msg}</div>}
      <div className="flex flex-wrap gap-2">
        <button onClick={signOutSupabase} className="px-3 py-2 rounded border">Sign out Supabase</button>
        <button onClick={clearLocalSettings} className="px-3 py-2 rounded border">Clear Settings (⚙️)</button>
      </div>
    </div>
  );
}
