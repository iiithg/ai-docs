"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createSupabaseClientFromSettings } from '@/lib/supabase/dynamic-client';

type SessionUser = { id: string; email?: string | null } | null;

export default function ProfileAvatar() {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [user, setUser] = useState<SessionUser>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>('');

  useEffect(() => {
    const client = createSupabaseClientFromSettings();
    setSupabase(client);
  }, []);

  useEffect(() => {
    if (!supabase) return;
    let mounted = true;

    (async () => {
      const { data } = await supabase.auth.getSession();
      const u = data?.session?.user || null;
      if (!mounted) return;
      setUser(u ? { id: u.id, email: u.email } : null);
      if (u) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('user_id', u.id)
          .maybeSingle();
        if (!mounted) return;
        setAvatarUrl(profile?.avatar_url || '');
      } else {
        setAvatarUrl('');
      }
    })();

    return () => {
      mounted = false;
    };
  }, [supabase]);

  // Listen for avatar updates triggered after successful uploads
  useEffect(() => {
    function onAvatarUpdated(e: Event) {
      const detail = (e as CustomEvent).detail as { url?: string };
      if (detail?.url) setAvatarUrl(detail.url);
    }
    window.addEventListener('avatar:updated', onAvatarUpdated as EventListener);
    return () => window.removeEventListener('avatar:updated', onAvatarUpdated as EventListener);
  }, []);

  if (!avatarUrl) return null;
  return (
    <Link href="/profile" title={user?.email || 'Profile'} className="block">
      <img src={avatarUrl} alt="avatar" className="w-9 h-9 rounded-full object-cover border" />
    </Link>
  );
}
