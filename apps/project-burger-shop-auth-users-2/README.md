# project-burger-shop-auth-users-2 — Auth, Profiles, Wallet, Stock, Admin

Auth + Users demo for the burger shop. Requires login to view items and buy. Stores user profile (name, birthday, avatar) and a per‑user wallet. Supports a one‑time welcome gift, per‑item stock with auto‑unlist at 0, and an admin page with email allowlist + role guard.

## Features

- Supabase Auth (email/password): register, login, logout
- Profiles table: `full_name`, `birthday`, `avatar_url`, `wallet_cents`, `welcome_claimed`
- One‑time welcome gift via RPC `claim_welcome_bonus` (default ¥100.00)
- Guarded purchase flow (visible and purchasable only when logged in)
- Stocked menu: `menu_items.quantity` decrements per purchase; auto‑unlists at 0
- Atomic purchase RPC `buy_burger`: decrement stock + deduct wallet + insert `orders`
- “My Purchases” list (RPC `get_my_purchased_items`)
- Admin page `/admin`: email allowlist (default `physicoada@gmail.com`, override with `NEXT_PUBLIC_ADMIN_EMAILS`) + role `profiles.role='admin'`; only admins can write `menu_items`

## Setup

- Copy `.env.example` → `.env.local` and set:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Or click the in‑app ⚙️ to set URL/Key at runtime (stored in localStorage)

## Database (SQL)

Run exactly one file: `apps/project-burger-shop-auth-users-2/scripts/init.sql` (copy all into Supabase SQL Editor, or run via psql).

What `init.sql` includes
- Extensions, tables (`menu_items` with `quantity`, `profiles` with `welcome_claimed`, `orders`), RLS policies
- Triggers: `handle_new_user()` (wallet starts at 0; default allowlisted email becomes admin)
- RPCs: `buy_burger`, `claim_welcome_bonus`, `get_my_purchased_items`
- Seed: 16+ menu items across burgers/sides/drinks with initial stock
- Backfill: auto‑create `profiles` for existing `auth.users`

Important
- Menu is readable only to authenticated users; guests won’t see the list.
- Menu writes are protected by RLS; the UI also enforces an email allowlist (default `physicoada@gmail.com`, override via comma‑separated `NEXT_PUBLIC_ADMIN_EMAILS`).

## Run

```bash
cd apps/project-burger-shop-auth-users-2
npm install
npm run dev
```

Open `http://localhost:3001` (or your dev port):
- `/auth` — register or login
- `/shop` — after login: view items (available && stock > 0), claim welcome gift, buy items (auto‑refreshes stock and purchases)
- `/admin` — menu CRUD for admins; non‑admins see access denied

## Files

- `app/shop/page.tsx` — Shop UI (login required; claim gift; buy; shows My Purchases)
- `app/auth/*` — Auth pages
- `app/admin/page.tsx` — Admin UI (email allowlist + role guard; stock support)
- `lib/database.ts` — `menuItems` / `profiles` / `orders` (includes `getMyPurchases`)
- `lib/types.ts` — Types: `MenuItem` / `Profile` / `BuyResult` / `PurchasedItem`
- `scripts/init.sql` — Initialization (extensions / tables / RLS / RPCs / trigger / seeds / backfill)

## Security

- RLS enabled on sensitive tables; `menu_items` readable only to authenticated users; admin writes only.
- Never expose service role keys in the client; use only the anon key on the web.

## Troubleshooting

- Can’t see “Claim Welcome Gift” or see “Failed to load”: most likely missing `profiles` row or wrong project. Run `scripts/init.sql` on the exact project your app connects to (⚙️). The script includes a backfill for existing users.
- “function not found (get_my_purchased_items)”: run the RPC section from `init.sql`, then `select pg_notify('pgrst','reload schema');`.
- Seed says `quantity does not exist`: older table is missing the column. `init.sql` includes `alter table ... add column if not exists quantity ...`; run that then re‑seed.

## Test users (optional)

- If you have a seeding flow for `auth.users`, `handle_new_user` will create matching `profiles` with wallet=0.

## RLS

- `profiles` and `orders` have RLS enabled by default.
  - profiles: self read; restricted self update (name/birthday/avatar only); admins can update any profile.
  - orders: self read; inserts via `buy_burger` RPC only.
- `menu_items`: authenticated read; admin‑only writes.
