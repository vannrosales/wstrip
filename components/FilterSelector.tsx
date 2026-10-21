'use client';

import { FILTERS } from '@/lib/templates';

interface FilterSelectorProps {
  activeFilterId: string;
  onSelectFilter: (filterId: string) => void;
}

export function FilterSelector({ activeFilterId, onSelectFilter }: FilterSelectorProps) {
  return (
    <div
      role="group"
      aria-label="Photo filter"
      className="no-scrollbar flex max-w-full items-center overflow-x-auto"
    >
      <div className="mac-segmented">
        {FILTERS.map((filter) => (
          <button
            key={filter.id}
            type="button"
            aria-pressed={activeFilterId === filter.id}
            onClick={() => onSelectFilter(filter.id)}
            className="whitespace-nowrap"
          >
            {filter.name}
          </button>
        ))}
      </div>
    </div>
  );
}
