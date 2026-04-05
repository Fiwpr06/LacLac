'use client';

import { useEffect, useMemo, useState } from 'react';
import TinderCard from 'react-tinder-card';

import { FoodItem, getSwipeQueue, postAction } from '../../src/lib/api';
import { useFilters } from '../../src/store/filters';

const getSessionId = (): string => {
  const key = 'laclac_web_session';
  const existing = globalThis.localStorage?.getItem(key);
  if (existing) return existing;
  const id = `session-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  globalThis.localStorage?.setItem(key, id);
  return id;
};

export default function SwipePage() {
  const { filters } = useFilters();
  const [cards, setCards] = useState<FoodItem[]>([]);

  const snapshot = useMemo(
    () => ({
      priceRange: filters.priceRange,
      mealType: filters.mealType,
      dietTag: filters.dietTag,
      category: undefined,
    }),
    [filters],
  );

  useEffect(() => {
    const load = async () => {
      const queue = await getSwipeQueue(filters);
      setCards(queue);
    };

    void load();
  }, [filters]);

  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-black text-brand-secondary">Swipe món ăn</h1>
      <p className="text-brand-secondary/70">Vuốt phải để thích, vuốt trái để bỏ qua.</p>

      <div className="relative h-[520px] w-full">
        {cards.map((food) => (
          <TinderCard
            key={food._id}
            onSwipe={(dir) =>
              void postAction({
                sessionId: getSessionId(),
                foodId: food._id,
                actionType: dir === 'right' ? 'swipe_right' : 'swipe_left',
                context: filters.context ?? 'none',
                filterSnapshot: snapshot,
              })
            }
            preventSwipe={['up', 'down']}
            className="absolute w-full"
          >
            <article className="lac-card mx-auto w-full max-w-xl p-6">
              <h2 className="text-3xl font-black text-brand-secondary">{food.name}</h2>
              <p className="mt-2 text-brand-secondary/70">
                {food.description ?? 'Món ngon đáng thử.'}
              </p>
              <div className="mt-4 flex gap-2 text-sm font-semibold text-brand-secondary">
                <span className="rounded-full bg-orange-50 px-3 py-1">
                  {food.priceRange ?? 'medium'}
                </span>
                <span className="rounded-full bg-orange-50 px-3 py-1">
                  {food.cookingStyle ?? 'dry'}
                </span>
              </div>
            </article>
          </TinderCard>
        ))}
      </div>
    </section>
  );
}
