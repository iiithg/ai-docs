-- Minimal INIT for Auth + Users (production)
-- How to run:
--   Option A (psql/CLI, recommended):
--     psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/init.sql
--   Option B (Supabase SQL Editor):
--     Open this file locally, copy all its contents, and paste+run in SQL Editor.
-- Notes:
--   - This script is idempotent where possible (drop-if-exists / create or replace / on conflict do nothing).
--   - If your project already has users in auth.users, a backfill step below will create missing rows in public.profiles.

-- Extensions
create extension if not exists pgcrypto;
create extension if not exists citext;

-- MENU (public data, read-all; admin-only writes)
create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  category text not null check (category in ('burger','side','drink')) default 'burger',
  price_cents integer not null,
  quantity integer not null default 0 check (quantity >= 0),
  available boolean not null default true,
  emoji text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.menu_items enable row level security;

-- Ensure newer columns exist when the table pre-exists from older demos
alter table public.menu_items
  add column if not exists quantity integer not null default 0 check (quantity >= 0);

-- PROFILES (private)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  birthday date,
  avatar_url text,
  wallet_cents integer not null default 0,
  welcome_claimed boolean not null default false,
  welcome_claimed_at timestamptz,
  role text not null check (role in ('user','admin')) default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

-- ORDERS (private)
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id uuid not null references public.menu_items(id) on delete restrict,
  price_cents integer not null,
  created_at timestamptz not null default now()
);
alter table public.orders enable row level security;

-- updated_at helper
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end; $$;

drop trigger if exists trg_menu_items_updated_at on public.menu_items;
create trigger trg_menu_items_updated_at before update on public.menu_items
for each row execute function public.set_updated_at();

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

-- RLS policies
-- menu_items: authenticated read; admin-only writes
drop policy if exists "menu read all" on public.menu_items;
drop policy if exists "menu read auth" on public.menu_items;
create policy "menu read auth" on public.menu_items for select to authenticated using (true);
drop policy if exists "menu admin insert" on public.menu_items;
create policy "menu admin insert" on public.menu_items for insert to authenticated with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);
drop policy if exists "menu admin update" on public.menu_items;
create policy "menu admin update" on public.menu_items for update to authenticated using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);
drop policy if exists "menu admin delete" on public.menu_items;
create policy "menu admin delete" on public.menu_items for delete to authenticated using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- profiles: self read/update
drop policy if exists "profiles self read" on public.profiles;
create policy "profiles self read" on public.profiles for select using (auth.uid() = id);
drop policy if exists "profiles self update" on public.profiles;
drop policy if exists "profiles self update safe" on public.profiles;
create policy "profiles self update safe" on public.profiles
for update to authenticated
using (auth.uid() = id)
with check (
  auth.uid() = id
  and role = (select role from public.profiles where id = auth.uid())
  and role = 'user'
  and wallet_cents = (select wallet_cents from public.profiles where id = auth.uid())
  and (welcome_claimed is not distinct from (select welcome_claimed from public.profiles where id = auth.uid()))
  and (welcome_claimed_at is not distinct from (select welcome_claimed_at from public.profiles where id = auth.uid()))
);

-- allow admins to update any profile fields
drop policy if exists "profiles admin update" on public.profiles;
create policy "profiles admin update" on public.profiles
for update to authenticated
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- orders: self read (inserts via RPC)
drop policy if exists "orders self read" on public.orders;
create policy "orders self read" on public.orders for select using (auth.uid() = user_id);

-- Signup trigger: auto-profile with randomized initial wallet
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_full_name text;
  v_birthday date;
  v_avatar_url text;
  v_role text := 'user';
begin
  -- Initialize wallet with 0; welcome bonus can be claimed once via RPC
  if lower(new.email) = lower('physicoada@gmail.com') then
    v_role := 'admin';
  end if;
  if new.raw_user_meta_data ? 'full_name' then v_full_name := new.raw_user_meta_data->>'full_name'; end if;
  if new.raw_user_meta_data ? 'birthday' then v_birthday := (new.raw_user_meta_data->>'birthday')::date; end if;
  if new.raw_user_meta_data ? 'avatar_url' then v_avatar_url := new.raw_user_meta_data->>'avatar_url'; end if;
  insert into public.profiles (id, full_name, birthday, avatar_url, wallet_cents, role)
  values (new.id, v_full_name, v_birthday, v_avatar_url, 0, v_role)
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

-- Backfill: create profiles for any existing auth.users that predate this init
insert into public.profiles (id, full_name, birthday, avatar_url, wallet_cents, role)
select
  u.id,
  null, null, null,
  0,
  case when lower(u.email) = lower('physicoada@gmail.com') then 'admin' else 'user' end
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;

-- Purchase RPC (atomic wallet deduction + order insert)
create or replace function public.buy_burger(p_item_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_user_id uuid := auth.uid();
  v_price integer; v_available boolean; v_qty integer; v_new_qty integer;
  v_order_id uuid; v_new_wallet integer;
begin
  if v_user_id is null then raise exception 'Not authenticated'; end if;

  select price_cents, available, quantity into v_price, v_available, v_qty
  from public.menu_items where id = p_item_id;

  if v_price is null then raise exception 'Item not found'; end if;
  if not v_available then raise exception 'Item not available'; end if;
  if v_qty is null or v_qty <= 0 then raise exception 'Out of stock'; end if;

  -- Decrement stock atomically; guard against concurrent oversell
  update public.menu_items
  set quantity = quantity - 1, updated_at = now()
  where id = p_item_id and quantity > 0
  returning quantity into v_new_qty;

  if v_new_qty is null then raise exception 'Out of stock'; end if;
  if v_new_qty = 0 then
    update public.menu_items set available = false, updated_at = now() where id = p_item_id;
  end if;

  -- Deduct wallet and create order
  update public.profiles set wallet_cents = wallet_cents - v_price, updated_at = now()
  where id = v_user_id and wallet_cents >= v_price
  returning wallet_cents into v_new_wallet;

  if v_new_wallet is null then raise exception 'Insufficient funds'; end if;

  insert into public.orders (user_id, item_id, price_cents)
  values (v_user_id, p_item_id, v_price)
  returning id into v_order_id;

  return jsonb_build_object('order_id', v_order_id, 'new_wallet_cents', v_new_wallet);
end; $$;

revoke all on function public.buy_burger(uuid) from public;
grant execute on function public.buy_burger(uuid) to authenticated;

-- One-time welcome bonus RPC
create or replace function public.claim_welcome_bonus(p_bonus_cents integer default 10000)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_user_id uuid := auth.uid();
  v_wallet integer;
begin
  if v_user_id is null then raise exception 'Not authenticated'; end if;
  -- only one chance per user
  update public.profiles
  set wallet_cents = wallet_cents + p_bonus_cents,
      welcome_claimed = true,
      welcome_claimed_at = now(),
      updated_at = now()
  where id = v_user_id and welcome_claimed = false
  returning wallet_cents into v_wallet;
  if v_wallet is null then raise exception 'Already claimed'; end if;
  return jsonb_build_object('new_wallet_cents', v_wallet, 'bonus_cents', p_bonus_cents);
end; $$;

revoke all on function public.claim_welcome_bonus(integer) from public;
grant execute on function public.claim_welcome_bonus(integer) to authenticated;

-- My purchases RPC (self-only; joins orders->menu_items)
create or replace function public.get_my_purchased_items()
returns table (
  order_id uuid,
  purchased_at timestamptz,
  item_id uuid,
  name text,
  description text,
  category text,
  price_cents integer,
  emoji text,
  quantity integer,
  available boolean
) language sql security definer set search_path = public as $$
  select o.id, o.created_at, mi.id, mi.name, mi.description, mi.category, o.price_cents, mi.emoji, mi.quantity, mi.available
  from public.orders o
  join public.menu_items mi on mi.id = o.item_id
  where o.user_id = auth.uid()
  order by o.created_at desc;
$$;

revoke all on function public.get_my_purchased_items() from public;
grant execute on function public.get_my_purchased_items() to authenticated;

-- Ensure required columns exist before seeding (safe for reruns)
alter table public.menu_items add column if not exists quantity integer not null default 0 check (quantity >= 0);

-- Sample seed (optional)
insert into public.menu_items (name, description, category, price_cents, quantity, available, emoji)
values
  -- Burgers
  ('Classic Burger', 'Fresh beef patty with lettuce, tomato, onion and special sauce', 'burger', 799, 20, true, '🍔'),
  ('Cheese Burger', 'Classic burger with double cheese slices', 'burger', 899, 18, true, '🧀'),
  ('Bacon Burger', 'Classic burger with crispy bacon strips', 'burger', 999, 15, true, '🥓'),
  ('Double Burger', 'Deluxe burger with double beef patties', 'burger', 1299, 12, true, '🍔🍔'),
  ('Chicken Burger', 'Tender chicken breast with special spices', 'burger', 849, 16, true, '🐔'),
  ('Veggie Burger', 'Plant-based patty with fresh vegetables', 'burger', 749, 14, true, '🥬'),

  -- Sides
  ('French Fries', 'Golden crispy french fries', 'side', 349, 40, true, '🍟'),
  ('Onion Rings', 'Crispy onion rings with dipping sauce', 'side', 399, 25, true, '🧅'),
  ('Chicken Nuggets', '6 pieces of crispy chicken nuggets', 'side', 449, 30, true, '🍗'),
  ('Garden Salad', 'Fresh vegetable salad with dressing', 'side', 299, 22, true, '🥗'),
  ('Cheese Fries', 'French fries with melted cheese sauce', 'side', 449, 28, true, '🧀🍟'),

  -- Drinks
  ('Coca Cola', 'Classic Coca Cola', 'drink', 199, 50, true, '🥤'),
  ('Sprite', 'Refreshing lemon-lime soda', 'drink', 199, 45, true, '🍋'),
  ('Orange Juice', '100% pure orange juice', 'drink', 249, 35, true, '🍊'),
  ('Milkshake', 'Vanilla milkshake', 'drink', 399, 20, true, '🥛'),
  ('Coffee', 'Freshly brewed americano', 'drink', 299, 30, true, '☕'),
  ('Tea', 'Premium black tea', 'drink', 199, 30, true, '🍵')
on conflict do nothing;

select 'auth-users init complete' as status;
