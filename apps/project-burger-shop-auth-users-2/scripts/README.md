# Database Scripts — Auth Users (app 2)

This folder contains SQL for the Auth + Profiles + Wallet demo, including RLS and admin policies.

## One-time init
- Production (recommended): run `init-auth.sql`
  - Creates tables: `menu_items`, `promo_codes`, `profiles` (with `role`), `orders`
  - Applies minimal RLS policies: menu/promo read-all + admin-only writes; profiles/orders protected
  - Installs RPC `buy_burger` and signup trigger `handle_new_user`
- Development (optional): run `init-auth-dev.sql`
  - Same as above, but disables RLS on menu/promo for quick testing (`profiles`/`orders` remain protected)

## Security model (RLS)
- profiles (private):
  - enable RLS
  - self read/update: users can see and edit their own non-role fields (`full_name`, `birthday`, `avatar_url`)
- orders (private):
  - enable RLS
  - self read: users can read their own orders; inserts happen via RPC only
- menu_items & promo_codes (public data):
  - Production: `031-rls_on_min_policies.sql`
    - read-all (public select)
    - admin-only writes (insert/update/delete) using `profiles.role = 'admin'`
  - Development: `030-rls_dev_off.sql` turns RLS off temporarily on these two tables

## Admin role
- `022-alter_profiles_add_role.sql` adds `role text check (role in ('user','admin')) default 'user'` to `profiles`.
- Promote an account:
  - Use `085-grant_admin.sql` and replace the email to set `role='admin'`.
- Admin capabilities:
  - Frontend: access `/admin` to manage menu items
  - Database: allowed to write `menu_items`/`promo_codes` via RLS policies

## RPC & triggers
- `060-rpc_buy_burger.sql` (SECURITY DEFINER):
  - checks item availability
  - performs atomic wallet deduction in `profiles`
  - inserts a row into `orders`
- `070-trigger_on_signup.sql`:
  - on insert to `auth.users`, creates `profiles` with a randomized `wallet_cents`
  - copies optional `full_name`/`birthday`/`avatar_url` from `raw_user_meta_data`

## Test users (optional)
- `080-seed_auth_users.sql`: inserts two confirmed users (alice/bob, password `Passw0rd!`)
- `085-grant_admin.sql`: promote a user to admin by email

## Order of execution
See `init-auth.sql` (production) or `init-auth-dev.sql` (development) for the exact `\i` sequence.
