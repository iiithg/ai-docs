# project-burger-shop-big

Combined app including features 1–5: Menu CRUD, Auth + Users, Realtime Orders, Storage Uploads, Edge Function + RPC.

## Start From Template
- Copy `apps/burger-template` and organize by features.
- Ensure `.env.local` has `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Suggested Structure
- `lib/supabase/*` — client and helpers
- `app/(menu)/*` — CRUD
- `app/(orders)/*` — realtime board
- `app/(photos)/*` — storage uploads
- `app/(users)/*` — auth + management
- `app/(reports)/*` — edge function + rpc

## Run
- `npm install`
- `npm run dev`

## Notes
- Apply SQL/RLS from demos 1–5; verify permissions end‑to‑end.

