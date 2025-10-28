"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Settings from "@/app/components/Settings";
import { createSupabaseClientFromSettings } from "@/lib/supabase/dynamic-client";

type User = { id: string; email?: string | null };
type Profile = { id: string; full_name: string | null; birthday: string | null; avatar_url: string | null };

export default function ProfilePage() {
  const [supabase, setSupabase] = useState<any>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
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
          .eq('id', u.id)
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
    setSelectedFile(null);
    setPreviewUrl("");
    setMessage("Signed out.");
  }

  function onFileChange(file?: File | null) {
    const f = file ?? fileInputRef.current?.files?.[0] ?? null;
    setSelectedFile(f || null);
    setMessage("");
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (f) setPreviewUrl(URL.createObjectURL(f));
    else setPreviewUrl("");
  }

  async function handleUpload() {
    if (!supabase) { setMessage('Configure Supabase first.'); return; }
    if (!selectedFile) { setMessage('Choose a file.'); return; }

    // basic validation
    const allowed = ['image/png','image/jpeg','image/gif','image/webp'];
    if (!allowed.includes(selectedFile.type)) { setMessage('Only PNG, JPG, GIF, WEBP'); return; }
    const maxBytes = 2 * 1024 * 1024; // 2 MB
    if (selectedFile.size > maxBytes) { setMessage('Max file size is 2 MB'); return; }

    setLoading(true);
    setMessage('Uploading...');
    try {
      const ext = (selectedFile.name.split('.').pop() || 'jpg').toLowerCase();
      const uuid = (typeof crypto !== 'undefined' && (crypto as any).randomUUID) ? (crypto as any).randomUUID() : Math.random().toString(36).slice(2);
      const path = user ? `${user.id}/avatar.${ext}` : `guest/${uuid}-avatar.${ext}`;

      const { error: upErr } = await supabase
        .storage
        .from('avatars')
        .upload(path, selectedFile, { upsert: true, cacheControl: '3600', contentType: selectedFile.type });
      if (upErr) throw upErr;

      const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path);
      const publicUrl = pub?.publicUrl || '';
      if (!publicUrl) throw new Error('Failed to get public URL');

      if (user) {
        const { error: updErr } = await supabase
          .from('profiles')
          .update({ avatar_url: publicUrl })
          .eq('id', user.id);
        if (updErr) throw updErr;
        setProfile((p)=> p ? { ...p, avatar_url: publicUrl } : p);
        setMessage('✅ Uploaded and profile updated.');
      } else {
        setMessage('✅ Uploaded anonymously. Copy the URL below.');
      }
      setLastUploadedUrl(publicUrl);
    } catch (err: any) {
      setMessage(err?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  }

  const supabaseConfigured = useMemo(() => !!supabase, [supabase]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Profile</h1>
        <Settings onSettingsChange={handleSettingsChange} defaultOpen />
      </div>

      {!supabaseConfigured && (
        <div className="p-4 rounded border bg-yellow-50 text-yellow-800">
          Configure Supabase first (click Settings) or set env.
        </div>
      )}

      {supabase && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-4 border rounded bg-white space-y-3">
            {user ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-neutral-500">Signed in as</div>
                    <div className="font-medium">{user.email || user.id}</div>
                  </div>
                  <button onClick={handleLogout} className="text-sm text-neutral-600 hover:text-neutral-900">Sign out</button>
                </div>
                <div className="h-px bg-neutral-200 my-2" />
                <div>
                  <div className="text-sm text-neutral-600 mb-2">Current avatar</div>
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="avatar" className="w-28 h-28 rounded-full object-cover border" />
                  ) : (
                    <div className="w-28 h-28 rounded-full bg-neutral-200 grid place-items-center text-neutral-500">none</div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="text-sm text-neutral-600">Anonymous mode: you can upload without signing in. Optionally sign in to save the URL to your profile.</div>
                <form onSubmit={handleLogin} className="space-y-3">
                  <div>
                    <label className="block text-sm mb-1">Email</label>
                    <input name="email" type="email" className="w-full rounded border px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Password</label>
                    <input name="password" type="password" className="w-full rounded border px-3 py-2" />
                  </div>
                  <button disabled={loading} className="px-4 py-2 bg-burger-red text-white rounded disabled:bg-neutral-300">{loading? 'Signing in...':'Sign In (optional)'}</button>
                </form>
              </>
            )}
          </div>

          <div className="p-4 border rounded bg-white space-y-3">
            <div className="font-medium">Upload new avatar {user ? '' : '(anonymous supported)'}</div>
            <input ref={fileInputRef} onChange={()=>onFileChange()} type="file" accept="image/*" />
            {previewUrl && (
              <div className="space-y-2">
                <div className="text-sm text-neutral-500">Preview</div>
                <img src={previewUrl} alt="preview" className="w-28 h-28 rounded-full object-cover border" />
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={handleUpload} disabled={loading || !selectedFile} className="px-4 py-2 bg-burger-red text-white rounded disabled:bg-neutral-300">
                {loading? 'Uploading...' : user ? 'Upload & Save to Profile' : 'Upload (anonymous)'}
              </button>
              <button onClick={()=>onFileChange(null)} className="px-4 py-2 text-neutral-600">Clear</button>
            </div>
            {message && <div className="text-sm text-neutral-700">{message}</div>}
            {lastUploadedUrl && (
              <div className="text-xs">
                <div className="text-neutral-500">File URL</div>
                <a href={lastUploadedUrl} target="_blank" className="text-blue-600 break-all">{lastUploadedUrl}</a>
              </div>
            )}
            <div className="text-xs text-neutral-500">Allowed: PNG/JPG/GIF/WEBP · Max 2 MB · Bucket: <code>avatars</code></div>
          </div>
        </div>
      )}
    </div>
  );
}
