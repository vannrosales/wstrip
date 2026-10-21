'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Aperture, Volume2, VolumeX } from 'lucide-react';
import { useSyncExternalStore } from 'react';

const NAV_LINKS = [
  { href: '/templates', label: 'Templates' },
  { href: '/booth', label: 'Booth' },
];

const MUTE_KEY = 'wstrip_sound_muted';
const MUTE_EVENT = 'wstrip-sound-change';

function subscribeMute(cb: () => void) {
  window.addEventListener(MUTE_EVENT, cb);
  window.addEventListener('storage', cb);
  return () => {
    window.removeEventListener(MUTE_EVENT, cb);
    window.removeEventListener('storage', cb);
  };
}

/** macOS-style translucent menu bar. */
export function Navbar() {
  const pathname = usePathname();
  const muted = useSyncExternalStore(
    subscribeMute,
    () => localStorage.getItem(MUTE_KEY) === 'true',
    () => false
  );

  const toggleSound = () => {
    localStorage.setItem(MUTE_KEY, String(!muted));
    window.dispatchEvent(new Event(MUTE_EVENT));
  };

  return (
    <header className="mac-menubar sticky top-0 z-50 w-full">
      <nav
        aria-label="Main"
        className="mx-auto flex h-9 max-w-6xl items-center justify-between px-3 text-[13px] sm:px-5"
      >
        <div className="flex items-center gap-1">
          <Link
            href="/"
            aria-label="wStrip home"
            className="flex items-center gap-1.5 rounded-md px-2 py-1 font-bold text-black/85 hover:bg-black/5"
          >
            <Aperture className="h-4 w-4 text-[#007aff]" strokeWidth={2.25} />
            <span>wStrip</span>
          </Link>
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={pathname === l.href ? 'page' : undefined}
              className={`rounded-md px-2.5 py-1 font-medium transition-colors hover:bg-black/5 ${
                pathname === l.href ? 'text-black' : 'text-black/65'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <button
          type="button"
          onClick={toggleSound}
          aria-pressed={muted}
          aria-label={muted ? 'Unmute booth sounds' : 'Mute booth sounds'}
          className="flex h-7 w-7 items-center justify-center rounded-md text-black/65 hover:bg-black/5"
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
      </nav>
    </header>
  );
}
