# wStrip Frontend Reference

## Contents
1. Camera
2. Capture flow
3. Template system
4. Strip composer (canvas)
5. Sharing
6. Mobile and iOS quirks
7. UI and accessibility

## 1. Camera

- Wrap `navigator.mediaDevices.getUserMedia` in a `useCamera` hook that returns `{ stream, error, start, stop, switchCamera }`.
- Request `{ video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 960 } }, audio: false }`.
- Always stop tracks on unmount (`stream.getTracks().forEach(t => t.stop())`) so the camera light turns off.
- Mirror the live preview with CSS (`transform: scaleX(-1)`) for selfie cameras, but capture the un-mirrored frame unless the user turns "mirror photo" on, because text and signs would otherwise appear reversed.
- Handle each error name distinctly: `NotAllowedError` (show how to re-enable permission), `NotFoundError` (offer upload fallback), `NotReadableError` (camera in use by another app).
- Camera only works over HTTPS or localhost. Vercel provides HTTPS.

## 2. Capture flow

State machine: `idle → countdown → flash → captured(n) → … → review → composed`.
- Keep it in a reducer or small Zustand store so retake-one-frame and retake-all are simple transitions.
- Countdown uses `setTimeout` chains cleaned up in effect cleanup; announce numbers with `aria-live="assertive"`.
- Capture frames by drawing the `<video>` element to an offscreen canvas, then `toBlob` (JPEG 0.92) to keep memory low. Revoke object URLs when frames are discarded.
- Flash effect is a white overlay fading out in about 150ms; shutter sound is optional with a visible mute toggle.

## 3. Template system

Templates are config objects in `lib/templates.ts`:

```ts
type StripTemplate = {
  id: string;
  name: string;
  shots: 2 | 3 | 4;
  size: { width: number; height: number };
  slots: { x: number; y: number; w: number; h: number }[];
  frame?: string;            // PNG overlay with transparent photo holes
  background: string;        // color or gradient
  filter?: string;           // CSS filter string
  footer?: { text: string; date?: boolean };
};
```

- Validate that `slots.length === shots` in a unit test so a bad template fails CI, not in front of a user.
- Frame PNGs live in `public/templates/`; lazy-load them when the user hovers or selects a template.

## 4. Strip composer (canvas)

- `composeStrip(photos, template) → Promise<Blob>` is a pure function: no DOM reads except creating a canvas. That makes it testable.
- Draw order: background → each photo cropped with "cover" fit into its slot → frame overlay → footer text.
- Render at 2x the display size for sharp output; cap total pixels (about 12MP) to avoid iOS canvas memory crashes.
- Apply filters through `ctx.filter` where supported, with a pixel-manipulation fallback for older Safari.
- Wait for fonts (`document.fonts.ready`) before drawing text.

## 5. Sharing

Order of preference:
1. `navigator.canShare({ files })` then `navigator.share({ files, title: "My wStrip" })`. This opens the native sheet, where Instagram and Facebook appear on mobile.
2. Desktop fallback: download button, "copy image" via `ClipboardItem`, and link shares (Facebook sharer, WhatsApp, X, Telegram) that point at the shareable URL if one exists.
- Treat `AbortError` from `share()` as the user cancelling, not a failure.
- Never promise "post directly to Instagram." The web cannot do that without app review, so label the button "Share".

## 6. Mobile and iOS quirks

- `<video playsInline muted autoPlay>` is required, or iOS Safari opens fullscreen or refuses to play.
- Start the camera from a user tap on iOS.
- Use `100dvh` rather than `100vh` to avoid the collapsing address bar.
- Prevent the screen sleeping during a session if `navigator.wakeLock` is available.
- Test the strip output on a real iPhone; canvas size limits differ from desktop.

## 7. UI and accessibility

- Mobile-first, thumb-reachable primary button at the bottom, minimum 44px targets.
- Respect `prefers-reduced-motion` (skip flash animation, shorten transitions).
- Provide text alternatives, visible focus rings, and sufficient contrast, including on colored templates.
- Show clear progress ("Photo 2 of 4") and always offer a way to go back.
