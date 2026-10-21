# wStrip — Free Online Photobooth

A free, open website for my FB friends. Pick a photostrip template, open the camera, snap the shots, and share the finished strip to Instagram, Facebook, or anywhere else.

- **Frontend + Backend:** Next.js (App Router, API routes / Route Handlers)
- **Hosting:** Vercel (Hobby/free plan)
- **Cost goal:** $0

---

## 1. Core Idea

1. User opens wstrip.vercel.app (no login, no install).
2. Picks a ready-made photostrip template.
3. Allows camera access, gets a countdown, and shoots 3–4 photos automatically.
4. Photos are composed into the template strip.
5. User downloads or shares the strip to social media.

---

## 2. MVP Features (Phase 1)

| # | Feature | Notes |
|---|---------|-------|
| 1 | **Template picker** | 6–10 built-in strip designs (classic B&W, pastel, film, Y2K, birthday, etc.) |
| 2 | **Live camera** | `getUserMedia`, front/back camera switch, mirrored selfie preview |
| 3 | **Auto-shoot sequence** | Countdown (3-2-1), flash effect, 3 or 4 shots in a row |
| 4 | **Retake** | Retake a single frame or the whole strip |
| 5 | **Strip composer** | Render photos into the template using HTML Canvas, high-res PNG output |
| 6 | **Download** | Save PNG/JPG to device |
| 7 | **Share button** | Web Share API (opens native share sheet with Instagram, Facebook, Messenger, etc.) |
| 8 | **Mobile-first UI** | Works great on phones, also on desktop webcams |
| 9 | **No sign-up** | Zero friction for friends |

---

## 3. Nice-to-Have Features (Phase 2)

- **Filters:** B&W, sepia, vintage film, soft glow, grain
- **Stickers & emojis:** drag/drop, resize, rotate on the finished strip
- **Custom text:** caption, date stamp, event name ("Maria's 25th 🎉")
- **Upload instead of camera:** pick photos from gallery
- **Layout options:** 2x6 vertical, 4x1, 2x2 grid, polaroid
- **Custom background color** or pattern per template
- **Timer settings:** 3s / 5s / 10s countdown
- **Burst/GIF mode:** animated GIF or short video of the strip being "taken"
- **Sound effects:** camera shutter, countdown beeps (with mute toggle)
- **Dark/light theme**
- **PWA:** installable on home screen, works offline for capturing

---

## 4. Social / Shareable Features (Phase 3)

- **Shareable link per strip:** short URL like `wstrip.vercel.app/s/abc123` with Open Graph preview image (so FB/IG link previews show the strip)
- **Strip gallery (optional, opt-in):** a "Friends Wall" where users choose to publish their strip
- **Event rooms:** a code/link for a party; all strips taken with that code collect in one album
- **QR code:** show a QR at events so guests open the booth instantly
- **Watermark toggle:** small "wStrip" mark, on by default, removable
- **Reactions / likes** on the public wall
- **Report/delete button** for moderation

---

## 5. Sharing Strategy (Important)

Instagram and Facebook **do not allow direct posting from a website** without app review and business accounts. The free, reliable approach:

1. **Web Share API with files** (`navigator.share({ files })`) — on mobile, opens the native share sheet, where the user picks Instagram (Feed/Story), Facebook, Messenger, WhatsApp, etc.
2. **Fallback on desktop:** Download button + "Copy image" + shortcut links:
   - Facebook share dialog (for the shareable link)
   - X/Twitter, WhatsApp, Telegram, Messenger link shares
3. **Open Graph meta tags** on shared links so the strip previews nicely.

---

## 6. Tech Stack (all free tier)

| Layer | Choice |
|-------|--------|
| Framework | Next.js 15 (App Router) + TypeScript |
| Styling | Tailwind CSS (+ shadcn/ui optional) |
| Camera | Browser `MediaDevices.getUserMedia` |
| Image compose | HTML Canvas (client-side) |
| State | React state / Zustand |
| Backend | Next.js Route Handlers (`/app/api/*`) on Vercel serverless |
| Storage (only if sharing links/gallery) | Vercel Blob (free quota) or Supabase/Cloudflare R2 free tier |
| Database (only for gallery/rooms) | Vercel Postgres / Neon / Upstash Redis free tier |
| OG images | `next/og` (ImageResponse) |
| Analytics | Vercel Analytics (free) |
| Deployment | Vercel (GitHub → auto deploy) |

**Key design choice:** In the MVP, everything runs **in the browser**. Photos never touch the server, so it's free, fast, and private. The backend is only needed for shareable links, event rooms, and the gallery.

---

## 7. Suggested Project Structure

```
wstrip/
├─ app/
│  ├─ page.tsx                 # landing + template picker
│  ├─ booth/page.tsx           # camera + capture flow
│  ├─ result/page.tsx          # preview, edit, share
│  ├─ s/[id]/page.tsx          # public shared strip (Phase 3)
│  ├─ api/
│  │  ├─ upload/route.ts       # save strip to Blob
│  │  ├─ strip/[id]/route.ts   # fetch strip metadata
│  │  └─ og/route.tsx          # dynamic OG image
├─ components/
│  ├─ CameraView.tsx
│  ├─ Countdown.tsx
│  ├─ TemplateCard.tsx
│  ├─ StripCanvas.tsx
│  └─ ShareButtons.tsx
├─ lib/
│  ├─ templates.ts             # template definitions (JSON)
│  ├─ composeStrip.ts          # canvas drawing logic
│  └─ share.ts                 # Web Share helpers
├─ public/templates/           # template PNG overlays / frames
└─ plan.md
```

---

## 8. Template System

Each template is a config object so adding new ones is easy:

```ts
{
  id: "classic-bw",
  name: "Classic B&W",
  shots: 4,
  size: { width: 600, height: 1800 },
  slots: [ {x, y, w, h}, ... ],   // where photos go
  frame: "/templates/classic-bw.png", // overlay with transparent holes
  filter: "grayscale(1)",
  footer: { text: "wStrip", date: true }
}
```

---

## 9. Roadmap

**Week 1 — MVP**
- [ ] Set up Next.js + Tailwind, deploy blank app to Vercel
- [ ] Camera access + mirrored preview
- [ ] Countdown + auto-capture of 4 shots
- [ ] 3 starter templates + canvas composer
- [ ] Download PNG

**Week 2 — Share + Polish**
- [ ] Web Share API + desktop fallbacks
- [ ] Retake flow, filters
- [ ] Mobile UI polish, shutter sound, flash animation
- [ ] 6–10 templates total

**Week 3 — Social**
- [ ] Upload to Vercel Blob, shareable link, OG preview image
- [ ] Stickers + text
- [ ] PWA install

**Week 4 — Community**
- [ ] Event rooms + QR code
- [ ] Opt-in friends wall
- [ ] Moderation (report/delete), rate limiting

---

## 10. Free-Tier Limits & Watch-outs

- **Vercel Hobby** is for personal/non-commercial use — fine for a friends project.
- **Serverless limits:** keep API routes light; compose images client-side.
- **Blob/DB quotas:** compress strips (JPEG ~85%), auto-delete after 7–30 days to stay free.
- **Camera needs HTTPS** — Vercel provides it by default.
- **iOS Safari quirks:** needs user tap to start camera; use `playsInline` on `<video>`.
- **Privacy:** state clearly "photos are processed on your device"; only upload when the user taps Share link.
- **Abuse:** add rate limiting (Upstash free) and file size/type checks on upload.

---

## 11. Success Checklist

- [ ] Opens and works on iPhone + Android browsers
- [ ] From landing to finished strip in under 30 seconds
- [ ] Share sheet shows Instagram and Facebook on mobile
- [ ] Runs entirely on free plans
- [ ] My FB friends actually use it 🎉

---

## 12. Name & Branding Ideas

- Name: **wStrip**
- Tagline: *"Snap. Strip. Share."*
- Style: retro photobooth vibe, bold type, playful colors, small curtain/flash animations
