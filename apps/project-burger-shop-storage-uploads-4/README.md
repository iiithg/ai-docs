# project-burger-shop-storage-uploads-4

Single‑file demo for uploading and rendering menu item photos via Supabase Storage.

## Start From Template
- Copy `apps/burger-template` or reuse its structure.
- Ensure `.env.local` has `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Run
- `npm install`
- `npm run dev`
- Implement upload/list UI in `app/demo/page.tsx` using `supabase.storage.from('menu-photos')`.

## Storage and SQL
- Create bucket `menu-photos` in Supabase Storage.
```sql
create table if not exists public.menu_photos (
  id uuid primary key default gen_random_uuid(),
  item_id uuid references public.menu_items(id) on delete cascade,
  path text not null,
  created_at timestamp with time zone default now()
);
alter table public.menu_photos enable row level security;
create policy "menu_photos owner" on public.menu_photos for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
```

## Next Steps
- Compare signed URL vs public bucket; show thumbnail grid.

