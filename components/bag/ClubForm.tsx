'use client';

import { useState } from 'react';
import { Club, ClubCategory } from '@/lib/types';
import ClubTypeSelector from './ClubTypeSelector';
import { X } from 'lucide-react';

interface Props {
  initial?: Club;
  onSave:   (data: Omit<Club, 'id'>) => void;
  onCancel: () => void;
}

export default function ClubForm({ initial, onSave, onCancel }: Props) {
  const [category, setCategory] = useState<ClubCategory>(initial?.category ?? 'iron');
  const [name,     setName]     = useState(initial?.name ?? '');
  const [carry,    setCarry]    = useState(initial?.carry ?? 150);

  function handleSave() {
    const trimmed = name.trim();
    if (!trimmed || carry <= 0) return;
    onSave({ name: trimmed, category, carry });
  }

  return (
    /* Overlay */
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4">
      <div className="absolute inset-0 bg-brand-black/80 backdrop-blur-sm" onClick={onCancel} />

      <div className="relative w-full max-w-md bg-brand-dark border border-brand-muted/20 rounded-2xl p-5 space-y-5 shadow-2xl">
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
              onChange={(e) => setCarry(Number(e.target.value))}
              className="w-28 bg-brand-black/50 border border-brand-muted/20 rounded-xl px-4 py-3
                         text-brand-cream text-center text-lg font-bold
                         focus:outline-none focus:border-brand-neon/50 transition-colors"
            />
            <span className="text-brand-muted font-medium">meters</span>
          </div>
          <input
            type="range"
            min={10}
            max={350}
            step={1}
            value={carry}
            onChange={(e) => setCarry(Number(e.target.value))}
            className="w-full mt-3 accent-brand-neon"
          />
        </div>

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
