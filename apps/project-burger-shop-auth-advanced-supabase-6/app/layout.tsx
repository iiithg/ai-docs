import '../styles/globals.css';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Advanced Auth — Burger Shop',
  description: 'Google/GitHub OAuth + JWT protected API demo.'
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
                <Link href="/auth/login" className="hover:text-burger-red transition-colors">oauth</Link>
                <Link href="/entry" className="hover:text-burger-red transition-colors">entry</Link>
              </nav>
            </div>
            <div className="flex items-center gap-2" />
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
        <footer className="border-t bg-white">
          <div className="mx-auto max-w-5xl px-4 py-3 text-xs text-neutral-500">
            Google/GitHub OAuth + JWT verification example.
          </div>
        </footer>
      </body>
    </html>
  );
}
