# Burger Template — Base UI + Local Shop

Path: `apps/burger-template`

A Next.js App Router template with a playful burger-shop UI. It includes a fully local “shop simulator” (no backend required): menu, inventory, cart, wallet, combo discount, coupon-only deals, tax, receipts, and inline Dev Tools. Feature apps copy this template and add Supabase-backed behavior.

## What’s Included
- Local shop flow: add items, compute totals, pay from a local wallet
- Inventory tracking in local state (with restock/reset dev actions)
- Deals: $1 off per Burger+Side+Drink combo and an optional `BURGER10` coupon
- Tax calculation (8%) and recent receipts list
- Inline Dev Tools: restock, reset wallet, clear local save, env status

## Supabase Integration (optional)
- The template runs UI-only. To wire Supabase for experiments, set env and use the client helper:
  - Env (optional): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Client helper: `lib/supabase/client.ts` → `maybeCreateBrowserClient()` returns `null` when env is absent

## Tech Stack
- Next.js (App Router) + TypeScript + Tailwind CSS

## Structure
- `app/layout.tsx` — Header/nav and themed layout
- `app/page.tsx` — Local shop (menu, cart, deals, checkout, dev tools)
- `lib/supabase/client.ts` — Optional browser client factory
- `styles/globals.css` — Global styles

## Conventions
- Keep components small and pure; prefer colocation.
- For demos that need persistence or multi-user behavior, lift state into Postgres (via Supabase CRUD/RPC) and keep UI logic thin.

## Usage
- Use this as the base for all single‑feature demos and combined apps.
- Replace local state with DB calls where appropriate; keep the UX and styling consistent.
