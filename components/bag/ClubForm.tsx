'use client';

import { useState } from 'react';
import { Club, ClubCategory } from '@/lib/types';
import { getMinRollout } from '@/lib/rollout';
import ClubTypeSelector from './ClubTypeSelector';
import { X, Trash2 } from 'lucide-react';

interface Props {
  initial?: Club;
  onSave:   (data: Omit<Club, 'id'>) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export default function ClubForm({ initial, onSave, onCancel, onDelete }: Props) {
  const [category, setCategory] = useState<ClubCategory>(initial?.category ?? 'iron');
  const [name,     setName]     = useState(initial?.name ?? '');
  const [carry,    setCarry]    = useState(initial?.carry ?? 150);
  const [totalCustom, setTotalCustom] = useState<number | null>(initial?.total ?? null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  function getDefaultTotal(c: number, cat: ClubCategory): number {
    return c + getMinRollout({ id: '', name: '', category: cat, carry: c });
  }

  const effectiveTotal = totalCustom ?? getDefaultTotal(carry, category);

  function handleCarryChange(newCarry: number) {
    setCarry(newCarry);
    // Reset custom total when carry changes so the default recalculates
    if (totalCustom !== null) {
      setTotalCustom(null);
    }
  }

  function handleSave() {
    const trimmed = name.trim();
    if (!trimmed || carry <= 0) return;
    const club: Omit<Club, 'id'> = { name: trimmed, category, carry };
    if (totalCustom !== null) club.total = totalCustom;
    onSave(club);
  }

  return (
    /* Overlay */
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-4">
      <div className="absolute inset-0 bg-brand-black/80 backdrop-blur-sm" onClick={onCancel} />

      <div className="relative w-full max-w-md bg-brand-dark border border-brand-muted/20 rounded-2xl p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-brand-cream font-bold text-lg">
            {initial ? 'Edit Club' : 'Add Club'}
          </h2>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg text-brand-muted hover:text-brand-cream transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Club type selector */}
        <div>
          <label className="text-xs font-semibold text-brand-muted uppercase tracking-widest mb-2 block">
            Club Type
          </label>
          <ClubTypeSelector
            selectedCategory={category}
            selectedName={name}
            onSelect={(cat, n) => {
              setCategory(cat);
              setName(n);
            }}
          />
        </div>

        {/* Club name */}
        <div>
          <label className="text-xs font-semibold text-brand-muted uppercase tracking-widest mb-2 block">
            Club Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. 7 Iron, 52° GW…"
            className="w-full bg-brand-black/50 border border-brand-muted/20 rounded-xl px-4 py-3
                       text-brand-cream placeholder:text-brand-muted/50 text-sm
                       focus:outline-none focus:border-brand-neon/50 transition-colors"
          />
        </div>

        {/* Carry distance */}
        <div>
          <label className="text-xs font-semibold text-brand-muted uppercase tracking-widest mb-2 block">
            Carry Distance
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={carry}
              min={10}
              max={350}
              onChange={(e) => handleCarryChange(Number(e.target.value))}
              className="w-24 bg-brand-black/50 border border-brand-muted/20 rounded-xl px-3 py-2
                         text-brand-cream text-center text-base font-bold
                         focus:outline-none focus:border-brand-neon/50 transition-colors"
            />
            <span className="text-brand-muted font-medium text-sm">meters</span>
          </div>
          <input
            type="range"
            min={10}
            max={350}
            step={1}
            value={carry}
            onChange={(e) => handleCarryChange(Number(e.target.value))}
            className="w-full mt-2 accent-brand-neon"
          />
        </div>

        {/* Total distance */}
        <div>
          <label className="text-xs font-semibold text-brand-muted uppercase tracking-widest mb-2 block">
            Total Distance (Carry + Rollout)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={effectiveTotal}
              min={carry}
              max={400}
              onChange={(e) => setTotalCustom(Number(e.target.value))}
              className="w-24 bg-brand-black/50 border border-brand-muted/20 rounded-xl px-3 py-2
                         text-brand-cream text-center text-base font-bold
                         focus:outline-none focus:border-brand-neon/50 transition-colors"
            />
            <span className="text-brand-muted font-medium text-sm">meters</span>
            {totalCustom !== null && (
              <button
                type="button"
                onClick={() => setTotalCustom(null)}
                className="text-xs text-brand-neon/70 hover:text-brand-neon transition-colors"
              >
                Reset
              </button>
            )}
          </div>
          <input
            type="range"
            min={carry}
            max={400}
            step={1}
            value={effectiveTotal}
            onChange={(e) => setTotalCustom(Number(e.target.value))}
            className="w-full mt-2 accent-brand-neon"
          />
        </div>

        {/* Delete (only in edit mode) */}
        {initial && onDelete && !showDeleteConfirm && (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
                       text-red-400/70 hover:text-red-400 hover:bg-red-400/5
                       border border-red-400/15 transition-colors text-sm font-medium"
          >
            <Trash2 size={14} />
            Delete Club
          </button>
        )}

        {/* Delete confirmation */}
        {showDeleteConfirm && onDelete && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 space-y-3">
            <p className="text-red-400 text-sm font-bold">
              Delete &quot;{initial?.name}&quot;?
            </p>
            <p className="text-brand-muted text-xs">
              This action cannot be undone. All tracking data for this club will remain but the club will be removed from your bag.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn-secondary flex-1 !py-2 text-sm"
              >
                Keep
              </button>
              <button
                onClick={onDelete}
                className="flex-1 bg-red-500 text-white font-bold rounded-xl px-4 py-2 text-sm
                           transition-all duration-150 active:scale-[0.97] hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button onClick={onCancel} className="btn-secondary flex-1">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || carry <= 0}
            className="btn-primary flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {initial ? 'Save Changes' : 'Add Club'}
          </button>
        </div>
      </div>
    </div>
  );
}
