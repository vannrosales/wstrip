'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TEMPLATES } from '@/lib/templates';
import { StripTemplate } from '@/lib/types';
import { TemplateCard } from '@/components/TemplateCard';
import { MacWindow } from '@/components/MacWindow';
import { saveBoothSession } from '@/lib/boothState';
import { Camera, Grid2x2, Film, Sparkles, Square, Layers } from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All Templates', icon: Grid2x2 },
  { id: 'classic', label: 'Classic', icon: Layers },
  { id: 'vintage', label: 'Vintage', icon: Film },
  { id: 'playful', label: 'Playful', icon: Sparkles },
  { id: 'minimal', label: 'Minimal', icon: Square },
] as const;

export default function TemplatesPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<StripTemplate>(TEMPLATES[0]);
  const [category, setCategory] = useState<string>('all');

  const visible =
    category === 'all' ? TEMPLATES : TEMPLATES.filter((t) => t.category === category);

  const start = () => {
    saveBoothSession({ templateId: selected.id, photos: [] });
    router.push('/booth');
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-3 py-6 sm:px-6 sm:py-10">
      <h1 className="sr-only">Choose a photostrip template</h1>
      <MacWindow
        title="Templates"
        className="min-h-[70dvh]"
        bodyClassName="flex flex-col md:flex-row"
        footer={
          <div className="flex items-center justify-between gap-3">
            <p className="hidden text-xs text-black/55 sm:block">
              <span className="font-semibold text-black/80">{selected.name}</span> &middot;{' '}
              {selected.shots} photos
            </p>
            <button
              type="button"
              onClick={start}
              className="mac-btn-primary inline-flex h-9 w-full items-center justify-center gap-2 px-5 text-[13px] sm:w-auto"
            >
              <Camera className="h-4 w-4" />
              Continue to camera
            </button>
          </div>
        }
      >
        {/* Sidebar */}
        <nav
          aria-label="Template categories"
          className="mac-sidebar no-scrollbar flex shrink-0 gap-1 overflow-x-auto p-2 md:w-52 md:flex-col md:overflow-visible md:p-3"
        >
          <p className="mb-1 hidden px-2 text-[11px] font-semibold uppercase tracking-wide text-black/40 md:block">
            Library
          </p>
          {CATEGORIES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setCategory(id)}
              aria-pressed={category === id}
              className={`flex shrink-0 items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors ${
                category === id
                  ? 'bg-[#007aff] text-white'
                  : 'text-black/75 hover:bg-black/[0.06]'
              }`}
            >
              <Icon className={`h-4 w-4 ${category === id ? 'text-white' : 'text-[#007aff]'}`} />
              {label}
            </button>
          ))}
        </nav>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {visible.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                isSelected={selected.id === template.id}
                onSelect={setSelected}
              />
            ))}
          </div>
        </div>
      </MacWindow>
    </div>
  );
}

