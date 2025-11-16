"use client";
import { SignIn } from '@clerk/nextjs';
import { useContext, useState } from 'react';
import { ClerkConfigContext } from '../../../ClerkRootProvider';

export default function ClerkLoginCatchAll() {
  const { clerkConfigured } = useContext(ClerkConfigContext);
  const [tempKey, setTempKey] = useState('');
  return (
    <div className="mx-auto max-w-md space-y-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Clerk Login</h1>
        <p className="text-sm text-neutral-600">Authentication using Clerk.</p>
      </div>
      {clerkConfigured ? (
        <div className="flex justify-center">
          <SignIn routing="path" path="/clerk/login" afterSignInUrl="/entry" afterSignUpUrl="/entry" />
        </div>
      ) : (
        <div className="rounded border bg-white p-3 text-sm">
          <div className="mb-2">Status: <span className="font-semibold text-red-600">No or invalid publishable key</span></div>
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
      )}
    </div>
  );
}
