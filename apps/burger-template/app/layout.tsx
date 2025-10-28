import "../styles/globals.css";
import Link from "next/link";
import type { Metadata } from "next";
import UserAvatar from "./components/UserAvatar";

export const metadata: Metadata = {
  title: "Burger Shop Template",
  description: "Next.js + Supabase starter in a burger-shop style"
};

// 模拟用户数据
const mockUserInfo = {
  name: "John Smith",
  balance: 2500, // $25.00
  birthday: "1990-05-15",
  avatar: "🧑‍🍳", // Default emoji avatar
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
                <Link href="/" className="hover:text-burger-red transition-colors">Shop</Link>
              </nav>
            </div>
            <UserAvatar userInfo={mockUserInfo} />
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
        <footer className="border-t bg-white">
          <div className="mx-auto max-w-5xl px-4 py-3 text-xs text-neutral-500">
            Next.js + Supabase template. Replace with your feature UI.
          </div>
        </footer>
      </body>
    </html>
  );
}
