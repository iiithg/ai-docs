"use client";
import { useEffect, useState } from 'react';
import Settings from './Settings';

export default function SettingsMount() {
  const [currentUrl, setCurrentUrl] = useState('');
  const [currentKey, setCurrentKey] = useState('');
  const [currentClerkKey, setCurrentClerkKey] = useState('');

  useEffect(() => {
    let url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    let anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    let clerkPk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '';
    if (typeof window !== 'undefined') {
      const urlLS = localStorage.getItem('supabase_url');
      const keyLS = localStorage.getItem('supabase_anon_key');
      const clerkLS = localStorage.getItem('clerk_publishable_key');
      if (urlLS) url = urlLS;
      if (keyLS) anon = keyLS;
      if (clerkLS) clerkPk = clerkLS;
    }
    setCurrentUrl(url);
    setCurrentKey(anon);
    setCurrentClerkKey(clerkPk);
  }, []);

  function onSettingsChange(url: string, key: string) {
    if (typeof window === 'undefined') return;
    if (url && key) {
      localStorage.setItem('supabase_url', url);
      localStorage.setItem('supabase_anon_key', key);
      setCurrentUrl(url);
      setCurrentKey(key);
    } else {
      localStorage.removeItem('supabase_url');
      localStorage.removeItem('supabase_anon_key');
      setCurrentUrl('');
      setCurrentKey('');
    }
    // Reload to ensure clients pick up the new settings
    window.location.reload();
  }

  function onClerkChange(pk: string) {
    if (typeof window === 'undefined') return;
    if (pk) {
      localStorage.setItem('clerk_publishable_key', pk);
      setCurrentClerkKey(pk);
    } else {
      localStorage.removeItem('clerk_publishable_key');
      setCurrentClerkKey('');
    }
    window.location.reload();
  }

  return (
    <Settings
      onSettingsChange={onSettingsChange}
      currentUrl={currentUrl}
      currentKey={currentKey}
      onClerkChange={onClerkChange}
      currentClerkKey={currentClerkKey}
    />
  );
}