# wStrip Backend Reference

## Contents
1. When a backend is needed
2. Route Handler rules
3. Storage (Vercel Blob)
4. Database (rooms, wall)
5. OG images
6. Security and abuse prevention
7. Privacy and retention
8. Free-tier budget

## 1. When a backend is needed

The MVP has no backend: camera, compositing, download, and share all run in the browser. Add server code only for:
- Shareable link per strip (`/s/[id]`) with a link preview
- Event rooms (a code that groups strips)
- Opt-in friends wall, reports, and deletion

If a request can be met client-side, say so and do it there. Fewer server calls means lower cost and better privacy.

## 2. Route Handler rules

- Files live at `app/api/<name>/route.ts` and export `GET`, `POST`, `DELETE` as needed.
- Keep handlers thin: parse and validate input, call a function in `lib/server/`, return JSON. This keeps logic testable without HTTP.
- Validate every input with a schema (Zod). Reject unknown fields.
- Return consistent errors: `{ error: { code, message } }` with correct status codes (400 bad input, 413 too large, 429 rate limited).
- Use the Node runtime for Blob uploads; use Edge only for tiny, stateless routes like OG images.
- Never trust the client for ids, sizes, or content types.

## 3. Storage (Vercel Blob)

- Upload only after the user explicitly taps "Get share link."
- Accept `image/jpeg` or `image/png` only, verified by checking magic bytes, not just the header. Cap at about 1.5MB per strip; the client compresses to JPEG around 0.85 first.
- Generate ids server-side with `nanoid(10)`; never use user-supplied filenames.
- Store at `strips/<id>.jpg` with a stored `expiresAt`.
- A scheduled cleanup (Vercel Cron, free plan allows daily) deletes expired blobs and rows.

## 4. Database (rooms, wall)

Use Upstash Redis or Neon Postgres free tier. Minimal shapes:

```ts
Strip { id, blobUrl, createdAt, expiresAt, roomCode?, isPublic }
Room  { code, name, createdAt, expiresAt }
Report{ stripId, reason, createdAt }
```

- Room codes: 6 characters, uppercase, no ambiguous letters (0/O, 1/I).
- Deleting a strip removes both the row and the blob. Give the creator a `deleteToken` at upload time (stored hashed) so they can remove it without an account.

## 5. OG images

- `app/s/[id]/page.tsx` exports `generateMetadata` that sets `og:image` to the strip's Blob URL (or `/api/og?id=...`) plus `twitter:card: summary_large_image`.
- If rendering a branded card, use `next/og` `ImageResponse` with fonts bundled locally, and set `Cache-Control` so previews are cached at the CDN. Facebook's crawler needs a public, fast, absolute URL.
- Private (non-public) strips use unguessable ids and `robots: noindex`.

## 6. Security and abuse prevention

- **Rate limiting:** Upstash `@upstash/ratelimit` keyed by IP hash, for example 10 uploads per hour. Return 429 with `Retry-After`.
- **Size and type checks** before touching storage; reject early.
- **No secrets in the client:** Blob/DB tokens only in server env vars set in Vercel project settings; never commit `.env*`.
- **CORS:** same-origin by default; do not add wildcard CORS to upload routes.
- **Moderation:** public wall entries need a report button; reports hide the item until reviewed. Consider an owner-only admin route protected by a secret.
- **Headers:** set a sensible `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, and `Referrer-Policy` in `next.config`.
- Do not log image bytes, full IPs, or tokens.

## 7. Privacy and retention

- Default message on the site: photos are processed on your device; nothing is uploaded unless you create a link.
- Auto-expire uploaded strips (7 to 30 days) and tell the user the expiry date.
- Provide a delete link or button for every uploaded strip.
- Public wall is strictly opt-in, off by default, with a clear preview of what will be shown.

## 8. Free-tier budget

Before adding a route, table, or stored file, estimate:
- Average strip size (about 300 to 800KB) times expected strips per month against Blob quota
- Function invocations and duration against Vercel Hobby limits
- DB reads/writes against the free plan

Prefer static generation and CDN caching for read paths. If a feature risks exceeding free limits, flag it in the summary and propose a cheaper alternative (shorter expiry, lower resolution, client-only fallback).
