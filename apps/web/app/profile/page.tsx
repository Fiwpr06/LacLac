'use client';

import { useFilters } from '../../src/store/filters';

export default function ProfilePage() {
  const { filters } = useFilters();

  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-black text-brand-secondary">Hồ sơ khẩu vị</h1>
      <p className="text-brand-secondary/70">
        Lắc Lắc lưu lại hành vi để chuẩn bị mô hình recommendation ở v3 (không AI ở v1).
      </p>

      <div className="lac-card grid gap-2 p-5 text-brand-secondary">
        <p>
          <span className="font-bold">Giá ưu tiên:</span> {filters.priceRange ?? 'chưa chọn'}
        </p>
        <p>
          <span className="font-bold">Bữa ăn:</span> {filters.mealType ?? 'chưa chọn'}
        </p>
        <p>
          <span className="font-bold">Dinh dưỡng:</span> {filters.dietTag ?? 'chưa chọn'}
        </p>
        <p>
          <span className="font-bold">Ngữ cảnh:</span> {filters.context ?? 'chưa chọn'}
        </p>
      </div>
    </section>
  );
}
