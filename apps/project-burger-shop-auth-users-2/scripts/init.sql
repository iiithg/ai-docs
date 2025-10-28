-- Minimal INIT for Auth + Users (production)
-- Run this in Supabase SQL Editor for this app only.

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

-- PROFILES (private)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  birthday date,
  avatar_url text,
  wallet_cents integer not null default 0,
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
-- menu_items: read-all; admin-only writes
drop policy if exists "menu read all" on public.menu_items;
create policy "menu read all" on public.menu_items for select using (true);
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
create policy "profiles self update" on public.profiles for update using (auth.uid() = id);

-- orders: self read (inserts via RPC)
drop policy if exists "orders self read" on public.orders;
create policy "orders self read" on public.orders for select using (auth.uid() = user_id);

-- Signup trigger: auto-profile with randomized initial wallet
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_initial integer;
  v_full_name text;
  v_birthday date;
  v_avatar_url text;
begin
  v_initial := (5000 + floor(random() * 30000))::int; -- 50.00 to ~349.99 (cents)
  if new.raw_user_meta_data ? 'full_name' then v_full_name := new.raw_user_meta_data->>'full_name'; end if;
  if new.raw_user_meta_data ? 'birthday' then v_birthday := (new.raw_user_meta_data->>'birthday')::date; end if;
  if new.raw_user_meta_data ? 'avatar_url' then v_avatar_url := new.raw_user_meta_data->>'avatar_url'; end if;
  insert into public.profiles (id, full_name, birthday, avatar_url, wallet_cents)
  values (new.id, v_full_name, v_birthday, v_avatar_url, v_initial)
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

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

-- Sample seed (optional)
insert into public.menu_items (name, description, category, price_cents, quantity, available, emoji)
values
('Classic Burger','Beef patty, lettuce, tomato','burger',899,10,true,'🍔'),
('Fries','Golden and crispy','side',349,20,true,'🍟'),
('Cola','Chilled can','drink',199,30,true,'🥤')
on conflict do nothing;

select 'auth-users init complete' as status;
