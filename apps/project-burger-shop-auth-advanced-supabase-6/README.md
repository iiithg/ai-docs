# Project Burger Shop Advanced Auth (Supabase) — 6

🍔 Advanced authentication built on Supabase: Google/GitHub OAuth, email/password login, password reset flow, dynamic Supabase configuration via Settings, and protected pages — all using Supabase Auth and Next.js 14.

## 🚀 Features

### Supabase Auth
- Google/GitHub OAuth (providers enabled in Dashboard → Authentication → Providers)
- Email/password sign in and sign up
- Password reset: `resetPasswordForEmail` + `updateUser` on `/auth/reset`
- Server-side cookie refresh via `middleware.ts` (route guard handled in pages)

### UX Flow
- Sign in success redirects to `/entry`
- “Forgot password?” sends reset email, then navigates to `/auth/reset/sent` with masked email; only email link can open `/auth/reset`
- Top-right ⚙️ Settings allows overriding Supabase URL/anon key (stored in localStorage); falls back to `.env`
- Buttons are disabled until Supabase config is valid; health preflight checks prevent confusing errors

### Tech Stack
- Next.js 14 (App Router), TypeScript
- Supabase JS (`@supabase/supabase-js`), `@supabase/auth-helpers-nextjs`
- UI: Tailwind CSS, shadcn/ui, `lucide-react`

## 🛠️ Quick Start

### 1) Environment
Create `.env.local`:
```bash
cp .env.example .env.local
```
Fill credentials:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Add allowed redirect URLs in Supabase Dashboard → Authentication → URL configuration:
- `http://localhost:3000/auth/callback` (OAuth)
- `http://localhost:3000/auth/reset` (Password recovery)

### 2) Database
Create a `profiles` table (RLS enabled). This app writes user profile data after sign-up (no trigger required):
```sql
CREATE TABLE public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  optional_info text
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY profiles_select_all ON public.profiles FOR SELECT USING (true);
CREATE POLICY profiles_insert_self ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY profiles_update_self ON public.profiles FOR UPDATE USING (auth.uid() = id);
```

The app also sets `user_metadata.full_name` during sign-up, which is shown as “Display name” in Supabase Authentication → Users.

### 3) Run
```bash
cd apps/project-burger-shop-auth-advanced-supabase-6
npm install
npm run dev
```
Open `/auth/login` to sign in via OAuth or email. After login, you will be redirected to `/entry`.

## 📁 Structure
- `app/auth/login` — login page: email/password, OAuth, Settings, “Forgot password?”
- `app/auth/reset` — password reset page (updates password after email recovery)
- `app/auth/reset/sent` — confirmation page; instructs user to check email (masked)
- `app/entry` — protected page showing session info
- `middleware.ts` — cookie refresh (guard is handled in pages)
- `lib/supabase` — client/server helpers

## 🎯 Implementation Notes
- Readiness gating: buttons disabled until Supabase config is valid; preflight checks call `/auth/v1/settings`
- Config sources: localStorage (via ⚙️ Settings) → `.env.local`
- Email privacy: no email in URL; masked email in confirmation page; states passed via `sessionStorage`
- Sign-up profile write: upsert into `public.profiles` and set `user_metadata.full_name`
- Redirects: email sign-in success → `/entry`; password reset uses Dashboard redirect whitelist

## 🔐 Security Notes
- Enforce password minimum length (≥ 8) on registration and reset
- Use generic error messages to avoid account enumeration
- RLS required on `public.profiles` to restrict row access to owners
- Keep redirect URLs whitelisted; use HTTPS in production
- JWT secret is not used in this demo; Supabase Auth sessions are managed via cookies

## 🧰 Troubleshooting
### OAuth: “Database error saving new user”
If Google/GitHub login returns:
`error=server_error&error_description=Database+error+saving+new+user`

Check your `public.profiles` schema and RLS policies match the above SQL.
Ensure there is no mismatching column (e.g., `user_id` or `full_name` if you’re not using triggers). The app inserts/queries `id`, `name`, `optional_info` and sets `user_metadata.full_name` during sign-up.

Clear Supabase cookies/localStorage and retry OAuth if the issue persists.
