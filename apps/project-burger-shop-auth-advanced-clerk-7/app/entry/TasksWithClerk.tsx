"use client";
import { useEffect, useState, useContext } from 'react';
import { useUser } from '@clerk/nextjs';
import { useSupabaseWithClerk } from '@/lib/supabase/client.clerk';
import { ClerkConfigContext } from '@/app/ClerkRootProvider';

type Task = { id: number; name: string; clerk_user_id: string; created_at: string };

// Safe wrapper component that handles ClerkProvider context
function TasksWithClerkSafe() {
  const { user } = useUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [supabase, setSupabase] = useState<any>(null);
  const [supabaseConfigured, setSupabaseConfigured] = useState(false);

  useEffect(() => {
    try {
      const client = useSupabaseWithClerk();
      setSupabase(client);
      setSupabaseConfigured(true);
    } catch (error) {
      setSupabaseConfigured(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!supabaseConfigured || !supabase) return;
    
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
  }, [user, supabase, supabaseConfigured]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase || !supabaseConfigured) return;
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

  if (!supabaseConfigured) {
    return (
      <div className="mt-6 rounded border bg-white p-4">
        <div className="font-semibold mb-2">Tasks (Clerk token → Supabase RLS)</div>
        <div className="text-sm text-neutral-600">Supabase not configured, please configure Supabase URL and Key in ⚙️ Settings above</div>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded border bg-white p-4">
      <div className="font-semibold mb-2">Tasks (Clerk token → Supabase RLS)</div>
      {err && <div className="mb-2 rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700">{err}</div>}
      {loading ? (
        <div className="text-sm text-neutral-600">Loading...</div>
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

// Main component that checks for ClerkProvider context
export default function TasksWithClerk() {
  // 使用ClerkConfigContext来获取配置状态，而不是错误地在useEffect中调用useAuth
  const { clerkConfigured, refreshConfig } = useContext(ClerkConfigContext);

  // 当用户点击设置按钮并保存后，我们可以在这里增加一个手动刷新的机制
  // 但通常监听localStorage变化的逻辑已经足够

  if (!clerkConfigured) {
    return (
      <div className="mt-6 rounded border bg-white p-4">
        <div className="font-semibold mb-2">Tasks (Clerk token → Supabase RLS)</div>
        <div className="text-sm text-neutral-600">Clerk not configured, please configure Clerk Publishable Key in ⚙️ Settings above</div>
        <button 
          onClick={refreshConfig}
          className="mt-2 px-3 py-1 text-xs bg-neutral-100 hover:bg-neutral-200 rounded"
        >
          刷新配置
        </button>
      </div>
    );
  }

  return <TasksWithClerkSafe />;
}

