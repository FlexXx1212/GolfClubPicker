'use client';

import { useState } from 'react';
import { useBag } from '@/lib/storage';
import { Club } from '@/lib/types';
import { CATEGORY_ORDER, CATEGORY_LABELS } from '@/lib/defaults';
import ClubCard from './ClubCard';
import ClubForm from './ClubForm';
import EmptyState from '@/components/common/EmptyState';
import { Plus, Briefcase } from 'lucide-react';

export default function BagManager() {
  const { bag, addClub, updateClub, removeClub } = useBag();
  const [editingClub, setEditingClub] = useState<Club | null>(null);
  const [showAddForm, setShowAddForm]  = useState(false);

  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    label: CATEGORY_LABELS[cat],
    clubs: bag.clubs
      .filter((c) => c.category === cat)
      .sort((a, b) => b.carry - a.carry),
  })).filter((g) => g.clubs.length > 0);

  return (
    <div className="px-4 pt-6 pb-4 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between animate-slide-up">
        <div>
          <p className="section-label text-brand-neon/60 mb-1">Club Setup</p>
          <h1 className="font-display text-3xl tracking-wide text-brand-cream leading-none">MY BAG</h1>
          <p className="text-brand-muted text-sm mt-1">{bag.clubs.length} clubs</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-primary flex items-center gap-2 !py-2.5 !px-4 text-sm"
        >
          <Plus size={15} />
          ADD CLUB
        </button>
      </div>

      {/* Club list */}
      {bag.clubs.length === 0 ? (
        <EmptyState
          icon={<Briefcase size={48} />}
          title="Bag is empty"
          description="Add your clubs and their carry distances to get started."
          action={
            <button onClick={() => setShowAddForm(true)} className="btn-primary">
              Add First Club
            </button>
          }
        />
      ) : (
        <div className="space-y-5 stagger-children">
          {grouped.map(({ category, label, clubs }) => (
            <div key={category}>
              <p className="text-xs font-semibold text-brand-muted uppercase tracking-widest mb-2 px-1">
                {label}
              </p>
              <div className="space-y-2">
                {clubs.map((club) => (
                  <ClubCard
                    key={club.id}
                    club={club}
                    onEdit={() => setEditingClub(club)}
                    onDelete={() => removeClub(club.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add form */}
      {showAddForm && (
        <ClubForm
          onSave={(data) => {
            addClub(data);
            setShowAddForm(false);
          }}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Edit form */}
      {editingClub && (
        <ClubForm
          initial={editingClub}
          onSave={(data) => {
            updateClub({ ...editingClub, ...data });
            setEditingClub(null);
          }}
          onCancel={() => setEditingClub(null)}
        />
      )}
    </div>
  );
}
