'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import TinderCard from 'react-tinder-card';

import { getRandomFood, FoodItem, postAction } from '../src/lib/api';
import { useFilters } from '../src/store/filters';

const getSessionId = (): string => {
  const key = 'laclac_web_session';
  const existing = globalThis.localStorage?.getItem(key);
  if (existing) return existing;

  const id = `session-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  globalThis.localStorage?.setItem(key, id);
  return id;
};

type SwipeDirection = 'left' | 'right' | 'up' | 'down';

export default function HomePage() {
  const { filters } = useFilters();
  const [food, setFood] = useState<FoodItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [cardSeed, setCardSeed] = useState(0);
  const [swipeNote, setSwipeNote] = useState('Vuốt trái để đánh dấu không thích món này.');

  const snapshot = useMemo(
    () => ({
      priceRange: filters.priceRange,
      mealType: filters.mealType,
      dietTag: filters.dietTag,
      category: undefined,
    }),
    [filters],
  );

  const loadNextFood = useCallback(async () => {
    setLoading(true);
    try {
      const nextFood = await getRandomFood(filters);
      setFood(nextFood);
      setCardSeed((value) => value + 1);

      if (nextFood?._id) {
        await postAction({
          sessionId: getSessionId(),
          foodId: nextFood._id,
          actionType: 'shake_result',
          context: filters.context ?? 'none',
          filterSnapshot: snapshot,
        });
      }
    } finally {
      setLoading(false);
    }
  }, [filters, snapshot]);

  const shakeNow = async () => {
    if (loading) return;
    setSwipeNote('Đang tìm món hợp gu của bạn...');
    await loadNextFood();
  };

  const onSwipe = async (direction: SwipeDirection) => {
    if (!food?._id || loading) return;
    if (direction !== 'left' && direction !== 'right') return;

    const swipedFoodId = food._id;
    const actionType = direction === 'left' ? 'swipe_left' : 'swipe_right';

    setSwipeNote(
      direction === 'left'
        ? 'Đã đánh dấu không thích. Đang tìm món khác...'
        : 'Đã lưu món muốn thử. Đang tìm món tiếp theo...',
    );

    await postAction({
      sessionId: getSessionId(),
      foodId: swipedFoodId,
      actionType,
      context: filters.context ?? 'none',
      filterSnapshot: snapshot,
    });

    await loadNextFood();
  };

  const imageUrl = food?.thumbnailImage ?? food?.images?.[0];

  return (
    <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <article className="lac-card relative overflow-hidden p-6 sm:p-8">
        <div className="pointer-events-none absolute -left-14 -top-16 h-40 w-40 rounded-full bg-orange-100/80 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-16 h-52 w-52 rounded-full bg-amber-100/70 blur-3xl" />

        <p className="relative text-xs font-black uppercase tracking-[0.2em] text-brand-primary">
          Lắc Lắc Web
        </p>
        <h1 className="relative mt-3 text-4xl font-black leading-tight text-brand-secondary sm:text-5xl">
          Một nút Lắc, một thẻ món ăn, vuốt là xong.
        </h1>
        <p className="relative mt-4 max-w-xl text-base text-brand-secondary/75">
          Bấm Lắc để lấy món ngẫu nhiên. Khi thẻ hiện ra, vuốt trái để đánh dấu không thích, vuốt
          phải để lưu món bạn muốn thử.
        </p>

        <button
          onClick={() => void shakeNow()}
          className="relative mt-6 rounded-2xl bg-brand-primary px-8 py-3 text-lg font-black text-white transition hover:-translate-y-0.5"
        >
          {loading ? 'Đang lắc...' : 'Lắc'}
        </button>

        <p className="relative mt-4 text-sm font-semibold text-brand-secondary/75">{swipeNote}</p>
        <Link
          href="/filter"
          className="relative mt-3 inline-block text-sm font-bold text-brand-primary"
        >
          Chỉnh bộ lọc →
        </Link>
      </article>

      <article className="lac-stage p-4 sm:p-6">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-brand-secondary/70">
          Thẻ món ăn
        </p>

        <div className="relative mt-3 h-[540px] w-full">
          {food ? (
            <TinderCard
              key={`${food._id}-${cardSeed}`}
              onSwipe={(direction) => void onSwipe(direction as SwipeDirection)}
              preventSwipe={['up', 'down']}
              className="absolute inset-0"
            >
              <article className="food-card h-full">
                <div
                  className="food-card-media"
                  style={
                    imageUrl
                      ? {
                          backgroundImage: `linear-gradient(180deg, rgba(45,53,97,0.08), rgba(45,53,97,0.45)), url(${imageUrl})`,
                        }
                      : undefined
                  }
                >
                  {imageUrl ? null : (
                    <span className="food-card-media-fallback">Món ngẫu nhiên đang chờ bạn.</span>
                  )}
                </div>

                <div className="space-y-3 px-1">
                  <p className="text-xs font-black uppercase tracking-[0.15em] text-brand-primary">
                    Gợi ý mới
                  </p>
                  <h2 className="text-3xl font-black text-brand-secondary">{food.name}</h2>
                  <p className="text-brand-secondary/75">
                    {food.description ?? 'Món ngon phù hợp cho bữa này.'}
                  </p>

                  <div className="flex flex-wrap gap-2 text-sm font-semibold text-brand-secondary">
                    <span className="food-chip">Giá: {food.priceRange ?? 'medium'}</span>
                    <span className="food-chip">Calo: {food.calories ?? 0}</span>
                    <span className="food-chip">Kiểu nấu: {food.cookingStyle ?? 'dry'}</span>
                  </div>

                  <div className="food-status">
                    <span>Vuốt trái: Không thích</span>
                    <span>Vuốt phải: Muốn thử</span>
                  </div>

                  <Link
                    href={`/food/${food._id}`}
                    className="inline-block text-sm font-bold text-brand-primary"
                  >
                    Xem chi tiết món →
                  </Link>
                </div>
              </article>
            </TinderCard>
          ) : (
            <article className="food-card h-full items-center justify-center text-center">
              <p className="text-xl font-black text-brand-secondary">Chưa có món nào.</p>
              <p className="mt-2 text-brand-secondary/70">Bấm nút Lắc để lấy thẻ món đầu tiên.</p>
            </article>
          )}
        </div>
      </article>
    </section>
  );
}
