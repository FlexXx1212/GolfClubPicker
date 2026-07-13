'use client';

import { useEffect, useMemo, useState } from 'react';
import { Club, TrackedShot } from '@/lib/types';
import { useTracking } from '@/lib/tracking-storage';
import { computeStats } from '@/lib/tracking-stats';
import { cn } from '@/lib/utils';
import { History, Trash2, X } from 'lucide-react';

interface Props {
  club: Club;
  onClose: () => void;
}

export default function ClubHistoryModal({ club, onClose }: Props) {
  const { getShotsForClub, removeShotFromClub } = useTracking();
  const [pendingDelete, setPendingDelete] = useState<TrackedShot | null>(null);
  const shots = getShotsForClub(club.id);
  const stats = useMemo(() => computeStats(shots), [shots]);

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = original; };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-3 pb-24" style={{ height: '100dvh' }}>
      <div className="absolute inset-0 bg-brand-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-brand-dark border border-brand-muted/20 rounded-2xl p-5 space-y-4 shadow-2xl max-h-[calc(100dvh-7.5rem)] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-brand-muted text-[10px] font-bold uppercase tracking-widest">Shot History</p>
            <h2 className="text-brand-cream font-bold text-lg">{club.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-brand-muted hover:text-brand-cream transition-colors"
            aria-label="Close history"
          >
            <X size={18} />
          </button>
        </div>

        {shots.length === 0 ? (
          <div className="text-center py-8 space-y-2">
            <History size={28} className="mx-auto text-brand-muted/50" />
            <p className="text-brand-cream font-bold">No shots yet</p>
            <p className="text-brand-muted text-sm">Track or import shots for this club to see history.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-brand-black/40 border border-brand-muted/15 rounded-xl p-3 text-center">
                <p className="text-brand-muted text-[10px] font-bold uppercase tracking-widest">Average Carry</p>
                <p className="font-display text-2xl text-brand-cream">{stats.medianCarry}<span className="text-brand-muted text-sm">m</span></p>
              </div>
              <div className="bg-brand-black/40 border border-brand-muted/15 rounded-xl p-3 text-center">
                <p className="text-brand-muted text-[10px] font-bold uppercase tracking-widest">Average Total</p>
                <p className="font-display text-2xl text-brand-neon">{stats.medianTotal}<span className="text-brand-muted text-sm">m</span></p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-brand-muted">{stats.validCount} included in average</span>
              <span className="text-red-400/90">{stats.outlierIds.size} outlier excluded</span>
            </div>

            {pendingDelete && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 space-y-3">
                <p className="text-red-400 text-sm font-bold">Delete this shot?</p>
                <p className="text-brand-muted text-xs">
                  {pendingDelete.carry}m / {pendingDelete.total}m will be removed permanently.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPendingDelete(null)}
                    className="btn-secondary flex-1 !py-2 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      removeShotFromClub(club.id, pendingDelete.id);
                      setPendingDelete(null);
                    }}
                    className="flex-1 bg-red-500 text-white font-bold rounded-xl px-4 py-2 text-sm hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              {[...shots].reverse().map((shot, i) => {
                const isOutlier = stats.outlierIds.has(shot.id);
                const included = !isOutlier;
                return (
                  <div
                    key={shot.id}
                    className={cn(
                      'flex items-center justify-between px-3 py-2.5 rounded-xl border',
                      isOutlier
                        ? 'border-red-500/30 bg-red-500/10'
                        : 'border-brand-neon/20 bg-brand-neon/5'
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-brand-muted text-xs font-bold w-6">#{shots.length - i}</span>
                      <span className={cn('text-sm font-bold', isOutlier ? 'text-red-300' : 'text-brand-cream')}>
                        {shot.carry}m
                      </span>
                      <span className="text-brand-muted/30">/</span>
                      <span className={cn('text-sm font-bold', isOutlier ? 'text-red-300' : 'text-brand-neon')}>
                        {shot.total}m
                      </span>
                      <span className={cn(
                        'text-[10px] font-bold uppercase tracking-wider',
                        included ? 'text-brand-neon/80' : 'text-red-400'
                      )}>
                        {included ? 'included' : 'outlier'}
                      </span>
                    </div>
                    <button
                      onClick={() => setPendingDelete(shot)}
                      className="p-1.5 rounded-lg text-brand-muted hover:text-red-400 hover:bg-red-400/10 transition-colors"
                      aria-label={`Delete shot ${shot.carry}m ${shot.total}m`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
