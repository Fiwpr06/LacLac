export default function AdminHomePage() {
  return (
    <section className="grid gap-4 md:grid-cols-2">
      <article className="rounded-2xl border border-slate-200 bg-white p-5">
        <h1 className="text-3xl font-black text-slate-800">Trang quản trị Lắc Lắc</h1>
        <p className="mt-3 text-slate-600">
          Quản lý dữ liệu món ăn Việt Nam cho hệ sinh thái mobile/web.
        </p>
      </article>
      <article className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-xl font-bold">Checklist v1</h2>
        <ul className="mt-3 list-disc pl-4 text-slate-600">
          <li>CRUD món ăn</li>
          <li>Quản lý categories</li>
          <li>Theo dõi dữ liệu hành vi</li>
        </ul>
      </article>
    </section>
  );
}
