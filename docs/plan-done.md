# Plan & Done Log

This file tracks planned tasks and completed work for the burger shop demos. Add new plan items with IDs; when completed, record them in Done with the same IDs.

Date: 2025-10-27

## Plan

- PLAN-016 — Simplify Deals: coupon-only
  - Date: 2025-10-27
  - Scope: Remove tip and loyalty (points/redeem) from template; keep coupon only; update pricing and UI.
  - Outputs: Updated `apps/burger-template/app/page.tsx`; UI shows only coupon in Deals.

- PLAN-017 — Implement Menu CRUD demo (app 1)
  - Date: 2025-10-28
  - Scope: Scaffold from burger-template; add single-page CRUD for `menu_items`; add env sample and README notes with SQL.
  - Outputs: `apps/project-burger-shop-menu-crud-1` runnable app; `app/page.tsx` CRUD UI; `.env.example` and updated README.

- PLAN-018 — Add full DB schema to README (CRUD app)
  - Date: 2025-10-28
  - Scope: Expand README with complete SQL: table, indexes, RLS policies, seed data; clarify dev vs prod settings.
  - Outputs: Updated `apps/project-burger-shop-menu-crud-1/README.md`.

- PLAN-019 — Add scripts folder with common SQL
  - Date: 2025-10-28
  - Scope: Provide SQL files for extensions, table, indexes, RLS (dev/prod), seed, reset, drop; link from README.
  - Outputs: `apps/project-burger-shop-menu-crud-1/scripts/*` and README references.

- PLAN-014 — Fix duplicate `tax` variable in template
  - Date: 2025-10-27
  - Scope: Remove duplicate `tax/total` declarations; keep unified pricing logic; verify build.
  - Outputs: Updated `apps/burger-template/app/page.tsx`; build compiles.

- PLAN-015 — Burger-themed UI refresh for template
  - Date: 2025-10-27
  - Scope: Add playful header/branding, category icons, clearer step-by-step order flow; align coupon/loyalty/checkout with design chain.
  - Outputs: Updated `apps/burger-template/app/page.tsx` with improved layout and labels.

- PLAN-011 — Scaffold burger template and READMEs
  - Date: 2025-10-27
  - Scope: Create `apps/burger-template` (Next.js skeleton) and add README + .env.example; add README + .env.example to each sub‑app folder per docs.
  - Outputs: Template app files; per‑app startup READMEs.
  - Status: completed

- PLAN-005 — Scaffold burger template (Next.js)
  - Scope: Create `apps/burger-template` using Next.js with a simple burger-shop theme (no database yet). Include basic layout, header/nav, components, and a placeholder state area.
  - Outputs: Next.js app, minimal components, instructions in `README.md`.

- PLAN-006 — Prepare SQL/RLS snippets for Menu CRUD
  - Scope: SQL to create `menu_items` and optional permissive dev policies; short notes for applying in Supabase SQL Editor.
  - Outputs: `apps/project-burger-shop-menu-crud-1/README.md` with SQL and steps.

- PLAN-007 — Implement single-file demos 1–5
  - Scope: Each demo starts from burger template, keeps logic in a single top-level file (page or component), showcasing exactly one feature.
  - Outputs: Five app folders with runnable examples.

- PLAN-008 — Per-app READMEs and env samples
  - Scope: Add `README.md` and `.env.example` to each app with setup steps and safety notes.
  - Outputs: Docs and examples for each app.

- PLAN-009 — Build project-burger-shop-small (features 1+2)
  - Scope: Multi-file app combining Menu CRUD + Auth & User Management.
  - Outputs: Runnable app with tabs for Menu and Account/Users.

- PLAN-010 — Build project-burger-shop-big (features 1–5)
  - Scope: Full multi-feature app including realtime, storage, and an edge function.
  - Outputs: Runnable app with Menu, Orders (Live), Photos, Users/Admin, Reports.

## Done

- DONE-001 — Created Supabase demos overview; aligned on single scenario and Small vs Big builds. File: `docs/supabase-demos.md`.
- DONE-002 — Added per-app architecture docs for burger shop demos (1–5, small, big). Files under `docs/project-burger-shop-*.md`.
- DONE-003 — Added burger template doc and updated to Next.js. File: `docs/burger-template.md`.
- DONE-004 — Consolidated planning into this single file; removed `docs/plan.md` and `docs/done.md`.

- DONE-011 — Scaffolded `apps/burger-template` (Next.js skeleton), added `.env.example` and README; added startup READMEs for all sub‑apps under `apps/project-burger-shop-*`.

- PLAN-012 — Make burger template not require Supabase by default
  - Date: 2025-10-27
  - Scope: Guard client creation; update demo page and README to treat env as optional.
  - Outputs: Safe `maybeCreateBrowserClient`, updated demo button/README.

- DONE-012 — Template runs UI-only without env; optional Supabase test works when vars are set.

- PLAN-013 — Add local burger shop operations to template
  - Date: 2025-10-27
  - Scope: Implement menu, cart, wallet, tax/total calc; remove demo-only wording; keep separate wiring page.
  - Outputs: Updated `app/page.tsx`, nav, README.

- DONE-013 — Implemented local cart/wallet flow in template; `/wiring` retained for optional Supabase check.
  - Update: replaced separate wiring page with inline Dev Tools; removed route.

- DONE-014 — Removed duplicate `tax/total` declarations; Next.js build compiles.

- DONE-015 — Refreshed template UI with burger-themed branding and step-by-step flow (Build → Order → Deals → Checkout); improved labels and icons.

- DONE-016 — Simplified Deals to coupon-only; removed tip and loyalty features; updated pricing and UI.

- DONE-017 — Implemented Menu CRUD demo app
  - Date: 2025-10-28
  - Result: Scaffolded `apps/project-burger-shop-menu-crud-1` from template with a single-page CRUD UI in `app/page.tsx`; added `.env.example` and updated README with SQL. Verified internal imports and basic build config.

- DONE-018 — Added full DB schema to CRUD README
  - Date: 2025-10-28
  - Result: README now contains table definition, helpful indexes, RLS policies (dev/prod variants), and seed data.

- DONE-019 — Added scripts folder with common SQL
  - Date: 2025-10-28
  - Result: Created `scripts/` with 8 SQL files (extensions, table, indexes, RLS on/off, seed, reset, drop) and documented usage in README.

Date: 2025-10-28

## Plan

- PLAN-034 — Storage uploads demo (app 4)
  - Date: 2025-10-28
  - Scope: Scaffold `project-burger-shop-storage-uploads-4` from template; add `/profile` page to upload avatar to `avatars` bucket and update `profiles.avatar_url`; include runtime Supabase settings modal.
  - Outputs: Runnable app under `apps/project-burger-shop-storage-uploads-4/` with `app/profile/page.tsx`, supabase client helpers, Tailwind setup, and updated app README.

## Done

- DONE-034 — Storage uploads demo implemented
  - Date: 2025-10-28
  - Result: New app scaffolding with Tailwind and runtime Supabase settings; `/profile` lets authenticated users upload to `avatars/<user_id>/avatar.<ext>`, then updates `profiles.avatar_url`. README documents bucket and policies.

Date: 2025-10-28

## Plan

- PLAN-035 — Open settings by default (app 4)
  - Date: 2025-10-28
  - Scope: Add `defaultOpen` prop to Settings and enable it on `/` and `/profile` so the Supabase config dialog shows on entry.
  - Outputs: Updated `app/components/Settings.tsx`, `app/page.tsx`, and `app/profile/page.tsx`.

## Done

- DONE-035 — Settings opens on entry
  - Date: 2025-10-28
  - Result: Visiting the app shows the Settings modal immediately to configure Supabase URL/key.

Date: 2025-10-28

## Plan

- PLAN-036 — Anonymous uploads + SQL script (app 4)
  - Date: 2025-10-28
  - Scope: Allow uploads without login using `avatars/guest/<uuid>-avatar.<ext>`; keep logged-in path `<user_id>/avatar.<ext>` with profile update. Add storage policy script to allow anon writes under `guest/` and self-writes for users.
  - Outputs: Updated upload UI/logic, README policies, and `scripts/storage-avatars.sql`.

## Done

- DONE-036 — Anonymous upload enabled + script added
  - Date: 2025-10-28
  - Result: Upload works without login (guest prefix) and still saves to profile when logged in; README updated with anon policy; added `scripts/storage-avatars.sql` with bucket policies.


- PLAN-026 — Auth Users: stock + docs sync
  - Date: 2025-10-28
  - Scope: Update app 2 dev doc to reflect admin CRUD + wallet + stock decrement; add `quantity` to `menu_items`; update `buy_burger` RPC to deduct stock and auto-unavailable at 0; wire minimal UI fields.
  - Outputs: Updated `docs/project-burger-shop-auth-users-2.md`; patched SQL in `apps/project-burger-shop-auth-users-2/scripts/init.sql` and `init-dev.sql`; UI shows/edits quantity in `/admin` and hides out-of-stock in `/shop`.

- PLAN-029 — Scripts README: init guides
  - Date: 2025-10-28
  - Scope: Document how to run SQL init in scripts/README (psql vs SQL Editor), include dev mode note and upgrade snippet, reflect welcome gift and stock.
  - Outputs: Updated `apps/project-burger-shop-auth-users-2/scripts/README.md`.

- PLAN-031 — Hide menu for guests + RLS
  - Date: 2025-10-28
  - Scope: Change `menu_items` select policy to `authenticated` only; update shop page to skip fetching and hide the list when logged out; refresh docs.
  - Outputs: Updated `init.sql`, shop UI, and docs.

- PLAN-032 — Resilient purchases fetch + errors
  - Date: 2025-10-28
  - Scope: Make `get_my_purchased_items` non-fatal if missing; improve error messages; auto-refresh menu+purchases after buy.
  - Outputs: Updated shop page fetch/refresh and error handling.

- PLAN-033 — Refresh app README + docs
  - Date: 2025-10-28
  - Scope: Update app README to match latest behavior (auth-only menu, gift, purchases, admin gating, single init.sql, troubleshooting); ensure docs mention these features.
  - Outputs: Updated `apps/project-burger-shop-auth-users-2/README.md` and `docs/project-burger-shop-auth-users-2.md`.

## Done

- DONE-026 — Stock + docs implemented for app 2
  - Date: 2025-10-28
  - Result: Dev doc updated to describe admin, wallet, and stock; `menu_items` gains `quantity`; `buy_burger` now decrements stock atomically and auto-unlists at 0; admin UI supports quantity; shop lists only available with stock and shows remaining qty.

Date: 2025-10-28

## Plan

- PLAN-027 — One-time welcome gift (RLS)
  - Date: 2025-10-28
  - Scope: Add `profiles.welcome_claimed` flag; RPC `claim_welcome_bonus(p_bonus_cents)` to credit wallet once; init wallet set to 0; update docs and shop UI with a claim button; keep profiles under RLS.
  - Outputs: Updated doc; SQL/RPC in `scripts/init.sql`; UI claim action in `/shop`.

## Done

- DONE-027 — Welcome gift with RLS added
  - Date: 2025-10-28
  - Result: Profiles track `welcome_claimed`; RPC enforces single claim and credits wallet; initial wallet is 0; shop shows a one-time “Claim Welcome Gift” button and updates balance on success.

- PLAN-020 — Build Auth + Users demo (app 2)
  - Date: 2025-10-28
  - Scope: Clone Menu CRUD to `apps/project-burger-shop-auth-users-2`; add Supabase Auth (register/login), `profiles` (name, birthday, avatar), wallet with randomized initial balance, and guarded purchase flow via `orders` + RPC.
  - Outputs: New app folder with pages (`/auth`, `/`), client code in `app/page.tsx`, services in `lib/`, SQL under `scripts/`, and updated README.

## Done

- DONE-020 — Auth + Users demo scaffolded and wired
  - Date: 2025-10-28
  - Result: New app with login/register page, profile readout (name/birthday/avatar), wallet shown and decremented via `buy_burger` RPC; SQL scripts added (`profiles`, `orders`, trigger, RPC) and README updated.

- DONE-021 — Admin-only CRUD + RLS policies
  - Date: 2025-10-28
  - Result: Added `/admin` (CRUD UI) with role guard; profiles now include `role` with default 'user'; added production RLS policies (read-all + admin write) for menu/promo; provided `085-grant_admin.sql` to promote admin.
- PLAN-021 — Admin route + role guard
  - Date: 2025-10-28
  - Scope: add `/admin` with CRUD UI; profiles add `role`; RLS policies for menu/promo (read-all + admin-write); seed admin script
  - Outputs: new route and SQL scripts; README updates

Date: 2025-10-28

## Plan

- PLAN-022 — Update docs for apps 2/3/4/5
  - Date: 2025-10-28
  - Scope: Refresh per-app docs to match current direction and implementations: (2) Auth+Profiles+Wallet+Admin, (3) Realtime Chat + Presence Cursors, (4) Avatars Upload via Storage, (5) Weather Edge Function; update overview lineup.
  - Outputs: Updated `docs/project-burger-shop-*.md` and `docs/supabase-demos.md`.

## Done

- DONE-022 — Docs updated for 2/3/4/5 and overview
  - Date: 2025-10-28
  - Result: Rewrote docs for auth-users-2 (routes, scripts, RLS), realtime-3 (chat + presence), storage-4 (avatars bucket + policies), edge-function-5 (weather proxy + stateless notes); updated `docs/supabase-demos.md` (Next.js stack, new app descriptions).

Date: 2025-10-28

## Plan

- PLAN-023 — English UI + split auth routes
  - Date: 2025-10-28
  - Scope: Replace Chinese UI strings with English across the Auth Users app; set html lang to `en` and US date formats; split `/auth` into dedicated `/auth/login` and `/auth/register` pages (keep `/auth` as a simple chooser); update nav labels.
  - Outputs: Updated UI texts in `app/*.tsx` and `lib/database.ts`; new pages `app/auth/login/page.tsx` and `app/auth/register/page.tsx`; navigation shows “Sign In / Sign Up”.

## Done

- DONE-023 — English UI and auth routes implemented
  - Date: 2025-10-28
  - Result: All UI strings translated to English; `<html lang="en">` set; dates use `en-US`; added `/auth/login` and `/auth/register`; `/auth` now a chooser; nav updated. Error messages in services localized to English.

Date: 2025-10-28

## Plan

- PLAN-024 — Make auth the home route
  - Date: 2025-10-28
  - Scope: Move current shop page to `/shop`, make `/` redirect to `/auth` (chooser for Sign In/Sign Up), and update header nav accordingly.
  - Outputs: New `app/shop/page.tsx`; `app/page.tsx` redirects to `/auth`; nav links use `/shop`.

## Done

- DONE-024 — Home now shows Auth
  - Date: 2025-10-28
  - Result: Moved shop to `/shop`; root `/` redirects to `/auth` (chooser). Nav updated to link to `/shop` and `/admin` only.

Date: 2025-10-28

## Plan

- PLAN-025 — Fix SQL policies for Postgres
  - Date: 2025-10-28
  - Scope: Replace unsupported `CREATE POLICY IF NOT EXISTS` with `DROP POLICY IF EXISTS` + `CREATE POLICY` to avoid syntax errors in Supabase.
  - Outputs: Updated `apps/project-burger-shop-auth-users-2/scripts/init.sql` policies section.

## Done

- DONE-025 — Policy syntax updated; runs clean
  - Date: 2025-10-28
  - Result: `init.sql` now uses drop-then-create for all policies; no more `syntax error at or near "not"`.

Date: 2025-10-28

## Plan

- PLAN-026 — Reload PostgREST cache after chat init
  - Date: 2025-10-28
  - Scope: Add `pg_notify('pgrst','reload schema')` to chat init SQL; document fix in README troubleshooting.
  - Outputs: Updated `apps/project-burger-shop-realtime-orders-3/scripts/init-chat-complete.sql` and README notes.

## Done

- DONE-026 — Schema cache reload added; docs updated
  - Date: 2025-10-28
  - Result: Running init script now refreshes PostgREST cache; README explains the "not found in schema cache" error and remedies.

Date: 2025-10-28

## Plan

- PLAN-027 — Make reset script idempotent
  - Date: 2025-10-28
  - Scope: Guard policy drops/revokes by table existence; add `pgcrypto` extension; add realtime publication and PostgREST cache reload; update README tip.
  - Outputs: Updated `apps/project-burger-shop-realtime-orders-3/scripts/reset-chat-tables.sql` and README.

## Done

- DONE-027 — Reset script hardened and safer
  - Date: 2025-10-28
  - Result: `reset-chat-tables.sql` no longer errors when the table is missing; it fully recreates the table, grants anon, adds to publication, and reloads schema.
Date: 2025-10-28

## Plan

- PLAN-023 — Build Realtime Chat demo (app 3)
  - Date: 2025-10-28
  - Scope: Scaffold app from burger-template; add `/chat` page with messages (DB) + presence cursors (Realtime); login box inline; SQL scripts for `chat_messages` with RLS; README update
  - Outputs: runnable app in `apps/project-burger-shop-realtime-orders-3`, scripts under `scripts/`

## Done

- DONE-023 — Realtime Chat demo implemented
  - Date: 2025-10-28
  - Result: App scaffolded with `/chat` page (messages + presence cursors), inline login/signup, SQL scripts (`init-chat.sql`, table + policies), updated README and landing page.
Date: 2025-10-28

## Plan

- PLAN-028 — Admin gating by email + auto-role
  - Date: 2025-10-28
  - Scope: Gate `/admin` by email allowlist (env `NEXT_PUBLIC_ADMIN_EMAILS`, default `physicoada@gmail.com`); modify signup trigger to auto set `role='admin'` when email matches; update docs.
  - Outputs: Updated admin page gating and trigger in `scripts/init.sql`; docs mention default email and env override.

## Done

- DONE-028 — Admin email gating enabled
  - Date: 2025-10-28
  - Result: Only allowlisted emails can see `/admin`; default `physicoada@gmail.com`. Signup trigger assigns admin role to matching email. Docs updated.

- DONE-029 — Scripts README updated
  - Date: 2025-10-28
  - Result: Clear instructions for running `init.sql`/`init-dev.sql` with psql and SQL Editor; upgrade snippet included; notes about allowlisted admin and welcome gift.

Date: 2025-10-28

## Plan

- PLAN-030 — Remove dev init and tighten RLS
  - Date: 2025-10-28
  - Scope: Delete `init-dev.sql`; update scripts README and app docs to single `init.sql`; harden `profiles` RLS to prevent self-editing `role/wallet/welcome_*`.
  - Outputs: Only `init.sql` remains; README/docs updated; policies adjusted in `init.sql`.

## Done

- DONE-030 — Dev script removed; RLS hardened
  - Date: 2025-10-28
  - Result: `init-dev.sql` deleted; README/docs show one init path; `profiles self update` now restricted (role/wallet/welcome fields immutable by user), admin policy added.

- DONE-031 — Menu hidden for guests; RLS updated
  - Date: 2025-10-28
  - Result: `menu_items` select now `to authenticated`; shop page hides Available Items when logged out and avoids unauthorized fetches.

- DONE-032 — Purchases fetch hardened; better errors
  - Date: 2025-10-28
  - Result: Purchases RPC failure no longer breaks the page; clearer API error messages; post-buy auto-refresh of lists.

- DONE-033 — App README + docs refreshed
  - Date: 2025-10-28
  - Result: README reflects login-only visibility, welcome gift, stock decrement, purchases list, admin email gating and role, single init.sql, and troubleshooting tips.
