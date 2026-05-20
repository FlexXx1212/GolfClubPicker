'use client';

import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@/lib/auth';
import { LogOut, User, Cloud } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  syncing?: boolean;
}

export default function UserMenu({ syncing }: Props) {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  if (!user) return null;

  const rect = btnRef.current?.getBoundingClientRect();

  return (
    <>
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex-1 relative flex flex-col items-center justify-center gap-1 py-3.5',
          'transition-colors duration-200',
          open ? 'text-brand-neon' : 'text-brand-muted hover:text-brand-cream/70'
        )}
      >
        {open && (
          <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-brand-neon rounded-b-full shadow-[0_0_8px_rgba(225,255,0,0.8)]" />
        )}
        <User
          size={19}
          strokeWidth={open ? 2.5 : 1.7}
          className="transition-transform duration-200"
          style={{ transform: open ? 'scale(1.08)' : 'scale(1)' }}
        />
        <span className={cn(
          'text-[10px] tracking-wider transition-all duration-200',
          open ? 'font-bold' : 'font-medium'
        )}>
          USER
        </span>
      </button>

      {open && createPortal(
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setOpen(false)} />
          <div
            className="fixed z-[9999] w-52 bg-brand-dark border border-brand-muted/15 rounded-2xl shadow-2xl overflow-hidden animate-scale-in"
            style={{
              bottom: rect ? window.innerHeight - rect.top + 8 : 0,
              right: rect ? window.innerWidth - rect.right : 0,
            }}
          >
            <div className="px-4 py-3 border-b border-brand-muted/10">
              <p className="text-brand-cream font-bold text-sm truncate">
                {user.displayName ?? 'User'}
              </p>
              <p className="text-brand-muted text-xs truncate mt-0.5">{user.email}</p>
              {syncing && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Cloud size={11} className="text-brand-neon" />
                  <span className="text-[10px] text-brand-muted/60 font-medium">Synced</span>
                </div>
              )}
            </div>
            <button
              onClick={() => { setOpen(false); signOut(); }}
              className="w-full flex items-center gap-3 px-4 py-3
                         text-brand-muted hover:text-red-400 hover:bg-red-400/5
                         transition-colors text-sm font-medium"
            >
              <LogOut size={14} />
              Sign out
            </button>
          </div>
        </>,
        document.body
      )}
    </>
  );
}
