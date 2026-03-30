'use client';

import { useBag } from '@/lib/storage';
import { buildRanges } from '@/lib/ranges';
import { cn } from '@/lib/utils';
import EmptyState from '@/components/common/EmptyState';
import { Table2 } from 'lucide-react';
import Link from 'next/link';

const CATEGORY_ICONS: Record<string, string> = {
  driver: '🏌️',
  wood:   '🪵',
  hybrid: '⚡',
  iron:   '🔩',
  wedge:  '🥏',
};

export default function DistanceTable() {
  const { bag } = useBag();
  const ranges  = buildRanges(bag.clubs);
  const maxCarry = ranges[0]?.club.carry ?? 250;

  if (bag.clubs.length === 0) {
    return (
      <EmptyState
        icon={<Table2 size={48} />}
        title="No clubs yet"
        description="Add clubs to your bag to generate the distance table."
        action={<Link href="/bag" className="btn-primary">Set Up My Bag</Link>}
      />
    );
  }

  return (
    <div className="px-4 pt-6 pb-4 space-y-5">
      {/* Header */}
      <div className="animate-slide-up">
        <p className="section-label text-brand-neon/60 mb-1">Club Selection</p>
        <h1 className="font-display text-3xl tracking-wide text-brand-cream leading-none">
          DISTANCE TABLE
        </h1>
        <p className="text-brand-muted text-sm mt-1.5">
          {bag.clubs.length} clubs · sorted by carry distance
        </p>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-12 gap-2 px-1 section-label">
        <div className="col-span-5">Club</div>
        <div className="col-span-3 text-center">Range</div>
        <div className="col-span-2 text-right">Carry</div>
        <div className="col-span-2 text-right">Total</div>
      </div>

      {/* Rows with stagger animation */}
      <div className="space-y-1.5 stagger-children">
        {ranges.map((r, i) => {
          const icon     = CATEGORY_ICONS[r.club.category] ?? '⛳';
          const isTop    = i === 0;
          const isBottom = i === ranges.length - 1;
          const barPct   = Math.min((r.club.carry / (maxCarry + 20)) * 100, 100);
          const totalPct = Math.min((r.effectiveTotal / (maxCarry + 20)) * 100, 100);

          return (
            <div
              key={r.club.id}
              className={cn(
                'rounded-xl border transition-colors overflow-hidden',
                isTop
                  ? 'border-brand-neon/20 bg-brand-neon/5'
                  : 'border-brand-muted/10 bg-brand-dark/30 hover:bg-brand-dark/50'
              )}
            >
              {/* Distance bars (subtle background) */}
              <div className="relative">
                <div
                  className="absolute left-0 top-0 bottom-0 bg-brand-neon/5"
                  style={{ width: `${totalPct}%` }}
                />
                <div
                  className="absolute left-0 top-0 bottom-0 bg-brand-neon/10"
                  style={{ width: `${barPct}%` }}
                />

                {/* Content */}
                <div className="relative grid grid-cols-12 gap-2 items-center px-4 py-3">
                  {/* Club name */}
                  <div className="col-span-5 flex items-center gap-2 min-w-0">
                    <span className="text-lg leading-none">{icon}</span>
                    <span className={cn(
                      'font-bold text-sm truncate',
                      isTop ? 'text-brand-neon' : 'text-brand-cream'
                    )}>
                      {r.club.name}
                    </span>
                  </div>

                  {/* Range */}
                  <div className="col-span-3 text-center">
                    <span className="text-[11px] font-bold text-brand-muted/70 tracking-wide">
                      {isBottom ? '0' : r.minDist}–{isTop ? '∞' : r.maxDist}m
                    </span>
                  </div>

                  {/* Carry */}
                  <div className="col-span-2 text-right">
                    <span className="font-display text-lg text-brand-cream tracking-wide">{r.club.carry}</span>
                    <span className="text-brand-muted/50 text-[10px]">m</span>
                  </div>

                  {/* Effective total */}
                  <div className="col-span-2 text-right">
                    <span className={cn(
                      'font-display text-lg tracking-wide',
                      isTop ? 'text-brand-neon' : 'text-brand-neon/70'
                    )}>
                      {r.effectiveTotal}
                    </span>
                    <span className="text-brand-muted/50 text-[10px]">m</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 px-1 pt-1 animate-slide-up">
        <div className="flex items-center gap-1.5 text-[10px] text-brand-muted/60 font-bold tracking-wide">
          <span className="inline-block w-3 h-1.5 bg-brand-neon/30 rounded-sm" />
          CARRY
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-brand-muted/60 font-bold tracking-wide">
          <span className="inline-block w-3 h-1.5 bg-brand-neon/10 rounded-sm" />
          CARRY + MIN. ROLLOUT
        </div>
      </div>
    </div>
  );
}

