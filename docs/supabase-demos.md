# Supabase Demos Overview

This repository uses a single fictitious scenario and builds features progressively from single-file demos to combined apps. Names follow `project-<scenario>-<feature>-<n>`. Early demos focus on one feature each (no repetition). Two final builds show how to combine features in small vs big implementations.

## Scenario
project-burger-shop — a mini burger shop that manages a simple menu (burgers, sides, drinks), staff login, a live orders board, and item photos.

## Demo Lineup

### project-burger-shop-menu-crud-1 — Menu: Basic CRUD (single file)
- Goal: Manage menu items (burgers/sides/drinks) from a single React file.
- Feature: Create/read/update/delete menu items using `@supabase/supabase-js`.
- Architecture:
  - Single file: `src/App.tsx` with UI and Supabase calls.
  - Direct client → Supabase REST/RPC; no server.
- Data Model (draft):
  - `public.menu_items(id uuid pk default gen_random_uuid(), name text, category text check (category in ('burger','side','drink')) default 'burger', price_cents int, available boolean default true, created_at timestamp default now())`.
- RLS (draft):
  - Start with RLS disabled while developing.
  - Optionally add a permissive policy for demo use.

### project-burger-shop-auth-users-2 — Auth + User Management (single file)
- Goal: Add authentication and minimal user management in-app.
- Features:
  - Email/password auth with session handling.
  - `profiles` table storing `username`, `role` (`staff`/`admin`), and `is_active`.
  - Basic User Management screen: list users (admins only), edit own profile, admin can promote/demote roles via RPC.
  - RLS ensures regular users can only see/update themselves; admins can view all profiles.
- Architecture:
  - Single file: `src/App.tsx` with auth flow + a simple "Manage Users" panel (visible to admins).
- Data Model (draft):
  - `public.profiles(id uuid pk references auth.users(id), username text unique, role text check (role in ('staff','admin')) default 'staff', is_active boolean default true, updated_at timestamp default now())`.
- Policies & RPC (draft):
  - `profiles select`: `auth.uid() = id OR current_setting('request.jwt.claims', true)::jsonb ->> 'role' = 'admin'` (pattern; exact SQL to be provided in app README).
  - `profiles update`: users can update own non-role fields; role changes go through a `SECURITY DEFINER` function `set_user_role(user_id uuid, new_role text)` callable only by admins via RLS check.
  - `menu_items`: restrict writes to authenticated users; reads can be public.

### project-burger-shop-realtime-orders-3 — Realtime Chat (single file)
- Goal: Multi-user chat lobby with realtime messages and presence cursors.
- Features: Postgres Changes for persistent messages; Realtime channel presence/broadcast for online users and mouse cursors.
- Architecture:
  - Single file: `src/App.tsx` focused on subscription and rendering.
- Data Model (draft):
  - `public.orders(id uuid pk default gen_random_uuid(), cashier_id uuid references auth.users(id), customer_name text null, status text default 'pending', created_at timestamp default now())`.
- RLS (draft):
  - Inserts allowed for authenticated users; reads can be public or staff-only depending on policy example.

### project-burger-shop-storage-uploads-4 — Avatars in Storage (single file)
- Goal: Upload and display user avatars.
- Features: Supabase Storage bucket `avatars`, per-user write policies, public or signed read; updates `profiles.avatar_url`.
- Architecture:
  - Single file: `src/App.tsx` with upload widget and image rendering.
- Data Model (draft):
  - Bucket: `menu-photos`.
  - Optional table: `public.menu_photos(id uuid pk, item_id uuid references menu_items(id), path text, created_at timestamp default now())`.
- RLS (draft):
  - Only authenticated users can upload; public can read via signed URLs.

### project-burger-shop-edge-function-5 — Weather Edge Function (single file)
- Goal: Stateless edge function that proxies a free weather API and returns JSON to the frontend.
- Features: Deno Edge Function at `/functions/v1/weather`; optional user-authenticated calls for rate limiting.
- Architecture:
  - Single file: `src/App.tsx` invoking `fetch` to the Edge Function endpoint and `supabase.rpc`.

## Small vs Big Builds

### project-burger-shop-small — Combined App (features 1 + 2)
- What it includes: Menu CRUD + Auth & User Management (profiles + roles).
- Why: Small, focused admin app that combines just enough to feel real while remaining easy to understand.
- Architecture: Multi-file React app with tabs: Products, Account. RLS guards writes; reads may be public.

### project-burger-shop-big — Combined App (features 1–5)
- What it includes: Menu CRUD, Staff Auth/RLS, Realtime Orders, Storage Uploads, and one Edge Function/RPC.
- Why: Full showcase that ties together all representative Supabase features in a cohesive small shop admin.
- Architecture: Multi-file React app with tabs: Products, Sales (live), Photos, Reports/Settings. Shared Supabase client; small utilities.

## Tech Stack (current)
- Next.js (App Router) + TypeScript.
- TypeScript for type safety and clearer examples.
- `@supabase/supabase-js` for client access.
- Minimal styling (Tailwind or plain CSS) to keep focus on Supabase features.

## Directory Layout
- `apps/project-burger-shop-menu-crud-1` — Single file, menu CRUD.
- `apps/project-burger-shop-auth-users-2` — Single file, auth + user management.
- `apps/project-burger-shop-realtime-orders-3` — Single file, realtime chat.
- `apps/project-burger-shop-storage-uploads-4` — Single file, avatars uploads.
- `apps/project-burger-shop-edge-function-5` — Single file, weather edge function.
- `apps/project-burger-shop-small` — Multi file, combined (1+2).
- `apps/project-burger-shop-big` — Multi file, combined (1–5).
- `packages/shared` (optional) — Shared UI/utilities.
- `docs/` — This overview and per-demo notes/changelogs.

## Running the Demos
- Environment: per app `.env.local` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (or用页面“⚙️”动态配置)。
- Each app runs independently with `npm run dev`.
- SQL/policy snippets are in each app’s `scripts/` and README。

## What You’ll Learn
- How to build isolated features quickly in single-file demos.
- How to secure data with RLS tied to Supabase Auth.
- How to deliver realtime UX and private file handling.
- How to integrate an Edge Function and Postgres `rpc`.

## Next Steps
- Confirm the `project-burger-shop` scenario and lineup.
- If you prefer another scenario (e.g., `project-event`, `project-bookclub`), tell me and I’ll rename.
- After confirmation, I’ll scaffold the apps and add SQL/policy templates.
