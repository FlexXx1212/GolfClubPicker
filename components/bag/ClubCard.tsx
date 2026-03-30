'use client';

import { Club } from '@/lib/types';
import { getEffectiveTotal } from '@/lib/rollout';
import { cn } from '@/lib/utils';
import { Pencil, Trash2 } from 'lucide-react';

const CATEGORY_ICONS: Record<string, string> = {
  driver: '🏌️',
  wood:   '🪵',
  hybrid: '⚡',
  iron:   '🔩',
  wedge:  '🥏',
};

interface Props {
  club: Club;
  onEdit: () => void;
  onDelete: () => void;
}

export default function ClubCard({ club, onEdit, onDelete }: Props) {
  const effective = getEffectiveTotal(club);
  const icon = CATEGORY_ICONS[club.category] ?? '⛳';

  return (
    <div className="card flex items-center gap-3">
      <span className="text-2xl">{icon}</span>

      <div className="flex-1 min-w-0">
        <p className="text-brand-cream font-bold truncate">{club.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-brand-muted/70 text-[11px] font-bold tracking-wide uppercase">Carry</span>
          <span className="text-brand-cream text-sm font-bold">{club.carry}m</span>
          <span className="text-brand-muted/30 text-xs">·</span>
          <span className="text-brand-muted/70 text-[11px] font-bold tracking-wide uppercase">Total</span>
          <span className="text-brand-neon text-sm font-bold">~{effective}m</span>
        </div>
      </div>

      {/* Mini carry bar */}
      <div className="w-16 hidden sm:block">
        <div className="h-1.5 bg-brand-dark rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-neon/50 rounded-full"
            style={{ width: `${Math.min((club.carry / 250) * 100, 100)}%` }}
          />
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={onEdit}
          className="p-2 rounded-lg text-brand-muted hover:text-brand-cream hover:bg-brand-muted/10 transition-colors"
          aria-label={`Edit ${club.name}`}
        >
          <Pencil size={15} />
        </button>
        <button
          onClick={onDelete}
          className="p-2 rounded-lg text-brand-muted hover:text-red-400 hover:bg-red-400/10 transition-colors"
          aria-label={`Delete ${club.name}`}
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}
