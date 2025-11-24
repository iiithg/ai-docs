import { serverComponentClient } from '@/lib/supabase/server';
import Link from 'next/link';
import EntryClientFallback from './ClientFallback';
import SignOutRow from '../components/SignOutRow';

export default async function EntryPage() {
  const supabase = serverComponentClient();
  if (!supabase) {
    return (
      <div className="mx-auto max-w-lg">
        <h1 className="text-2xl font-bold mb-2">Entry</h1>
        <p className="text-neutral-600 mb-4">Visible after sign-in.</p>
        <EntryClientFallback />
        <SignOutRow />
      </div>
    );
  }

  const { data: { user } } = await supabase.auth.getUser();
  let displayName: string | null = null;
  let emailForUser: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', user.id)
      .maybeSingle();
    const meta = user.user_metadata as { name?: string } | null;
    displayName = profile?.name || meta?.name || user.email || null;
    emailForUser = user.email ?? null;
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-bold mb-2">Entry</h1>
      <p className="text-neutral-600 mb-4">Visible after sign-in.</p>

      {user && (
        <div className="rounded border bg-white p-4">
          <div className="font-semibold">Welcome, your name is {displayName}</div>
          <div className="text-sm text-neutral-600 mt-1">id: {user.id}</div>
          {emailForUser && <div className="text-sm text-neutral-600">email: {emailForUser}</div>}
        </div>
      )}

      {!user && <EntryClientFallback />}
      <SignOutRow />

      <div className="mt-4">
        <Link className="text-burger-red" href="/auth/login">← Back to Login</Link>
      </div>
    </div>
  );
}
