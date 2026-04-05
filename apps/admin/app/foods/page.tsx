import { fetchFoods } from '../../src/lib/api';

export default async function FoodsAdminPage() {
  const foods = (await fetchFoods()) as Array<{ _id?: string; name?: string; priceRange?: string }>;

  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-black text-slate-800">Quản lý món ăn</h1>
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-slate-500">
              <th className="py-2">Tên món</th>
              <th className="py-2">Giá</th>
              <th className="py-2">ID</th>
            </tr>
          </thead>
          <tbody>
            {foods.map((food) => (
              <tr key={food._id} className="border-b border-slate-50">
                <td className="py-2 font-semibold text-slate-700">{food.name ?? 'N/A'}</td>
                <td className="py-2 text-slate-600">{food.priceRange ?? 'N/A'}</td>
                <td className="py-2 text-slate-400">{food._id ?? 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
