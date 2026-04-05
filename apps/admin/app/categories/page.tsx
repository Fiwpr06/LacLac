import { fetchCategories } from '../../src/lib/api';

export default async function CategoriesAdminPage() {
  const categories = (await fetchCategories()) as Array<{
    _id?: string;
    name?: string;
    type?: string;
  }>;

  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-black text-slate-800">Danh mục</h1>
      <div className="grid gap-3 md:grid-cols-2">
        {categories.map((category) => (
          <article key={category._id} className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-lg font-bold text-slate-800">{category.name ?? 'N/A'}</p>
            <p className="mt-1 text-sm text-slate-500">Type: {category.type ?? 'N/A'}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
