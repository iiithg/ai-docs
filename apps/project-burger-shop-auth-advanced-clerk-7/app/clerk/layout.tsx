"use client";
import { useEffect, useState } from 'react';

export default function ClerkLayout({ children }: { children: React.ReactNode }) {
  const [publishableKey, setPublishableKey] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [tempKey, setTempKey] = useState('');

  useEffect(() => {
    let key: string | null = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || null;
    if (typeof window !== 'undefined') {
      const ls = localStorage.getItem('clerk_publishable_key');
      if (ls) key = ls;
    }
    setPublishableKey(key);
    setReady(true);
  }, []);

  if (!ready) return null;

  if (!publishableKey) {
    return (
      <div className="mx-auto max-w-md p-4">
        <h1 className="text-2xl font-bold mb-2">Clerk Not Configured</h1>
        <p className="text-sm text-neutral-600 mb-3">No publishable key found. You can add it here or via the Settings (⚙️) on the OAuth page. Env alternative: <code>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> in <code>.env.local</code>.</p>
        <div className="rounded border bg-white p-3 text-sm">
          <div className="mb-2">Status: <span className="font-semibold text-red-600">Missing publishable key</span></div>
          <label className="block text-sm font-medium text-gray-700 mb-1 mt-2">Clerk Publishable Key</label>
          <input
            value={tempKey}
            onChange={(e)=>setTempKey(e.target.value)}
            placeholder="pk_test_..."
            className="w-full px-3 py-2 border rounded mb-2"
          />
          <div className="flex gap-2">
            <button
              className="px-3 py-2 bg-neutral-900 text-white rounded disabled:opacity-50"
              disabled={!tempKey.trim()}
              onClick={()=>{ if (typeof window!== 'undefined'){ localStorage.setItem('clerk_publishable_key', tempKey.trim()); window.location.reload(); } }}
            >Save</button>
          </div>
        </div>
      </div>
    );
  }

  // Global ClerkRootProvider already wraps the app; avoid nesting providers here.
  return <>{children}</>;
}
