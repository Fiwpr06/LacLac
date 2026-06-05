'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useHistoryStore } from '../../src/store/history';
import { useSettingsStore } from '../../src/store/settings';
import { tPriceRange } from '../../src/lib/translate';
import { FoodItem } from '../../src/lib/api';

const getFoodImageUrl = (food: FoodItem): string => {
  const url = food.thumbnailImage || (food.images && food.images[0]) || '';
  if (!url) return '';
  if (url.startsWith('data:image/') || url.startsWith('http')) return url;
  return `/${url}`;
};

export default function HistoryPage(): JSX.Element {
  const { history, clearHistory } = useHistoryStore();
  const { language } = useSettingsStore();
  const isEn = language === 'en';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPrice, setSelectedPrice] = useState<'all' | 'cheap' | 'medium' | 'expensive'>('all');

  const t = {
    title: isEn ? 'Shake History' : 'Lịch Sử Lắc',
    desc: isEn ? 'Explore your recently discovered dishes' : 'Những món ăn bạn đã tìm thấy gần đây',
    clearBtn: isEn ? 'Clear All' : 'Xóa tất cả',
    backBtn: isEn ? 'Back to Shake' : 'Quay lại màn lắc',
    historyEmpty: isEn ? 'History is empty. Shake to get started!' : 'Lịch sử trống. Hãy thử lắc nhé!',
    dish: isEn ? 'Dish' : 'Món ăn',
    saveBtn: isEn ? 'Save' : 'Lưu',
    searchPlaceholder: isEn ? 'Search dishes...' : 'Tìm kiếm món ăn...',
    priceAll: isEn ? 'All Prices' : 'Mọi mức giá',
    priceCheap: isEn ? 'Cheap' : 'Tiết kiệm',
    priceMedium: isEn ? 'Medium' : 'Cân bằng',
    priceExpensive: isEn ? 'Expensive' : 'Thoải mái',
  };

  const filteredHistory = history.filter((item) => {
    const nameVi = item.name?.vi?.toLowerCase() || '';
    const nameEn = item.name?.en?.toLowerCase() || '';
    const q = searchQuery.toLowerCase();
    const matchesSearch = nameVi.includes(q) || nameEn.includes(q);

    const matchesPrice = selectedPrice === 'all' || item.priceRange === selectedPrice;

    return matchesSearch && matchesPrice;
  });

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 animate-fade-in-up">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
        <div>
          <h1 className="text-4xl font-heading font-extrabold text-brand-secondary mb-2 flex items-center gap-2">
            <span>⏳</span>
            {t.title}
          </h1>
          <p className="text-slate-500 font-medium">{t.desc}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={clearHistory}
            className="px-5 py-2.5 text-sm font-bold rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer select-none"
          >
            {t.clearBtn}
          </button>
          <Link
            href="/"
            className="px-5 py-2.5 text-sm font-bold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-md shadow-slate-900/10 cursor-pointer select-none"
          >
            {t.backBtn}
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel rounded-3xl p-6 mb-8 flex flex-col md:flex-row gap-4 items-center">
        {/* Search Field */}
        <div className="relative w-full md:w-1/2">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 pointer-events-none">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </span>
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 glass-input rounded-2xl focus:outline-none font-semibold text-sm"
          />
        </div>

        {/* Price filter pills */}
        <div className="flex flex-wrap gap-2 w-full md:w-1/2 md:justify-end">
          {[
            { key: 'all', label: t.priceAll },
            { key: 'cheap', label: t.priceCheap },
            { key: 'medium', label: t.priceMedium },
            { key: 'expensive', label: t.priceExpensive },
          ].map((pill) => {
            const isActive = selectedPrice === pill.key;
            return (
              <button
                key={pill.key}
                onClick={() => setSelectedPrice(pill.key as any)}
                className={`px-4 py-2 text-xs font-bold rounded-full border transition-all duration-300 cursor-pointer select-none ${
                  isActive
                    ? 'bg-gradient-to-r from-rose-500 to-orange-500 border-rose-500 text-white shadow-sm shadow-rose-500/10'
                    : 'bg-white/60 hover:bg-slate-100/80 border-slate-200/50 text-slate-600'
                }`}
              >
                {pill.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* History Grid Container */}
      <div className="glass-panel rounded-3xl p-6 md:p-8">
        {filteredHistory.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredHistory.map((hItem, idx) => (
              <div
                key={`${hItem._id}-${idx}`}
                className="flex items-center gap-4 p-4 rounded-2xl bg-white/40 border border-slate-200/40 hover:bg-white hover:shadow-lg hover:border-slate-200/80 transition-all duration-300 group"
              >
                <div className="w-18 h-18 rounded-2xl overflow-hidden shrink-0 bg-slate-100 relative border border-slate-200/40 shadow-sm">
                  {getFoodImageUrl(hItem) ? (
                    <Image
                      src={getFoodImageUrl(hItem)}
                      alt={hItem.name?.vi ?? 'Food'}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <path d="M21 15l-5-5L5 21" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-bold text-slate-800 truncate" title={hItem.name?.vi}>
                    {hItem.name?.vi}
                  </h4>
                  <p className="text-xs text-slate-400 font-semibold truncate mt-1">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200/50 text-slate-500 text-[10px] font-bold uppercase tracking-wider mr-1.5 inline-block">
                      {typeof hItem.category === 'string'
                        ? t.dish
                        : (typeof hItem.category?.name === 'string'
                            ? hItem.category.name
                            : hItem.category?.name?.vi) || t.dish}
                    </span>
                    {tPriceRange(hItem.priceRange, isEn)}
                  </p>
                </div>
                <button className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-brand-primary border border-rose-100/50 rounded-xl text-xs font-bold hover:shadow-sm transition-all duration-200 shrink-0 cursor-pointer select-none">
                  {t.saveBtn}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-24 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-slate-100/60 rounded-full flex items-center justify-center mb-6 animate-float">
              <span className="text-4xl">🫙</span>
            </div>
            <p className="text-slate-400 font-bold text-sm tracking-wide">{t.historyEmpty}</p>
          </div>
        )}
      </div>
    </div>
  );
}
