'use client';

import Link from 'next/link';

import { WebFilter } from '../../src/lib/api';
import { useFilters } from '../../src/store/filters';

type Option<T extends string> = {
  readonly value: T;
  readonly label: string;
};

const PRICE_OPTIONS = [
  { value: 'cheap', label: 'Tiết kiệm 💰' },
  { value: 'medium', label: 'Cân bằng ⚖️' },
  { value: 'expensive', label: 'Thoải mái 💎' },
] as const;

const BUDGET_OPTIONS = [
  { value: 'under_30k', label: 'Dưới 30k' },
  { value: 'from_30k_to_50k', label: '30k - 50k' },
  { value: 'from_50k_to_100k', label: '50k - 100k' },
  { value: 'over_100k', label: 'Trên 100k' },
] as const;

const DISH_OPTIONS = [
  { value: 'liquid', label: 'Món nước 🍜' },
  { value: 'dry', label: 'Món khô 🥖' },
  { value: 'fried_grilled', label: 'Chiên / Nướng 🍳' },
] as const;

const CUISINE_OPTIONS = [
  { value: 'vietnamese', label: 'Việt Nam 🇻🇳' },
  { value: 'asian', label: 'Châu Á 🌏' },
  { value: 'european', label: 'Châu Âu 🇪🇺' },
] as const;

const MEAL_OPTIONS = [
  { value: 'breakfast', label: 'Sáng 🌅' },
  { value: 'lunch', label: 'Trưa ☀️' },
  { value: 'dinner', label: 'Tối 🌙' },
  { value: 'snack', label: 'Ăn vặt 🍟' },
] as const;

const DIET_OPTIONS = [
  { value: 'vegetarian', label: 'Ăn chay 🥬' },
  { value: 'vegan', label: 'Thuần chay 🌱' },
  { value: 'keto', label: 'Keto 🥩' },
  { value: 'clean', label: 'Eat clean 🥗' },
] as const;

const COOKING_OPTIONS = [
  { value: 'soup', label: 'Canh / Súp' },
  { value: 'dry', label: 'Khô' },
  { value: 'fried', label: 'Chiên' },
  { value: 'grilled', label: 'Nướng' },
  { value: 'raw', label: 'Tươi / Sống' },
  { value: 'steamed', label: 'Hấp' },
] as const;

const CONTEXT_OPTIONS = [
  { value: 'solo', label: 'Một mình 🙋‍♂️' },
  { value: 'date', label: 'Hẹn hò 👩‍❤️‍👨' },
  { value: 'group', label: 'Nhóm bạn 👥' },
  { value: 'travel', label: 'Đi chơi 🎒' },
  { value: 'office', label: 'Công sở 💼' },
] as const;

const pillBase =
  'rounded-2xl border px-4 py-2.5 text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40 select-none cursor-pointer active:scale-95';

const pillClass = (isActive: boolean): string => {
  if (isActive) {
    return `${pillBase} border-transparent bg-gradient-to-r from-brand-primary to-orange-500 text-white shadow-md shadow-brand-primary/15`;
  }

  return `${pillBase} border-slate-200 bg-white text-slate-600 hover:border-brand-primary/30 hover:text-brand-primary`;
};

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

function ToggleGroup<T extends string>({
  title,
  options,
  value,
  onSelect,
}: {
  title: string;
  options: ReadonlyArray<Option<T>>;
  value?: T;
  onSelect: (value?: T) => void;
}) {
  return (
    <div className="space-y-2.5">
      <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">{title}</h2>
      <div className="flex flex-wrap gap-2">
        {options.map((item) => {
          const active = value === item.value;
          return (
            <button
              key={item.value}
              onClick={() => {
                try {
                  const tickAudio = new Audio('/sounds/tick-filter.mp3');
                  tickAudio.volume = 0.4;
                  tickAudio.play().catch(() => {});
                } catch (e) {}
                onSelect(active ? undefined : item.value);
              }}
              className={pillClass(active)}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function FilterPage(): JSX.Element {
  const { filters, setFilter, reset } = useFilters();
  const activeFilterCount = countActiveFilters(filters);
  const allergenText = (filters.allergenExclude ?? []).join(', ');

  return (
    <section className="max-w-4xl mx-auto py-6 space-y-6 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-black text-slate-800 tracking-tight">Bộ lọc thông minh</h1>
          <p className="text-slate-400 text-xs md:text-sm font-medium mt-1">
            Chọn nhanh theo ngân sách, kiểu món, ẩm thực, bữa ăn và ngữ cảnh trước khi lắc.
          </p>
        </div>
        <div className="px-4 py-2 bg-gradient-to-r from-brand-primary/10 to-orange-500/10 border border-brand-primary/10 text-brand-primary rounded-2xl text-xs font-bold self-start">
          Đang bật {activeFilterCount} điều kiện lọc
        </div>
      </div>

      <div className="glass-panel rounded-3xl p-6 md:p-8 border border-white/40 space-y-8">
        <div className="grid gap-6 md:grid-cols-2">
          <ToggleGroup
            title="Khoảng giá"
            options={PRICE_OPTIONS}
            value={filters.priceRange}
            onSelect={(value) => setFilter('priceRange', value)}
          />

          <ToggleGroup
            title="Ngân sách chi tiết"
            options={BUDGET_OPTIONS}
            value={filters.budgetBucket}
            onSelect={(value) => setFilter('budgetBucket', value)}
          />

          <ToggleGroup
            title="Loại món"
            options={DISH_OPTIONS}
            value={filters.dishType}
            onSelect={(value) => setFilter('dishType', value)}
          />

          <ToggleGroup
            title="Kiểu ẩm thực"
            options={CUISINE_OPTIONS}
            value={filters.cuisineType}
            onSelect={(value) => setFilter('cuisineType', value)}
          />

          <ToggleGroup
            title="Bữa ăn"
            options={MEAL_OPTIONS}
            value={filters.mealType}
            onSelect={(value) => setFilter('mealType', value)}
          />

          <ToggleGroup
            title="Chế độ dinh dưỡng"
            options={DIET_OPTIONS}
            value={filters.dietTag}
            onSelect={(value) => setFilter('dietTag', value)}
          />

          <ToggleGroup
            title="Kiểu nấu"
            options={COOKING_OPTIONS}
            value={filters.cookingStyle}
            onSelect={(value) => setFilter('cookingStyle', value)}
          />

          <ToggleGroup
            title="Ngữ cảnh"
            options={CONTEXT_OPTIONS}
            value={filters.context}
            onSelect={(value) => setFilter('context', value)}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2 pt-4 border-t border-slate-100/60">
          <div className="space-y-2.5">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Dị ứng cần loại trừ</h2>
            <input
              value={allergenText}
              onChange={(event) => {
                const next = event.target.value
                  .split(',')
                  .map((item) => item.trim())
                  .filter(Boolean);

                setFilter('allergenExclude', next.length > 0 ? next : undefined);
              }}
              placeholder="Ví dụ: đậu phộng, tôm, sữa"
              className="w-full rounded-2xl px-4 py-3 text-xs text-slate-700 outline-none border border-slate-200 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all font-bold placeholder:text-slate-400"
            />
            <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
              Tách các thành phần bằng dấu phẩy để loại trừ nhiều nhóm dị ứng cùng lúc.
            </p>
          </div>

          <div className="space-y-2.5">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Khóa cứng danh mục (Nâng cao)</h2>
            <input
              value={filters.category ?? ''}
              onChange={(event) => {
                const next = event.target.value.trim();
                setFilter('category', next || undefined);
              }}
              placeholder="ObjectId category"
              className="w-full rounded-2xl px-4 py-3 text-xs text-slate-700 outline-none border border-slate-200 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all font-bold placeholder:text-slate-400"
            />
            <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
              Nhập mã ObjectId danh mục hệ thống để cố định bộ lắc chỉ chọn món ăn thuộc danh mục này.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 pt-6 border-t border-slate-100/60">
          <button
            onClick={reset}
            className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl shadow-md hover:shadow-lg active:scale-95 transition-all select-none cursor-pointer uppercase tracking-wider"
          >
            Reset toàn bộ bộ lọc
          </button>
          <Link
            href="/"
            className="px-6 py-3 bg-gradient-to-r from-brand-primary to-orange-500 text-white font-black text-xs rounded-xl shadow-md shadow-brand-primary/15 hover:shadow-lg hover:shadow-brand-primary/25 active:scale-95 transition-all select-none cursor-pointer uppercase tracking-wider"
          >
            Quay lại màn lắc chính
          </Link>
        </div>
      </div>
    </section>
  );
}
