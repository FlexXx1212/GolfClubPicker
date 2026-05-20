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
import Link from 'next/link';

export default function ShotCalculator() {
  const { bag } = useBag();
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
    <div className="px-4 pt-4 pb-4 space-y-4">
      {/* Distance */}
      <section className="card space-y-3 animate-slide-up">
        <DistanceInput value={distance} onChange={setDistance} />
      </section>

      {/* Conditions */}
      <section className="card space-y-3 animate-slide-up" style={{ animationDelay: '50ms' }}>
        <div className="flex items-center gap-3">
          <span className="text-brand-muted/70 text-[11px] font-bold tracking-widest uppercase shrink-0 w-[52px]">Hazard</span>
          <HazardSelector value={hazard} onChange={setHazard} />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-brand-muted/70 text-[11px] font-bold tracking-widest uppercase shrink-0 w-[52px]">Lie</span>
          <LieSelector value={lie} onChange={setLie} />
        </div>
      </section>

      {/* Recommendation */}
      {result && <RecommendationCard result={result} targetDistance={distance} />}
    </div>
  );
}
