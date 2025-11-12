import '../styles/globals.css';
import Link from 'next/link';
import type { Metadata } from 'next';
import ClerkRootProvider from './ClerkRootProvider';
import SettingsMount from './components/SettingsMount';

export const metadata: Metadata = {
  title: 'Clerk Auth — Burger Shop',
  description: 'Clerk login demo (optional with Supabase data access).'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-50 text-neutral-800">
        <ClerkRootProvider>
        <SettingsMount />
        <header className="border-b bg-white">
          <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="font-bold text-burger-red">🍔 Burger Shop</div>
              <nav className="text-sm text-neutral-600 flex gap-4">
                <Link href="/clerk/login" className="hover:text-burger-red transition-colors">clerk</Link>
                <Link href="/entry" className="hover:text-burger-red transition-colors">entry</Link>
              </nav>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
        <footer className="border-t bg-white">
          <div className="mx-auto max-w-5xl px-4 py-3 text-xs text-neutral-500">
            Clerk demo with optional Supabase data access.
          </div>
        </footer>
        </ClerkRootProvider>
      </body>
    </html>
  );
}
