"use client";
import Link from 'next/link';
import ProfileAvatar from '@/app/components/ProfileAvatar';

export default function HeaderBar() {
  return (
    <header className="border-b bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 sticky top-0 z-30">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-4 min-w-0">
          <Link href="/" className="font-bold text-burger-red shrink-0">🍔 Burger Shop</Link>
          <nav className="text-sm text-neutral-600 flex gap-4 overflow-x-auto">
            <Link href="/profile" className="hover:text-burger-red transition-colors">Profile</Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <ProfileAvatar />
        </div>
      </div>
    </header>
  );
}
