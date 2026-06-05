'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import {
  FoodItem,
  WebFilter,
  getSwipeQueue,
  postAction,
  postShake,
  toActionFilterSnapshot,
  CustomCollection,
  getCustomCollections,
} from '../src/lib/api';
import { useFilters } from '../src/store/filters';
import { useSettingsStore } from '../src/store/settings';
import { useHistoryStore } from '../src/store/history';
import { useAuthStore } from '../src/store/auth-store';
import { tPriceRange } from '../src/lib/translate';

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

const getFilterSignature = (filters: WebFilter): string => {
  return JSON.stringify({
    ...filters,
    allergenExclude: [...(filters.allergenExclude ?? [])].sort(),
  });
};

const mergeUniqueFoods = (current: FoodItem[], incoming: FoodItem[]): FoodItem[] => {
  if (incoming.length === 0) return current;
  const existingIds = new Set(current.map((item) => item._id));
  const merged = [...current];
  for (const item of incoming) {
    if (!existingIds.has(item._id)) {
      merged.push(item);
      existingIds.add(item._id);
    }
  }
  return merged;
};

const getFoodImageUrl = (food: FoodItem): string => {
  const url = food.thumbnailImage || (food.images && food.images[0]) || '';
  if (!url) return '';
  if (url.startsWith('data:image/') || url.startsWith('http')) return url;
  return `/${url}`;
};

export default function HomePage() {
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const key = 'laclac_web_session';
    let existing = window.localStorage.getItem(key);
    if (!existing) {
      existing = `session-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      window.localStorage.setItem(key, existing);
    }
    setSessionId(existing);
  }, []);

  const { filters } = useFilters();
  const { language } = useSettingsStore();
  const isEn = language === 'en';

  const [food, setFood] = useState<FoodItem | null>(null);
  const [queue, setQueue] = useState<FoodItem[]>([]);
  const { history, addHistory, clearHistory } = useHistoryStore();
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | undefined>(undefined);
  const [mounted, setMounted] = useState(false);
  const [buttonShaking, setButtonShaking] = useState(false);

  // Custom Collections states
  const { user, accessToken } = useAuthStore();
  const [collections, setCollections] = useState<CustomCollection[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [includeSystem, setIncludeSystem] = useState(true);
  const [excludeFoodIds, setExcludeFoodIds] = useState<string[]>([]);

  useEffect(() => {
    if (accessToken) {
      getCustomCollections(accessToken)
        .then(setCollections)
        .catch(console.error);
    }
  }, [accessToken]);

  const queueLoadingRef = useRef(false);
  const queueSignatureRef = useRef('');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Preload images for upcoming queue items to ensure instant load on next shakes
  useEffect(() => {
    if (queue && queue.length > 0) {
      queue.slice(0, 6).forEach((item) => {
        const url = getFoodImageUrl(item);
        if (url) {
          const img = new window.Image();
          img.src = url;
        }
      });
    }
  }, [queue]);

  const activeFilterCount = useMemo(() => countActiveFilters(filters), [filters]);
  const filterSignature = useMemo(() => getFilterSignature(filters), [filters]);

  const t = {
    flexible: isEn ? 'Flexible' : 'Linh hoạt',
    activeFiltersStr: isEn ? 'Active Filters' : 'Điều kiện lọc',
    filterDesc: isEn
      ? 'Refine the pool that Lắc will pick from'
      : 'Thu hẹp phạm vi chọn món của Lắc Lắc',
    cuisine: isEn ? 'Cuisine' : 'Loại Ẩm thực',
    price: isEn ? 'Price Range' : 'Khoảng Giá',
    anyPrice: isEn ? 'Any price' : 'Mọi mức giá',
    allergens: isEn ? 'Allergens' : 'Dị Ứng',
    mealType: isEn ? 'Meal Time' : 'Bữa ăn',
    diet: isEn ? 'Diet Preferences' : 'Chế độ ăn',
    editFilters: isEn ? 'Edit Filters' : 'Sửa Bộ Lọc',
    shakeTitle: isEn ? 'Shake & Discover' : 'Lắc & Khám Phá',
    shakeDesc: isEn
      ? 'Press the big Lắc button below or press Space to simulate shaking. Each shake pulls a random dish.'
      : 'Nhấn nút Lắc lớn bên dưới hoặc phím Space để tìm món ngẫu nhiên dựa trên các lựa chọn lọc của bạn.',
    shakeBtn: isEn ? 'Shake!' : 'Lắc!',
    spaceHint: isEn ? 'Press Shake or Space' : 'Nhấn Lắc hoặc phím Space',
    currentPool: isEn ? 'Current Pool' : 'Bộ lọc hiện tại',
    poolCountInfo: (len: number) => {
      if (len > 5) return isEn ? 'Hundreds of matching dishes' : 'Đang có hàng trăm món phù hợp';
      return isEn ? `${len} matching dishes` : `Đang có ${len} món phù hợp`;
    },
    noFilters: isEn ? 'No active filters' : 'Chưa có bộ lọc nào',
    apiError: isEn
      ? 'Failed to fetch food from service. Please try again.'
      : 'Không tìm thấy món nào khớp với bộ lọc của bạn. Hãy thử thay đổi bộ lọc.',
    noImage: isEn ? 'No image' : 'Không có ảnh',
    dish: isEn ? 'Dish' : 'Món ăn',
    main: isEn ? 'Main' : 'Món chính',
    accept: isEn ? 'Favorite' : 'Yêu thích',
    details: isEn ? 'View Details' : 'Xem chi tiết',
    shakeWait: isEn ? 'Click the Lắc button to find something to eat today!' : 'Nhấn nút Lắc để tìm xem hôm nay ăn gì nhé!',
    historyTitle: isEn ? 'Recent Shakes' : 'Lịch Sử Lắc',
    historyDesc: isEn ? 'Last 10 results' : '10 món gần nhất',
    clearBtn: isEn ? 'Clear' : 'Xóa',
    historyEmpty: isEn
      ? 'History is empty. Shake to get started!'
      : 'Lịch sử trống. Hãy thử lắc nhé!',
    viewFullHistory: isEn ? 'View Full History' : 'Xem toàn bộ',
    saveBtn: isEn ? 'Save' : 'Lưu',
  };

  const formatList = (items?: string | string[]): string => {
    if (!items || items.length === 0) return t.flexible;
    if (typeof items === 'string') return items;
    return Array.isArray(items) ? items.join(', ') : t.flexible;
  };

  const safeArray = (items?: string | string[]): string[] => {
    if (!items) return [];
    return Array.isArray(items) ? items : [items];
  };

  const warmQueue = useCallback(async (signature: string, activeFilters: WebFilter) => {
    if (queueLoadingRef.current) return;
    queueLoadingRef.current = true;
    try {
      const incoming = await getSwipeQueue(activeFilters);
      if (incoming.length === 0 || queueSignatureRef.current !== signature) return;
      setQueue((current) => mergeUniqueFoods(current, incoming));
    } catch (error) {
      console.error('Failed to warm web shake queue', error);
    } finally {
      queueLoadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    queueSignatureRef.current = filterSignature;
    setQueue([]);
    void warmQueue(filterSignature, filters);
  }, [filterSignature, filters, warmQueue]);

  const shakeNow = useCallback(async () => {
    if (loading) return;

    setButtonShaking(true);
    setTimeout(() => setButtonShaking(false), 600);

    const signature = filterSignature;
    const activeFilters: WebFilter = {
      ...filters,
      allergenExclude: filters.allergenExclude ? [...filters.allergenExclude] : undefined,
    };
    if (!sessionId) return;

    setLoading(true);
    try {
      const shakeAudio = new Audio('/sounds/shake.mp3');
      shakeAudio.volume = 0.4;
      shakeAudio.play().catch(() => {});
    } catch (e) {}
    setErrorText(undefined);

    try {
      let selectedFood: FoodItem | null = null;
      let nextQueue = queue;

      const hasCustomSource = selectedCollections.length > 0 || !includeSystem;

      if (queue.length > 0 && !hasCustomSource) {
        selectedFood = queue[0] ?? null;
        nextQueue = queue.slice(1);
      } else {
        let result = await postShake(
          {
            sessionId,
            triggerType: 'button',
            context: activeFilters.context,
            filters: activeFilters,
            collectionIds: selectedCollections,
            includeSystem,
            excludeFoodIds,
          },
          accessToken || undefined,
        );

        if (result.resetRequired) {
          setExcludeFoodIds([]);
          alert(
            isEn
              ? 'All items in this collection have been shaken. Resetting pool!'
              : 'Bạn đã random hết tất cả món trong bộ này. Bộ món ăn đã được reset.',
          );
          
          result = await postShake(
            {
              sessionId,
              triggerType: 'button',
              context: activeFilters.context,
              filters: activeFilters,
              collectionIds: selectedCollections,
              includeSystem,
              excludeFoodIds: [],
            },
            accessToken || undefined,
          );
        }

        selectedFood = result.food;
        nextQueue = [];
      }

      if (queueSignatureRef.current !== signature && !hasCustomSource) return;

      if (selectedFood) {
        try {
          const tingAudio = new Audio('/sounds/ting.mp3');
          tingAudio.volume = 0.8;
          tingAudio.play().catch(() => {});
        } catch (e) {}
        setFood(selectedFood);
        addHistory(selectedFood!);
        setExcludeFoodIds((prev) => [...prev, selectedFood!._id]);
      } else {
        try {
          const falseAudio = new Audio('/sounds/false.mp3');
          falseAudio.volume = 0.4;
          falseAudio.play().catch(() => {});
        } catch (e) {}
        setErrorText(t.apiError);
      }
      setQueue(nextQueue);

      void postAction({
        sessionId,
        foodId: selectedFood?._id,
        actionType: 'shake_result',
        context: activeFilters.context ?? 'none',
        triggerType: 'button',
        filterSnapshot: toActionFilterSnapshot(activeFilters),
      }).catch(console.error);

      if (nextQueue.length <= 2 && !hasCustomSource) {
        void warmQueue(signature, activeFilters);
      }
    } catch (error) {
      console.error(error);
      try {
        const falseAudio = new Audio('/sounds/false.mp3');
        falseAudio.volume = 0.4;
        falseAudio.play().catch(() => {});
      } catch (e) {}
      setErrorText(t.apiError);
    } finally {
      setLoading(false);
    }
  }, [
    loading,
    filterSignature,
    filters,
    sessionId,
    queue,
    selectedCollections,
    includeSystem,
    excludeFoodIds,
    accessToken,
    isEn,
    addHistory,
    warmQueue,
    t.apiError
  ]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        shakeNow();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shakeNow]);

  if (!mounted) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_300px] gap-6 md:gap-8 items-start py-4">
      {/* LEFT PANEL: Sources & Active Filters */}
      <div className="space-y-6 flex flex-col">
        {/* Source selector */}
        {user && (
          <div className="glass-panel rounded-3xl p-6 border border-white/40">
            <h2 className="text-base font-black mb-1 text-slate-800 flex items-center gap-1.5">
              <span>🎯</span> {isEn ? 'Shake Sources' : 'Nguồn lắc món'}
            </h2>
            <p className="text-xs text-slate-400 mb-4 font-medium leading-relaxed">
              {isEn ? 'Choose where Lắc pulls from' : 'Chọn nguồn món ăn để quay ngẫu nhiên'}
            </p>
            <div className="space-y-3">
              <label className="flex items-center gap-2.5 cursor-pointer group select-none">
                <input
                  type="checkbox"
                  checked={includeSystem}
                  onChange={(e) => setIncludeSystem(e.target.checked)}
                  className="rounded-md w-4 h-4 border-slate-200 text-brand-primary focus:ring-brand-primary/20 transition-all duration-200"
                />
                <span className="text-xs font-bold text-slate-600 group-hover:text-brand-primary transition-colors">
                  {isEn ? 'System Foods' : 'Món ăn Hệ Thống'}
                </span>
              </label>

              <div className="border-t border-slate-100 my-2 pt-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                  {isEn ? 'Custom Collections' : 'Bộ sưu tập của tôi'}
                </span>
                {collections.length === 0 ? (
                  <div className="text-xs text-slate-400 italic font-medium">
                    {isEn ? 'No collections. ' : 'Chưa có bộ nào. '}
                    <Link href="/collections" className="text-brand-primary underline font-bold">
                      {isEn ? 'Create one' : 'Tạo mới'}
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1 slim-scrollbar">
                    {collections.map((col) => (
                      <label key={col._id} className="flex items-center gap-2.5 cursor-pointer group select-none">
                        <input
                          type="checkbox"
                          checked={selectedCollections.includes(col._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCollections([...selectedCollections, col._id]);
                            } else {
                              setSelectedCollections(selectedCollections.filter((id) => id !== col._id));
                            }
                          }}
                          className="rounded-md w-4 h-4 border-slate-200 text-brand-primary focus:ring-brand-primary/20 transition-all duration-200"
                        />
                        <span className="text-xs text-slate-600 font-medium group-hover:text-brand-primary truncate transition-colors" title={col.name}>
                          {col.name}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {!user && (
          <div className="glass-panel rounded-3xl p-6 border border-white/40 text-center flex flex-col items-center">
            <span className="text-3xl mb-3 animate-bounce">🍱</span>
            <h3 className="text-xs font-black text-slate-800 mb-1.5">
              {isEn ? 'Custom Collections' : 'Tự tạo bộ món ăn riêng'}
            </h3>
            <p className="text-[11px] text-slate-400 mb-4 leading-relaxed font-medium">
              {isEn ? 'Sign in to create your own collections and shake from them!' : 'Đăng nhập để tự tạo danh sách món ăn riêng và lắc nhé!'}
            </p>
            <Link
              href="/login"
              className="w-full py-2 bg-gradient-to-r from-brand-primary/10 to-orange-500/10 text-brand-primary font-black rounded-xl text-xs hover:from-brand-primary hover:to-orange-500 hover:text-white transition-all duration-300 shadow-sm"
            >
              {isEn ? 'Sign In' : 'Đăng nhập'}
            </Link>
          </div>
        )}

        {/* Active Filters */}
        <div className="glass-panel rounded-3xl p-6 border border-white/40">
          <h2 className="text-base font-black mb-1 text-slate-800 flex items-center gap-1.5">
            <span>⚙️</span> {t.activeFiltersStr}
          </h2>
          <p className="text-xs text-slate-400 mb-4 font-medium leading-relaxed">{t.filterDesc}</p>

          <div className="space-y-2 max-h-[220px] overflow-y-auto slim-scrollbar pr-0.5">
            <div className="p-2.5 bg-slate-50/50 rounded-xl border border-slate-100 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.cuisine}</div>
                <div className="text-xs font-bold text-slate-700 mt-0.5 truncate max-w-[190px]">{formatList(filters.cuisineType)}</div>
              </div>
            </div>

            <div className="p-2.5 bg-slate-50/50 rounded-xl border border-slate-100 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.price}</div>
                <div className="text-xs font-bold text-slate-700 mt-0.5">
                  {filters.priceRange ? tPriceRange(filters.priceRange, isEn) : t.anyPrice}
                </div>
              </div>
            </div>

            <div className="p-2.5 bg-slate-50/50 rounded-xl border border-slate-100 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.allergens}</div>
                <div className="text-xs font-bold text-slate-700 mt-0.5 truncate max-w-[190px]">
                  {formatList(filters.allergenExclude)}
                </div>
              </div>
            </div>

            <div className="p-2.5 bg-slate-50/50 rounded-xl border border-slate-100 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.mealType}</div>
                <div className="text-xs font-bold text-slate-700 mt-0.5">{formatList(filters.mealType)}</div>
              </div>
            </div>

            <div className="p-2.5 bg-slate-50/50 rounded-xl border border-slate-100 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.diet}</div>
                <div className="text-xs font-bold text-slate-700 mt-0.5">{formatList(filters.dietTag)}</div>
              </div>
            </div>
          </div>

          <Link
            href="/filter"
            className="mt-4 w-full py-2.5 bg-gradient-to-r from-brand-primary to-orange-500 text-white rounded-xl text-xs font-bold flex items-center justify-center hover:shadow-lg hover:shadow-brand-primary/20 hover:scale-102 active:scale-98 transition-all duration-200"
          >
            {t.editFilters}
          </Link>
        </div>
      </div>

      {/* CENTER PANEL: Shake Area */}
      <div className="glass-panel rounded-3xl p-6 md:p-8 border border-white/40 flex flex-col items-center min-h-[580px] relative">
        <div className="text-center mb-6 max-w-lg">
          <h1 className="text-3xl md:text-4xl font-heading font-black tracking-tight text-slate-800 mb-2">
            {t.shakeTitle}
          </h1>
          <p className="text-slate-400 text-xs md:text-sm leading-relaxed font-medium">{t.shakeDesc}</p>
        </div>

        {/* Shake Button Section */}
        <div className="flex flex-col items-center mb-8 w-full">
          <div className="flex flex-col sm:flex-row items-center gap-6 w-full max-w-xl mx-auto justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="relative flex items-center justify-center">
                {/* Ripple wave effect using hardware-accelerated animate-ping */}
                {!loading && (
                  <div className="absolute inset-0 rounded-full bg-brand-primary/20 animate-ping pointer-events-none scale-110" />
                )}
                <button
                  onClick={shakeNow}
                  disabled={loading}
                  className={`relative z-10 w-36 h-36 rounded-full bg-gradient-to-tr from-brand-primary to-orange-500 text-white font-black text-2xl shadow-[0_12px_40px_rgba(255,59,48,0.35)] hover:shadow-[0_18px_50px_rgba(255,59,48,0.5)] hover:scale-105 active:scale-95 transition-all duration-300 flex flex-col items-center justify-center disabled:opacity-50 disabled:hover:scale-100 select-none cursor-pointer ${
                    buttonShaking ? 'animate-shake-bounce' : 'animate-glow-pulse'
                  }`}
                >
                  {loading ? (
                    <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <div className="flex flex-col items-center">
                      <span className="text-3xl mb-1.5">🎲</span>
                      <span className="font-heading font-black tracking-tight text-sm uppercase">{t.shakeBtn}</span>
                    </div>
                  )}
                </button>
              </div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t.spaceHint}</span>
            </div>

            <div className="flex-1 bg-slate-50/50 p-4.5 rounded-2xl border border-slate-100/60 w-full">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-black text-slate-700 uppercase tracking-wider">{t.currentPool}</span>
                <span className="text-[11px] font-bold text-slate-400">{t.poolCountInfo(queue.length)}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {safeArray(filters.cuisineType).map((c) => (
                  <span
                    key={c}
                    className="px-2 py-0.5 bg-white border border-slate-200/80 rounded-md text-[10px] font-bold text-slate-500 uppercase tracking-wide"
                  >
                    {c}
                  </span>
                ))}
                {safeArray(filters.dietTag).map((d) => (
                  <span
                    key={d}
                    className="px-2 py-0.5 bg-white border border-slate-200/80 rounded-md text-[10px] font-bold text-slate-500 uppercase tracking-wide"
                  >
                    {d}
                  </span>
                ))}
                {filters.priceRange && (
                  <span className="px-2 py-0.5 bg-white border border-slate-200/80 rounded-md text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                    {tPriceRange(filters.priceRange, isEn)}
                  </span>
                )}
                {activeFilterCount === 0 && (
                  <span className="px-2 py-0.5 bg-white border border-slate-200/80 rounded-md text-[10px] font-medium text-slate-400 italic">
                    {t.noFilters}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {errorText && (
          <div className="p-4 bg-rose-50 text-brand-primary rounded-xl mb-6 text-xs font-semibold max-w-md text-center border border-rose-100 flex items-center gap-2">
            <span>⚠️</span> {errorText}
          </div>
        )}

        {/* Display Match */}
        {food ? (
          <div className="w-full max-w-2xl bg-white border border-slate-100 shadow-xl shadow-slate-100/30 rounded-3xl flex flex-col sm:flex-row overflow-hidden animate-fade-in-up hover:shadow-2xl transition-all duration-300">
            <div className="relative w-full sm:w-56 h-56 sm:h-auto bg-slate-100 shrink-0 border-r border-slate-100/50">
              {getFoodImageUrl(food) ? (
                <Image src={getFoodImageUrl(food)} alt={food.name?.vi ?? 'Food Image'} fill className="object-cover hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm font-semibold">
                  {t.noImage}
                </div>
              )}
            </div>
            <div className="p-8 flex flex-col justify-between flex-1 min-w-0">
              <div>
                <div className="flex justify-between items-start gap-3 mb-2 min-w-0">
                  <h3 className="text-xl font-black text-slate-800 truncate" title={food.name?.vi}>
                    {food.name?.vi}
                  </h3>
                  <span className="font-black text-lg text-brand-primary shrink-0">
                    {tPriceRange(food.priceRange, isEn)}
                  </span>
                </div>
                <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 mb-3.5 uppercase tracking-wide">
                  <span className="truncate">
                    {(food as any).isCustom 
                      ? `${isEn ? 'Collection' : 'Bộ sưu tập'}: ${(food as any).collectionName}`
                      : (typeof food.category === 'string' ? t.dish : (typeof food.category?.name === 'string' ? food.category.name : food.category?.name?.vi) || t.dish)
                    }
                  </span>
                  <span>•</span>
                  <span>{t.main}</span>
                  {(food as any).isCustom && (
                    <span className="ml-1 px-1.5 py-0.5 bg-brand-primary text-white text-[8px] font-black rounded uppercase tracking-wider shrink-0">
                      Cá nhân
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {food.tags?.vi?.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-slate-50 text-slate-500 border border-slate-100 rounded text-[10px] font-bold"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {food.description?.vi && (
                  <p className="text-slate-500 text-xs leading-relaxed line-clamp-3 mb-4 font-medium">
                    {food.description.vi}
                  </p>
                )}

                {(() => {
                  const rawIngs = (food as any).ingredients;
                  const ings: string[] = Array.isArray(rawIngs) ? rawIngs : (rawIngs?.vi || []);
                  if (ings.length === 0) return null;
                  return (
                    <div className="mb-4">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">
                        {isEn ? 'Ingredients' : 'Nguyên liệu'}
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {ings.slice(0, 5).map((ing: any) => (
                          <span
                            key={ing}
                            className="px-2 py-0.5 bg-slate-50 border border-slate-200/50 rounded text-[9px] font-bold text-slate-500"
                          >
                            {ing}
                          </span>
                        ))}
                        {ings.length > 5 && (
                          <span className="px-1.5 py-0.5 text-[9px] font-bold text-slate-400">
                            +{ings.length - 5}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="flex items-center gap-3">
                <button className="flex-1 bg-gradient-to-r from-brand-primary to-orange-500 text-white py-2.5 rounded-xl font-bold text-xs flex justify-center items-center gap-1.5 hover:shadow-lg hover:shadow-brand-primary/20 hover:scale-102 active:scale-98 transition-all duration-200">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                  {t.accept}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-2xl h-64 bg-slate-50/50 border border-slate-200/60 border-dashed rounded-3xl flex flex-col items-center justify-center text-slate-400 p-8 text-center">
            <span className="text-4xl mb-4 animate-float">🍲</span>
            <p className="text-sm font-bold text-slate-400 max-w-sm leading-relaxed">{t.shakeWait}</p>
          </div>
        )}
      </div>

      {/* RIGHT PANEL: Shake History */}
      <div className="glass-panel rounded-3xl p-6 border border-white/40 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-black text-slate-800 leading-none flex items-center gap-1.5">
              <span>⏳</span> {t.historyTitle}
            </h2>
            <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">{t.historyDesc}</p>
          </div>
          <button
            onClick={clearHistory}
            className="text-[10px] px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 hover:text-brand-primary text-slate-500 border border-slate-200/50 transition-all font-bold uppercase tracking-wider"
          >
            {t.clearBtn}
          </button>
        </div>

        {history.length > 0 ? (
          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 slim-scrollbar">
            {history.slice(0, 10).map((hItem, idx) => (
              <div key={`${hItem._id}-${idx}`} className="flex items-center gap-3 p-2 bg-white/40 border border-slate-100 rounded-2xl hover:bg-white hover:shadow-sm transition-all duration-200">
                <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-slate-100 relative border border-slate-200/40">
                  {getFoodImageUrl(hItem) && (
                    <Image
                      src={getFoodImageUrl(hItem)}
                      alt={hItem.name?.vi ?? 'Food'}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-800 truncate" title={hItem.name?.vi}>
                    {hItem.name?.vi}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-semibold truncate mt-0.5">
                    {tPriceRange(hItem.priceRange, isEn)} •{' '}
                    {typeof hItem.category === 'string' ? t.dish : (typeof hItem.category?.name === 'string' ? hItem.category.name : hItem.category?.name?.vi) || t.dish}
                  </p>
                </div>
                <button className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-brand-primary rounded-lg text-[10px] font-bold transition-all shrink-0">
                  {t.saveBtn}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-xs text-slate-400 font-semibold">{t.historyEmpty}</div>
        )}

        {history.length > 0 && (
          <Link
            href="/history"
            className="block text-center w-full mt-4 py-2 text-xs font-bold bg-slate-50 hover:bg-slate-100 border border-slate-200/60 rounded-xl text-slate-600 transition-colors"
          >
            {t.viewFullHistory}
          </Link>
        )}
      </div>
    </div>
  );
}
