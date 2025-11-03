"use client";
import { useEffect, useState } from 'react';

export default function Settings({ defaultOpen }: { defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(!!defaultOpen);
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);

  useEffect(() => {
    const u = localStorage.getItem('supabase_url') || '';
    const k = localStorage.getItem('supabase_anon_key') || '';
    const t = localStorage.getItem('supabase_access_token') || '';
    setUrl(u); setKey(k); setToken(t);
  }, []);

  function save() {
    localStorage.setItem('supabase_url', url);
    localStorage.setItem('supabase_anon_key', key);
    if (token) localStorage.setItem('supabase_access_token', token); else localStorage.removeItem('supabase_access_token');
    setIsOpen(false);
  }

  return (
    <>
      <button onClick={()=>setIsOpen(true)} className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-800">
        <span className="text-lg">⚙️</span> Settings
      </button>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Supabase Settings</h2>
              <button onClick={()=>setIsOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Supabase URL</label>
                <input type="url" value={url} onChange={e=>setUrl(e.target.value)} className="w-full rounded border px-3 py-2" placeholder="https://YOUR-PROJECT.supabase.co" />
              </div>
              <div>
                <label className="block text-sm mb-1">Anon Key</label>
                <div className="relative">
                  <input type={showKey? 'text':'password'} value={key} onChange={e=>setKey(e.target.value)} className="w-full rounded border px-3 py-2 pr-10" placeholder="eyJhbGci..." />
                  <button type="button" onClick={()=>setShowKey(!showKey)} className="absolute inset-y-0 right-0 pr-3 text-xs text-neutral-500">{showKey? 'Hide':'Show'}</button>
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1">Access Token (Authorization: Bearer ...)</label>
                <div className="relative">
                  <input type={showToken? 'text':'password'} value={token} onChange={e=>setToken(e.target.value)} className="w-full rounded border px-3 py-2 pr-10" placeholder="Paste user JWT if endpoint requires verify_jwt" />
                  <button type="button" onClick={()=>setShowToken(!showToken)} className="absolute inset-y-0 right-0 pr-3 text-xs text-neutral-500">{showToken? 'Hide':'Show'}</button>
                </div>
                <p className="text-xs text-neutral-500 mt-1">部分函数启用了 JWT 校验（verify_jwt）。填写此字段以附带 <code>Authorization</code> 头。</p>
              </div>
              <p className="text-xs text-neutral-500">Edge Function can be public; settings are optional unless you add auth.</p>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={()=>setIsOpen(false)} className="px-4 py-2 text-neutral-600">Cancel</button>
              <button onClick={save} className="px-4 py-2 bg-burger-red text-white rounded">Save</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
