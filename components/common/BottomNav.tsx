'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Target, Briefcase, Table2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const TABS = [
  { href: '/',      label: 'Shot',  icon: Target   },
  { href: '/bag',   label: 'Bag',   icon: Briefcase },
  { href: '/table', label: 'Table', icon: Table2    },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto">
      <div className="bg-brand-black/95 border-t border-brand-muted/10 backdrop-blur-md">
        <div className="flex items-stretch">
          {TABS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex-1 relative flex flex-col items-center justify-center gap-1 py-3.5',
                  'transition-colors duration-200',
                  active ? 'text-brand-neon' : 'text-brand-muted hover:text-brand-cream/70'
                )}
              >
                {/* Top neon edge indicator */}
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-brand-neon rounded-b-full shadow-[0_0_8px_rgba(225,255,0,0.8)]" />
                )}

                <Icon
                  size={19}
                  strokeWidth={active ? 2.5 : 1.7}
                  className="transition-transform duration-200"
                  style={{ transform: active ? 'scale(1.08)' : 'scale(1)' }}
                />
                <span className={cn(
                  'text-[10px] tracking-wider transition-all duration-200',
                  active ? 'font-bold' : 'font-medium'
                )}>
                  {label.toUpperCase()}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

