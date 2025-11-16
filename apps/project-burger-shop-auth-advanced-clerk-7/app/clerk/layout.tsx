"use client";
import { useEffect, useState } from 'react';

export default function ClerkLayout({ children }: { children: React.ReactNode }) {
  const [publishableKey, setPublishableKey] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [tempKey, setTempKey] = useState('');
  const [valid, setValid] = useState(false);

  useEffect(() => {
    let key: string | null = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || null;
    if (typeof window !== 'undefined') {
      const ls = localStorage.getItem('clerk_publishable_key');
      if (ls) key = ls;
    }
    setPublishableKey(key);
    setValid(Boolean(key && /^pk_(test|live)_/.test(key)));
    setReady(true);
  }, []);

  if (!ready) return null;

  if (!publishableKey || !valid) {
    return (
      <div className="mx-auto max-w-md p-4">
        <h1 className="text-2xl font-bold mb-2">Clerk Not Configured</h1>
        <p className="text-sm text-neutral-600 mb-3">No or invalid publishable key. Add it here or via Settings (⚙️). Env alternative: <code>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> in <code>.env.local</code>.</p>
        <div className="rounded border bg-white p-3 text-sm">
          <div className="mb-2">Status: <span className="font-semibold text-red-600">{publishableKey ? 'Invalid publishable key' : 'Missing publishable key'}</span></div>
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
