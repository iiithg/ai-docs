"use client";
import { useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

function ClerkSignOutButton({ setMsg }: { setMsg: (s: string | null) => void }) {
  const { signOut } = useClerk();
  const router = useRouter();
  async function onClick() {
    try {
      await signOut();
      router.push('/clerk/login');
    } catch (e: any) {
      setMsg(e?.message || 'Failed to sign out Clerk');
    }
  }
  return <button onClick={onClick} className="px-3 py-2 rounded border">Sign out Clerk</button>;
}

export default function SignOutRow() {
  const router = useRouter();
  const [msg, setMsg] = useState<string | null>(null);
  const [hasClerkProvider, setHasClerkProvider] = useState(false);

  useEffect(() => {
    let key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '';
    if (typeof window !== 'undefined') {
      const ls = localStorage.getItem('clerk_publishable_key');
      if (ls) key = ls;
    }
    setHasClerkProvider(Boolean(key));
  }, []);

  async function signOutSupabase() {
    try {
      const supabase = createBrowserClient();
      if (supabase) await supabase.auth.signOut();
      router.push('/clerk/login');
    } catch (e: any) {
      setMsg(e?.message || 'Failed to sign out Supabase');
    }
  }

  function clearLocalSettings() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('supabase_url');
      localStorage.removeItem('supabase_anon_key');
      localStorage.removeItem('clerk_publishable_key');
      setMsg('已清除本地设置。');
    }
  }

  return (
    <div className="mt-6 rounded border bg-white p-4 text-sm">
      <div className="font-semibold mb-2">Session & Settings</div>
      {msg && <div className="mb-2 rounded border border-yellow-200 bg-yellow-50 p-2 text-yellow-800">{msg}</div>}
      <div className="flex flex-wrap gap-2">
        {hasClerkProvider && <ClerkSignOutButton setMsg={setMsg} />}
        <button onClick={signOutSupabase} className="px-3 py-2 rounded border">Sign out Supabase</button>
        <button onClick={clearLocalSettings} className="px-3 py-2 rounded border">Clear Settings (⚙️)</button>
      </div>
    </div>
  );
}
