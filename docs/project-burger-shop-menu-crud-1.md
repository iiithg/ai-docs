# project-burger-shop-menu-crud-1 — Architecture

## Purpose
- Single-file demo showing basic CRUD on a burger shop menu.

## Feature Scope
- Create/read/update/delete `menu_items` via Supabase from a simple UI.
- No auth or RLS required to run locally; optional permissive policy example.

## Architecture
- Single file app based on `apps/burger-template`.
- Entry: `src/App.tsx` contains UI and Supabase calls.
- Direct client → Supabase; no server components.

## Data Model (draft)
- Table `public.menu_items`:
  - `id uuid pk default gen_random_uuid()`
  - `name text`
  - `category text check (category in ('burger','side','drink')) default 'burger'`
  - `price_cents int`
  - `available boolean default true`
  - `created_at timestamp default now()`

## Policies (draft)
- Start with RLS disabled to validate CRUD.
- Optional: add permissive `select/insert/update/delete` policy for demo-only use.

## Env Vars
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

## Run
- `npm install && npm run dev`

