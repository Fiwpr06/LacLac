'use client';

import { useFilters } from '../../src/store/filters';

const pill = 'rounded-full border border-brand-secondary/20 px-4 py-2 font-semibold';

export default function FilterPage() {
  const { filters, setFilter, reset } = useFilters();

  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-black text-brand-secondary">Bộ lọc thông minh</h1>
      <p className="text-brand-secondary/70">
        Lọc theo giá, bữa ăn, chế độ dinh dưỡng và ngữ cảnh.
      </p>

      <div className="lac-card space-y-5 p-5">
        <div className="space-y-2">
          <h2 className="font-bold text-brand-secondary">Khoảng giá</h2>
          <div className="flex flex-wrap gap-2">
            {(['cheap', 'medium', 'expensive'] as const).map((item) => (
              <button
                key={item}
                onClick={() =>
                  setFilter('priceRange', filters.priceRange === item ? undefined : item)
                }
                className={`${pill} ${filters.priceRange === item ? 'bg-brand-primary text-white' : ''}`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="font-bold text-brand-secondary">Ngữ cảnh</h2>
          <div className="flex flex-wrap gap-2">
            {(['solo', 'date', 'group', 'travel', 'office'] as const).map((item) => (
              <button
                key={item}
                onClick={() => setFilter('context', filters.context === item ? undefined : item)}
                className={`${pill} ${filters.context === item ? 'bg-brand-accent text-brand-secondary' : ''}`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={reset}
          className="rounded-xl bg-brand-secondary px-4 py-2 font-bold text-white"
        >
          Reset
        </button>
      </div>
    </section>
  );
}
