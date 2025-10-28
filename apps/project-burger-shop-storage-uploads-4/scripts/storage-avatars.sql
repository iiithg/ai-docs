-- Storage setup for avatars with optional anonymous uploads
-- Run in Supabase SQL Editor (SQL is idempotent where feasible)

-- 1) Ensure bucket exists (via Dashboard → Storage recommended)
-- If you prefer SQL, use the RPC:
-- select storage.create_bucket('avatars', public := true);

-- 2) Policies
-- Everyone can read avatars (or use signed URLs and remove this)
drop policy if exists "avatars read all" on storage.objects;
create policy "avatars read all" on storage.objects
  for select using (bucket_id = 'avatars');

-- Authenticated users: only self folder writes (id/<file>)
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

-- Anonymous users: allow uploads only under guest/ prefix
drop policy if exists "avatars anon upload guest" on storage.objects;
create policy "avatars anon upload guest" on storage.objects
  for insert with check (
    bucket_id = 'avatars' and auth.role() = 'anon' and split_part(name,'/',1) = 'guest'
  );

-- Optional: if you set bucket to private, comment out read-all and use signed URLs from the client/server.

