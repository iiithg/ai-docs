# project-burger-shop-menu-crud-1 — Menu + Promo CRUD

Path: `apps/project-burger-shop-menu-crud-1`

Next.js (App Router) demo for database CRUD. It manages two tables: `menu_items` and `promo_codes`. The app includes a runtime Settings modal, so you can paste your Supabase URL/Anon Key without environment variables.

## Features
- Create, edit, toggle, and delete menu items (emoji, category, price in cents, availability)
- Create, toggle, and delete promo codes (percentage or fixed amount; usage count)
- Dynamic Supabase configuration via in‑app settings (stored in localStorage)

## Pages
- `/` — CRUD UI with tabs: Menu and Promo Codes

## Environment
- Optional: `.env.local` → `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Or use the in‑app settings (⚙️) — no restart required

## Data Model
Tables created by scripts under `scripts/`:

### public.menu_items
- `id uuid pk default gen_random_uuid()`
- `name text not null`
- `description text`
- `category text check (category in ('burger','side','drink')) not null`
- `price_cents integer not null check (price_cents >= 0)`
- `emoji text`
- `available boolean not null default true`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

### public.promo_codes
- `id uuid pk default gen_random_uuid()`
- `code text unique not null`
- `description text`
- `discount_type text check (discount_type in ('percentage','fixed')) not null`
- `discount_value integer not null`
- `is_active boolean not null default true`
- `used_count integer not null default 0`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

## Scripts
- One-time init (recommended): `scripts/init-all.sql`
- Step-by-step: `000-extensions.sql` → `010-table_menu_items.sql` → `011-table_promo_codes.sql` → `030-rls_dev_off.sql` → `040-seed_menu_items.sql` → `041-seed_promo_codes.sql`
- See `apps/project-burger-shop-menu-crud-1/scripts/README.md` for step instructions

## Run
```bash
cd apps/project-burger-shop-menu-crud-1
npm install
npm run dev
```

Open the app and click the settings button (⚙️) to configure Supabase.
