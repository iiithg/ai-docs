import Link from 'next/link';

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl p-4">
      <h1 className="text-2xl font-bold">🍔 Realtime Chat Demo</h1>
      <p className="mt-2 text-neutral-600">Join a multi-user chat with live messages and mouse cursors.</p>
      <div className="mt-4">
        <Link href="/chat" className="rounded bg-burger-red text-white px-3 py-2 text-sm">Go to /chat</Link>
      </div>
      <div className="mt-8 text-sm text-neutral-500">
        In Supabase SQL Editor, run <code>scripts/init-chat.sql</code> to create <code>chat_messages</code> and RLS.
      </div>
    </div>
  );
}
