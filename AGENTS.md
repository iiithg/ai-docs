# Repository Guidelines

## Project Structure & Module Organization
- `apps/` holds runnable demos. Use `apps/burger-template/` as the base when adding a new scenario, and keep each `project-burger-shop-<feature>-<n>/` focused on a single capability (CRUD, auth, realtime, storage, edge functions). Combined experiences live in `project-burger-shop-small/` (features 1+2) and `project-burger-shop-big/` (features 1–5).
- `docs/` contains high-level overviews and per-app architecture notes; mirror any new app decisions here.
- Follow the naming pattern `project-<scenario>-<feature>-<n>` so contributors can instantly locate demos by scenario and depth.

## Build, Test, and Development Commands
- `npm install` (run per app directory) installs only the dependencies you actually modify.
- `npm run dev` starts the Next.js or Vite dev server; rely on `.env.local` for Supabase keys.
- `npm run build` produces a production bundle for deployment tests.
- `npm run lint` / `npm run format` (if defined) keep code quality consistent; check `package.json` in each app before running.

## Coding Style & Naming Conventions
- TypeScript everywhere, 2-space indentation, semicolons, single quotes.
- Components use `PascalCase.tsx`, hooks use `useSomething.ts`, utility folders stay kebab-case.
- Prefer named exports so features remain composable across demos.
- Inline styles stay minimal (Tailwind or CSS modules) and colocated with their component.

## Testing Guidelines
- Tests are optional but colocate them beside the code as `*.test.ts[x]` when you add logic worth guarding.
- Use Vitest or Jest for units and Playwright for combined app flows; keep runs under a minute.
- Execute `npm test` (or the framework-specific script) inside the relevant app before opening a pull request.

## Commit & Pull Request Guidelines
- Write Conventional Commits (e.g., `feat: menu CRUD page`, `fix: RLS policy notes`) so release notes stay machine-readable.
- Pull requests should summarize scope, list impacted apps, and attach screenshots or terminal output for UI or CLI changes.
- Reference related Supabase issues or Notion tasks, and call out env or doc updates in the description.

## Security & Configuration Tips
- Copy `.env.example` to `.env.local`, fill `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and keep those files untracked.
- Never expose service-role keys in client code; reserve them for Edge Functions or secured server contexts.
- Document relaxed Row Level Security assumptions in `docs/` whenever you diverge from production posture.

## Agent-Specific Instructions
- Keep every single-feature demo scoped to one capability, leveraging `apps/burger-template/` as the starting point.
- Favor small, pure components and colocated logic so the template stays approachable for other agents.
