"use client";
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Settings from '../../components/Settings';
import GoogleButton from '../../components/social-auth-buttons/GoogleButton';
import AppleButton from '../../components/social-auth-buttons/AppleButton';
import GitHubButton from '../../components/social-auth-buttons/GitHubButton';
import { createBrowserClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [supabase, setSupabase] = useState<any>(null);
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const ready = useMemo(() => Boolean(supabase), [supabase]);

  // email/password auth state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [optionalInfo, setOptionalInfo] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  useEffect(() => {
    const client = createBrowserClient();
    setSupabase(client);
    // Prefer localStorage for UI echo; fall back to env
    let lsUrl = '';
    let lsKey = '';
    if (typeof window !== 'undefined') {
      lsUrl = localStorage.getItem('supabase_url') || '';
      lsKey = localStorage.getItem('supabase_anon_key') || '';
    }
    setSupabaseUrl(lsUrl || process.env.NEXT_PUBLIC_SUPABASE_URL || '');
    setSupabaseKey(lsKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');    // Session listener
    if (client) {
      client.auth.getSession().then(({ data }) => setAccessToken(data.session?.access_token ?? null));
      const { data: sub } = client.auth.onAuthStateChange((_event, session) => {
        setAccessToken(session?.access_token ?? null);
      });
      return () => { sub.subscription.unsubscribe(); };
    }
  }, []);

  const handleSettingsChange = (url: string, key: string) => {
    // Recreate client with new settings by reloading page (keeps demo simple)
    if (typeof window !== 'undefined') {
      localStorage.setItem('supabase_url', url);
      localStorage.setItem('supabase_anon_key', key);
      window.location.reload();
    }
  };
  async function signInWith(provider: 'google' | 'github' | 'apple') {
    setErr(null);
    setMessage(null);
    if (!supabase) { setErr('请先在⚙️中配置 Supabase URL 与 Anon Key'); return; }
    const redirectTo = `${window.location.origin}/auth/callback`;
    // Preflight: don't redirect immediately; check provider config first
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo, skipBrowserRedirect: true as any }
    } as any);
    if (error) {
      const msg = String(error.message || 'Login failed');
      if (msg.toLowerCase().includes('provider is not enabled')) {
        setErr(`该登录方式未在 Supabase Dashboard 启用。请前往 Authentication → Providers 启用 ${provider} 并保存，然后重试。`);
      } else {
        setErr(msg);
      }
      return;
    }
    if (data?.url) {
      window.location.href = data.url;
    } else {
      setErr('未获取到重定向地址，请检查配置');
    }
  }

  async function signOut() {
    setErr(null);
    setMessage(null);
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) setErr(error.message); else setMessage('Signed out');
  }

  async function callJwtEcho() {
    setErr(null); setMessage(null);
    if (!accessToken) { setErr('No access token'); return; }
    const res = await fetch('/api/jwt-echo', { headers: { Authorization: `Bearer ${accessToken}` } });
    const json = await res.json();
    if (!res.ok) { setErr(json.error || 'Request failed'); return; }
    setMessage(`Verified for sub=${json.sub}, exp=${json.exp}`);
  }

  async function emailSignIn() {
    setErr(null); setMessage(null);
    if (!supabase) { setErr('Supabase not ready'); return; }
    if (!email || !password) { setErr('请输入邮箱与密码'); return; }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setErr(error.message); else setMessage('登录成功');
  }

  async function emailSignUp() {
    setErr(null); setMessage(null);
    if (!supabase) { setErr('Supabase not ready'); return; }
    if (!email || !password || !name || !optionalInfo) {
      setErr('注册需要填写：邮箱、密码、name、optional 信息（均为必填）');
      return;
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, optional_info: optionalInfo } }
    });
    if (error) { setErr(error.message); return; }
    const userId = data.user?.id;
    try {
      if (userId) {
        // ensure a profile row exists; requires scripts/init.sql policies
        const { error: upsertErr } = await supabase.from('profiles').upsert({
          user_id: userId,
          name,
          optional_info: optionalInfo
        }, { onConflict: 'user_id' });
        if (upsertErr) throw upsertErr;
      }
    } catch (e: any) {
      setErr(`注册成功但写入资料失败: ${e.message || e}`);
      return;
    }
    setMessage('注册成功，请前往邮箱验证（如开启）或直接访问受保护页面');
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Advanced Login</h1>
        <p className="text-sm text-neutral-600">Google / GitHub OAuth + JWT protected API.</p>
      </div>

      {!ready && (
        <div className="rounded border bg-yellow-50 text-yellow-800 p-3 text-sm mb-4">
          未检测到 Supabase 配置。请点击右上角⚙️填写 <b>Supabase URL</b> 与 <b>Anon Key</b>，或在 .env.local 设置后重启。
        </div>
      )}

      {err && <div className="mb-3 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{err}</div>}
      {message && <div className="mb-3 rounded border border-green-200 bg-green-50 p-3 text-sm text-green-700">{message}</div>}

      <div className="rounded-lg border bg-white p-4 space-y-4">
        <div className="space-y-3">
          <GoogleButton onClick={()=>signInWith('google')} disabled={!ready} />
          <GitHubButton onClick={()=>signInWith('github')} disabled={!ready} />
          <AppleButton onClick={()=>signInWith('apple')} disabled={!ready} />
        </div>

        <div className="flex items-center gap-2 text-xs text-neutral-500 select-none">
          <div className="h-px flex-1 bg-neutral-200" />
          <span>或使用邮箱</span>
          <div className="h-px flex-1 bg-neutral-200" />
        </div>

        <div className="flex items-center justify-between">
          <div className="font-semibold">邮箱登录 / 注册</div>
          <div className="text-sm">
            <button className={`px-2 py-1 rounded ${mode==='signin'?'bg-neutral-900 text-white':'border'}`} onClick={()=>setMode('signin')}>登录</button>
            <button className={`ml-2 px-2 py-1 rounded ${mode==='signup'?'bg-neutral-900 text-white':'border'}`} onClick={()=>setMode('signup')}>注册</button>
          </div>
        </div>

        <div className="space-y-2">
          <input value={email} onChange={(e)=>setEmail(e.target.value)} type="email" placeholder="邮箱" className="w-full px-3 py-2 border rounded" />
          <input value={password} onChange={(e)=>setPassword(e.target.value)} type="password" placeholder="密码" className="w-full px-3 py-2 border rounded" />
          {mode === 'signup' && (
            <>
              <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="name（必填）" className="w-full px-3 py-2 border rounded" />
              <input value={optionalInfo} onChange={(e)=>setOptionalInfo(e.target.value)} placeholder="optional 信息（必填）" className="w-full px-3 py-2 border rounded" />
            </>
          )}
        </div>
        {mode === 'signin' ? (
          <button onClick={emailSignIn} disabled={!ready} className="w-full rounded bg-blue-600 text-white px-3 py-2 disabled:opacity-50">邮箱登录</button>
        ) : (
          <button onClick={emailSignUp} disabled={!ready} className="w-full rounded bg-green-600 text-white px-3 py-2 disabled:opacity-50">邮箱注册</button>
        )}

        <div className="pt-2">
          <button onClick={signOut} disabled={!ready} className="w-full rounded bg-burger-red text-white px-3 py-2 disabled:opacity-50">Sign out</button>
        </div>
      </div>

      <div className="mt-4 rounded-lg border bg-white p-4 text-sm">
        <div className="font-semibold mb-2">Session</div>
        <div className="break-all text-neutral-700">{accessToken ? `Access Token: ${accessToken}` : 'Not signed in'}</div>
        <div className="mt-3 flex gap-2">
          <button onClick={callJwtEcho} className="rounded bg-blue-600 text-white px-3 py-2">Call /api/jwt-echo</button>
          <Link href="/entry" className="rounded bg-green-600 text-white px-3 py-2">Go to entry page →</Link>
        </div>
      </div>

      <div className="mt-6">
        <Settings
          onSettingsChange={handleSettingsChange}
          currentUrl={supabaseUrl}
          currentKey={supabaseKey}
          onClerkChange={handleClerkChange}
          currentClerkKey={clerkPublishableKey}
        />
      </div>
    </div>
  );
}
