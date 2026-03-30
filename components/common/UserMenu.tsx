'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { LogOut, User, ChevronDown, Cloud, CloudOff } from 'lucide-react';
import Image from 'next/image';

interface Props {
  syncing?: boolean;
}

export default function UserMenu({ syncing }: Props) {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl
                   bg-brand-dark/50 border border-brand-muted/15
                   text-brand-muted hover:text-brand-cream
                   transition-colors text-xs font-bold tracking-wide"
      >
        {user.photoURL ? (
          <Image
            src={user.photoURL}
            alt="avatar"
            width={20}
            height={20}
            className="rounded-full"
          />
        ) : (
          <User size={14} />
        )}
        <span className="max-w-[90px] truncate hidden sm:block">
          {user.displayName ?? user.email ?? 'Account'}
        </span>
        {syncing ? (
          <Cloud size={12} className="text-brand-neon animate-pulse" />
        ) : (
          <CloudOff size={12} className="text-brand-muted/40" />
        )}
        <ChevronDown size={12} />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-[199]" onClick={() => setOpen(false)} />
          {/* Menu */}
          <div className="absolute right-0 top-full mt-2 z-[200] w-52
                          bg-brand-dark border border-brand-muted/15 rounded-2xl
                          shadow-2xl overflow-hidden animate-scale-in">
            {/* User info */}
            <div className="px-4 py-3 border-b border-brand-muted/10">
              <p className="text-brand-cream font-bold text-sm truncate">
                {user.displayName ?? 'User'}
              </p>
              <p className="text-brand-muted text-xs truncate mt-0.5">{user.email}</p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <Cloud size={11} className="text-brand-neon" />
                <span className="text-[10px] text-brand-muted/60 font-medium">Synced to Firestore</span>
              </div>
            </div>

            {/* Sign out */}
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
        </>
      )}
    </div>
  );
}
