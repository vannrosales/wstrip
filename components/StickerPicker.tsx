'use client';

import { STICKERS } from '@/lib/templates';
import { PlacedSticker } from '@/lib/types';
import { Trash2 } from 'lucide-react';

interface StickerPickerProps {
  placedStickers: PlacedSticker[];
  onAddSticker: (stickerId: string) => void;
  onClearStickers: () => void;
}

export function StickerPicker({
  placedStickers,
  onAddSticker,
  onClearStickers,
}: StickerPickerProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-black/70">Stickers</span>
        {placedStickers.length > 0 && (
          <button
            type="button"
            onClick={onClearStickers}
            className="flex items-center gap-1 text-[11px] font-medium text-[#007aff] hover:underline"
          >
            <Trash2 className="h-3 w-3" />
            Clear ({placedStickers.length})
          </button>
        )}
      </div>

      <div className="grid grid-cols-8 gap-1.5">
        {STICKERS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onAddSticker(s.id)}
            aria-label={`Add ${s.label} sticker`}
            title={s.label}
            className="mac-btn flex aspect-square items-center justify-center"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
              <path d={s.path} fill={s.color} fillRule={s.evenodd ? 'evenodd' : 'nonzero'} />
            </svg>
          </button>
        ))}
      </div>
      <p className="text-[11px] text-black/50">Stickers are placed along the bottom of the strip.</p>
    </div>
  );
}
