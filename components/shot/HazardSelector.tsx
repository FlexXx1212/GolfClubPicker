'use client';

import { Hazard } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ShieldAlert, ShieldX, Shield } from 'lucide-react';

const OPTIONS: { value: Hazard; label: string; icon: React.ElementType; desc: string }[] = [
  { value: 'none',  label: 'Clear',  icon: Shield,      desc: 'No hazard' },
  { value: 'front', label: 'Front',  icon: ShieldAlert,  desc: 'Must carry over' },
  { value: 'back',  label: 'Back',   icon: ShieldX,      desc: 'Avoid rollout' },
];

interface Props {
  value: Hazard;
  onChange: (v: Hazard) => void;
}

export default function HazardSelector({ value, onChange }: Props) {
  return (
    <div className="flex gap-2">
      {OPTIONS.map(({ value: v, label, icon: Icon, desc }) => {
        const active = value === v;
        return (
          <button
            key={v}
            onClick={() => onChange(v)}
            className={cn(
              'flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 active:scale-95',
              active
                ? 'bg-brand-neon text-brand-black shadow-lg shadow-brand-neon/20'
                : 'bg-brand-dark/60 border border-brand-muted/20 text-brand-muted hover:border-brand-muted/40'
            )}
            title={desc}
          >
            <Icon size={16} strokeWidth={active ? 2.5 : 1.8} />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
