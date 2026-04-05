import Link from 'next/link';

import { getFoodDetail } from '../../../src/lib/api';

export default async function FoodDetailPage({ params }: { params: { id: string } }) {
  const food = await getFoodDetail(params.id);

  if (!food) {
    return <p>Không tìm thấy món ăn.</p>;
  }

  return (
    <section className="space-y-4">
      <Link href="/" className="font-bold text-brand-primary">
        ← Quay lại
      </Link>

      <article className="lac-card p-6">
        <h1 className="text-4xl font-black text-brand-secondary">{food.name}</h1>
        <p className="mt-3 text-brand-secondary/75">
          {food.description ?? 'Món ngon hợp khẩu vị Việt.'}
        </p>

        <div className="mt-5 flex flex-wrap gap-2 text-sm font-semibold text-brand-secondary">
          <span className="rounded-full bg-orange-50 px-3 py-1">
            Giá: {food.priceRange ?? 'medium'}
          </span>
          <span className="rounded-full bg-orange-50 px-3 py-1">Calo: {food.calories ?? 0}</span>
          <span className="rounded-full bg-orange-50 px-3 py-1">
            Kiểu nấu: {food.cookingStyle ?? 'dry'}
          </span>
        </div>
      </article>
    </section>
  );
}
