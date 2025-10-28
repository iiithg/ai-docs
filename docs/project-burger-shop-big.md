# project-burger-shop-big — Architecture

## Purpose
- Multi-file combined app that includes features 1–5 for a complete demo.

## Feature Scope
- Menu CRUD, Auth + User Management, Realtime Orders, Storage Uploads, Edge Function + RPC.

## Architecture
- Based on `apps/burger-template` and organized by feature folders.
- Tabs: `Menu`, `Orders (Live)`, `Photos`, `Users/Admin`, `Reports/Settings`.
- Files:
  - `src/lib/supabase.ts` — client
  - `src/features/menu/*`
  - `src/features/orders/*`
  - `src/features/photos/*`
  - `src/features/auth/*`, `src/features/users/*`
  - `src/features/reports/*` (Edge Function + RPC UI)
  - `src/App.tsx`, `src/main.tsx`

## Data Model (draft)
- `public.menu_items`
- `public.profiles`
- `public.orders`
- `public.menu_photos` (optional)

## Policies (draft)
- Enforce authenticated writes across tables.
- `profiles` self-service, admin elevated via RPC.
- Realtime reads limited to staff; photos via signed URLs.

## Env Vars
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- `VITE_STORAGE_BUCKET=menu-photos`
- `VITE_EDGE_FN_URL` (if needed)

## Run
- `npm install && npm run dev`

