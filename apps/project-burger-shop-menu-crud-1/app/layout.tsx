import '../styles/globals.css';
import Link from 'next/link';
import type { Metadata } from 'next';
import UserAvatar from './components/UserAvatar';

export const metadata: Metadata = {
  title: 'Menu CRUD — Burger Shop',
  description: 'Single-page Supabase CRUD demo for menu items.'
};

const mockUserInfo = {
  name: 'Chef Demo',
  balance: 2500,
  birthday: '1990-05-15',
  avatar: '🧑‍🍳',
  isEmoji: true
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
                <Link href="/" className="hover:text-burger-red transition-colors">Menu CRUD</Link>
              </nav>
            </div>
            <UserAvatar userInfo={mockUserInfo} />
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
        <footer className="border-t bg-white">
          <div className="mx-auto max-w-5xl px-4 py-3 text-xs text-neutral-500">
            Supabase CRUD demo. Create, edit, toggle availability, and delete menu items.
          </div>
        </footer>
      </body>
    </html>
  );
}

