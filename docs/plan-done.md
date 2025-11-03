# Plan & Done Log

This file tracks planned tasks and completed work for the burger shop demos. Add new plan items with IDs; when completed, record them in Done with the same IDs.

Date: 2025-10-29

## Plan

- PLAN-039 — Refresh docs to match latest implementations
  - Date: 2025-10-29
  - Scope: Update docs for template (coupon-only deals, local shop), CRUD app (Next.js + promo codes + scripts), Realtime chat (script names, access model), Storage uploads (guest uploads), and Edge Function (weather route + example). Ensure English throughout.
  - Outputs: Updated files under `docs/*` listed in DONE.

## Done

- DONE-039 — Docs updated and aligned to apps
  - Date: 2025-10-29
  - Result: Edited `docs/burger-template.md`, `docs/project-burger-shop-menu-crud-1.md`, `docs/project-burger-shop-realtime-orders-3.md`, `docs/project-burger-shop-storage-uploads-4.md`, and `docs/project-burger-shop-edge-function-5.md` to reflect current code and keep language consistent (English).

Date: 2025-10-29

## Plan

- PLAN-040 — Write Supabase tutorial for demos -1 and -2
  - Date: 2025-10-29
  - Scope: New course-style doc in Chinese covering DB basics, how to run demos -1/-2, how to register Supabase, and two assignments to replicate -1 (CRUD) and -2 (Auth + RLS with private/public data).
  - Outputs: `docs/supabase-tutorial-1-2.md`.

## Done

- DONE-040 — Supabase tutorial added
  - Date: 2025-10-29
  - Result: Created `docs/supabase-tutorial-1-2.md` with end-to-end steps, SQL samples, acceptance checklists, and troubleshooting.

Date: 2025-10-31

## Plan

- PLAN-041 — Advanced OAuth + JWT login (-6)
  - Date: 2025-10-31
  - Scope: Add a single-feature app for Google/GitHub OAuth, cookie session via auth-helpers, and a JWT-protected API route with verification using `SUPABASE_JWT_SECRET`.
  - Outputs: `apps/project-burger-shop-auth-advanced-6/*`, usage README, docs page under `docs/project-burger-shop-auth-advanced-6.md`.

## Done

- DONE-041 — Created advanced login demo (-6)
  - Date: 2025-10-31
  - Result: Added app with Google/GitHub OAuth, callback handler, protected page via middleware, and `/api/jwt-echo` verifying Supabase access token; included README and docs.
