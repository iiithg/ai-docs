"use client";
import { useEffect, useMemo, useState } from 'react';
import { maybeCreateBrowserClient } from '@/lib/supabase/client';
import { 
  createDynamicSupabaseClient, 
  createSupabaseClientFromSettings, 
  getStoredSupabaseSettings, 
  saveSupabaseSettings 
} from '@/lib/supabase/dynamic-client';
import { createDatabaseServices } from '@/lib/database';
import { MenuItem, PromoCode, formatPrice, parsePrice } from '@/lib/types';
import Settings from './components/Settings';

const CATEGORIES: { value: 'burger' | 'side' | 'drink'; label: string; icon: string }[] = [
  { value: 'burger', label: 'Burger', icon: '🍔' },
  { value: 'side', label: 'Side', icon: '🍟' },
  { value: 'drink', label: 'Drink', icon: '🥤' },
];

export default function BurgerShopDemo() {
  // Supabase settings state
  const [supabaseSettings, setSupabaseSettings] = useState({ url: '', key: '' });
  const [supabaseClient, setSupabaseClient] = useState<any>(null);
  
  // Initialize Supabase client
  useEffect(() => {
    const stored = getStoredSupabaseSettings();
    setSupabaseSettings(stored);
    
    // Try to create client from stored settings or env vars
    const client = createSupabaseClientFromSettings();
    setSupabaseClient(client);
  }, []);

  const services = useMemo(() => supabaseClient ? createDatabaseServices(supabaseClient) : null, [supabaseClient]);

  // Handle settings change
  const handleSettingsChange = (url: string, key: string) => {
    setSupabaseSettings({ url, key });
    saveSupabaseSettings(url, key);
    
    // Create new client with new settings
    const newClient = createDynamicSupabaseClient(url, key);
    setSupabaseClient(newClient);
  };

  const [activeTab, setActiveTab] = useState<'menu' | 'promo'>('menu');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Menu Items State
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuForm, setMenuForm] = useState({
    name: '',
    description: '',
    category: 'burger' as const,
    price: '8.99',
    emoji: '🍔'
  });
  const [editingMenuItem, setEditingMenuItem] = useState<string | null>(null);
  const [editMenuForm, setEditMenuForm] = useState<{
    name: string;
    description: string;
    category: 'burger' | 'side' | 'drink';
    price: string;
    emoji: string;
  }>({
    name: '',
    description: '',
    category: 'burger',
    price: '0.00',
    emoji: '🍔'
  });

  // Promo Codes State
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [promoForm, setPromoForm] = useState({
    code: '',
    description: '',
    discount_type: 'percentage' as const,
    discount_value: '10'
  });

  // Load data functions
  async function loadMenuItems() {
    if (!services) return;
    try {
      setLoading(true);
      const items = await services.menuItems.getAll();
      setMenuItems(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load menu items');
    } finally {
      setLoading(false);
    }
  }

  async function loadPromoCodes() {
    if (!services) return;
    try {
      setLoading(true);
      const codes = await services.promoCodes.getAll();
      setPromoCodes(codes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load promo codes');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (activeTab === 'menu') {
      loadMenuItems();
    } else {
      loadPromoCodes();
    }
  }, [activeTab, services]);

  // Menu Item handlers
  async function createMenuItem(e: React.FormEvent) {
    e.preventDefault();
    if (!services) return;
    
    try {
      const price_cents = parsePrice(menuForm.price);
      if (!menuForm.name.trim() || price_cents <= 0) {
        setError('Please enter valid name and price');
        return;
      }

      await services.menuItems.create({
        name: menuForm.name.trim(),
        description: menuForm.description.trim() || undefined,
        category: menuForm.category,
        price_cents,
        emoji: menuForm.emoji
      });

      setMenuForm({ name: '', description: '', category: 'burger', price: '8.99', emoji: '🍔' });
      setError(null);
      loadMenuItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create menu item');
    }
  }

  function startEditMenuItem(item: MenuItem) {
    setEditingMenuItem(item.id);
    setEditMenuForm({
      name: item.name,
      description: item.description || '',
      category: item.category,
      price: (item.price_cents / 100).toFixed(2),
      emoji: item.emoji || '🍔'
    });
  }

  async function saveMenuItem() {
    if (!services || !editingMenuItem) return;
    
    try {
      const price_cents = parsePrice(editMenuForm.price);
      if (!editMenuForm.name.trim() || price_cents <= 0) {
        setError('Please enter valid name and price');
        return;
      }

      await services.menuItems.update(editingMenuItem, {
        name: editMenuForm.name.trim(),
        description: editMenuForm.description.trim() || undefined,
        category: editMenuForm.category,
        price_cents,
        emoji: editMenuForm.emoji
      });

      setEditingMenuItem(null);
      setError(null);
      loadMenuItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update menu item');
    }
  }

  async function toggleMenuItemAvailability(id: string) {
    if (!services) return;
    try {
      await services.menuItems.toggleAvailability(id);
      loadMenuItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle availability');
    }
  }

  async function deleteMenuItem(id: string) {
    if (!services || !confirm('Are you sure you want to delete this menu item?')) return;
    try {
      await services.menuItems.delete(id);
      loadMenuItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete menu item');
    }
  }

  // Promo Code handlers
  async function createPromoCode(e: React.FormEvent) {
    e.preventDefault();
    if (!services) return;
    
    try {
      const discount_value = parseInt(promoForm.discount_value);
      
      if (!promoForm.code.trim() || discount_value <= 0) {
        setError('Please enter valid promo code and discount value');
        return;
      }

      await services.promoCodes.create({
        code: promoForm.code.trim().toUpperCase(),
        description: promoForm.description.trim() || undefined,
        discount_type: promoForm.discount_type,
        discount_value
      });

      setPromoForm({
        code: '',
        description: '',
        discount_type: 'percentage',
        discount_value: '10'
      });
      setError(null);
      loadPromoCodes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create promo code');
    }
  }

  async function togglePromoCodeActive(id: string) {
    if (!services) return;
    try {
      await services.promoCodes.toggleActive(id);
      loadPromoCodes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle promo code status');
    }
  }

  async function deletePromoCode(id: string) {
    if (!services || !confirm('Are you sure you want to delete this promo code?')) return;
    try {
      await services.promoCodes.delete(id);
      loadPromoCodes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete promo code');
    }
  }

  if (!supabaseClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
          <h1 className="text-xl font-bold text-red-600 mb-4">Supabase Configuration Missing</h1>
          <p className="text-gray-600 mb-4">
            Please configure Supabase connection information. You can:
          </p>
          
          <div className="mb-4 p-3 bg-blue-50 rounded-md">
            <p className="text-sm font-medium text-blue-800 mb-2">Method 1: Use Settings Button (Recommended)</p>
            <p className="text-sm text-blue-700">Click the settings button ⚙️ in the top right corner to directly enter Supabase URL and Key</p>
          </div>
          
          <div className="mb-4 p-3 bg-gray-50 rounded-md">
            <p className="text-sm font-medium text-gray-800 mb-2">Method 2: Environment Variables</p>
            <p className="text-sm text-gray-600 mb-2">
              Create <code className="bg-gray-100 px-2 py-1 rounded">.env.local</code> file and set:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              <li>NEXT_PUBLIC_SUPABASE_URL</li>
              <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
            </ul>
            <p className="text-sm text-gray-500 mt-2">Restart development server after configuration.</p>
          </div>
        </div>
        
        {/* Settings Component for configuration */}
        <Settings
          onSettingsChange={handleSettingsChange}
          currentUrl={supabaseSettings.url}
          currentKey={supabaseSettings.key}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🍔 Burger Shop Management</h1>
          <p className="text-gray-600">Supabase CRUD Demo - Menu Management and Promo Code System</p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('menu')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'menu'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                🍔 Menu Management
              </button>
              <button
                onClick={() => setActiveTab('promo')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'promo'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                🎫 Promo Code Management
              </button>
            </nav>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <div className="text-red-800 text-sm">{error}</div>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Menu Items Tab */}
        {activeTab === 'menu' && (
          <div className="space-y-6">
            {/* Create Menu Item Form */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Add New Menu Item</h2>
              <form onSubmit={createMenuItem} className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <input
                  type="text"
                  placeholder="Item name"
                  value={menuForm.name}
                  onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Description (optional)"
                  value={menuForm.description}
                  onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <select
                  value={menuForm.category}
                  onChange={(e) => setMenuForm({ ...menuForm, category: e.target.value as any })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Price (e.g.: 8.99)"
                  value={menuForm.price}
                  onChange={(e) => setMenuForm({ ...menuForm, price: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Emoji (e.g.: 🍔)"
                  value={menuForm.emoji}
                  onChange={(e) => setMenuForm({ ...menuForm, emoji: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-center"
                  maxLength={2}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Item'}
                </button>
              </form>
            </div>

            {/* Menu Items List */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold">Menu Items ({menuItems.length})</h2>
                <button
                  onClick={loadMenuItems}
                  disabled={loading}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  {loading ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
              <div className="divide-y divide-gray-200">
                {menuItems.map((item) => {
                  const isEditing = editingMenuItem === item.id;
                  const category = CATEGORIES.find(c => c.value === item.category);
                  
                  return (
                    <div key={item.id} className="px-6 py-4">
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{item.emoji || category?.icon}</span>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editMenuForm.name}
                              onChange={(e) => setEditMenuForm({ ...editMenuForm, name: e.target.value })}
                              className="px-2 py-1 border border-gray-300 rounded text-sm w-full"
                            />
                          ) : (
                            <div>
                              <div className="font-medium">{item.name}</div>
                              {item.description && (
                                <div className="text-sm text-gray-500">{item.description}</div>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div>
                          {isEditing ? (
                            <select
                              value={editMenuForm.category}
                              onChange={(e) => setEditMenuForm({ ...editMenuForm, category: e.target.value as any })}
                              className="px-2 py-1 border border-gray-300 rounded text-sm w-full"
                            >
                              {CATEGORIES.map((cat) => (
                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-sm text-gray-600">{category?.label}</span>
                          )}
                        </div>
                        
                        <div>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editMenuForm.price}
                              onChange={(e) => setEditMenuForm({ ...editMenuForm, price: e.target.value })}
                              className="px-2 py-1 border border-gray-300 rounded text-sm w-full"
                            />
                          ) : (
                            <span className="font-medium">{formatPrice(item.price_cents)}</span>
                          )}
                        </div>
                        
                        <div>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editMenuForm.emoji}
                              onChange={(e) => setEditMenuForm({ ...editMenuForm, emoji: e.target.value })}
                              className="px-2 py-1 border border-gray-300 rounded text-sm w-full text-center"
                              maxLength={2}
                              placeholder="🍔"
                            />
                          ) : (
                            <span className="text-lg">{item.emoji}</span>
                          )}
                        </div>
                        
                        <div>
                          <button
                            onClick={() => toggleMenuItemAvailability(item.id)}
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              item.available
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {item.available ? 'Available' : 'Unavailable'}
                          </button>
                        </div>
                        
                        <div className="text-xs text-gray-500">
                          {new Date(item.created_at).toLocaleDateString('en-US')}
                        </div>
                        
                        <div className="flex space-x-2 justify-end">
                          {isEditing ? (
                            <>
                              <button
                                onClick={saveMenuItem}
                                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingMenuItem(null)}
                                className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEditMenuItem(item)}
                                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteMenuItem(item.id)}
                                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {menuItems.length === 0 && !loading && (
                  <div className="px-6 py-8 text-center text-gray-500">
                    No menu items yet. Please add the first item.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Promo Codes Tab */}
        {activeTab === 'promo' && (
          <div className="space-y-6">
            {/* Create Promo Code Form */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Add New Promo Code</h2>
              <form onSubmit={createPromoCode} className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <input
                  type="text"
                  placeholder="Promo code (e.g.: SAVE20)"
                  value={promoForm.code}
                  onChange={(e) => setPromoForm({ ...promoForm, code: e.target.value.toUpperCase() })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Description (optional)"
                  value={promoForm.description}
                  onChange={(e) => setPromoForm({ ...promoForm, description: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <select
                  value={promoForm.discount_type}
                  onChange={(e) => setPromoForm({ ...promoForm, discount_type: e.target.value as any })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="percentage">Percentage Discount</option>
                  <option value="fixed_amount">Fixed Amount</option>
                </select>
                <input
                  type="number"
                  placeholder={promoForm.discount_type === 'percentage' ? 'Discount% (e.g.: 20)' : 'Amount (e.g.: 500)'}
                  value={promoForm.discount_value}
                  onChange={(e) => setPromoForm({ ...promoForm, discount_value: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  min="1"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Promo Code'}
                </button>
              </form>
            </div>

            {/* Promo Codes List */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold">Promo Codes ({promoCodes.length})</h2>
                <button
                  onClick={loadPromoCodes}
                  disabled={loading}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  {loading ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
              <div className="divide-y divide-gray-200">
                {promoCodes.map((promo) => (
                  <div key={promo.id} className="px-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                      <div>
                        <div className="font-mono font-bold text-lg">{promo.code}</div>
                        {promo.description && (
                          <div className="text-sm text-gray-500">{promo.description}</div>
                        )}
                      </div>
                      
                      <div>
                        <span className="text-sm">
                          {promo.discount_type === 'percentage'
                            ? `${promo.discount_value}% off`
                            : `${formatPrice(promo.discount_value)} off`
                          }
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        Usage: {promo.used_count}
                      </div>
                      
                      <div>
                        <button
                          onClick={() => togglePromoCodeActive(promo.id)}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            promo.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {promo.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </div>
                      
                      <div className="flex space-x-2 justify-end">
                        <button
                          onClick={() => deletePromoCode(promo.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {promoCodes.length === 0 && !loading && (
                  <div className="px-6 py-8 text-center text-gray-500">
                    No promo codes yet. Please add the first promo code.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Settings Component */}
      <Settings
        onSettingsChange={handleSettingsChange}
        currentUrl={supabaseSettings.url}
        currentKey={supabaseSettings.key}
      />
    </div>
  );
}

