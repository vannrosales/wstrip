import Link from 'next/link';
import {
  Aperture,
  ArrowRight,
  Camera,
  Download,
  Film,
  Layers,
  Lock,
  Palette,
  RotateCcw,
  Share2,
  Smartphone,
  Sparkles,
  Timer,
} from 'lucide-react';
import { MacWindow } from '@/components/MacWindow';
import { TemplateStripPreview } from '@/components/TemplateStripPreview';
import { TEMPLATES } from '@/lib/templates';

const CORE_SHOWCASE_FEATURES = [
  {
    number: '01',
    icon: Layers,
    title: 'Template Picker',
    body: 'Choose from 8 curated photostrip designs with tailored typography and layouts (Classic B&W, 35mm Film, Retro Polaroid, Pastel Dream, Cyber Y2K, and more).',
    tint: '#af52de',
  },
  {
    number: '02',
    icon: Camera,
    title: 'Live Camera & Viewfinder',
    body: 'Access your device camera with real-time selfie mirroring, front/back lens switching, and an upload-from-gallery fallback.',
    tint: '#007aff',
  },
  {
    number: '03',
    icon: Timer,
    title: 'Auto-Shoot Sequence',
    body: 'Automated shooting with a 3s or 5s countdown timer, synthesized audio beeps, and studio flash effects that capture 3–4 photos in a row.',
    tint: '#ff9500',
  },
  {
    number: '04',
    icon: RotateCcw,
    title: 'Retake & Frame Control',
    body: 'Review captured thumbnails and retake any single shot without losing the rest, or restart the entire sequence in one tap.',
    tint: '#ff2d55',
  },
];

const FEATURES = [
  {
    icon: Camera,
    title: 'Live camera',
    body: 'Front or back camera, mirrored selfie preview, and a countdown with a studio flash.',
    tint: '#007aff',
  },
  {
    icon: Layers,
    title: '8 strip templates',
    body: 'Classic black and white, 35mm film, pastel, Y2K and more. Add your own caption and date.',
    tint: '#af52de',
  },
  {
    icon: Palette,
    title: 'Filters and stickers',
    body: 'Tune the look with film filters and drop vector stickers onto the finished strip.',
    tint: '#ff9500',
  },
  {
    icon: Share2,
    title: 'Share anywhere',
    body: 'Open the native share sheet for Instagram, Facebook, Messenger and WhatsApp.',
    tint: '#ff2d55',
  },
  {
    icon: Lock,
    title: 'Private by design',
    body: 'Photos are processed on your device. Nothing is uploaded unless you choose to.',
    tint: '#34c759',
  },
  {
    icon: Smartphone,
    title: 'Made for phones',
    body: 'Mobile-first and touch friendly, and it works on desktop webcams too.',
    tint: '#5856d6',
  },
];

const STEPS = [
  { icon: Layers, title: 'Pick a template', body: 'Choose a strip style that fits the mood.' },
  { icon: Timer, title: 'Strike a pose', body: 'A 3-2-1 countdown snaps every photo for you.' },
  { icon: Download, title: 'Save or share', body: 'Download a high-res PNG or share it instantly.' },
];

export default function LandingPage() {
  const showcase = [TEMPLATES[0], TEMPLATES[3], TEMPLATES[1], TEMPLATES[4]];

  return (
    <div className="flex flex-col items-center pb-20">
      {/* Hero */}
      <section className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 pb-10 pt-12 sm:px-6 md:grid-cols-2 md:pt-20">
        <div className="text-center md:text-left">
          <p className="mx-auto inline-flex items-center gap-2 rounded-full bg-white/60 px-3 py-1 text-xs font-medium text-black/70 shadow-[0_0_0_0.5px_rgba(0,0,0,0.12)] backdrop-blur-xl md:mx-0">
            <Aperture className="h-3.5 w-3.5 text-[#007aff]" />
            Free online photobooth. No login.
          </p>
          <h1 className="mt-5 text-5xl font-semibold leading-[1.05] tracking-tight text-black/90 sm:text-6xl lg:text-7xl">
            Snap. Strip.
            <br />
            <span className="bg-gradient-to-r from-[#007aff] via-[#af52de] to-[#ff2d55] bg-clip-text text-transparent">
              Share.
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-md text-lg leading-relaxed text-black/60 md:mx-0">
            Pick a photostrip template, take 3 or 4 photos with friends, and share the result
            anywhere. It all happens in your browser.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row md:justify-start">
            <Link
              href="/templates"
              className="mac-btn-primary inline-flex h-12 items-center gap-2 px-6 text-[15px]"
            >
              <Sparkles className="h-4 w-4" />
              Open the photobooth
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#showcase" className="mac-btn inline-flex h-12 items-center gap-2 px-5 text-[15px]">
              <Film className="h-4 w-4 text-[#007aff]" />
              Watch 20s Demo
            </a>
          </div>
        </div>

        {/* Hero visual */}
        <div className="relative mx-auto w-full max-w-md">
          <MacWindow title="wStrip" className="relative z-10">
            <div className="flex items-end justify-center gap-4 bg-gradient-to-b from-white/40 to-white/10 px-6 pb-8 pt-8">
              {showcase.slice(0, 3).map((t, i) => (
                <div
                  key={t.id}
                  className="animate-floaty"
                  style={
                    {
                      '--r': `${(i - 1) * 4}deg`,
                      animationDelay: `${i * 0.6}s`,
                      marginBottom: i === 1 ? 24 : 0,
                    } as React.CSSProperties
                  }
                >
                  <TemplateStripPreview template={t} width={96} />
                </div>
              ))}
            </div>
          </MacWindow>
        </div>
      </section>

      {/* 20-Second Motion Graphics Product Showcase */}
      <section
        id="showcase"
        className="mx-auto w-full max-w-6xl scroll-mt-16 px-4 pt-12 sm:px-6"
        aria-labelledby="showcase-title"
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#007aff]/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-[#007aff]">
            <Film className="h-3.5 w-3.5" />
            20-Second Product Showreel
          </span>
          <h2
            id="showcase-title"
            className="mt-3 text-3xl font-semibold tracking-tight text-black/90 sm:text-4xl"
          >
            See wStrip in motion
          </h2>
          <p className="mt-2 max-w-xl text-sm text-black/60 sm:text-base">
            Unmute the player for the full stereo soundtrack, countdown beeps, and camera shutter SFX.
          </p>
        </div>

        <MacWindow title="wStrip — 20s Motion Graphics Showcase (1080p · 30fps)">
          <div className="bg-black/95">
            <video
              src="/wstrip-promo.mp4"
              controls
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              className="aspect-video w-full object-cover"
            >
              Your browser does not support embedded MP4 video.
            </video>
          </div>
        </MacWindow>

        <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CORE_SHOWCASE_FEATURES.map(({ number, icon: Icon, title, body, tint }) => (
            <li key={number} className="mac-card flex flex-col justify-between p-5">
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-[10px] text-white shadow-sm"
                    style={{ background: `linear-gradient(${tint}cc, ${tint})` }}
                  >
                    <Icon className="h-4 w-4" strokeWidth={2.2} />
                  </span>
                  <span className="font-mono text-xs font-bold tracking-widest text-black/40">
                    FEATURE {number}
                  </span>
                </div>
                <h3 className="mt-3.5 text-[15px] font-semibold text-black/85">{title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-black/60">{body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Features */}
      <section className="mx-auto w-full max-w-6xl px-4 pt-16 sm:px-6" aria-labelledby="features-title">
        <h2 id="features-title" className="text-center text-3xl font-semibold tracking-tight text-black/85">
          Everything a photobooth needs
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-black/55">
          Designed to feel at home on your phone or your Mac.
        </p>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, body, tint }) => (
            <li key={title} className="mac-card p-5">
              <span
                className="flex h-10 w-10 items-center justify-center rounded-[10px] text-white shadow-sm"
                style={{ background: `linear-gradient(${tint}cc, ${tint})` }}
              >
                <Icon className="h-5 w-5" strokeWidth={2} />
              </span>
              <h3 className="mt-4 text-[15px] font-semibold text-black/85">{title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-black/55">{body}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mx-auto w-full max-w-4xl scroll-mt-16 px-4 pt-24 sm:px-6">
        <MacWindow title="How it works">
          <ol className="grid divide-black/10 sm:grid-cols-3 sm:divide-x">
            {STEPS.map(({ icon: Icon, title, body }, i) => (
              <li key={title} className="flex flex-col items-center p-8 text-center">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#007aff] text-xs font-semibold text-white">
                  {i + 1}
                </span>
                <Icon className="mt-5 h-8 w-8 text-black/70" strokeWidth={1.5} />
                <h3 className="mt-3 text-[15px] font-semibold text-black/85">{title}</h3>
                <p className="mt-1 text-sm text-black/55">{body}</p>
              </li>
            ))}
          </ol>
        </MacWindow>
      </section>

      {/* Template showcase */}
      <section className="mx-auto w-full max-w-6xl px-4 pt-24 sm:px-6" aria-labelledby="templates-title">
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <h2 id="templates-title" className="text-3xl font-semibold tracking-tight text-black/85">
            Pick your style
          </h2>
          <Link href="/templates" className="inline-flex items-center gap-1 text-sm font-medium text-[#007aff] hover:underline">
            See all templates <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mac-card mt-6 flex flex-wrap items-end justify-center gap-8 p-8">
          {TEMPLATES.slice(0, 6).map((t) => (
            <figure key={t.id} className="flex flex-col items-center gap-3">
              <TemplateStripPreview template={t} width={104} />
              <figcaption className="text-xs font-medium text-black/60">{t.name}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto w-full max-w-3xl px-4 pt-24 text-center sm:px-6">
        <h2 className="text-4xl font-semibold tracking-tight text-black/90">Ready when you are</h2>
        <p className="mt-3 text-black/55">Grab a friend and make your first strip in under 30 seconds.</p>
        <Link
          href="/templates"
          className="mac-btn-primary mt-7 inline-flex h-12 items-center gap-2 px-7 text-[15px]"
        >
          <Camera className="h-4 w-4" />
          Start taking photos
        </Link>
      </section>

      <footer className="mt-20 text-center text-xs text-black/45">
        wStrip &middot; Free forever &middot; Photos stay on your device
      </footer>
    </div>
  );
}
