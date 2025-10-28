"use client";
import { useEffect, useState } from 'react';
import {
  createDynamicSupabaseClient,
  createSupabaseClientFromSettings,
  getStoredSupabaseSettings,
  saveSupabaseSettings
} from '@/lib/supabase/dynamic-client';
import Settings from '../../components/Settings';
import Link from 'next/link';

export default function RegisterPage() {
  const [supabaseClient, setSupabaseClient] = useState<any>(null);
  const [supabaseSettings, setSupabaseSettings] = useState({ url: '', key: '' });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

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

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabaseClient) return;
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const { error: err } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName || null, birthday: birthday || null, avatar_url: avatarUrl || null }
        }
      });
      if (err) throw err;
      setMessage('Registered successfully. Check your email to verify, then sign in.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Operation failed');
    } finally {
      setLoading(false);
    }
  }

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
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Sign Up</h1>
        <p className="text-sm text-neutral-600">Create an account with email and password.</p>
      </div>

      {error && <div className="mb-3 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {message && <div className="mb-3 rounded border border-green-200 bg-green-50 p-3 text-sm text-green-700">{message}</div>}

      <form onSubmit={onSubmit} className="rounded-lg border bg-white p-4 space-y-3">
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} type="email" required className="w-full rounded border px-3 py-2" placeholder="you@example.com" />
        </div>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <input value={password} onChange={e=>setPassword(e.target.value)} type="password" required className="w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm mb-1">Full Name (optional)</label>
          <input value={fullName} onChange={e=>setFullName(e.target.value)} type="text" className="w-full rounded border px-3 py-2" placeholder="John Doe" />
        </div>
        <div>
          <label className="block text-sm mb-1">Birthday (optional)</label>
          <input value={birthday} onChange={e=>setBirthday(e.target.value)} type="date" className="w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm mb-1">Avatar URL (optional)</label>
          <input value={avatarUrl} onChange={e=>setAvatarUrl(e.target.value)} type="url" className="w-full rounded border px-3 py-2" placeholder="https://..." />
        </div>
        <button disabled={loading} className="w-full rounded bg-burger-red px-3 py-2 text-white disabled:opacity-50">
          {loading ? 'Processing...' : 'Sign Up'}
        </button>
      </form>

      <div className="mt-3 text-sm text-neutral-600">
        Already have an account? <Link href="/auth/login" className="text-burger-red">Sign in</Link>
        <span className="mx-2">·</span>
        <Link href="/" className="hover:underline">Back to Home</Link>
      </div>

      <div className="mt-6">
        <Settings onSettingsChange={handleSettingsChange} currentUrl={supabaseSettings.url} currentKey={supabaseSettings.key} />
      </div>
    </div>
  );
}

