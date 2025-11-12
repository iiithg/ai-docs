import Link from 'next/link';
import { currentUser } from '@clerk/nextjs/server';
import ClerkClientInfo from './ClerkClientInfo';
import TasksWithClerk from './TasksWithClerk';
import SignOutRow from '../components/SignOutRow';

export default async function EntryPage() {
  const clerkUser = await currentUser().catch(() => null);

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-bold mb-2">Entry</h1>
      <p className="text-neutral-600 mb-4">Visible after successful login.</p>

      {clerkUser ? (
        <div className="rounded border bg-white p-4">
          <div className="font-semibold">Welcome, your name is {clerkUser?.firstName ?? clerkUser?.emailAddresses?.[0]?.emailAddress}</div>
          <div className="text-sm text-neutral-600 mt-1">email: {clerkUser?.primaryEmailAddress?.emailAddress}</div>
          <div className="text-xs text-neutral-500 mt-1">Signed in via Clerk</div>
        </div>
      ) : (
        <div className="rounded border bg-yellow-50 text-yellow-800 p-3 text-sm">Not logged in, please login first</div>
      )}

      {/* Clerk client info with Clerk JWT-based Supabase access example (optional) */}
      <ClerkClientInfo />
      <TasksWithClerk />
      <SignOutRow />

      <div className="mt-4">
        <Link className="text-burger-red" href="/clerk/login">← Back to login</Link>
      </div>
    </div>
  );
}
