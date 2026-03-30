'use client';

import { useState } from 'react';
import { ClubCategory } from '@/lib/types';
import { CATEGORY_ORDER, CATEGORY_LABELS, PRESET_CLUBS } from '@/lib/defaults';
import { cn } from '@/lib/utils';

interface Props {
  selectedCategory: ClubCategory;
  selectedName:     string;
  onSelect: (category: ClubCategory, name: string) => void;
}

export default function ClubTypeSelector({ selectedCategory, selectedName, onSelect }: Props) {
  const [activeCategory, setActiveCategory] = useState<ClubCategory>(selectedCategory);

  function handleCategoryClick(cat: ClubCategory) {
    setActiveCategory(cat);
    // Auto-select first preset in the category
    const presets = PRESET_CLUBS[cat];
    if (presets.length === 1) {
      onSelect(cat, presets[0]);
    } else {
      onSelect(cat, selectedCategory === cat ? selectedName : '');
    }
  }

  return (
    <div className="space-y-3">
      {/* Category tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {CATEGORY_ORDER.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryClick(cat)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 active:scale-95',
              activeCategory === cat
                ? 'bg-brand-neon text-brand-black'
                : 'bg-brand-black/50 border border-brand-muted/20 text-brand-muted hover:border-brand-muted/40'
            )}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Preset names for selected category */}
      <div className="flex flex-wrap gap-1.5">
        {PRESET_CLUBS[activeCategory].map((preset) => {
          const active = selectedName === preset && selectedCategory === activeCategory;
          return (
            <button
              key={preset}
              onClick={() => onSelect(activeCategory, preset)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 active:scale-95',
                active
                  ? 'bg-brand-neon/20 border border-brand-neon text-brand-neon'
                  : 'bg-brand-black/30 border border-brand-muted/15 text-brand-muted hover:border-brand-muted/30 hover:text-brand-cream'
              )}
            >
              {preset}
            </button>
          );
        })}
        {/* Custom / clear */}
        <button
          onClick={() => onSelect(activeCategory, '')}
          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-dashed border-brand-muted/30 text-brand-muted/60 hover:border-brand-muted/60 hover:text-brand-muted transition-all duration-150"
        >
          Custom…
        </button>
      </div>
    </div>
  );
}
