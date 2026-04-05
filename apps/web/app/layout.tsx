import type { Metadata } from 'next';
import { Be_Vietnam_Pro, Space_Grotesk } from 'next/font/google';
import Link from 'next/link';

import './globals.css';

const headingFont = Space_Grotesk({ subsets: ['latin'], variable: '--font-heading' });
const bodyFont = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-body',
});

export const metadata: Metadata = {
  title: 'Lắc Lắc',
  description: 'Lắc một cái — biết ngay ăn gì!',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${headingFont.variable} ${bodyFont.variable} bg-brand-surface`}>
        <header className="border-b border-orange-100 bg-white/85 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link href="/" className="text-2xl font-extrabold text-brand-primary">
              Lắc Lắc
            </Link>
            <nav className="flex gap-3 text-sm font-bold text-brand-secondary">
              <Link href="/filter">Bộ lọc</Link>
              <Link href="/profile">Hồ sơ</Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
