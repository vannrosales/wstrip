'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { ChevronLeft, Camera } from 'lucide-react';
import { getBoothSession, saveBoothSession } from '@/lib/boothState';
import { TEMPLATES, getTemplateById } from '@/lib/templates';
import { StripTemplate, PlacedSticker, StripCompositionOptions } from '@/lib/types';
import { StripCanvas } from '@/components/StripCanvas';
import { ShareButtons } from '@/components/ShareButtons';
import { FilterSelector } from '@/components/FilterSelector';
import { StickerPicker } from '@/components/StickerPicker';
import { MacWindow } from '@/components/MacWindow';

export default function ResultPage() {
  const router = useRouter();
  const [template] = useState<StripTemplate>(() => {
    const session = getBoothSession();
    return session?.templateId ? getTemplateById(session.templateId) : TEMPLATES[0];
  });
  const [photos] = useState<string[]>(() => getBoothSession()?.photos || []);
  const [filterId, setFilterId] = useState<string>(
    () => getBoothSession()?.filterId || 'original'
  );
  const [customCaption, setCustomCaption] = useState<string>(
    () => getBoothSession()?.customCaption || ''
  );
  const [showDate, setShowDate] = useState<boolean>(() => {
    const s = getBoothSession();
    return s?.showDate !== undefined ? s.showDate : true;
  });
  const [stickers, setStickers] = useState<PlacedSticker[]>(
    () => getBoothSession()?.stickers || []
  );
  const [composedBlob, setComposedBlob] = useState<Blob | null>(null);

  // Guard against direct visits and celebrate once
  useEffect(() => {
    if (photos.length === 0) {
      router.replace('/booth');
      return;
    }
    try {
      confetti({
        particleCount: 40,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#007aff', '#5856d6', '#ff2d55', '#ffcc00', '#34c759'],
      });
    } catch {
      // Ignore
    }
  }, [photos.length, router]);

  const persist = (patch: {
    filterId?: string;
    customCaption?: string;
    showDate?: boolean;
    stickers?: PlacedSticker[];
  }) => {
    saveBoothSession({
      templateId: template.id,
      photos,
      filterId,
      customCaption,
      showDate,
      stickers,
      ...patch,
    });
  };

  const handleAddSticker = (stickerId: string) => {
    const next: PlacedSticker[] = [
      ...stickers,
      {
        id: `stk_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        stickerId,
        x: 15 + Math.random() * 70,
        y: 91 + Math.random() * 5,
        size: 36,
      },
    ];
    setStickers(next);
    persist({ stickers: next });
  };

  const handleClearStickers = () => {
    setStickers([]);
    persist({ stickers: [] });
  };

  const handleFilterChange = (id: string) => {
    setFilterId(id);
    persist({ filterId: id });
  };

  const handleCaptionChange = (val: string) => {
    setCustomCaption(val);
    persist({ customCaption: val });
  };

  const handleToggleDate = () => {
    const next = !showDate;
    setShowDate(next);
    persist({ showDate: next });
  };

  const compositionOptions = useMemo<StripCompositionOptions>(
    () => ({
      filterId,
      customCaption: customCaption.trim() ? customCaption : undefined,
      showDate,
      stickers,
    }),
    [filterId, customCaption, showDate, stickers]
  );

  const handleBlobReady = useCallback((blob: Blob) => setComposedBlob(blob), []);

  if (photos.length === 0) return null;

  return (
    <div className="mx-auto w-full max-w-5xl px-3 py-6 sm:px-6 sm:py-10">
      <h1 className="sr-only">Your photostrip</h1>
      <MacWindow
        title="Your Strip"
        toolbar={
          <Link
            href="/booth"
            className="inline-flex items-center gap-1 text-[13px] font-medium text-[#007aff] hover:underline"
          >
            <ChevronLeft className="h-4 w-4" />
            Booth
          </Link>
        }
        bodyClassName="grid md:grid-cols-[1fr_20rem]"
      >
        {/* Preview */}
        <div className="flex items-start justify-center bg-black/[0.035] p-6 sm:p-8">
          <StripCanvas
            photos={photos}
            template={template}
            options={compositionOptions}
            onBlobReady={handleBlobReady}
          />
        </div>

        {/* Inspector */}
        <aside className="flex flex-col gap-5 border-t border-black/10 p-4 md:border-l md:border-t-0">
          <section aria-labelledby="look-title" className="flex flex-col gap-4">
            <h2 id="look-title" className="text-[11px] font-semibold uppercase tracking-wide text-black/40">
              Appearance
            </h2>

            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-black/70">Filter</span>
              <FilterSelector activeFilterId={filterId} onSelectFilter={handleFilterChange} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="strip-caption" className="text-xs font-semibold text-black/70">
                Caption
              </label>
              <input
                id="strip-caption"
                type="text"
                maxLength={40}
                placeholder={template.footer?.text || "Maria's 25th"}
                value={customCaption}
                onChange={(e) => handleCaptionChange(e.target.value)}
                className="mac-input h-8 px-2.5 text-[13px] text-black placeholder:text-black/35"
              />
            </div>

            <div className="flex items-center justify-between">
              <span id="date-label" className="text-xs font-semibold text-black/70">
                Date stamp
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={showDate}
                aria-labelledby="date-label"
                onClick={handleToggleDate}
                className={`relative inline-flex h-[22px] w-[38px] items-center rounded-full transition-colors ${
                  showDate ? 'bg-[#34c759]' : 'bg-black/20'
                }`}
              >
                <span
                  className={`inline-block h-[18px] w-[18px] rounded-full bg-white shadow transition-transform ${
                    showDate ? 'translate-x-[18px]' : 'translate-x-[2px]'
                  }`}
                />
              </button>
            </div>

            <StickerPicker
              placedStickers={stickers}
              onAddSticker={handleAddSticker}
              onClearStickers={handleClearStickers}
            />
          </section>

          <section aria-labelledby="share-title" className="flex flex-col gap-3 border-t border-black/10 pt-4">
            <h2 id="share-title" className="text-[11px] font-semibold uppercase tracking-wide text-black/40">
              Export
            </h2>
            <ShareButtons stripBlob={composedBlob} templateName={template.name} />
          </section>

          <div className="flex items-center justify-between border-t border-black/10 pt-3 text-[13px] font-medium text-[#007aff]">
            <Link href="/booth" className="inline-flex items-center gap-1.5 hover:underline">
              <Camera className="h-4 w-4" />
              Retake
            </Link>
            <Link href="/templates" className="hover:underline">
              New template
            </Link>
          </div>
        </aside>
      </MacWindow>
    </div>
  );
}
