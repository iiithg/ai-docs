"use client";
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  createDynamicSupabaseClient,
  createSupabaseClientFromSettings,
  getStoredSupabaseSettings,
  saveSupabaseSettings
} from '@/lib/supabase/dynamic-client';
import { createDatabaseServices } from '@/lib/database';
import Settings from '../components/Settings';
import { formatPrice, type MenuItem } from '@/lib/types';

type Profile = {
  id: string;
  full_name: string | null;
  birthday: string | null; // ISO date
  avatar_url: string | null;
  wallet_cents: number;
};

export default function ShopPage() {
  const [supabaseSettings, setSupabaseSettings] = useState({ url: '', key: '' });
  const [supabaseClient, setSupabaseClient] = useState<any>(null);
  const services = useMemo(() => (supabaseClient ? createDatabaseServices(supabaseClient) : null), [supabaseClient]);

  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const stored = getStoredSupabaseSettings();
    setSupabaseSettings(stored);
    const client = createSupabaseClientFromSettings();
    setSupabaseClient(client);
  }, []);

  useEffect(() => {
    if (!supabaseClient) return;
    supabaseClient.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
    const { data: sub } = supabaseClient.auth.onAuthStateChange((_evt: any, session: any) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => sub?.subscription?.unsubscribe();
  }, [supabaseClient]);

  useEffect(() => {
    if (!services) return;
    (async () => {
      try {
        setLoading(true);
        const items = await services.menuItems.getAvailable();
        setMenu(items);
        if (userId) {
          const p = await services.profiles.getMyProfile();
          setProfile(p);
        } else {
          setProfile(null);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    })();
  }, [services, userId]);

  const handleSettingsChange = (url: string, key: string) => {
    setSupabaseSettings({ url, key });
    saveSupabaseSettings(url, key);
    const newClient = createDynamicSupabaseClient(url, key);
    setSupabaseClient(newClient);
  };

  async function buy(item: MenuItem) {
    if (!services) return;
    try {
      setError(null);
      setMessage(null);
      const res = await services.orders.buyBurger(item.id);
      setProfile((p) => (p ? { ...p, wallet_cents: res.new_wallet_cents } : p));
      setMessage(`Purchased: ${item.name} — Paid ${formatPrice(item.price_cents)}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Purchase failed');
    }
  }

  if (!supabaseClient) {
    return (
      <div className="min-h-[70vh] grid place-items-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow p-6">
          <h1 className="text-xl font-bold text-red-600 mb-3">Supabase configuration missing</h1>
          <p className="text-sm text-neutral-600 mb-3">Click the top-right ⚙️ to set URL and Key, or configure .env.local.</p>
          <Settings onSettingsChange={handleSettingsChange} currentUrl={supabaseSettings.url} currentKey={supabaseSettings.key} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">🍔 Burger Shop</h1>
          <p className="text-sm text-neutral-600">Sign in to purchase. Email/password via Supabase is supported.</p>
        </div>
        <Settings onSettingsChange={handleSettingsChange} currentUrl={supabaseSettings.url} currentKey={supabaseSettings.key} />
      </div>

      {!userId ? (
        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Not signed in</div>
              <div className="text-sm text-neutral-600">Please sign in or create an account to purchase.</div>
            </div>
            <Link href="/auth" className="rounded bg-burger-red px-3 py-2 text-white text-sm hover:opacity-90">Go to Sign In / Sign Up</Link>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center gap-4">
            <div className="text-3xl">{profile?.avatar_url ? '👤' : '🧑‍🍳'}</div>
            <div>
              <div className="font-semibold">{profile?.full_name || 'User'}</div>
              <div className="text-sm text-neutral-600">Balance: {formatPrice(profile?.wallet_cents ?? 0)}{profile?.birthday ? ` · Birthday: ${new Date(profile.birthday).toLocaleDateString('en-US')}` : ''}</div>
            </div>
            <button
              className="ml-auto rounded border px-3 py-1 text-sm"
              onClick={async () => {
                await supabaseClient.auth.signOut();
                setMessage('Signed out');
              }}
            >Sign out</button>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}
      {message && (
        <div className="rounded border border-green-200 bg-green-50 p-3 text-sm text-green-700">{message}</div>
      )}

      <section className="rounded-lg border bg-white">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="font-semibold">Available Items</div>
          <button className="text-sm rounded border px-2 py-1" onClick={async ()=>{
            try {
              setLoading(true);
              setError(null);
              const items = await services!.menuItems.getAvailable();
              setMenu(items);
              if (userId) setProfile(await services!.profiles.getMyProfile());
            } catch (e) {
              setError(e instanceof Error? e.message:'Refresh failed');
            } finally { setLoading(false); }
          }}>{loading? 'Refreshing...':'Refresh'}</button>
        </div>
        <ul className="divide-y">
          {menu.map((m)=> (
            <li key={m.id} className="px-4 py-3 grid grid-cols-1 md:grid-cols-5 items-center gap-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{m.emoji || '🍔'}</span>
                <div>
                  <div className="font-medium">{m.name}</div>
                  {m.description && <div className="text-xs text-neutral-500">{m.description}</div>}
                </div>
              </div>
              <div className="text-sm text-neutral-600">{m.category}</div>
              <div className="font-semibold">{formatPrice(m.price_cents)}</div>
              <div className="text-xs text-neutral-500">{new Date(m.created_at).toLocaleDateString('en-US')} · Qty: {m.quantity}</div>
              <div className="flex justify-end">
                <button
                  disabled={!userId || !m.available}
                  onClick={() => buy(m)}
                  className="rounded bg-burger-red px-3 py-2 text-white text-sm disabled:opacity-50"
                >
                  {userId ? 'Buy' : 'Sign in first'}
                </button>
              </div>
            </li>
          ))}
          {menu.length === 0 && (
            <li className="px-4 py-6 text-center text-sm text-neutral-500">No items yet. Please add some in the CRUD app.</li>
          )}
        </ul>
      </section>
    </div>
  );
}
