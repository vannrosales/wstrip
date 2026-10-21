---
name: wstrip-dev
description: Build, review, and maintain wStrip, a free online photobooth web app (Next.js App Router on Vercel) where users pick a photostrip template, shoot with their camera, and share to Instagram or Facebook. Use this skill whenever the user works on wStrip code, mentions photobooth, photostrip, camera capture, strip templates, canvas compositing, Web Share, shareable strip links, Vercel Blob uploads, or asks to review, refactor, test, or add a feature to this app, on the frontend OR the backend, even if they don't say "wStrip" explicitly.
---

# wStrip Development Guide

wStrip is a free, no-login photobooth for friends. Flow: pick template → camera countdown → 3–4 shots → strip composed on a canvas → download or share.

Everything must stay on free tiers (Vercel Hobby plus free storage/DB quotas). That one constraint explains most rules below: do work in the browser when possible, keep serverless routes tiny, and never store more than necessary.

## Architecture in one paragraph

Next.js (App Router, TypeScript strict) deployed on Vercel. The MVP is client-side only: camera via `getUserMedia`, compositing via HTML Canvas, sharing via Web Share API. The backend (Route Handlers under `app/api/`) exists only for optional features: shareable links, event rooms, and the friends wall. If a feature can be done in the browser, do it there. Photos should never reach the server unless the user taps a share-link or publish action, because that protects privacy and keeps the app free.

## Workflow for any task

1. Decide whether the task touches frontend, backend, or both, and read the matching reference file:
   - Frontend (UI, camera, canvas, templates, sharing): `references/frontend.md`
   - Backend (API routes, storage, DB, OG images, security): `references/backend.md`
2. Make the smallest change that satisfies the request. Match existing patterns in the repo before introducing new ones.
3. Run the quality gate below before calling the work done.
4. Report what changed in one or two sentences, and flag anything that could affect free-tier limits.

## Quality gate (run before finishing)

Run what exists in the repo; if a tool is missing, mention it rather than silently skipping.

```
npm run lint        # ESLint (next lint)
npx tsc --noEmit    # strict type check
npm run test        # Vitest unit tests, if present
npm run build       # catches App Router and server/client boundary errors
```

Review checklist:
- **Types:** no `any` without a comment explaining why; shared types live in `lib/types.ts`.
- **Server/client boundary:** `"use client"` only on components that use hooks, browser APIs, or events. Camera and canvas code is always client-only.
- **Errors:** every camera, share, and upload call handles failure with a user-readable message (permission denied, no camera, share cancelled, offline).
- **Accessibility:** buttons have labels, focus states visible, countdown announced via `aria-live`, touch targets at least 44px.
- **Performance:** no large images in the main bundle, templates lazy-loaded, canvas work off the render path, Lighthouse mobile score stays above 90.
- **Security/privacy:** see backend reference; never log image data or user identifiers.
- **Free-tier impact:** note any new API route, stored file, or DB write and its approximate cost against quotas.

## Conventions

- Folder layout: `app/` routes, `components/`, `lib/` (templates, composeStrip, share helpers), `public/templates/`.
- Templates are data, not code: adding a template means adding a config entry and an asset, never editing the composer.
- Use Tailwind for styling; keep the retro photobooth look (bold type, playful colors) consistent.
- Name files in kebab-case or PascalCase for components, and keep components under roughly 150 lines by extracting hooks (`useCamera`, `useCountdown`).
- Commit messages: conventional style (`feat(booth): add burst mode`).

## Testing approach

- **Unit (Vitest):** `composeStrip`, template config validation, share helpers (mock `navigator.share`).
- **Component (React Testing Library):** template picker, countdown, share buttons with fallbacks.
- **E2E (Playwright):** full capture flow using Chromium's fake camera flags (`--use-fake-device-for-media-stream --use-fake-ui-for-media-stream`), plus a mobile viewport run.
- **API:** test Route Handlers by calling the exported handler with a `Request`, covering bad input, oversize files, and rate-limit responses.
