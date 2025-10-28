# project-burger-shop-auth-users-2 — Auth, Profiles, Wallet, Stock, Admin

Path: `apps/project-burger-shop-auth-users-2`

## Overview
- Sign in to view and buy items.
- Profiles store name, birthday, avatar URL, wallet balance, and whether the welcome gift was claimed.
- A one-time welcome gift can be claimed per user via an RPC.
- Purchases are atomic: deduct stock and wallet, insert an order, and auto-unlist items at zero stock.
- Admins manage the menu in `/admin` with an email allowlist plus role guard.

## Pages
- `/auth` — sign in / register (Supabase Auth)
- `/shop` — shop page (requires login to see items), claim gift, buy items, and view “My Purchases”
- `/admin` — admin UI (only for `role='admin'` and allowlisted emails)

## Environment
- Use `.env.local` or the in‑app “⚙️” dialog (stored in localStorage):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Start
```bash
cd apps/project-burger-shop-auth-users-2
npm install
npm run dev
```

## Database and Scripts (scripts/)
- Single entry: `init.sql` (run once)
  - Extensions: `pgcrypto`, `citext`
  - Tables:
    - `public.menu_items` (includes `quantity integer not null default 0 check (quantity >= 0)`)
    - `public.profiles` (includes `wallet_cents`, `welcome_claimed boolean default false`, and `role` with `user|admin`)
    - `public.orders`
  - Trigger: `handle_new_user()` — creates a profile at signup (wallet=0) and promotes default allowlisted email to admin
  - RPCs:
    - `buy_burger(p_item_id uuid)` — atomic wallet deduction + stock decrement; auto `available=false` at zero
    - `claim_welcome_bonus(p_bonus_cents integer default 10000)` — one-time per user, credits wallet and sets `welcome_claimed=true`
    - `get_my_purchased_items()` — returns the caller’s order history joined with current menu data
  - RLS:
    - `menu_items`: select allowed only to authenticated users; write allowed only for admins (`profiles.role='admin'`)
    - `profiles`: self read; restricted self update (role/wallet/welcome fields locked); admins may update any profile
    - `orders`: self read; inserts happen via RPC only
  - Seeds: 16+ sample items across burgers/sides/drinks with initial stock
  - Backfill: create missing `profiles` rows for existing `auth.users`

Run options
```bash
# psql (recommended)
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/init.sql
# Supabase SQL Editor
# Open this file locally, copy all contents, and paste + run
```

## Purchase and Gift Flows (transactional)
1) Validate auth and availability.
2) Decrement `quantity` with a guarded `update ... where quantity > 0 returning quantity` (prevents oversell).
3) Auto-unlist when new quantity hits 0 (`available=false`).
4) Deduct `wallet_cents` (fails and rolls back on insufficient funds).
5) Insert into `orders` and return `{ order_id, new_wallet_cents }`.

Gift
- On `/shop`, click “Claim Welcome Gift”. UI calls `claim_welcome_bonus()`.
- If `welcome_claimed=false`, it sets it to true and credits the wallet in a single transaction; otherwise it raises “Already claimed”.

## Frontend Behavior
- `/shop`: shows available items (login required, stock>0). After buy, it auto-refreshes stock and “My Purchases”.
- `/admin`: create/edit/delete/toggle availability and edit `quantity` (admins only).
- The profile card shows wallet balance and a “Claim Welcome Gift” button if not yet claimed.
