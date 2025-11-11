"use client";
import { useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

function SignOutButton() {
  const { signOut } = useClerk();
  const router = useRouter();
  const [msg, setMsg] = useState<string | null>(null);
  
  async function onClick() {
    try {
      await signOut();
      router.push('/clerk/login');
    } catch (e: any) {
      setMsg(e?.message || '退出登录失败');
    }
  }

  function clearSettings() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('clerk_publishable_key');
      setMsg('已清除本地设置。');
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button onClick={onClick} className="px-3 py-2 rounded border">退出登录</button>
      <button onClick={clearSettings} className="px-3 py-2 rounded border">清除设置 (⚙️)</button>
    </div>
  );
}

export default function SignOutRow() {
  const [hasClerkProvider, setHasClerkProvider] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    let key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '';
    if (typeof window !== 'undefined') {
      const ls = localStorage.getItem('clerk_publishable_key');
      if (ls) key = ls;
    }
    setHasClerkProvider(Boolean(key));
  }, []);

  function clearSettings() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('clerk_publishable_key');
      setMsg('已清除本地设置。');
    }
  }

  // 如果没有 Clerk 提供者，只显示清除设置按钮
  if (!hasClerkProvider) {
    return (
      <div className="mt-6 rounded border bg-white p-4 text-sm">
        <div className="font-semibold mb-2">会话和设置</div>
        {msg && <div className="mb-2 rounded border border-yellow-200 bg-yellow-50 p-2 text-yellow-800">{msg}</div>}
        <div className="flex flex-wrap gap-2">
          <button onClick={clearSettings} className="px-3 py-2 rounded border">清除设置 (⚙️)</button>
        </div>
      </div>
    );
  }

  // 有 Clerk 提供者，显示完整的设置界面
  return (
    <div className="mt-6 rounded border bg-white p-4 text-sm">
      <div className="font-semibold mb-2">会话和设置</div>
      {msg && <div className="mb-2 rounded border border-yellow-200 bg-yellow-50 p-2 text-yellow-800">{msg}</div>}
      <SignOutButton />
    </div>
  );
}
