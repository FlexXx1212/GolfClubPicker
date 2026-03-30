'use client';

import { useState } from 'react';
import { useBag } from '@/lib/storage';
import { recommend } from '@/lib/recommendation';
import { Hazard, Lie } from '@/lib/types';
import DistanceInput from './DistanceInput';
import HazardSelector from './HazardSelector';
import LieSelector from './LieSelector';
import RecommendationCard from './RecommendationCard';
import EmptyState from '@/components/common/EmptyState';
import UserMenu from '@/components/common/UserMenu';
import { Briefcase } from 'lucide-react';
import Link from 'next/link';

export default function ShotCalculator() {
  const { bag, syncing } = useBag();
  const [distance, setDistance] = useState(150);
  const [hazard, setHazard]     = useState<Hazard>('none');
  const [lie, setLie]           = useState<Lie>('good');

  if (bag.clubs.length === 0) {
    return (
      <EmptyState
        title="Your bag is empty"
        description="Add your clubs and carry distances to get recommendations."
        action={
          <Link href="/bag" className="btn-primary">
            Set Up My Bag
          </Link>
        }
      />
    );
  }

  const result = recommend(bag.clubs, distance, hazard, lie);

  return (
    <div className="px-4 pt-6 pb-4 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between animate-slide-up">
        <div>
          <p className="section-label text-brand-neon/60 mb-1">Golf Club Picker</p>
          <h1 className="text-3xl font-display tracking-wide text-brand-cream leading-none">
            SHOT PLANNER
          </h1>
        </div>
        <UserMenu syncing={syncing} />
      </div>

      {/* Distance */}
      <section className="card space-y-3 animate-slide-up" style={{ animationDelay: '50ms' }}>
        <h2 className="section-label">Target Distance</h2>
        <DistanceInput value={distance} onChange={setDistance} />
      </section>

      {/* Conditions */}
      <section className="card space-y-4 animate-slide-up" style={{ animationDelay: '100ms' }}>
        <h2 className="section-label">Conditions</h2>
        <div className="space-y-3">
          <div>
            <p className="text-brand-muted/70 text-[11px] font-bold tracking-widest uppercase mb-2">Hazard</p>
            <HazardSelector value={hazard} onChange={setHazard} />
          </div>
          <div>
            <p className="text-brand-muted/70 text-[11px] font-bold tracking-widest uppercase mb-2">Lie</p>
            <LieSelector value={lie} onChange={setLie} />
          </div>
        </div>
      </section>

      {/* Recommendation */}
      {result && <RecommendationCard result={result} targetDistance={distance} />}
    </div>
  );
}
