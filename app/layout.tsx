import type { Metadata, Viewport } from 'next';
import { Syne, Bebas_Neue } from 'next/font/google';
import './globals.css';
import { BagProvider } from '@/lib/storage';
import { AuthProvider } from '@/lib/auth';
import BottomNav from '@/components/common/BottomNav';
import AuthGate from '@/components/common/AuthGate';

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

const bebasNeue = Bebas_Neue({
  subsets: ['latin'],
  variable: '--font-bebas',
  weight: ['400'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Golf Club Picker',
  description: 'Choose the right club for every shot',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#262625',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${bebasNeue.variable}`}>
      <body className="bg-brand-black text-brand-cream min-h-screen font-sans antialiased">
        <AuthProvider>
          <BagProvider>
            <AuthGate>
              <div className="flex flex-col min-h-screen max-w-md mx-auto relative">
                <main className="flex-1 pb-20 overflow-y-auto">
                  {children}
                </main>
                <BottomNav />
              </div>
            </AuthGate>
          </BagProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
