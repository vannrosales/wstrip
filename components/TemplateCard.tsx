'use client';

import { StripTemplate } from '@/lib/types';
import { Check } from 'lucide-react';
import { TemplateStripPreview } from './TemplateStripPreview';

interface TemplateCardProps {
  template: StripTemplate;
  isSelected?: boolean;
  onSelect: (template: StripTemplate) => void;
}

export function TemplateCard({ template, isSelected, onSelect }: TemplateCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(template)}
      aria-pressed={isSelected}
      aria-label={`${template.name}, ${template.shots} photos`}
      className="group flex flex-col items-center gap-2 rounded-xl p-2 text-center outline-offset-2 transition-colors hover:bg-black/[0.04]"
    >
      <span
        className={`relative flex h-52 w-full items-center justify-center rounded-lg bg-black/[0.04] transition-all ${
          isSelected ? 'ring-[3px] ring-[#007aff] ring-offset-0' : 'ring-0'
        }`}
      >
        <TemplateStripPreview template={template} width={78} />
        {isSelected && (
          <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#007aff] text-white shadow">
            <Check className="h-3 w-3" strokeWidth={3} />
          </span>
        )}
      </span>
      <span className="flex flex-col">
        <span
          className={`text-[13px] font-medium ${
            isSelected ? 'text-[#007aff]' : 'text-black/85'
          }`}
        >
          {template.name}
        </span>
        <span className="text-[11px] capitalize text-black/50">
          {template.shots} photos &middot; {template.category}
        </span>
      </span>
    </button>
  );
}
