# Burger Template — Base Frontend

This template provides a minimal Next.js + Supabase setup in a burger shop style (header, hero, menu grid). Other apps copy this as a starting point and then add database-backed interactions.

## Purpose
- Speed up scaffolding and keep UI/UX consistent across demos.
- Centralize Supabase client creation, layout shell, and basic utilities.
- Demonstrate “database as state management” where UI state persists in Postgres.

## Stack
- Next.js (App Router) + TypeScript
- Styling: Tailwind (or minimal CSS modules)
- Supabase client: `@supabase/supabase-js`

## Environment
- `.env.local` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Optional: `NEXT_PUBLIC_STORAGE_BUCKET`, `NEXT_PUBLIC_EDGE_FN_URL` used by feature apps.

## Suggested Structure
- `apps/burger-template/`
  - `app/layout.tsx` — Layout shell (header/nav/footer)
  - `app/page.tsx` — Landing page (hero + sample menu grid)
  - `app/(feature)/demo/page.tsx` — Slot page for feature demos
  - `lib/supabase/client.ts` — Configured Supabase browser client
  - `lib/supabase/server.ts` — Server helpers (optional)
  - `components/*` — Button, Input, Card, Table, Modal
  - `styles/globals.css` — Tailwind or minimal CSS
  - `next.config.js`, `postcss.config.js`, `tailwind.config.js`, `tsconfig.json`

## Conventions
- Keep state local and simple; avoid heavy client state libraries.
- Prefer DB-backed state for canonical data; use optimistic UI when helpful.
- Use typed helpers for Supabase responses where practical.

## Database as State (pattern)
- UI source of truth lives in Postgres; components read/write through Supabase.
- For small demos, write directly from components; for larger ones, wrap writes in small helpers (or RPC) to keep UI clean.

## Usage
- Copy `apps/burger-template` as the starting point for each demo.
- Add feature-specific UI under `app/(feature)/...` and wire to Supabase.
