# project-burger-shop-small — Architecture

## Purpose
- Multi-file combined app that merges features 1 + 2 for a realistic but compact admin.

## Feature Scope
- Menu CRUD (`menu_items`).
- Auth + User Management (profiles + roles).

## Architecture
- Based on `apps/burger-template` and expanded into small components.
- Tabs or routes: `Menu`, `Account`, `Users` (admins only).
- Files:
  - `src/lib/supabase.ts` — client
  - `src/features/menu/*` — list, form, row item
  - `src/features/auth/*` — auth forms, guard
  - `src/features/users/*` — admin list and role actions
  - `src/App.tsx`, `src/main.tsx`

## Data Model (draft)
- `public.menu_items` (from demo 1)
- `public.profiles` (from demo 2)

## Policies (draft)
- `menu_items`: public read optional; writes require auth.
- `profiles`: users manage self; admins can view all and change roles via RPC.

## Env Vars
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

## Run
- `npm install && npm run dev`

