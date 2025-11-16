"use client";
import { useEffect, useState } from 'react';
import Settings from './Settings';

export default function ClientSettings() {
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');

  useEffect(() => {
    const savedUrl = localStorage.getItem('supabaseUrl');
    const savedKey = localStorage.getItem('supabaseKey');
    if (savedUrl) setSupabaseUrl(savedUrl);
    if (savedKey) setSupabaseKey(savedKey);
  }, []);

  const handleSettingsChange = (url: string, key: string) => {
    localStorage.setItem('supabaseUrl', url);
    localStorage.setItem('supabaseKey', key);
    setSupabaseUrl(url);
    setSupabaseKey(key);
  };

  return (
    <Settings 
      onSettingsChange={handleSettingsChange}
      currentUrl={supabaseUrl}
      currentKey={supabaseKey}
    />
  );
}