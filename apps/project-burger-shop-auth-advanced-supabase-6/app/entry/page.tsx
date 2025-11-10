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
        <p className="text-neutral-600 mb-4">登录成功后可见。</p>
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
      .eq('user_id', user.id)
      .maybeSingle();
    displayName = profile?.name || (user.user_metadata as any)?.name || user.email || null;
    emailForUser = user.email ?? null;
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-bold mb-2">Entry</h1>
      <p className="text-neutral-600 mb-4">登录成功后可见。</p>

      {user ? (
        <div className="rounded border bg-white p-4">
          <div className="font-semibold">恭喜你加入，您的名字是 {displayName}</div>
          <div className="text-sm text-neutral-600 mt-1">id: {user.id}</div>
          {emailForUser && <div className="text-sm text-neutral-600">email: {emailForUser}</div>}
        </div>
      ) : (
        <div className="rounded border bg-yellow-50 text-yellow-800 p-3 text-sm">未登录，请先登录</div>
      )}

      <EntryClientFallback />
      <SignOutRow />

      <div className="mt-4">
        <Link className="text-burger-red" href="/auth/login">← 返回登录</Link>
      </div>
    </div>
  );
}
