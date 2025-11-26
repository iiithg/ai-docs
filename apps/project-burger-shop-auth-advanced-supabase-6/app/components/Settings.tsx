"use client";
import { useState } from 'react';

interface SettingsProps {
  onSettingsChange: (url: string, key: string) => void;
  currentUrl?: string;
  currentKey?: string;
  children: React.ReactNode;
}

export default function Settings({ onSettingsChange, currentUrl = '', currentKey = '', children }: SettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState(currentUrl);
  const [key, setKey] = useState(currentKey);
  const [showKey, setShowKey] = useState(false);

  const handleSave = () => {
    if (url.trim() && key.trim()) {
      onSettingsChange(url.trim(), key.trim());
    }
    setIsOpen(false);
  };

  const handleReset = () => {
    localStorage.removeItem('supabase_url');
    localStorage.removeItem('supabase_anon_key');
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-neutral-600 hover:text-burger-red transition-colors p-1"
        title="Settings"
      >
        {children}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Settings</h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supabase URL</label>
                <input type="url" value={url} onChange={(e)=>setUrl(e.target.value)} placeholder="https://your-project.supabase.co" className="w-full px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supabase Anon Key</label>
                <div className="relative">
                  <input type={showKey? 'text':'password'} value={key} onChange={(e)=>setKey(e.target.value)} placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." className="w-full px-3 py-2 pr-10 border rounded-md" />
                  <button type="button" onClick={()=>setShowKey(!showKey)} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    {showKey ? (
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" /></svg>
                    ) : (
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
                <p className="font-medium mb-1">Where to find:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Supabase Dashboard → Settings → API</li>
                  <li>Copy Project URL and anon public key</li>
                </ol>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button onClick={handleReset} className="px-4 py-2 text-gray-600 hover:text-gray-800">Reset</button>
              <div className="space-x-2">
                <button onClick={()=>setIsOpen(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800">Cancel</button>
                <button onClick={handleSave} disabled={(!url.trim()||!key.trim())} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
