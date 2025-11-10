"use client";
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useSupabaseWithClerk } from '@/lib/supabase/client.clerk';

type Task = { id: number; name: string; clerk_user_id: string; created_at: string };

export default function TasksWithClerk() {
  const supabase = useSupabaseWithClerk();
  const { user } = useUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const sub = user?.id;
    if (!sub) return;
    let aborted = false;
    async function load(id: string) {
      setLoading(true); setErr(null);
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('clerk_user_id', id)
        .order('created_at', { ascending: false });
      if (!aborted) {
        if (error) setErr(error.message); else setTasks((data as Task[])||[]);
        setLoading(false);
      }
    }
    load(sub);
    return () => { aborted = true; };
  }, [user]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    const sub = user?.id;
    if (!sub || !name.trim()) return;
    setErr(null);
    const { error } = await supabase.from('tasks').insert({ name: name.trim(), clerk_user_id: sub });
    if (error) { setErr(error.message); return; }
    setName('');
    // reload
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('clerk_user_id', sub)
      .order('created_at', { ascending: false });
    setTasks((data as Task[])||[]);
  }

  return (
    <div className="mt-6 rounded border bg-white p-4">
      <div className="font-semibold mb-2">Tasks (Clerk token → Supabase RLS)</div>
      {err && <div className="mb-2 rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700">{err}</div>}
      {loading ? (
        <div className="text-sm text-neutral-600">Loading…</div>
      ) : (
        <>
          {tasks.length === 0 ? (
            <div className="text-sm text-neutral-600">No tasks</div>
          ) : (
            <ul className="text-sm list-disc pl-5 space-y-1">
              {tasks.map(t => (
                <li key={t.id}>{t.name} <span className="text-neutral-400">· {new Date(t.created_at).toLocaleString()}</span></li>
              ))}
            </ul>
          )}
          <form onSubmit={onCreate} className="mt-3 flex gap-2">
            <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="New task" className="flex-1 px-3 py-2 border rounded" />
            <button className="px-3 py-2 rounded bg-neutral-900 text-white">Add</button>
          </form>
        </>
      )}
    </div>
  );
}

