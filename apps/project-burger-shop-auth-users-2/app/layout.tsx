import '../styles/globals.css';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Auth Users — Burger Shop',
  description: 'Supabase Auth + Profiles + Wallet demo for burger shop.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-50 text-neutral-800">
        <header className="border-b bg-white">
          <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="font-bold text-burger-red">🍔 Burger Shop</div>
              <nav className="text-sm text-neutral-600 flex gap-4">
                <Link href="/shop" className="hover:text-burger-red transition-colors">Shop</Link>
                <Link href="/admin" className="hover:text-burger-red transition-colors">Admin</Link>
              </nav>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
        <footer className="border-t bg-white">
          <div className="mx-auto max-w-5xl px-4 py-3 text-xs text-neutral-500">
            Supabase Auth + Profiles + Wallet demo.
          </div>
        </footer>
      </body>
    </html>
  );
}
