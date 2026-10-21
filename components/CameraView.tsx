'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { RefreshCw, CameraOff, Camera, FlipHorizontal } from 'lucide-react';
import { CameraState } from '@/lib/useCamera';

interface CameraViewProps {
  camera: CameraState;
  isFlashing: boolean;
  mirrored: boolean;
  onToggleMirror: () => void;
  onRetry: () => void;
  activeFilterCss?: string;
  children?: ReactNode;
}

export function CameraView({
  camera,
  isFlashing,
  mirrored,
  onToggleMirror,
  onRetry,
  activeFilterCss = 'none',
  children,
}: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && camera.stream) {
      videoRef.current.srcObject = camera.stream;
      videoRef.current.play().catch((err) => {
        console.warn('Video play interrupted:', err);
      });
    }
  }, [camera.stream]);

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-neutral-900 shadow-[0_0_0_0.5px_rgba(0,0,0,0.4),0_10px_30px_-10px_rgba(0,0,0,0.5)]">
      {camera.stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            transform: mirrored ? 'scaleX(-1)' : 'none',
            filter: activeFilterCss,
          }}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center text-white">
          {camera.isLoading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-white/30 border-t-white" />
              <p className="text-sm text-white/80">Starting camera...</p>
            </div>
          ) : camera.error ? (
            <div className="flex max-w-xs flex-col items-center gap-3">
              <CameraOff className="h-9 w-9 text-white/70" strokeWidth={1.5} />
              <h2 className="text-[15px] font-semibold">Camera access needed</h2>
              <p className="text-xs leading-relaxed text-white/65">{camera.error}</p>
              <button
                type="button"
                onClick={onRetry}
                className="mac-btn mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Try again
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <Camera className="h-9 w-9 text-white/60" strokeWidth={1.5} />
              <p className="text-sm text-white/70">Camera is ready</p>
            </div>
          )}
        </div>
      )}

      {/* Flash */}
      <div
        className={`pointer-events-none absolute inset-0 z-40 bg-white transition-opacity duration-150 motion-reduce:transition-none ${
          isFlashing ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {children}

      {camera.stream && (
        <div className="absolute right-3 top-3 z-20 flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleMirror}
            aria-pressed={mirrored}
            aria-label={mirrored ? 'Disable selfie mirroring' : 'Enable selfie mirroring'}
            title={mirrored ? 'Mirror: On (click to disable)' : 'Mirror: Off (click to enable)'}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium backdrop-blur-xl ring-1 ring-white/25 transition-all ${
              mirrored
                ? 'bg-[#007aff] text-white shadow-[0_0_12px_rgba(0,122,255,0.45)]'
                : 'bg-black/45 text-white/90 hover:bg-black/60'
            }`}
          >
            <FlipHorizontal className="h-3.5 w-3.5" />
            <span>{mirrored ? 'Mirror On' : 'Mirror Off'}</span>
          </button>
          <button
            type="button"
            onClick={camera.switchCamera}
            aria-label="Switch front or back camera"
            title="Switch camera"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white ring-1 ring-white/25 backdrop-blur-xl transition-colors hover:bg-black/55"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
