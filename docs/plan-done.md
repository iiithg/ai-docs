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

Date: 2025-11-03

## Plan

- PLAN-042 — Storage avatars + header layout polish (-4)
  - Date: 2025-11-03
  - Scope: Improve front-end layout in storage demo; add header avatar that reflects `profiles.avatar_url` after upload; keep components small and base on template styles.
  - Outputs: Updated `apps/project-burger-shop-storage-uploads-4/app/layout.tsx`, new `HeaderBar` and `ProfileAvatar` components, minor UI tweaks on profile page.

## Done

- DONE-042 — Header avatar and layout improved (-4)
  - Date: 2025-11-03
  - Result: Added `HeaderBar` with live `ProfileAvatar` that updates after uploads; polished `/profile` layout; dispatches `avatar:updated` event post-upload so header reflects the new image instantly.

Date: 2025-11-03

## Plan

- PLAN-043 — Simplify profile page layout (-4)
  - Date: 2025-11-03
  - Scope: Remove redundant left info card; merge account row + current avatar preview into the upload card for a single-column clean layout.
  - Outputs: Updated `apps/project-burger-shop-storage-uploads-4/app/profile/page.tsx` only.

## Done

- DONE-043 — Merged info into upload card (-4)
  - Date: 2025-11-03
  - Result: Single card now shows signed-in info, current avatar, and uploader; cleaner DOM without the extra column.

Date: 2025-11-03

## Plan

- PLAN-044 — Improve upload error messages (-4)
  - Date: 2025-11-03
  - Scope: When TUS returns 404 Bucket not found, show bucket name, object path, endpoint, status, and a clear hint to create the bucket.
  - Outputs: Update `UppyUpload.tsx` to format rich errors and surface actionable guidance.

## Done

- DONE-044 — Actionable TUS errors (-4)
  - Date: 2025-11-03
  - Result: Error panel now displays bucket/object/endpoint/status and a hint (e.g., create `avatars` bucket), making misconfig quickly diagnosable.

Date: 2025-11-03

## Plan

- PLAN-045 — Align uploads to existing RLS (-4)
  - Date: 2025-11-03
  - Scope: Without changing policies, force uploads to `avatars/public/*.jpg` so anon uploads pass current RLS.
  - Outputs: Update `UppyUpload.tsx` file-added path/extension.

## Done

- DONE-045 — Policy-compatible upload path (-4)
  - Date: 2025-11-03
  - Result: Anonymous uploads now go to `public/avatar-<ts>-<uuid>.jpg`, matching the project’s RLS; uploads should succeed without policy changes.

Date: 2025-11-03

## Plan

- PLAN-046 — Fallback to signed URL when bucket is private (-4)
  - Date: 2025-11-03
  - Scope: Detect bucket publicity and on success prefer public URL; otherwise generate 1h signed URL so links always open.
  - Outputs: Update `UppyUpload.tsx` upload-success to call `getBucket` + `createSignedUrl`.

## Done

- DONE-046 — Always-open links (public or signed) (-4)
  - Date: 2025-11-03
  - Result: Viewer link now works even if bucket is private, by using signed URLs; message indicates which mode is used.

Date: 2025-11-03

## Plan

- PLAN-047 — Document Public vs Signed URL in README (-4)
  - Date: 2025-11-03
  - Scope: Add a README section with the exact code snippet that prefers public URL and falls back to signed URL, plus explanations and notes.
  - Outputs: Update `apps/project-burger-shop-storage-uploads-4/README.md`.

## Done

- DONE-047 — README updated with URL strategy (-4)
  - Date: 2025-11-03
  - Result: Added "Public URL vs Signed URL" section with the precise code sample and guidance; clarified file organization and RLS troubleshooting.
- PLAN-048 — Avoid fake public URL on private buckets (-4)
  - Date: 2025-11-03
  - Scope: Verify public URL with HEAD; only fall back to signed URL; never show public URL when it would 404; update README notes.
  - Outputs: Update `UppyUpload.tsx` and README wording.

## Done

- DONE-048 — Accurate URL detection for private buckets (-4)
  - Date: 2025-11-03
  - Result: Public URLs are validated; if inaccessible, the component returns a signed URL or explains why signing failed.
- PLAN-049 — Show both Public and Signed URLs (-4)
  - Date: 2025-11-03
  - Scope: After upload, render both the computed Public URL and a (1h) Signed URL when available, with status badges and copyable links; update README.
  - Outputs: Update `UppyUpload.tsx` and `README.md`.

## Done

- DONE-049 — Dual-link display after upload (-4)
  - Date: 2025-11-03
  - Result: UI now lists Public URL (OK/blocked) and Signed URL (1h). Users can pick either without toggling bucket visibility.
- PLAN-050 — Gracefully handle missing accessible URL (-4)
  - Date: 2025-11-03
  - Scope: Do not throw when signed/public links are unavailable; show success with clear guidance and keep dual-link section visible.
  - Outputs: Update `UppyUpload.tsx` and README notes.

## Done

- DONE-050 — No-URL success message with guidance (-4)
  - Date: 2025-11-03
  - Result: Users see that the file uploaded but why links are unavailable, plus options to fix (public bucket, select policy, or server signing).
- PLAN-051 — Tidy profile UI and simplify links (-4)
  - Date: 2025-11-03
  - Scope: Remove duplicate headings, add link-details toggle, better copy for signed-out state, and cleaner spacing.
  - Outputs: Update `UppyUpload.tsx` (props + toggle) and `profile/page.tsx` texts/layout.

## Done

- DONE-051 — Cleaner profile page and link UX (-4)
  - Date: 2025-11-03
  - Result: Single clear “Upload avatar” section, dual links collapsed by default with a “Show link details” toggle; less clutter overall.
- PLAN-052 — Always show both links (-4)
  - Date: 2025-11-03
  - Scope: Remove the toggle and render Public + Signed URLs by default after upload.
  - Outputs: Update `UppyUpload.tsx` link section.

## Done

- DONE-052 — Dual links visible by default (-4)
  - Date: 2025-11-03
  - Result: Users see both Public and Signed URLs immediately; Public shows OK/blocked state.
- PLAN-053 — Add client-side RLS debug panel (-4)
  - Date: 2025-11-03
  - Scope: On each upload/sign attempt, display role, bucket, folder, extension, and PASS/FAIL vs. current policy assumptions.
  - Outputs: Update `UppyUpload.tsx` with a debug preformatted block.

## Done

- DONE-053 — Visible RLS checks and role info (-4)
  - Date: 2025-11-03
  - Result: Users can see current role (anon/authenticated), object path details, and which policy clauses pass/fail to diagnose why signing fails.
- PLAN-054 — Prevent unintended TUS resume (-4)
  - Date: 2025-11-03
  - Scope: Disable tus resume cache so re-selecting the same local file triggers a fresh upload; avoid confusion where remote seems unchanged.
  - Outputs: Set `resume: false` and `removeFingerprintOnSuccess: true` in `UppyUpload.tsx` Tus options.

## Done

- DONE-054 — Fresh upload for same local file (-4)
  - Date: 2025-11-03
  - Result: Selecting the same file now creates a new upload (unique objectName); no silent resume from cached fingerprint.
- PLAN-055 — Document TUS resume cache pitfall (-4)
  - Date: 2025-11-03
  - Scope: Add README section explaining why re-selecting the same local file may not upload again, and how we disabled resume cache.
  - Outputs: Update `apps/project-burger-shop-storage-uploads-4/README.md` with code and alternatives.

## Done

- DONE-055 — README covers TUS cache behavior (-4)
  - Date: 2025-11-03
  - Result: Added a troubleshooting subsection with the exact Tus config (`resume: false`, `removeFingerprintOnSuccess: true`) and options for overwrite vs. new filenames.
- PLAN-056 — Add Chinese note about TUS resume pitfalls (-4)
  - Date: 2025-11-03
  - Scope: Document in README a Chinese caution section about resumable uploads and how this demo config avoids pitfalls.
  - Outputs: Update storage-uploads-4 README.

## Done

- DONE-056 — Chinese caution added for TUS resume (-4)
  - Date: 2025-11-03
  - Result: README now includes “注意事项：小心断点续传的设定” with concrete do/don’t guidance and safe alternatives.
- PLAN-057 — Document avatar upload + save flow (-4)
  - Date: 2025-11-03
  - Scope: Add a README section with Mermaid sequence, client-direct and server-assisted patterns, minimal SQL for `profiles`, and code snippets to update avatar_url.
  - Outputs: Update `apps/project-burger-shop-storage-uploads-4/README.md`.

## Done

- DONE-057 — README: avatar workflow documented (-4)
  - Date: 2025-11-03
  - Result: New section covers Storage naming, RLS, upload, link generation, DB update, and optional server routes, with Mermaid diagram and copy-paste code.
- PLAN-058 — Remove unused avatar UI (-4)
  - Date: 2025-11-03
  - Scope: Remove profile page's inline current-avatar preview section and hide header fallback avatar placeholder when no URL.
  - Outputs: Update `profile/page.tsx` and `components/ProfileAvatar.tsx`.

## Done

- DONE-058 — Cleaned up avatar placeholders (-4)
  - Date: 2025-11-03
  - Result: Removed the current-avatar preview block from `/profile` and the header's default 👤 placeholder; header avatar only shows when a real URL exists.
- PLAN-059 — Remove header Settings button (-4)
  - Date: 2025-11-03
  - Scope: Drop the Settings button from the top header; keep ProfileAvatar only.
  - Outputs: Update `app/components/HeaderBar.tsx`.

## Done

- DONE-059 — Header cleaned (no Settings) (-4)
  - Date: 2025-11-03
  - Result: Removed the header Settings button per request; layout unchanged and avatar remains.
- PLAN-060 — Remove File URL block; explain blocked (-4)
  - Date: 2025-11-03
  - Scope: Hide the legacy File URL section on profile; add inline explanation for Public=blocked meaning in Uppy links.
  - Outputs: Update `profile/page.tsx` and `UppyUpload.tsx`.

## Done

- DONE-060 — Cleaner links + blocked note (-4)
  - Date: 2025-11-03
  - Result: Profile no longer shows duplicate File URL; link list explains that blocked=private bucket or missing read policy; prefer Signed link.
