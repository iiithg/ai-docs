"use client";
import { useEffect, useState } from 'react';
import { getStoredSupabaseSettings, saveSupabaseSettings } from '@/lib/supabase/dynamic-client';

export default function Settings({ onSettingsChange, currentUrl, currentKey, defaultOpen }: { onSettingsChange: (url: string, key: string) => void; currentUrl?: string; currentKey?: string; defaultOpen?: boolean; }) {
  const [isOpen, setIsOpen] = useState(!!defaultOpen);
  const [url, setUrl] = useState(currentUrl || '');
  const [key, setKey] = useState(currentKey || '');
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    const { url, key } = getStoredSupabaseSettings();
    if (url) setUrl(url);
    if (key) setKey(key);
  }, []);
  useEffect(() => {
    if (typeof defaultOpen !== 'undefined') setIsOpen(!!defaultOpen);
  }, [defaultOpen]);

  function handleSave() {
    saveSupabaseSettings(url, key);
    onSettingsChange(url, key);
    setIsOpen(false);
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-800"
      >
        <span className="text-lg">⚙️</span>
        Settings
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Supabase Settings</h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supabase URL</label>
                <input type="url" value={url} onChange={(e)=>setUrl(e.target.value)} placeholder="https://YOUR-PROJECT.supabase.co" className="w-full rounded border px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supabase anon key</label>
                <div className="relative">
                  <input type={showKey? 'text':'password'} value={key} onChange={(e)=>setKey(e.target.value)} placeholder="eyJhbGciOiJI..." className="w-full rounded border px-3 py-2 pr-10" />
                  <button type="button" onClick={()=>setShowKey(!showKey)} className="absolute inset-y-0 right-0 pr-3 text-xs text-neutral-500">{showKey? 'Hide':'Show'}</button>
                </div>
              </div>
              <p className="text-xs text-neutral-500">Find these in your Supabase Dashboard → Settings → API.</p>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button onClick={()=>setIsOpen(false)} className="px-4 py-2 text-neutral-600">Cancel</button>
              <button onClick={handleSave} disabled={!url || !key} className="px-4 py-2 bg-burger-red text-white rounded disabled:bg-neutral-300">Save</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
