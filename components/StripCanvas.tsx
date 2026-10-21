'use client';

import { useState, useEffect } from 'react';
import { StripTemplate, StripCompositionOptions } from '@/lib/types';
import { composeStrip } from '@/lib/composeStrip';
import { Loader2 } from 'lucide-react';

interface StripCanvasProps {
  photos: string[];
  template: StripTemplate;
  options?: StripCompositionOptions;
  onBlobReady?: (blob: Blob) => void;
}

export function StripCanvas({
  photos,
  template,
  options,
  onBlobReady,
}: StripCanvasProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isComposing, setIsComposing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function render() {
      if (photos.length === 0) return;
      setIsComposing(true);
      setError(null);

      try {
        const blob = await composeStrip(photos, template, options);
        if (isCancelled) return;

        const url = URL.createObjectURL(blob);
        setBlobUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });

        if (onBlobReady) {
          onBlobReady(blob);
        }
      } catch (err) {
        console.error('Failed to compose photostrip:', err);
        if (!isCancelled) {
          setError('Failed to generate photostrip canvas preview.');
        }
      } finally {
        if (!isCancelled) {
          setIsComposing(false);
        }
      }
    }

    render();

    return () => {
      isCancelled = true;
    };
  }, [photos, template, options, onBlobReady]);

  // Clean up blob url on unmount
  useEffect(() => {
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [blobUrl]);

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Composing Spinner Overlay */}
      {isComposing && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-lg bg-white/60 backdrop-blur-sm">
          <Loader2 className="h-6 w-6 animate-spin text-[#007aff]" />
          <p className="mt-2 text-xs font-medium text-black/60">Composing...</p>
        </div>
      )}

      {/* Rendered Photostrip Image Preview */}
      {blobUrl && (
        <div className="relative w-full max-w-[17rem] overflow-hidden rounded-sm shadow-[0_0_0_0.5px_rgba(0,0,0,0.2),0_18px_40px_-12px_rgba(0,0,0,0.45)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={blobUrl}
            alt={`${template.name} Photostrip`}
            className="h-auto w-full object-contain"
          />
        </div>
      )}

      {error && (
        <div role="alert" className="rounded-lg bg-[#ff3b30]/10 p-3 text-xs text-[#d70015]">
          {error}
        </div>
      )}
    </div>
  );
}

