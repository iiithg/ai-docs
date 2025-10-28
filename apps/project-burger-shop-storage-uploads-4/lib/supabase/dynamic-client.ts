"use client";
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Dynamic client factory that accepts URL and key as parameters
export function createDynamicSupabaseClient(url: string, anonKey: string): SupabaseClient | null {
  if (!url || !anonKey) return null;
  
  try {
    return createClient(url, anonKey);
  } catch (error) {
    console.error('Failed to create Supabase client:', error);
    return null;
  }
}

// Storage keys for persisting settings
export const STORAGE_KEYS = {
  SUPABASE_URL: 'supabase_url',
  SUPABASE_ANON_KEY: 'supabase_anon_key'
} as const;

// Get stored settings from localStorage
export function getStoredSupabaseSettings(): { url: string; key: string } {
  if (typeof window === 'undefined') {
    return { url: '', key: '' };
  }
  
  const url = localStorage.getItem(STORAGE_KEYS.SUPABASE_URL) || '';
  const key = localStorage.getItem(STORAGE_KEYS.SUPABASE_ANON_KEY) || '';
  
  return { url, key };
}

// Save settings to localStorage
export function saveSupabaseSettings(url: string, key: string): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem(STORAGE_KEYS.SUPABASE_URL, url);
  localStorage.setItem(STORAGE_KEYS.SUPABASE_ANON_KEY, key);
}

// Clear stored settings
export function clearSupabaseSettings(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(STORAGE_KEYS.SUPABASE_URL);
  localStorage.removeItem(STORAGE_KEYS.SUPABASE_ANON_KEY);
}

// Create client from stored settings or environment variables
export function createSupabaseClientFromSettings(): SupabaseClient | null {
  // First try stored settings
  const stored = getStoredSupabaseSettings();
  if (stored.url && stored.key) {
    return createDynamicSupabaseClient(stored.url, stored.key);
  }
  
  // Fallback to environment variables
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (envUrl && envKey) {
    return createDynamicSupabaseClient(envUrl, envKey);
  }
  
  return null;
}

