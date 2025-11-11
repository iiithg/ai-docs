import Link from 'next/link';
import { currentUser } from '@clerk/nextjs/server';
import ClerkClientInfo from './ClerkClientInfo';
import TasksWithClerk from './TasksWithClerk';
import SignOutRow from '../components/SignOutRow';

export default async function EntryPage() {
  const clerkUser = await currentUser().catch(() => null);

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-bold mb-2">进入页面</h1>
      <p className="text-neutral-600 mb-4">登录成功后可见。</p>

      {clerkUser ? (
        <div className="rounded border bg-white p-4">
          <div className="font-semibold">恭喜你加入，您的名字是 {clerkUser?.firstName ?? clerkUser?.emailAddresses?.[0]?.emailAddress}</div>
          <div className="text-sm text-neutral-600 mt-1">email: {clerkUser?.primaryEmailAddress?.emailAddress}</div>
          <div className="text-xs text-neutral-500 mt-1">通过 Clerk 登录</div>
        </div>
      ) : (
        <div className="rounded border bg-yellow-50 text-yellow-800 p-3 text-sm">未登录，请先登录</div>
      )}

      {/* Clerk 客户端信息与基于 Clerk JWT 的 Supabase 访问示例（可选） */}
      <ClerkClientInfo />
      <TasksWithClerk />
      <SignOutRow />

      <div className="mt-4">
        <Link className="text-burger-red" href="/clerk/login">← 返回登录</Link>
      </div>
    </div>
  );
}
