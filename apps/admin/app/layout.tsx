import Link from 'next/link';

import './globals.css';

export const metadata = {
  title: 'Lắc Lắc Admin',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link href="/" className="text-xl font-black text-orange-500">
              Lắc Lắc Admin
            </Link>
            <nav className="flex gap-4 text-sm font-semibold text-slate-700">
              <Link href="/foods">Món ăn</Link>
              <Link href="/categories">Danh mục</Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
