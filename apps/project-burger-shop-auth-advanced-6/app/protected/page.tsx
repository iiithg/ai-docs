import { serverComponentClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function ProtectedPage() {
  const supabase = serverComponentClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-bold mb-2">Protected</h1>
      <p className="text-neutral-600 mb-4">Only visible when signed in via OAuth or existing session.</p>

      {user ? (
        <div className="rounded border bg-white p-4">
          <div className="font-semibold">You are signed in</div>
          <div className="text-sm text-neutral-700">id: {user.id}</div>
          <div className="text-sm text-neutral-700">email: {user.email}</div>
          <div className="text-sm text-neutral-700">provider: {user.app_metadata?.provider}</div>
        </div>
      ) : (
        <div className="rounded border bg-yellow-50 text-yellow-800 p-3 text-sm">No session</div>
      )}

      <div className="mt-4">
        <Link className="text-burger-red" href="/auth/login">← Back to login</Link>
      </div>
    </div>
  );
}

