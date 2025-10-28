# project-burger-shop-small

Combined app including features 1 + 2: Menu CRUD and Auth + User Management.

## Start From Template
- Copy `apps/burger-template` and split into small feature folders.
- Ensure `.env.local` has `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Suggested Structure
- `src/lib/supabase.ts` or `lib/supabase/client.ts`
- `app/(menu)/*` — CRUD pages/components
- `app/(auth)/*` — login/register and profile screen
- `app/(users)/*` — admin users list and role actions

## Run
- `npm install`
- `npm run dev`

## Notes
- Reuse SQL from demos 1 and 2; enable RLS.

