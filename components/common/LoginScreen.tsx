'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { LogIn, Loader2 } from 'lucide-react';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  async function handleSignIn() {
    setLoading(true);
    setError('');
    try {
      await signIn();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Sign-in failed';
      // Ignore popup-closed-by-user
      if (!msg.includes('popup-closed')) setError('Sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
      {/* Logo mark */}
      <div className="mb-8 animate-slide-up">
        <div className="w-20 h-20 rounded-2xl bg-brand-neon flex items-center justify-center mb-5 mx-auto shadow-[0_0_40px_rgba(225,255,0,0.35)]">
          <span className="text-4xl">⛳</span>
        </div>
        <h1 className="font-display text-5xl text-brand-cream tracking-wide leading-none">
          GOLF CLUB<br />PICKER
        </h1>
        <p className="text-brand-muted text-sm mt-3 font-medium leading-relaxed">
          The right club for every shot.<br />
          Sign in to sync your bag across devices.
        </p>
      </div>

      {/* Sign in button */}
      <div className="w-full max-w-xs space-y-4 animate-slide-up" style={{ animationDelay: '80ms' }}>
        <button
          onClick={handleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-6 py-4
                     bg-brand-neon text-brand-black font-bold rounded-2xl text-base
                     shadow-[0_0_24px_rgba(225,255,0,0.25)]
                     transition-all active:scale-[0.97] hover:brightness-110
                     disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <>
              {/* Google G logo */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </>
          )}
        </button>

        {error && (
          <p className="text-red-400 text-xs text-center">{error}</p>
        )}

        <p className="text-brand-muted/50 text-xs leading-relaxed">
          Your bag is stored securely in the cloud.<br />
          Works offline too — syncs when you reconnect.
        </p>
      </div>
    </div>
  );
}
