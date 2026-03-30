'use client';

import { Lie } from '@/lib/types';
import { cn } from '@/lib/utils';

const OPTIONS: { value: Lie; label: string; emoji: string; desc: string }[] = [
  { value: 'good',   label: 'Good',   emoji: '✓',  desc: 'Fairway / tee' },
  { value: 'normal', label: 'Normal', emoji: '~',  desc: 'Light rough' },
  { value: 'bad',    label: 'Bad',    emoji: '✗',  desc: 'Deep rough / divot' },
];

interface Props {
  value: Lie;
  onChange: (v: Lie) => void;
}

export default function LieSelector({ value, onChange }: Props) {
  return (
    <div className="flex gap-2">
      {OPTIONS.map(({ value: v, label, emoji, desc }) => {
        const active = value === v;
        return (
          <button
            key={v}
            onClick={() => onChange(v)}
            title={desc}
            className={cn(
              'flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 active:scale-95',
              active
                ? 'bg-brand-neon text-brand-black shadow-lg shadow-brand-neon/20'
                : 'bg-brand-dark/60 border border-brand-muted/20 text-brand-muted hover:border-brand-muted/40'
            )}
          >
            <span className="text-base leading-none">{emoji}</span>
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
