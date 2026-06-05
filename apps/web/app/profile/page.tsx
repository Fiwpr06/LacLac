'use client';

import { useSettingsStore } from '../../src/store/settings';
import { useFilters } from '../../src/store/filters';
import { WebFilter } from '../../src/lib/api';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../src/store/auth-store';
import { authApi } from '../../src/lib/auth-api';

const countActiveFilters = (filters: WebFilter): number => {
  const scalarCount = [
    filters.priceRange,
    filters.budgetBucket,
    filters.dishType,
    filters.cuisineType,
    filters.category,
    filters.mealType,
    filters.dietTag,
    filters.cookingStyle,
    filters.context,
  ].filter(Boolean).length;
  return scalarCount + ((filters.allergenExclude?.length ?? 0) > 0 ? 1 : 0);
};

export default function ProfilePage(): JSX.Element | null {
  const settings = useSettingsStore();
  const { filters } = useFilters();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const router = useRouter();
  const { user, clearAuth } = useAuthStore();

  if (!mounted) return null;

  const isEn = settings.language === 'en';

  const t = {
    title: isEn ? 'User Settings & Profile' : 'Cài đặt & Hồ sơ',
    desc: isEn
      ? 'Manage your application preferences and diet profile.'
      : 'Quản lý tùy chọn ứng dụng và hồ sơ ăn uống của bạn.',
    system: isEn ? 'System Preferences' : 'Tùy chọn hệ thống',
    haptic: isEn ? 'Haptic Feedback (Mobile/PWA)' : 'Phản hồi rung (Mobile/PWA)',
    sound: isEn ? 'Application Sounds' : 'Âm thanh ứng dụng',
    reduceMotion: isEn ? 'Reduce Motion' : 'Giảm chuyển động',
    language: isEn ? 'English Interface' : 'Giao diện Tiếng Anh',
    tasteProfile: isEn ? 'Taste Profile (Debugging)' : 'Hồ sơ khẩu vị (Gỡ lỗi)',
    activeFilters: isEn ? 'Active Filters' : 'Điều kiện đang bật',
    price: isEn ? 'Price Range' : 'Mức giá',
    cuisine: isEn ? 'Cuisine' : 'Ẩm thực',
    diet: isEn ? 'Diet' : 'Chế độ ăn',
    allergens: isEn ? 'Excluded Allergens' : 'Dị ứng loại trừ',
    swipeMode: isEn ? 'Swipe Feature' : 'Tính năng Vuốt',
  };

  const renderListBadges = (values?: string | string[]) => {
    if (!values || values.length === 0) {
      return <span className="text-slate-400 italic text-xs">{isEn ? 'None' : 'Chưa có'}</span>;
    }
    const list = typeof values === 'string' ? [values] : values;
    return (
      <div className="flex flex-wrap gap-1.5 justify-end">
        {list.map((v) => (
          <span
            key={v}
            className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-slate-100/80 text-slate-700 border border-slate-200/50"
          >
            {v}
          </span>
        ))}
      </div>
    );
  };

  const handleLogout = () => {
    clearAuth();
    router.push('/');
  };

  const handleToggleSwipeMode = async (checked: boolean) => {
    settings.setSwipeModeEnabled(checked);
    const token = useAuthStore.getState().accessToken;
    if (user && token) {
      try {
        await authApi.updateSettings({ swipeModeEnabled: checked }, token);
      } catch (err) {
        console.error('Failed to sync swipe mode settings', err);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 animate-fade-in-up">
      {/* Title section */}
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-4xl font-heading font-extrabold text-brand-secondary mb-3">
          {t.title}
        </h1>
        <p className="text-slate-500 font-medium">{t.desc}</p>
      </div>

      {/* Profile Card banner */}
      {user && (
        <div className="bg-slate-900 text-white rounded-3xl p-8 mb-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden border border-slate-800">
          {/* Glowing background blob */}
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-10 -top-10 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10 text-center sm:text-left">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-rose-500 via-red-500 to-orange-500 p-[3px] shadow-lg shrink-0">
              <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center overflow-hidden">
                {user.avatarUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl">🧑‍🍳</span>
                )}
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold font-heading bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                {user.name}
              </h2>
              <p className="text-slate-400 text-sm mt-1">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="px-6 py-2.5 bg-white/10 hover:bg-rose-500 text-white font-bold rounded-xl border border-white/10 hover:border-rose-500 transition-all duration-300 relative z-10 shadow-sm"
          >
            {isEn ? 'Log out' : 'Đăng xuất'}
          </button>
        </div>
      )}

      {/* Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Settings Card */}
        <div className="glass-panel rounded-3xl p-8">
          <h2 className="text-xl font-bold mb-8 text-brand-secondary flex items-center gap-2">
            <span className="text-xl">⚙️</span>
            {t.system}
          </h2>

          <div className="space-y-6">
            {/* Setting 1: Language */}
            <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/50 transition-colors duration-200">
              <div className="flex items-center gap-3">
                <span className="text-lg">🌐</span>
                <span className="font-semibold text-slate-800 text-sm">{t.language}</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={isEn}
                  onChange={(e) => settings.setLanguage(e.target.checked ? 'en' : 'vi')}
                />
                <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-[18px] after:w-[18px] after:transition-all after:duration-300 peer-checked:bg-gradient-to-r peer-checked:from-rose-500 peer-checked:to-orange-500 shadow-sm"></div>
              </label>
            </div>

            {/* Setting 2: Haptic */}
            <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/50 transition-colors duration-200 pointer-events-none opacity-40">
              <div className="flex items-center gap-3">
                <span className="text-lg">📳</span>
                <span className="font-semibold text-slate-800 text-sm">{t.haptic}</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.hapticEnabled}
                  onChange={(e) => settings.setHaptic(e.target.checked)}
                />
                <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-[18px] after:w-[18px] after:transition-all after:duration-300 peer-checked:bg-gradient-to-r peer-checked:from-rose-500 peer-checked:to-orange-500 shadow-sm"></div>
              </label>
            </div>

            {/* Setting 3: Sound */}
            <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/50 transition-colors duration-200 pointer-events-none opacity-40">
              <div className="flex items-center gap-3">
                <span className="text-lg">🔊</span>
                <span className="font-semibold text-slate-800 text-sm">{t.sound}</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.soundEnabled}
                  onChange={(e) => settings.setSound(e.target.checked)}
                />
                <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-[18px] after:w-[18px] after:transition-all after:duration-300 peer-checked:bg-gradient-to-r peer-checked:from-rose-500 peer-checked:to-orange-500 shadow-sm"></div>
              </label>
            </div>

            {/* Setting 4: Reduce Motion */}
            <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/50 transition-colors duration-200">
              <div className="flex items-center gap-3">
                <span className="text-lg">🎬</span>
                <span className="font-semibold text-slate-800 text-sm">{t.reduceMotion}</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.reduceMotion}
                  onChange={(e) => settings.setReduceMotion(e.target.checked)}
                />
                <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-[18px] after:w-[18px] after:transition-all after:duration-300 peer-checked:bg-gradient-to-r peer-checked:from-rose-500 peer-checked:to-orange-500 shadow-sm"></div>
              </label>
            </div>

            {/* Setting 5: Swipe Feature */}
            <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/50 transition-colors duration-200">
              <div className="flex items-center gap-3">
                <span className="text-lg">✨</span>
                <span className="font-semibold text-slate-800 text-sm">{t.swipeMode}</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.swipeModeEnabled}
                  onChange={(e) => handleToggleSwipeMode(e.target.checked)}
                />
                <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-[18px] after:w-[18px] after:transition-all after:duration-300 peer-checked:bg-gradient-to-r peer-checked:from-rose-500 peer-checked:to-orange-500 shadow-sm"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Filters Summary Card */}
        <div className="glass-panel rounded-3xl p-8">
          <h2 className="text-xl font-bold mb-8 text-brand-secondary flex items-center gap-2">
            <span className="text-xl">🥗</span>
            {t.tasteProfile}
          </h2>

          <div className="space-y-5 text-sm text-slate-600">
            <div className="flex justify-between items-center py-3 border-b border-slate-100">
              <span className="font-semibold text-slate-800">{t.activeFilters}</span>
              <span className="px-3 py-1 font-bold text-white bg-slate-900 rounded-full text-xs">
                {countActiveFilters(filters)}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-slate-100">
              <span className="font-semibold text-slate-800">{t.price}</span>
              <span className="text-slate-900 font-medium">
                {filters.priceRange || (isEn ? 'Any' : 'Mọi mức giá')}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-slate-100">
              <span className="font-semibold text-slate-800 shrink-0">{t.cuisine}</span>
              <div className="max-w-[200px] text-right truncate">
                {renderListBadges(filters.cuisineType)}
              </div>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-slate-100">
              <span className="font-semibold text-slate-800 shrink-0">{t.diet}</span>
              <div className="max-w-[200px] text-right truncate">
                {renderListBadges(filters.dietTag)}
              </div>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="font-semibold text-slate-800 shrink-0">{t.allergens}</span>
              <div className="max-w-[200px] text-right truncate">
                {renderListBadges(filters.allergenExclude)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
