# Repository Guidelines

## Project Structure & Module Organization
- `apps/` — runnable demos and templates (each isolated):
  - `burger-template/` — Next.js base UI for the burger shop theme.
  - `project-burger-shop-*-<n>/` — single‑feature demos (menu CRUD, auth-users, realtime, storage, edge-fn).
  - `project-burger-shop-small/` (1+2) and `project-burger-shop-big/` (1–5) combined apps.
- `docs/` — overview, per‑app architecture notes
- Naming pattern: `project-<scenario>-<feature>-<n>`; keep features focused per app.

## Build, Test, and Development Commands
- Per app folder:
  - `npm install` — install deps.
  - `npm run dev` — run locally (Next.js or Vite depending on the app).
  - `npm run build` — production build.
  - `npm run lint` / `npm run format` — if configured; otherwise optional.
- Env: copy `.env.example` → `.env.local` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (or Vite equivalents).

## Coding Style & Naming Conventions
- TypeScript, 2‑space indent, semicolons on, single quotes.
- Components `PascalCase.tsx`; hooks `useSomething.ts`; folders kebab‑case.
- Prefer small, pure components; colocate minimal styles (Tailwind or CSS modules).
- Exports: prefer named exports; avoid default unless a page component.

## Testing Guidelines
- Tests are optional for demos. If adding:
  - Unit: Vitest/Jest (`*.test.ts[x]`).
  - E2E: Playwright in combined apps.
  - Keep tests fast and colocated with code.

## Commit & Pull Request Guidelines
- Use Conventional Commits (e.g., `feat: menu CRUD page`, `fix: RLS policy notes`).

## Security & Configuration Tips
- Do not commit secrets. Use `.env.local`; gitignore it.
- Dev policies may be permissive; document and tighten for production (RLS + least privilege).
- Use service‑role keys only in server contexts (Edge Functions), never in the client.

## Agent‑Specific Instructions
- Keep single‑feature demos single‑purpose and minimal; base new work on `apps/burger-template/`.