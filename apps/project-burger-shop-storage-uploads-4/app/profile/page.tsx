"use client";
import { useEffect, useState } from "react";
import Settings from "@/app/components/Settings";
import { createSupabaseClientFromSettings } from "@/lib/supabase/dynamic-client";
import UppyUpload from "@/app/components/UppyUpload";

type User = { id: string; email?: string | null };
type Profile = { id: string; full_name: string | null; birthday: string | null; avatar_url: string | null };

export default function ProfilePage() {
  const [supabase, setSupabase] = useState<any>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [lastUploadedUrl, setLastUploadedUrl] = useState<string>("");

  // init client
  useEffect(() => {
    const client = createSupabaseClientFromSettings();
    setSupabase(client);
  }, []);

  // load session and profile
  useEffect(() => {
    if (!supabase) return;
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const u = sessionData?.session?.user || null;
      setUser(u ? { id: u.id, email: u.email } : null);
      if (u) {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, birthday, avatar_url')
          .eq('user_id', u.id)
          .maybeSingle();
        if (error) setMessage(error.message);
        else setProfile(data);
      } else {
        setProfile(null);
      }
    })();
  }, [supabase]);

  function handleSettingsChange() {
    const client = createSupabaseClientFromSettings();
    setSupabase(client);
    setMessage("");
  }

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!supabase) return;
    const form = e.currentTarget as HTMLFormElement;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    setMessage("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { setMessage(error.message); return; }
    // refresh
    const { data: sessionData } = await supabase.auth.getSession();
    const u = sessionData?.session?.user || null;
    setUser(u ? { id: u.id, email: u.email } : null);
  }

  async function handleLogout() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setMessage("Signed out.");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Profile</h1>
          <p className="text-sm text-neutral-500">Upload an avatar and we’ll remember it.</p>
        </div>
        <Settings onSettingsChange={handleSettingsChange} />
      </div>

      {!supabase ? (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto space-y-4">
            <div className="text-6xl">🔧</div>
            <h2 className="text-xl font-semibold text-gray-700">Supabase configuration required</h2>
            <p className="text-gray-600">
              Click the Settings button (top-right) to add your Supabase URL and anon key, then you can start uploading avatars.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 border rounded-lg bg-white space-y-4">
          {user ? (
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <div className="text-xs text-neutral-500">Signed in as</div>
                <div className="font-medium truncate">{user.email || user.id}</div>
              </div>
              <button onClick={handleLogout} className="text-sm text-neutral-600 hover:text-neutral-900">Sign out</button>
            </div>
          ) : (
            <div className="text-xs p-2 rounded border bg-yellow-50 text-yellow-800">Not signed in — anonymous uploads allowed.</div>
          )}

          {/* Removed the inline current-avatar preview section per request */}

          <div className="space-y-3">
            <div className="font-medium">Upload avatar</div>
            <UppyUpload 
              supabase={supabase}
              user={user}
              hideTitle
              showDetailsOnSuccess={false}
              onUploadSuccess={(url) => {
                setLastUploadedUrl(url);
                setMessage('Upload successful!');
                if (user && supabase) {
                  supabase
                    .from('profiles')
                    .select('id, full_name, birthday, avatar_url')
                    .eq('user_id', user.id)
                    .maybeSingle()
                    .then(({ data, error }: { data: any; error: any }) => {
                      if (!error && data) setProfile(data);
                    });
                }
              }}
              onUploadError={(error) => {
                setMessage(`Upload failed: ${error}`);
              }}
            />
            {message && <div className="text-sm text-neutral-700">{message}</div>}
            <div className="text-xs text-neutral-500">Resumable uploads with TUS protocol · Max 2 MB · Bucket: <code>avatars</code></div>
          </div>
        </div>
      )}
    </div>
  );
}
