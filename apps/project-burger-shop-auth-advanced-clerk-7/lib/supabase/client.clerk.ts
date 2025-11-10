"use client";
import { useAuth } from '@clerk/nextjs';
import { useMemo } from 'react';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Create a Supabase client that attaches Clerk's session token to every request.
export function useSupabaseWithClerk(): SupabaseClient {
  const { getToken } = useAuth();

  let url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  let key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  // Prefer locally saved settings from the Settings (⚙️) modal
  if (typeof window !== 'undefined') {
    const urlLS = localStorage.getItem('supabase_url');
    const anonLS = localStorage.getItem('supabase_anon_key');
    if (urlLS) url = urlLS;
    if (!key && anonLS) key = anonLS;
  }

  if (!url || !key) {
    throw new Error('Supabase URL/Key missing. 请在右上角⚙️ Settings中配置或在 .env.local 中添加 NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  // Memoize to avoid creating a new client on every render
  const client = useMemo(() => {
    return createClient(url, key, {
      accessToken: async () => (await getToken()) ?? null,
    });
  }, [url, key]);

  return client;
}

