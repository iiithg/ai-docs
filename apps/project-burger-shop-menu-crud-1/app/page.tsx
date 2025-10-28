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
  { value: 'burger', label: '汉堡', icon: '🍔' },
  { value: 'side', label: '配菜', icon: '🍟' },
  { value: 'drink', label: '饮品', icon: '🥤' },
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
      setError(err instanceof Error ? err.message : '加载菜单项失败');
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
      setError(err instanceof Error ? err.message : '加载优惠码失败');
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
        setError('请输入有效的名称和价格');
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
      setError(err instanceof Error ? err.message : '创建菜单项失败');
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
        setError('请输入有效的名称和价格');
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
      setError(err instanceof Error ? err.message : '更新菜单项失败');
    }
  }

  async function toggleMenuItemAvailability(id: string) {
    if (!services) return;
    try {
      await services.menuItems.toggleAvailability(id);
      loadMenuItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : '切换可用性失败');
    }
  }

  async function deleteMenuItem(id: string) {
    if (!services || !confirm('确定要删除这个菜单项吗？')) return;
    try {
      await services.menuItems.delete(id);
      loadMenuItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除菜单项失败');
    }
  }

  // Promo Code handlers
  async function createPromoCode(e: React.FormEvent) {
    e.preventDefault();
    if (!services) return;
    
    try {
      const discount_value = parseInt(promoForm.discount_value);
      
      if (!promoForm.code.trim() || discount_value <= 0) {
        setError('请输入有效的优惠码和折扣值');
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
      setError(err instanceof Error ? err.message : '创建优惠码失败');
    }
  }

  async function togglePromoCodeActive(id: string) {
    if (!services) return;
    try {
      await services.promoCodes.toggleActive(id);
      loadPromoCodes();
    } catch (err) {
      setError(err instanceof Error ? err.message : '切换优惠码状态失败');
    }
  }

  async function deletePromoCode(id: string) {
    if (!services || !confirm('确定要删除这个优惠码吗？')) return;
    try {
      await services.promoCodes.delete(id);
      loadPromoCodes();
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除优惠码失败');
    }
  }

  if (!supabaseClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
          <h1 className="text-xl font-bold text-red-600 mb-4">Supabase 配置缺失</h1>
          <p className="text-gray-600 mb-4">
            请配置 Supabase 连接信息。你可以：
          </p>
          
          <div className="mb-4 p-3 bg-blue-50 rounded-md">
            <p className="text-sm font-medium text-blue-800 mb-2">方法一：使用设置按钮（推荐）</p>
            <p className="text-sm text-blue-700">点击右上角的设置按钮 ⚙️ 直接输入 Supabase URL 和 Key</p>
          </div>
          
          <div className="mb-4 p-3 bg-gray-50 rounded-md">
            <p className="text-sm font-medium text-gray-800 mb-2">方法二：环境变量</p>
            <p className="text-sm text-gray-600 mb-2">
              创建 <code className="bg-gray-100 px-2 py-1 rounded">.env.local</code> 文件并设置：
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              <li>NEXT_PUBLIC_SUPABASE_URL</li>
              <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
            </ul>
            <p className="text-sm text-gray-500 mt-2">设置完成后重启开发服务器。</p>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🍔 汉堡店管理系统</h1>
          <p className="text-gray-600">Supabase CRUD 演示 - 菜单管理和优惠码系统</p>
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
                🍔 菜单管理
              </button>
              <button
                onClick={() => setActiveTab('promo')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'promo'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                🎫 优惠码管理
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
              <h2 className="text-lg font-semibold mb-4">添加新菜单项</h2>
              <form onSubmit={createMenuItem} className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <input
                  type="text"
                  placeholder="菜品名称"
                  value={menuForm.name}
                  onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
                <input
                  type="text"
                  placeholder="描述（可选）"
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
                  placeholder="价格 (例: 8.99)"
                  value={menuForm.price}
                  onChange={(e) => setMenuForm({ ...menuForm, price: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
                <input
                  type="text"
                  placeholder="表情 (例: 🍔)"
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
                  {loading ? '添加中...' : '添加菜品'}
                </button>
              </form>
            </div>

            {/* Menu Items List */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold">菜单项列表 ({menuItems.length})</h2>
                <button
                  onClick={loadMenuItems}
                  disabled={loading}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  {loading ? '刷新中...' : '刷新'}
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
                            {item.available ? '可用' : '不可用'}
                          </button>
                        </div>
                        
                        <div className="text-xs text-gray-500">
                          {new Date(item.created_at).toLocaleDateString('zh-CN')}
                        </div>
                        
                        <div className="flex space-x-2 justify-end">
                          {isEditing ? (
                            <>
                              <button
                                onClick={saveMenuItem}
                                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                              >
                                保存
                              </button>
                              <button
                                onClick={() => setEditingMenuItem(null)}
                                className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                              >
                                取消
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEditMenuItem(item)}
                                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                              >
                                编辑
                              </button>
                              <button
                                onClick={() => deleteMenuItem(item.id)}
                                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                              >
                                删除
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
                    暂无菜单项，请添加第一个菜品。
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
              <h2 className="text-lg font-semibold mb-4">添加新优惠码</h2>
              <form onSubmit={createPromoCode} className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <input
                  type="text"
                  placeholder="优惠码 (例: SAVE20)"
                  value={promoForm.code}
                  onChange={(e) => setPromoForm({ ...promoForm, code: e.target.value.toUpperCase() })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
                <input
                  type="text"
                  placeholder="描述（可选）"
                  value={promoForm.description}
                  onChange={(e) => setPromoForm({ ...promoForm, description: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <select
                  value={promoForm.discount_type}
                  onChange={(e) => setPromoForm({ ...promoForm, discount_type: e.target.value as any })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="percentage">百分比折扣</option>
                  <option value="fixed_amount">固定金额</option>
                </select>
                <input
                  type="number"
                  placeholder={promoForm.discount_type === 'percentage' ? '折扣% (例: 20)' : '金额 (例: 500)'}
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
                  {loading ? '添加中...' : '添加优惠码'}
                </button>
              </form>
            </div>

            {/* Promo Codes List */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold">优惠码列表 ({promoCodes.length})</h2>
                <button
                  onClick={loadPromoCodes}
                  disabled={loading}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  {loading ? '刷新中...' : '刷新'}
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
                            ? `${promo.discount_value}% 折扣`
                            : `减 ${formatPrice(promo.discount_value)}`
                          }
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        使用次数: {promo.used_count}
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
                          {promo.is_active ? '启用' : '禁用'}
                        </button>
                      </div>
                      
                      <div className="flex space-x-2 justify-end">
                        <button
                          onClick={() => deletePromoCode(promo.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {promoCodes.length === 0 && !loading && (
                  <div className="px-6 py-8 text-center text-gray-500">
                    暂无优惠码，请添加第一个优惠码。
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

