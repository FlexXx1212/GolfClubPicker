'use client';

import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'next/navigation';
import { useBag } from '@/lib/storage';
import { useTracking } from '@/lib/tracking-storage';
import { computeStats } from '@/lib/tracking-stats';
import { getEffectiveTotal } from '@/lib/rollout';
import { cn } from '@/lib/utils';
import { Minus, Plus, X, Activity, ChevronDown, Upload } from 'lucide-react';
import ShotImportModal from '@/components/tracking/ShotImportModal';

export default function TrackingPage() {
  const searchParams = useSearchParams();
  const { bag, updateClub } = useBag();
  const { session, selectClub, addShot, removeShot, clearShots } = useTracking();

  const [selectedClubId, setSelectedClubId] = useState<string>('');
  const [carry, setCarry] = useState(150);
  const [total, setTotal] = useState(160);
  const [showSelector, setShowSelector] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [saved, setSaved] = useState(false);
  const selectorBtnRef = useRef<HTMLButtonElement>(null);

  // Initialize from URL param or first club
  useEffect(() => {
    const paramClub = searchParams.get('club');
    if (paramClub && bag.clubs.find((c) => c.id === paramClub)) {
      setSelectedClubId(paramClub);
    } else if (bag.clubs.length > 0 && !selectedClubId) {
      setSelectedClubId(bag.clubs[0].id);
    }
  }, [searchParams, bag.clubs, selectedClubId]);

  // When club selection changes, reset session and set defaults
  useEffect(() => {
    if (!selectedClubId) return;
    selectClub(selectedClubId);
    const club = bag.clubs.find((c) => c.id === selectedClubId);
    if (club) {
      setCarry(club.carry);
      setTotal(club.total ?? getEffectiveTotal(club));
    }
  }, [selectedClubId, bag.clubs, selectClub]);

  // When shots change, use last shot values as defaults
  useEffect(() => {
    if (session.shots.length > 0) {
      const last = session.shots[session.shots.length - 1];
      setCarry(last.carry);
      setTotal(last.total);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run when shot count changes
  }, [session.shots.length]);

  const selectedClub = bag.clubs.find((c) => c.id === selectedClubId);
  const stats = computeStats(session.shots);

  function handleAddShot() {
    if (carry <= 0 || total <= 0) return;
    addShot(carry, total);
    setSaved(false);
  }

  function handleSave() {
    if (!selectedClub || stats.validCount < 1) return;
    updateClub({ ...selectedClub, carry: stats.medianCarry, total: stats.medianTotal });
    setSaved(true);
    setTimeout(() => {
      clearShots();
      setSaved(false);
    }, 1200);
  }

  if (bag.clubs.length === 0) {
    return (
      <div className="px-4 pt-6 text-center">
        <Activity size={48} className="mx-auto text-brand-muted/40 mb-3" />
        <p className="text-brand-cream font-bold">No clubs in your bag</p>
        <p className="text-brand-muted text-sm mt-1">Add clubs first to start tracking shots.</p>
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-4 space-y-5">
      {/* Header */}
      <div className="animate-slide-up flex items-center justify-between">
        <div>
          <p className="section-label text-brand-neon/60 mb-1">Range Session</p>
          <h1 className="font-display text-3xl tracking-wide text-brand-cream leading-none">
            SHOT TRACKER
          </h1>
        </div>
        <button
          onClick={() => setShowImport(true)}
          className="p-2.5 rounded-xl bg-brand-dark border border-brand-muted/20 text-brand-muted
                     hover:text-brand-neon hover:border-brand-neon/30 transition-colors"
          aria-label="Import shots"
        >
          <Upload size={18} />
        </button>
      </div>

      {/* Import Modal */}
      {showImport && (
        <ShotImportModal
          onClose={() => setShowImport(false)}
          onImported={() => {}}
        />
      )}

      {/* Club Selector */}
      <div className="relative animate-slide-up">
        <button
          ref={selectorBtnRef}
          onClick={() => setShowSelector(!showSelector)}
          className="w-full flex items-center justify-between bg-brand-dark border border-brand-muted/20 rounded-xl px-4 py-3 text-left"
        >
          <span className="text-brand-cream font-bold">
            {selectedClub?.name ?? 'Select Club'}
          </span>
          <ChevronDown size={18} className={cn(
            'text-brand-muted transition-transform',
            showSelector && 'rotate-180'
          )} />
        </button>

        {showSelector && createPortal(
          <>
            <div className="fixed inset-0 z-[199]" onClick={() => setShowSelector(false)} />
            <div
              className="fixed z-[200] bg-brand-dark border border-brand-muted/20 rounded-xl overflow-hidden max-h-60 overflow-y-auto shadow-2xl"
              style={{
                top: selectorBtnRef.current
                  ? selectorBtnRef.current.getBoundingClientRect().bottom + 4
                  : 0,
                left: selectorBtnRef.current
                  ? selectorBtnRef.current.getBoundingClientRect().left
                  : 0,
                width: selectorBtnRef.current
                  ? selectorBtnRef.current.getBoundingClientRect().width
                  : '100%',
              }}
            >
              {bag.clubs
                .sort((a, b) => b.carry - a.carry)
                .map((club) => (
                  <button
                    key={club.id}
                    onClick={() => {
                      setSelectedClubId(club.id);
                      setShowSelector(false);
                    }}
                    className={cn(
                      'w-full text-left px-4 py-2.5 text-sm transition-colors',
                      club.id === selectedClubId
                        ? 'bg-brand-neon/10 text-brand-neon font-bold'
                        : 'text-brand-cream hover:bg-brand-muted/10'
                    )}
                  >
                    {club.name} <span className="text-brand-muted text-xs ml-1">{club.carry}m</span>
                  </button>
                ))}
            </div>
          </>,
          document.body
        )}
      </div>

      {/* Input Section */}
      <div className="card space-y-4 animate-slide-up">
        <div className="grid grid-cols-2 gap-4">
          {/* Carry Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-brand-muted uppercase tracking-widest block text-center">
              Carry
            </label>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCarry((c) => Math.max(0, c - 1))}
                className="p-2.5 rounded-lg bg-brand-black/50 border border-brand-muted/20 text-brand-cream hover:border-brand-neon/30 active:scale-95 transition-all"
              >
                <Minus size={18} />
              </button>
              <input
                type="number"
                value={carry}
                onChange={(e) => setCarry(Number(e.target.value))}
                className="flex-1 bg-brand-black/50 border border-brand-muted/20 rounded-xl px-2 py-2.5
                           text-brand-cream text-center text-lg font-bold
                           focus:outline-none focus:border-brand-neon/50 transition-colors min-w-0"
              />
              <button
                onClick={() => setCarry((c) => c + 1)}
                className="p-2.5 rounded-lg bg-brand-black/50 border border-brand-muted/20 text-brand-cream hover:border-brand-neon/30 active:scale-95 transition-all"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          {/* Total Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-brand-muted uppercase tracking-widest block text-center">
              Total
            </label>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setTotal((t) => Math.max(0, t - 1))}
                className="p-2.5 rounded-lg bg-brand-black/50 border border-brand-muted/20 text-brand-cream hover:border-brand-neon/30 active:scale-95 transition-all"
              >
                <Minus size={18} />
              </button>
              <input
                type="number"
                value={total}
                onChange={(e) => setTotal(Number(e.target.value))}
                className="flex-1 bg-brand-black/50 border border-brand-muted/20 rounded-xl px-2 py-2.5
                           text-brand-cream text-center text-lg font-bold
                           focus:outline-none focus:border-brand-neon/50 transition-colors min-w-0"
              />
              <button
                onClick={() => setTotal((t) => t + 1)}
                className="p-2.5 rounded-lg bg-brand-black/50 border border-brand-muted/20 text-brand-cream hover:border-brand-neon/30 active:scale-95 transition-all"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={handleAddShot}
          className="btn-primary w-full flex items-center justify-center gap-2 !py-3"
        >
          <Plus size={16} />
          ADD SHOT
        </button>
      </div>

      {/* Shot List */}
      {session.shots.length > 0 && (
        <>
          <div className="card animate-slide-up">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-brand-muted uppercase tracking-widest">
                {session.shots.length} shot{session.shots.length !== 1 ? 's' : ''}
              </p>
              {stats.outlierIds.size > 0 && (
                <p className="text-[10px] text-brand-muted/60">
                  {stats.outlierIds.size} outlier{stats.outlierIds.size !== 1 ? 's' : ''} excluded
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div className="text-center">
                <p className="text-brand-muted text-[10px] font-bold tracking-widest uppercase">Median Carry</p>
                <p className="font-display text-2xl text-brand-cream">{stats.medianCarry}<span className="text-brand-muted text-sm">m</span></p>
              </div>
              <div className="text-center">
                <p className="text-brand-muted text-[10px] font-bold tracking-widest uppercase">Median Total</p>
                <p className="font-display text-2xl text-brand-neon">{stats.medianTotal}<span className="text-brand-muted/70 text-sm">m</span></p>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 animate-slide-up">
            {[...session.shots].reverse().map((shot, i) => {
              const isOutlier = stats.outlierIds.has(shot.id);
              return (
                <div
                  key={shot.id}
                  className={cn(
                    'flex items-center justify-between px-4 py-2.5 rounded-xl border',
                    isOutlier
                      ? 'border-red-500/20 bg-red-500/5'
                      : 'border-brand-muted/10 bg-brand-dark/30'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-brand-muted text-xs font-bold w-5">
                      #{session.shots.length - i}
                    </span>
                    <span className={cn(
                      'text-sm font-bold',
                      isOutlier ? 'line-through text-brand-muted/50' : 'text-brand-cream'
                    )}>
                      {shot.carry}m
                    </span>
                    <span className="text-brand-muted/30">/</span>
                    <span className={cn(
                      'text-sm font-bold',
                      isOutlier ? 'line-through text-brand-muted/50' : 'text-brand-neon/80'
                    )}>
                      {shot.total}m
                    </span>
                    {isOutlier && (
                      <span className="text-[9px] text-red-400/80 font-bold uppercase tracking-wider">outlier</span>
                    )}
                  </div>
                  <button
                    onClick={() => removeShot(shot.id)}
                    className="p-1.5 rounded-lg text-brand-muted hover:text-red-400 hover:bg-red-400/10 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saved}
            className={cn(
              'btn-primary w-full !py-3 text-sm animate-slide-up',
              saved && '!bg-green-600 !text-white'
            )}
          >
            {saved ? '✓ Saved!' : `Save Distances (${stats.medianCarry}m / ${stats.medianTotal}m)`}
          </button>
        </>
      )}
    </div>
  );
}
