"use client";
import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';

export default function EntryClientFallback() {
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function run() {
      try {
        const urlLS = typeof window !== 'undefined' ? (localStorage.getItem('supabase_url') || '') : '';
        const keyLS = typeof window !== 'undefined' ? (localStorage.getItem('supabase_anon_key') || '') : '';
        const urlEnv = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const keyEnv = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
        const effectiveUrl = urlLS || urlEnv;
        const effectiveKey = keyLS || keyEnv;
        if (!effectiveUrl || !effectiveKey) {
          setError('Supabase 配置缺失或无效，请点击右上角⚙️设置或检查 .env');
          setLoading(false);
          return;
        }
        const health = await fetch(`${effectiveUrl}/auth/v1/settings`, { headers: { apikey: effectiveKey } });
        if (!health.ok) {
          setError('Supabase 配置可能有问题，请检查 URL 与 Anon Key 是否正确');
          setLoading(false);
          return;
        }
        const supabase = createBrowserClient();
        if (!supabase) {
          setError('Supabase 配置缺失或无效，请点击右上角⚙️设置或检查 .env');
          setLoading(false);
          return;
        }
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setError('Not signed in');
          setLoading(false);
          return;
        }
        setUserId(session.user.id);
        setEmail(session.user.email ?? null);
        const { data: profile } = await supabase.from('profiles').select('name').eq('id', session.user.id).maybeSingle();
        const meta = session.user.user_metadata as { name?: string } | null;
        const n = profile?.name || meta?.name || session.user.email || null;
        setName(n);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e ?? '');
        setError(msg || '无法获取用户信息，请检查 Supabase 配置或登录状态');
      } finally {
        setLoading(false);
      }
    }
    run();
  }, []);

  if (loading) {
    return <div className="rounded border bg-white p-4 text-sm">Loading...</div>;
  }

  return (
    <>
      {/* 用户信息 - 仅在已登录时显示 */}
      {name && (
        <div className="rounded border bg-white p-4">
          <div className="font-semibold">恭喜你加入, 你的名字是 {name}</div>
          {userId && <div className="text-sm text-neutral-600 mt-1">id: {userId}</div>}
          {email && <div className="text-sm text-neutral-600">email: {email}</div>}
        </div>
      )}
      
      {/* 未登录提示 */}
      {!name && !error && (
        <div className="rounded border bg-yellow-50 p-4">
          <div className="text-sm text-yellow-800">
            正在加载用户信息...
          </div>
        </div>
      )}
      
      {error && (
        <div className="rounded border bg-red-50 p-4">
          <div className="text-sm text-red-800">
            {error === 'Not signed in' ? '请先登录以查看用户信息' : error}
          </div>
        </div>
      )}
    </>
  );
}
