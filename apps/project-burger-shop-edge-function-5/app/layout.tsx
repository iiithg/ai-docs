import "../styles/globals.css";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Burger Shop — AI & Email (Edge Functions)',
  description: 'OpenAI‑compatible chat, send emails, and text‑to‑image',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-50 text-neutral-800">
        <header className="border-b bg-white">
          <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="font-bold text-burger-red">🍔 Burger Shop</div>
              <nav className="text-sm text-neutral-600 flex gap-4 flex-wrap">
                <Link href="/" className="hover:text-burger-red transition-colors">Home</Link>
                <Link href="/llm-chat" className="hover:text-burger-red transition-colors">LLM Chat</Link>
                <Link href="/email" className="hover:text-burger-red transition-colors">Send Emails</Link>
                <Link href="/txt2img" className="hover:text-burger-red transition-colors">Text→Image</Link>
              </nav>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
        <footer className="border-t bg-white">
          <div className="mx-auto max-w-5xl px-4 py-3 text-xs text-neutral-500">
            Uses Supabase Edge Functions at /functions/v1/*
          </div>
        </footer>
      </body>
    </html>
  );
}
