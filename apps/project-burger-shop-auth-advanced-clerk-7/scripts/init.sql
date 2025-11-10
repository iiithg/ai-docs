-- This SQL script sets up an advanced auth schema for Supabase:
-- 1. Creates a public.profiles table linked to auth.users with name & optional_info fields.
-- 2. Adds an updated_at trigger and indexes for performance.
-- 3. Enables Row Level Security (RLS) so users can only read/insert/update their own profile row.
-- 4. Automatically inserts a profile row when a new auth.user is created, copying metadata.
-- 5. Optionally integrates Clerk by adding clerk_user_id column and additional RLS policies
--    that allow access via Clerk JWT tokens (auth.jwt()->>'sub').
-- 6. Includes a demo public.tasks table with Clerk-token RLS for testing Clerk integration.
-- Run in Supabase SQL editor or psql connected to your project.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  optional_info text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists profiles_id_idx on public.profiles(id);

-- Updated at trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;$$ language plpgsql;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

-- RLS policies: users can manage their own row
alter table public.profiles enable row level security;

drop policy if exists "Profiles select own" on public.profiles;
create policy "Profiles select own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "Profiles insert self" on public.profiles;
create policy "Profiles insert self" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "Profiles update own" on public.profiles;
create policy "Profiles update own" on public.profiles
  for update using (auth.uid() = id);

-- Optional: copy user_metadata into profiles on new user
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, optional_info)
  values (new.id,
          coalesce(new.raw_user_meta_data->>'name', ''),
          coalesce(new.raw_user_meta_data->>'optional_info', ''))
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- === Clerk integration (optional) ===
-- Add a column to map Clerk user id (JWT sub) to profiles
alter table public.profiles
  add column if not exists clerk_user_id text;

-- Helpful index if you frequently look up by Clerk user id
create index if not exists profiles_clerk_user_id_idx
  on public.profiles(clerk_user_id);

-- Additional RLS policies to allow access via Clerk session tokens (auth.jwt())
-- These policies coexist with the existing auth.uid()-based policies above.

drop policy if exists "Profiles select via Clerk" on public.profiles;
create policy "Profiles select via Clerk" on public.profiles
  for select to authenticated
  using (coalesce(clerk_user_id, '') = coalesce((select auth.jwt()->>'sub'), ''));

drop policy if exists "Profiles insert via Clerk" on public.profiles;
create policy "Profiles insert via Clerk" on public.profiles
  for insert to authenticated
  with check (coalesce(clerk_user_id, '') = coalesce((select auth.jwt()->>'sub'), ''));

drop policy if exists "Profiles update via Clerk" on public.profiles;
create policy "Profiles update via Clerk" on public.profiles
  for update to authenticated
  using (coalesce(clerk_user_id, '') = coalesce((select auth.jwt()->>'sub'), ''));

-- Simple demo table for Clerk-token RLS (used by TasksWithClerk client)
create table if not exists public.tasks (
  id bigserial primary key,
  name text not null,
  clerk_user_id text not null,
  created_at timestamptz not null default now()
);

alter table public.tasks enable row level security;

drop policy if exists "Tasks select own (Clerk)" on public.tasks;
create policy "Tasks select own (Clerk)" on public.tasks
  for select to authenticated
  using (clerk_user_id = (select auth.jwt()->>'sub'));

drop policy if exists "Tasks insert own (Clerk)" on public.tasks;
create policy "Tasks insert own (Clerk)" on public.tasks
  for insert to authenticated
  with check (clerk_user_id = (select auth.jwt()->>'sub'));
