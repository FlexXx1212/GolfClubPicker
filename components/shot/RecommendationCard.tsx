'use client';

import { Recommendation } from '@/lib/types';
import { getMinRollout } from '@/lib/rollout';
import { cn } from '@/lib/utils';
import { Info, ArrowRight } from 'lucide-react';

interface Props {
  result: Recommendation;
  targetDistance: number;
}

const CATEGORY_ICONS: Record<string, string> = {
  driver: '🏌️',
  wood:   '🪵',
  hybrid: '⚡',
  iron:   '🔩',
  wedge:  '🥏',
};

export default function RecommendationCard({ result, targetDistance }: Props) {
  const { primary, alternative, adjustedTarget, explanation } = result;
  const rollout   = getMinRollout(primary);
  const effective = primary.carry + rollout;
  const icon      = CATEGORY_ICONS[primary.category] ?? '⛳';
  const maxBar    = Math.max(primary.carry, effective, targetDistance) + 20;

  return (
    <section className="space-y-3 animate-slide-up">
      {/* Primary recommendation */}
      <div
        key={primary.id}
        className="relative rounded-2xl overflow-hidden animate-neon-pulse border border-brand-neon/25"
      >
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-neon/8 via-transparent to-brand-neon/4 pointer-events-none" />

        <div className="relative p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="section-label text-brand-neon/70">Recommended Club</span>
            <span className="text-xs font-bold text-brand-muted/60 tracking-wide">
              {adjustedTarget !== targetDistance
                ? `Adjusted → ${adjustedTarget}m`
                : `${targetDistance}m target`}
            </span>
          </div>

          {/* Club name row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{icon}</span>
              <div>
                <p className="font-display text-[52px] leading-none text-brand-cream tracking-wide">
                  {primary.name.toUpperCase()}
                </p>
                <p className="text-brand-muted text-sm mt-1">
                  Carry{' '}
                  <span className="text-brand-cream font-bold">{primary.carry}m</span>
                  <span className="text-brand-muted/40 mx-2">·</span>
                  Total{' '}
                  <span className="text-brand-neon font-bold">~{effective}m</span>
                </p>
              </div>
            </div>

            {/* Delta badge */}
            <div className={cn(
              'flex flex-col items-end shrink-0',
              Math.abs(primary.carry - targetDistance) <= 8 ? 'text-brand-neon' : 'text-brand-cream'
            )}>
              <span className="text-xs text-brand-muted/60 font-medium">vs target</span>
              <span className="text-2xl font-display tracking-wide">
                {primary.carry >= targetDistance ? '+' : ''}{primary.carry - targetDistance}M
              </span>
            </div>
          </div>

          {/* Distance visualization bar */}
          <div className="space-y-2">
            <div className="relative h-3 bg-brand-dark/80 rounded-full overflow-hidden">
              {/* Target line */}
              <div
                className="absolute top-0 bottom-0 w-px bg-brand-cream/40 z-10"
                style={{ left: `${Math.min((targetDistance / maxBar) * 100, 98)}%` }}
              />
              {/* Carry bar */}
              <div
                className="absolute left-0 top-0 bottom-0 bg-brand-neon/65 rounded-l-full animate-bar"
                style={{ width: `${Math.min((primary.carry / maxBar) * 100, 100)}%` }}
              />
              {/* Rollout extension */}
              <div
                className="absolute top-0 bottom-0 bg-brand-neon/20 rounded-r-full animate-bar"
                style={{
                  left:  `${Math.min((primary.carry / maxBar) * 100, 100)}%`,
                  width: `${Math.min((rollout / maxBar) * 100, 100)}%`,
                  animationDelay: '0.1s',
                }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-brand-muted/60 font-bold tracking-wide">
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-1.5 bg-brand-neon/65 rounded-sm" />
                CARRY {primary.carry}m
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-1.5 bg-brand-neon/20 rounded-sm" />
                +ROLLOUT ~{rollout}m
              </span>
              <span className="text-brand-cream/40">
                TARGET {targetDistance}m
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Alternative club */}
      {alternative && (
        <div className="card flex items-center justify-between animate-slide-up" style={{ animationDelay: '60ms' }}>
          <div>
            <p className="section-label mb-1">Alternative</p>
            <p className="font-display text-2xl text-brand-cream tracking-wide">{alternative.name.toUpperCase()}</p>
            <p className="text-brand-muted text-xs mt-0.5">Carry {alternative.carry}m</p>
          </div>
          <ArrowRight size={16} className="text-brand-muted/50" />
        </div>
      )}

      {/* Explanation notes */}
      {adjustedTarget !== targetDistance && explanation.length > 0 && (
        <div
          className="flex items-start gap-2.5 px-1 animate-slide-up"
          style={{ animationDelay: '100ms' }}
        >
          <Info size={13} className="text-brand-muted/60 mt-0.5 shrink-0" />
          <div className="space-y-1">
            {explanation.map((note, i) => (
              <p key={i} className="text-brand-muted/70 text-xs leading-relaxed">{note}</p>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

