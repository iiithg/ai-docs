-- ============================================================================
-- Snake Game Supabase Database Initialization Script
-- ============================================================================
-- This script creates the necessary tables, policies, and triggers for:
-- 1. User profiles with username and email
-- 2. Game leaderboard with scores
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Drop existing objects (optional - comment out if you want to keep existing data)
-- DROP TABLE IF EXISTS public.leaderboard CASCADE;
-- DROP TABLE IF EXISTS public.profiles CASCADE;
-- DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- ============================================================================
-- 1. Create profiles table
-- ============================================================================

create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  username text unique not null,
  email text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  constraint username_length check (char_length(username) >= 3),
  constraint username_format check (username ~* '^[A-Za-z0-9_]{3,24}$')
);

-- ============================================================================
-- 2. Enable Row Level Security on profiles
-- ============================================================================

alter table public.profiles enable row level security;

-- Allow everyone to view profiles (for leaderboard display)
create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);

-- Users can only insert their own profile
create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- Users can only update their own profile
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- ============================================================================
-- 3. Create leaderboard table
-- ============================================================================

create table if not exists public.leaderboard (
  id uuid default gen_random_uuid() not null primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  username text not null,
  score bigint not null,
  snake_length integer default 1,
  game_duration integer,  -- Duration in seconds
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================================================
-- 4. Enable Row Level Security on leaderboard
-- ============================================================================

alter table public.leaderboard enable row level security;

-- Allow everyone to view the leaderboard
create policy "Leaderboard is viewable by everyone"
  on public.leaderboard for select using (true);

-- Authenticated users can insert their own scores
create policy "Users can insert their own scores"
  on public.leaderboard for insert with check (auth.uid() = user_id);

-- Users can only update their own scores (e.g., to update game duration)
create policy "Users can update their own scores"
  on public.leaderboard for update using (auth.uid() = user_id);

-- ============================================================================
-- 5. Create indexes for optimal query performance
-- ============================================================================

-- Index for leaderboard ranking queries (ORDER BY score DESC)
create index if not exists idx_leaderboard_score 
  on public.leaderboard(score desc);

-- Index for user-specific queries
create index if not exists idx_leaderboard_user_id 
  on public.leaderboard(user_id);

-- Index for recent scores queries
create index if not exists idx_leaderboard_created_at 
  on public.leaderboard(created_at desc);

-- Index for fetching user's high score
create index if not exists idx_leaderboard_user_score 
  on public.leaderboard(user_id, score desc);

-- ============================================================================
-- 6. Create trigger function to auto-create profile on user signup
-- ============================================================================

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username, email)
  values (
    new.id, 
    coalesce(
      new.raw_user_meta_data->>'username',
      new.raw_user_meta_data->>'full_name',
      'user_' || left(new.id::text, 8)
    ),
    new.email
  );
  return new;
end;
$$;

-- ============================================================================
-- 7. Create trigger on auth.users
-- ============================================================================

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================================
-- 8. Optional: Create a view for easy leaderboard ranking
-- ============================================================================

create or replace view public.leaderboard_view as
select 
  row_number() over (order by score desc) as rank,
  user_id,
  username,
  score,
  snake_length,
  game_duration,
  created_at
from public.leaderboard;

-- ============================================================================
-- 9. Optional: Create a function to get user's rank
-- ============================================================================

create or replace function public.get_user_rank(target_user_id uuid)
returns integer language plpgsql as $$
declare
  user_rank integer;
begin
  select count(*) + 1 into user_rank
  from public.leaderboard
  where user_id != target_user_id
    and score > coalesce(
      (select max(score) from public.leaderboard where user_id = target_user_id),
      0
    );
  return user_rank;
end;
$$;

-- ============================================================================
-- 10. Optional: Create a function to get user's high score
-- ============================================================================

create or replace function public.get_user_high_score(target_user_id uuid)
returns bigint language sql as $$
  select max(score) from public.leaderboard where user_id = target_user_id;
$$;

-- ============================================================================
-- 11. Enable realtime for leaderboard (optional - for live updates)
-- ============================================================================

begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;

alter publication supabase_realtime add table public.leaderboard;
alter publication supabase_realtime add table public.profiles;

-- ============================================================================
-- 12. Add comments for documentation
-- ============================================================================

comment on table public.profiles is 'User profiles for the Snake Game - stores username, email, and avatar';
comment on table public.leaderboard is 'Game scores and leaderboard records for the Snake Game';
comment on view public.leaderboard_view is 'Leaderboard with rank column for easy display';
comment on function public.handle_new_user() is 'Trigger function to create profile when user signs up';
comment on function public.get_user_rank(uuid) is 'Returns the current rank of a user';
comment on function public.get_user_high_score(uuid) is 'Returns the highest score of a user';

-- ============================================================================
-- 13. Create function to get leaderboard with unique users (highest score only)
-- ============================================================================

create or replace function public.get_leaderboard(limit_count int default 50)
returns table (
  id uuid,
  user_id uuid,
  username text,
  score bigint,
  snake_length int,
  game_duration int,
  created_at timestamp with time zone,
  email text
)
language sql
as $$
  with ranked_scores as (
    select
      l.id,
      l.user_id,
      l.username,
      l.score,
      l.snake_length,
      l.game_duration,
      l.created_at,
      p.email,
      row_number() over (partition by l.user_id order by l.score desc) as rn
    from public.leaderboard l
    left join public.profiles p on l.user_id = p.id
  )
  select
    id,
    user_id,
    username,
    score,
    snake_length,
    game_duration,
    created_at,
    email
  from ranked_scores
  where rn = 1
  order by score desc
  limit limit_count;
$$;

comment on function public.get_leaderboard(int) is 'Returns leaderboard with each users highest score only';

-- ============================================================================
-- 14. Create view for leaderboard with rank column
-- ============================================================================

create or replace view public.leaderboard_unique as
select
  row_number() over (order by score desc) as rank,
  user_id,
  username,
  score,
  snake_length,
  game_duration,
  created_at,
  email
from public.get_leaderboard(100);

-- ============================================================================
-- Usage Examples (uncomment to run):
-- ============================================================================
--
-- -- Get top 10 players (unique users with highest score)
-- select * from public.get_leaderboard(10);
--
-- -- Get leaderboard view with ranks
-- select * from public.leaderboard_unique limit 10;
--
-- -- Get specific user's rank
-- select public.get_user_rank('user-uuid-here');
--
-- -- Get user's high score
-- select public.get_user_high_score('user-uuid-here');
--
-- ============================================================================
