# Database Scripts — Auth Users (app 2)

This folder holds SQL for the Auth + Profiles + Wallet + Stock demo.

File in this folder
- `init.sql` — One-shot initialization (extensions, tables, RLS, triggers, RPCs, seeds)

What `init.sql` does
- Extensions: `pgcrypto`, `citext`
- Tables
  - `public.menu_items`: price in cents, `quantity integer not null default 0 check (quantity>=0)`, `available`
  - `public.profiles`: `full_name`, `birthday`, `avatar_url`, `wallet_cents`, `welcome_claimed`, `welcome_claimed_at`, `role ('user'|'admin')`
  - `public.orders`
- Triggers
  - `handle_new_user()`: on signup creates `profiles` with wallet=0; if `email='physicoada@gmail.com'` then `role='admin'`
- RPCs (SECURITY DEFINER)
  - `buy_burger(p_item_id uuid)`: checks available and stock, decrements `quantity` atomically; when stock hits 0, auto `available=false`; deducts wallet; inserts `orders`
  - `claim_welcome_bonus(p_bonus_cents integer default 10000)`: one-time welcome gift per user; sets `welcome_claimed=true` and credits wallet
  - `get_my_purchased_items()`: returns the caller’s own purchase history joined with current menu data
- RLS policies
  - `menu_items`: authenticated-only read; write allowed only when caller’s profile has `role='admin'`
  - `profiles`: self read/update (role not elevated by user updates)
  - `orders`: self read; inserts only via RPC
- Seeds
  - Rich sample menu: 16+ items across burgers/sides/drinks with initial `quantity` per item

How to run
- psql/CLI: `psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/init.sql`
- Supabase SQL Editor: open the file, copy all of `init.sql` and run

Upgrading an existing database (if you ran an older init already)
- Run the following idempotent snippet to add welcome-gift fields and RPC, and update the signup trigger:

```sql
-- Add welcome-gift columns if missing
alter table public.profiles add column if not exists welcome_claimed boolean not null default false;
alter table public.profiles add column if not exists welcome_claimed_at timestamptz;

-- Signup trigger: wallet=0; auto-admin by email
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_full_name text;
  v_birthday date;
  v_avatar_url text;
  v_role text := 'user';
begin
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

-- One-time welcome gift RPC
create or replace function public.claim_welcome_bonus(p_bonus_cents integer default 10000)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_user_id uuid := auth.uid();
  v_wallet integer;
begin
  if v_user_id is null then raise exception 'Not authenticated'; end if;
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
```

Admin access rules (frontend + DB)
- Frontend `/admin`: requires user email in allowlist (env `NEXT_PUBLIC_ADMIN_EMAILS`, default `physicoada@gmail.com`) AND `profiles.role='admin'`
- DB writes to `menu_items`: allowed by RLS only if `profiles.role='admin'`

Notes
- Keep service-role keys off the client; the app uses only the anon key in the browser.
