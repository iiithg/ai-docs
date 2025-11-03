# Advanced Auth (-6): Google/GitHub OAuth + JWT API

Single-feature demo showing:
- Sign in with Google and GitHub (Supabase OAuth)
- Session cookie via `@supabase/auth-helpers-nextjs` callback
- Protected page using `middleware.ts`
- JWT-protected API: verifies Supabase access token with `SUPABASE_JWT_SECRET`

## Setup

1) Copy env

```
cp .env.example .env.local
```

Set:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_JWT_SECRET` (Supabase → Settings → API → JWT secret)

2) Configure providers in Supabase Dashboard

- Enable Google and GitHub under Authentication → Providers
- Set Redirect URL: `http://localhost:3000/auth/callback`

3) Install and run

```
npm install
npm run dev
```

Open http://localhost:3000 and use Google/GitHub login.

## Pages

- `/auth/login` — OAuth buttons, shows access token and calls `/api/jwt-echo`
- `/auth/callback` — exchanges `code` → session cookie (handled server-side)
- `/protected` — server-rendered page; blocked by `middleware.ts` when not signed in

## JWT-protected API

`GET /api/jwt-echo` expects `Authorization: Bearer <access_token>` where `<access_token>` is the Supabase session access token. The route verifies the token with `jsonwebtoken` using `SUPABASE_JWT_SECRET` and returns the token claims such as `sub` and `role`.

Notes:
- Keep `SUPABASE_JWT_SECRET` server-only. Do not expose it to the browser.
- In production, prefer cookie-based session checks (`auth-helpers`) for internal APIs. Use JWT verification mainly for non-browser clients or service-to-service calls.

