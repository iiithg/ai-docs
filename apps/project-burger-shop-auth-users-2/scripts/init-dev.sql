-- Minimal INIT for Auth + Users (development)
-- Same as init.sql, but disables RLS on menu_items for quick testing

\i init.sql

alter table public.menu_items disable row level security;

select 'auth-users DEV init complete (menu_items RLS disabled)' as status;

