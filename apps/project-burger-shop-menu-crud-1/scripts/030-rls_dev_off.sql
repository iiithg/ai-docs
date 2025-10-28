-- Disable Row Level Security for development
-- WARNING: This allows unrestricted access to all data
-- Only use this during development and testing

-- Disable RLS on menu_items table
alter table public.menu_items disable row level security;

-- Disable RLS on promo_codes table  
alter table public.promo_codes disable row level security;

-- Comments
comment on table public.menu_items is 'RLS DISABLED - Development mode only';
comment on table public.promo_codes is 'RLS DISABLED - Development mode only';