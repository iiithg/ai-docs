"use client";
import { useEffect, useMemo, useState } from 'react';
import {
  createDynamicSupabaseClient,
  createSupabaseClientFromSettings,
  getStoredSupabaseSettings,
  saveSupabaseSettings
} from '@/lib/supabase/dynamic-client';
import Settings from '../components/Settings';
import Link from 'next/link';

export default function AuthPage() {
  const [supabaseClient, setSupabaseClient] = useState<any>(null);
  const [supabaseSettings, setSupabaseSettings] = useState({ url: '', key: '' });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = getStoredSupabaseSettings();
    setSupabaseSettings(stored);
    setSupabaseClient(createSupabaseClientFromSettings());
  }, []);

  const handleSettingsChange = (url: string, key: string) => {
    setSupabaseSettings({ url, key });
    saveSupabaseSettings(url, key);
    setSupabaseClient(createDynamicSupabaseClient(url, key));
  };

  if (!supabaseClient) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow p-6">
          <h1 className="text-lg font-semibold mb-2">Configure Supabase</h1>
          <p className="text-sm text-neutral-600 mb-3">Click the top-right ⚙️ to set URL and Key.</p>
          <Settings onSettingsChange={handleSettingsChange} currentUrl={supabaseSettings.url} currentKey={supabaseSettings.key} />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      {error && <div className="mb-3 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="rounded-lg border bg-white p-6 space-y-3">
        <h1 className="text-xl font-semibold">Authentication</h1>
        <p className="text-sm text-neutral-600">Choose an action to continue.</p>
        <div className="flex gap-3">
          <Link href="/auth/login" className="flex-1 text-center rounded bg-burger-red px-3 py-2 text-white hover:opacity-90">Sign In</Link>
          <Link href="/auth/register" className="flex-1 text-center rounded border px-3 py-2">Sign Up</Link>
        </div>
        <div className="text-xs text-neutral-500">You can configure Supabase via the top-right ⚙️.</div>
      </div>

      <div className="mt-3 text-sm text-neutral-600">
        <Link href="/" className="hover:underline">Back to Home</Link>
      </div>

      <div className="mt-6">
        <Settings onSettingsChange={handleSettingsChange} currentUrl={supabaseSettings.url} currentKey={supabaseSettings.key} />
      </div>
    </div>
  );
}
