# project-burger-shop-storage-uploads-4 — Avatars via Storage

Upload a user avatar to Supabase Storage (`avatars` bucket) and save the file URL to `public.profiles.avatar_url`. Minimal, single‑feature demo.

Routes
- `/profile` — sign in and upload avatar; shows preview and current profile value

Start From Template
- Based on `apps/burger-template` structure and styling
- Runtime settings modal (⚙️) lets you paste Supabase URL and anon key; or set `.env.local`

Run
```bash
cd apps/project-burger-shop-storage-uploads-4
npm install
npm run dev
```

Environment
- Copy `.env.example` → `.env.local` (optional if you’ll use the in‑app settings)
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Storage and Policies
- Create bucket: `avatars`
- Recommended path: `<user_id>/avatar.<ext>`
```sql
-- Everyone can read avatars (or switch to signed URLs only)
drop policy if exists "avatars read all" on storage.objects;
create policy "avatars read all" on storage.objects
  for select using (bucket_id = 'avatars');

-- Only the owner can write/update/delete files under their own folder
drop policy if exists "avatars write self" on storage.objects;
create policy "avatars write self" on storage.objects
  for insert with check (
    bucket_id = 'avatars' and split_part(name,'/',1) = auth.uid()::text
  );
drop policy if exists "avatars update self" on storage.objects;
create policy "avatars update self" on storage.objects
  for update using (
    bucket_id = 'avatars' and split_part(name,'/',1) = auth.uid()::text
  );
drop policy if exists "avatars delete self" on storage.objects;
create policy "avatars delete self" on storage.objects
  for delete using (
    bucket_id = 'avatars' and split_part(name,'/',1) = auth.uid()::text
  );

-- Anonymous users can upload under guest/ prefix
drop policy if exists "avatars anon upload guest" on storage.objects;
create policy "avatars anon upload guest" on storage.objects
  for insert with check (
    bucket_id = 'avatars' and auth.role() = 'anon' and split_part(name,'/',1) = 'guest'
  );
```

Profile Update
- After upload, the app computes a public URL and updates `profiles.avatar_url` for the current user.
 - Anonymous users upload to `avatars/guest/<uuid>-avatar.<ext>` and get a public URL without updating profiles.

Notes
- Max upload size is limited in‑UI (default 2 MB) and by your project settings.
- If you prefer signed URLs, switch the code to `createSignedUrl(path, seconds)` and store that instead (or store `path` and sign at runtime on the server).

SQL Scripts
- See `apps/project-burger-shop-storage-uploads-4/scripts/storage-avatars.sql` for a ready-to-run set of policies (read-all, self-write, and anon guest upload). Apply in the SQL Editor.
