"use client";
import React, { useEffect, useState } from 'react';
import { ClerkProvider } from '@clerk/nextjs';

// 为了在组件间共享Clerk配置状态，创建一个Context
export const ClerkConfigContext = React.createContext<{ clerkConfigured: boolean; refreshConfig: () => void }>({
  clerkConfigured: false,
  refreshConfig: () => {}
});

export default function ClerkRootProvider({ children }: { children: React.ReactNode }) {
  const [pk, setPk] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [valid, setValid] = useState(false);

  // 增加一个函数专门用于刷新配置
  const refreshConfig = () => {
    let key: string | null = null;
    // 优先从环境变量获取
    if (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
      key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    }
    // 然后从localStorage获取
    if (typeof window !== 'undefined') {
      const ls = localStorage.getItem('clerk_publishable_key');
      if (ls) key = ls;
    }
    setPk(key);
    setValid(Boolean(key && /^pk_(test|live)_/.test(key)));
  };

  // 初始加载配置
  useEffect(() => {
    refreshConfig();
    setReady(true);
    
    // 监听localStorage变化，当clerk_publishable_key被修改时自动刷新
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'clerk_publishable_key') {
        refreshConfig();
      }
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageChange);
      }
    };
  }, []);

  // 提供配置上下文
  const contextValue = {
    clerkConfigured: valid,
    refreshConfig
  };

  // 在ready之前显示加载状态
  if (!ready) return null;
  
  // 如果pk存在，提供ClerkProvider
  if (valid && pk) {
    return (
      <ClerkConfigContext.Provider value={contextValue}>
        <ClerkProvider publishableKey={pk}>{children}</ClerkProvider>
      </ClerkConfigContext.Provider>
    );
  }
  
  // 即使没有pk，也提供配置上下文，以便子组件可以知道配置状态
  return (
    <ClerkConfigContext.Provider value={contextValue}>
      {children}
    </ClerkConfigContext.Provider>
  );
}

