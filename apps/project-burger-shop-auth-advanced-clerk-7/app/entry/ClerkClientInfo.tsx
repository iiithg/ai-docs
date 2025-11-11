"use client";
import { useEffect, useState } from 'react';
import { SignedIn, useUser } from '@clerk/nextjs';

export default function ClerkClientInfo() {
  const [hasPk, setHasPk] = useState(false);
  useEffect(() => {
    let key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '';
    if (typeof window !== 'undefined') {
      key = localStorage.getItem('clerk_publishable_key') || key;
    }
    setHasPk(Boolean(key));
  }, []);

  if (!hasPk) return null;
  return <SignedIn><ClerkInner /></SignedIn>;
}

function ClerkInner() {
  const { user } = useUser();
  if (!user) return null;
  const name = user.firstName || user.username || user.primaryEmailAddress?.emailAddress || 'User';
  const email = user.primaryEmailAddress?.emailAddress;
  return (
    <div className="rounded border bg-white p-4">
      <div className="font-semibold">恭喜你加入, 你的名字是 {name}</div>
      {email && <div className="text-sm text-neutral-600 mt-1">email: {email}</div>}
      <div className="text-xs text-neutral-500 mt-1">通过 Clerk 登录 (客户端)</div>
    </div>
  );
}
