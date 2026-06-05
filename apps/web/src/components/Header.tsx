'use client';

import Link from 'next/link';
import { useSettingsStore } from '../store/settings';
import { useAuthStore } from '../store/auth-store';
import { useEffect, useState } from 'react';

export default function Header() {
  const { language, setLanguage } = useSettingsStore();
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isEn = mounted && language === 'en';

  const t = {
    profile: isEn ? 'Profile' : 'Hồ sơ',
    user: isEn ? 'Guest' : 'Khách',
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50 w-full transition-all duration-300">
      <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-6 py-3.5">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-2.5xl font-heading font-black text-brand-secondary tracking-tight group"
        >
          <span className="bg-gradient-to-r from-brand-primary to-orange-500 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">Lắc</span>
          <span className="group-hover:translate-x-0.5 transition-transform duration-300">Lắc</span>
        </Link>

        {/* Action Right */}
        <div className="flex items-center gap-5">
          {mounted && user && (
            <Link
              href="/collections"
              className="text-sm font-bold text-slate-600 hover:text-brand-primary transition-colors duration-200"
            >
              {isEn ? 'Collections' : 'Bộ sưu tập'}
            </Link>
          )}
          <Link
            href="/download"
            className="hidden sm:flex items-center gap-2 px-5 py-2 text-xs font-black bg-gradient-to-r from-brand-primary to-orange-500 text-white rounded-full hover:shadow-lg hover:shadow-brand-primary/20 hover:scale-102 active:scale-98 transition-all duration-200"
          >
            Tải ứng dụng
          </Link>
          
          {mounted && (
            <button
              onClick={() => setLanguage(isEn ? 'vi' : 'en')}
              className="px-3 py-1.5 text-xs font-black border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 hover:border-slate-300 active:scale-95 transition-all duration-150"
            >
              {isEn ? 'EN' : 'VI'}
            </button>
          )}

          <div className="h-5 w-px bg-slate-200 hidden sm:block" />

          <Link href={user ? '/profile' : '/login'} className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200/60 shadow-sm group-hover:border-brand-primary/50 group-hover:bg-slate-200/50 transition-all duration-300 overflow-hidden">
              {user?.avatarUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-slate-400 group-hover:text-brand-primary transition-colors"
                >
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              )}
            </div>
            <span className="font-bold text-xs hidden md:block text-slate-700 group-hover:text-brand-primary transition-colors duration-200">
              {user ? user.name : t.user}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
