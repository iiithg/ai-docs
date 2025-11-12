"use client";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SignOutRow() {
  const router = useRouter();
  const [hasClerkProvider, setHasClerkProvider] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    let key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '';
    if (typeof window !== 'undefined') {
      const ls = localStorage.getItem('clerk_publishable_key');
      if (ls) key = ls;
    }
    setHasClerkProvider(Boolean(key));
  }, []);

  async function onClick() {
    try {
      // Check if Clerk is available in window
      if (typeof window !== 'undefined' && (window as any).Clerk) {
        await (window as any).Clerk.signOut();
        router.push('/clerk/login');
      } else {
        setMsg('Clerk is not loaded');
      }
    } catch (e: any) {
      setMsg(e?.message || 'Sign out failed');
    }
  }

  // If no Clerk provider, show no content
  if (!hasClerkProvider) {
    return null;
  }

  // With Clerk provider, show full settings interface
  return (
    <div className="mt-6 rounded border bg-white p-4 text-sm">
      <div className="font-semibold text-sm text-neutral-800 mb-3">Session & Settings</div>
      {msg && <div className="mb-2 rounded border border-yellow-200 bg-yellow-50 p-2 text-yellow-800">{msg}</div>}
      <div className="flex gap-2">
        <button onClick={onClick} className="px-3 py-2 rounded border">Sign Out</button>
      </div>
    </div>
  );
}
