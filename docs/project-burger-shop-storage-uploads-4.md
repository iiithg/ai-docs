# project-burger-shop-storage-uploads-4 — Avatars via Storage

Path: `apps/project-burger-shop-storage-uploads-4`

Upload a user avatar to the `avatars` bucket and save its URL to `public.profiles.avatar_url`. Includes optional anonymous uploads for guests.

## Pages
- `/profile` — sign in and upload avatar; shows preview and current profile value

## Environment
- Optional: `.env.local` → `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Or configure in-app via the Settings modal (opens by default)

## Storage and Policies
- Create bucket: `avatars`
- Preferred user path: `<user_id>/avatar.<ext>`
- Anonymous path: `guest/<uuid>-avatar.<ext>`

Example policies (see script below):
```sql
-- Everyone can read avatars (or switch to signed URLs only)
create policy if not exists "avatars read all" on storage.objects
  for select using (bucket_id = 'avatars');

-- Only the owner can write/update/delete files under their own folder
create policy if not exists "avatars write self" on storage.objects
  for insert with check (
    bucket_id = 'avatars' and split_part(name,'/',1) = auth.uid()::text
  );
create policy if not exists "avatars update self" on storage.objects
  for update using (
    bucket_id = 'avatars' and split_part(name,'/',1) = auth.uid()::text
  );
create policy if not exists "avatars delete self" on storage.objects
  for delete using (
    bucket_id = 'avatars' and split_part(name,'/',1) = auth.uid()::text
  );

-- Anonymous users may upload under the guest/ prefix
create policy if not exists "avatars anon upload guest" on storage.objects
  for insert with check (
    bucket_id = 'avatars' and auth.role() = 'anon' and split_part(name,'/',1) = 'guest'
  );
```

Script: `apps/project-burger-shop-storage-uploads-4/scripts/storage-avatars.sql`

## Frontend Flow
- Upload: `supabase.storage.from('avatars').upload(path, file, { upsert: true })`
- URL: use `getPublicUrl(path)` (or `createSignedUrl(path, seconds)` if you prefer signed URLs)
- Save: update `profiles.avatar_url` for logged-in users; guests get a public URL without profile updates

## Run
```bash
cd apps/project-burger-shop-storage-uploads-4
npm install
npm run dev
```
