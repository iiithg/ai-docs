"use client";
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export function createBrowserClient(): SupabaseClient | null {
  // Prefer locally saved settings for quick demo configuration
  if (typeof window !== 'undefined') {
    const urlLS = localStorage.getItem('supabase_url');
    const keyLS = localStorage.getItem('supabase_anon_key');
    if (urlLS && keyLS) {
      try { return createClient(urlLS, keyLS); } catch {}
    }
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  return createClient(url, anon);
}
