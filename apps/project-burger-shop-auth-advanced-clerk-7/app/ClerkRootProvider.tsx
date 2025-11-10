"use client";
import { useEffect, useState } from 'react';
import { ClerkProvider } from '@clerk/nextjs';

export default function ClerkRootProvider({ children }: { children: React.ReactNode }) {
  const [pk, setPk] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let key: string | null = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || null;
    if (typeof window !== 'undefined') {
      const ls = localStorage.getItem('clerk_publishable_key');
      if (ls) key = ls;
    }
    setPk(key);
    setReady(true);
  }, []);

  if (!ready) return null;
  if (!pk) return <>{children}</>;
  return <ClerkProvider publishableKey={pk}>{children}</ClerkProvider>;
}

