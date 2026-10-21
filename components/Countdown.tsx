'use client';

interface CountdownProps {
  currentCount: number | null;
}

export function Countdown({ currentCount }: CountdownProps) {
  if (currentCount === null || currentCount <= 0) {
    return null;
  }

  return (
    <div
      aria-live="assertive"
      aria-atomic="true"
      className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-black/25 backdrop-blur-[3px]"
    >
      <div
        key={currentCount}
        className="flex h-36 w-36 items-center justify-center rounded-full bg-white/25 text-8xl font-semibold text-white shadow-2xl ring-1 ring-white/40 backdrop-blur-xl"
        style={{ animation: 'fadeIn 0.3s ease-out' }}
      >
        {currentCount}
      </div>
      <span className="sr-only">Taking photo in {currentCount}</span>
    </div>
  );
}
