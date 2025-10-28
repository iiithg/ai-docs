"use client";
import { useEffect, useMemo, useState } from 'react';
import {
  createDynamicSupabaseClient,
  createSupabaseClientFromSettings,
  getStoredSupabaseSettings,
  saveSupabaseSettings
} from '@/lib/supabase/dynamic-client';
import { createDatabaseServices } from '@/lib/database';
import type { MenuItem } from '@/lib/types';
import { formatPrice, parsePrice } from '@/lib/types';
import Settings from '../components/Settings';

type Profile = { id: string; role: 'user' | 'admin' };

const CATEGORIES: { value: 'burger' | 'side' | 'drink'; label: string; icon: string }[] = [
  { value: 'burger', label: 'Burger', icon: '🍔' },
  { value: 'side', label: 'Side', icon: '🍟' },
  { value: 'drink', label: 'Drink', icon: '🥤' },
];

export default function AdminPage() {
  const [supabaseSettings, setSupabaseSettings] = useState({ url: '', key: '' });
  const [supabaseClient, setSupabaseClient] = useState<any>(null);
  const services = useMemo(() => (supabaseClient ? createDatabaseServices(supabaseClient) : null), [supabaseClient]);

  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // CRUD state
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuForm, setMenuForm] = useState({ name: '', description: '', category: 'burger' as const, price: '8.99', quantity: 10, emoji: '🍔' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', description: '', category: 'burger' as const, price: '0.00', quantity: 0, emoji: '🍔' });

  useEffect(() => {
    const stored = getStoredSupabaseSettings();
    setSupabaseSettings(stored);
    const client = createSupabaseClientFromSettings();
    setSupabaseClient(client);
  }, []);

  // auth + profile
  useEffect(() => {
    if (!supabaseClient) return;
    supabaseClient.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
    const { data: sub } = supabaseClient.auth.onAuthStateChange((_evt: any, session: any) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => sub?.subscription?.unsubscribe();
  }, [supabaseClient]);

  // load admin profile + items
  useEffect(() => {
    if (!services) return;
    (async () => {
      try {
        setLoading(true);
        if (userId) {
          const p = await services.profiles.getMyProfile();
          setProfile({ id: p.id, role: (p as any).role ?? 'user' });
        } else {
          setProfile(null);
        }
        const items = await services.menuItems.getAll();
        setMenuItems(items);
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
    setSupabaseClient(createDynamicSupabaseClient(url, key));
  };

  // CRUD handlers
  async function createItem(e: React.FormEvent) {
    e.preventDefault();
    if (!services) return;
    const price_cents = parsePrice(menuForm.price);
    await services.menuItems.create({
      name: menuForm.name.trim(),
      description: menuForm.description.trim() || undefined,
      category: menuForm.category,
      price_cents,
      quantity: Number.isFinite(menuForm.quantity as any) ? Number(menuForm.quantity) : 0,
      emoji: menuForm.emoji
    });
    setMenuForm({ name: '', description: '', category: 'burger', price: '8.99', quantity: 10, emoji: '🍔' });
    setMenuItems(await services.menuItems.getAll());
  }

  function startEdit(item: MenuItem) {
    setEditingId(item.id);
    setEditForm({
      name: item.name,
      description: item.description || '',
      category: item.category,
      price: (item.price_cents / 100).toFixed(2),
      quantity: item.quantity,
      emoji: item.emoji || '🍔'
    });
  }

  async function saveItem() {
    if (!services || !editingId) return;
    const price_cents = parsePrice(editForm.price);
    await services.menuItems.update(editingId, {
      name: editForm.name.trim(),
      description: editForm.description.trim() || undefined,
      category: editForm.category,
      price_cents,
      quantity: Number.isFinite(editForm.quantity as any) ? Number(editForm.quantity) : undefined,
      emoji: editForm.emoji
    });
    setEditingId(null);
    setMenuItems(await services.menuItems.getAll());
  }

  async function toggleAvail(id: string) {
    if (!services) return;
    await services.menuItems.toggleAvailability(id);
    setMenuItems(await services.menuItems.getAll());
  }

  async function removeItem(id: string) {
    if (!services) return;
    if (!confirm('Delete this menu item?')) return;
    await services.menuItems.delete(id);
    setMenuItems(await services.menuItems.getAll());
  }

  // Guards
  if (!supabaseClient) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow p-6">
          <h1 className="text-lg font-semibold mb-2">Supabase configuration missing</h1>
          <p className="text-sm text-neutral-600 mb-3">Click the top-right ⚙️ to set URL and Key.</p>
          <Settings onSettingsChange={handleSettingsChange} currentUrl={supabaseSettings.url} currentKey={supabaseSettings.key} />
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="rounded border bg-white p-6">Please sign in to access the admin area.</div>
    );
  }

  if (profile && profile.role !== 'admin') {
    return (
      <div className="rounded border border-red-200 bg-red-50 p-6">
        <div className="font-semibold text-red-700 mb-2">Insufficient permissions</div>
        <div className="text-sm text-red-700">Only super admins can access the admin area. Contact your administrator if needed.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">🍔 Admin</h1>
          <p className="text-sm text-neutral-600">Admin only: manage menu items and availability</p>
        </div>
        <Settings onSettingsChange={handleSettingsChange} currentUrl={supabaseSettings.url} currentKey={supabaseSettings.key} />
      </div>

      {/* Create form */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Add New Item</h2>
        <form onSubmit={createItem} className="grid grid-cols-1 md:grid-cols-7 gap-4">
          <input className="px-3 py-2 border rounded-md" placeholder="Name" value={menuForm.name} onChange={e=>setMenuForm({...menuForm, name:e.target.value})} required/>
          <input className="px-3 py-2 border rounded-md" placeholder="Description (optional)" value={menuForm.description} onChange={e=>setMenuForm({...menuForm, description:e.target.value})}/>
          <select className="px-3 py-2 border rounded-md" value={menuForm.category} onChange={e=>setMenuForm({...menuForm, category:e.target.value as any})}>
            {CATEGORIES.map(c=> (<option key={c.value} value={c.value}>{c.label}</option>))}
          </select>
          <input className="px-3 py-2 border rounded-md" placeholder="Price (e.g., 8.99)" value={menuForm.price} onChange={e=>setMenuForm({...menuForm, price:e.target.value})} required/>
          <input className="px-3 py-2 border rounded-md" type="number" min={0} placeholder="Quantity" value={menuForm.quantity} onChange={e=>setMenuForm({...menuForm, quantity: Number(e.target.value)})} required/>
          <input className="px-3 py-2 border rounded-md text-center" placeholder="🍔" value={menuForm.emoji} onChange={e=>setMenuForm({...menuForm, emoji:e.target.value})} maxLength={2}/>
          <button className="px-4 py-2 bg-red-600 text-white rounded-md">Add Item</button>
        </form>
      </div>

      {/* List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">Menu Items ({menuItems.length})</h2>
          <button className="text-sm rounded border px-2 py-1" onClick={async()=>{
            if(!services) return;
            setMenuItems(await services.menuItems.getAll());
          }}>Refresh</button>
        </div>
        <div className="divide-y">
          {menuItems.map(item => {
            const isEditing = editingId === item.id;
            const cat = CATEGORIES.find(c=>c.value===item.category);
            return (
              <div key={item.id} className="px-6 py-4 grid grid-cols-1 md:grid-cols-8 items-center gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.emoji || cat?.icon}</span>
                  {isEditing ? (
                    <input className="px-2 py-1 border rounded text-sm" value={editForm.name} onChange={e=>setEditForm({...editForm, name:e.target.value})}/>
                  ) : (
                    <div>
                      <div className="font-medium">{item.name}</div>
                      {item.description && <div className="text-xs text-neutral-500">{item.description}</div>}
                    </div>
                  )}
                </div>
                <div>
                  {isEditing ? (
                    <select className="px-2 py-1 border rounded text-sm" value={editForm.category} onChange={e=>setEditForm({...editForm, category:e.target.value as any})}>
                      {CATEGORIES.map(c=> (<option key={c.value} value={c.value}>{c.label}</option>))}
                    </select>
                  ) : (
                    <span className="text-sm text-neutral-600">{cat?.label}</span>
                  )}
                </div>
                <div>
                  {isEditing ? (
                    <input className="px-2 py-1 border rounded text-sm" value={editForm.price} onChange={e=>setEditForm({...editForm, price:e.target.value})}/>
                  ) : (
                    <span className="font-semibold">{formatPrice(item.price_cents)}</span>
                  )}
                </div>
                <div>
                  {isEditing ? (
                    <input className="px-2 py-1 border rounded text-sm" type="number" min={0} value={editForm.quantity} onChange={e=>setEditForm({...editForm, quantity: Number(e.target.value)})}/>
                  ) : (
                    <span className="text-sm">Qty: {item.quantity}</span>
                  )}
                </div>
                <div>
                  {isEditing ? (
                    <input className="px-2 py-1 border rounded text-sm text-center" value={editForm.emoji} onChange={e=>setEditForm({...editForm, emoji:e.target.value})} maxLength={2}/>
                  ) : (
                    <span className="text-lg">{item.emoji}</span>
                  )}
                </div>
                <div>
                  <button onClick={()=>toggleAvail(item.id)} className={`px-3 py-1 rounded-full text-xs font-medium ${item.available? 'bg-green-100 text-green-800':'bg-gray-100 text-gray-800'}`}>{item.available? 'Available':'Unavailable'}</button>
                </div>
                <div className="text-xs text-neutral-500">{new Date(item.created_at).toLocaleDateString('en-US')}</div>
                <div className="flex justify-end gap-2">
                  {isEditing ? (
                    <>
                      <button onClick={saveItem} className="px-3 py-1 bg-green-600 text-white rounded text-sm">Save</button>
                      <button onClick={()=>setEditingId(null)} className="px-3 py-1 bg-gray-600 text-white rounded text-sm">Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={()=>startEdit(item)} className="px-3 py-1 bg-blue-600 text-white rounded text-sm">Edit</button>
                      <button onClick={()=>removeItem(item.id)} className="px-3 py-1 bg-red-600 text-white rounded text-sm">Delete</button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
          {menuItems.length === 0 && (
            <div className="px-6 py-8 text-center text-neutral-500">No menu items</div>
          )}
        </div>
      </div>
    </div>
  );
}
