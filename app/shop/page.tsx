import { pub } from "@/lib/supabase"; import { t } from "@/lib/i18n"; import ProductCard from "@/components/ProductCard";
export const dynamic = "force-dynamic";
export default async function Shop({ searchParams: sp }: { searchParams: Record<string, string> }) {
  const s = t(); let q = pub().from("products").select("*,product_images(*),categories!inner(slug)");
  if (sp.cat) q = q.eq("categories.slug", sp.cat);
  if (sp.q) q = q.ilike("name", `%${sp.q}%`);
  if (sp.brand) q = q.eq("brand", sp.brand);
  if (sp.min) q = q.gte("price", +sp.min); if (sp.max) q = q.lte("price", +sp.max);
  if (sp.stock) q = q.gt("stock", 0);
  q = sp.sort === "price_asc" ? q.order("price") : sp.sort === "price_desc" ? q.order("price", { ascending: false }) : q.order("created_at", { ascending: false });
  const { data } = await q;
  return (<><form className="grid grid-cols-2 md:grid-cols-6 gap-2 mb-6">
    <input name="q" placeholder={s.search} className="inp col-span-2" defaultValue={sp.q} />
    <select name="cat" className="inp" defaultValue={sp.cat}><option value="">Category</option><option value="consoles">Consoles</option><option value="accessories">Accessories</option></select>
    <select name="sort" className="inp" defaultValue={sp.sort}><option value="">New arrivals</option><option value="price_asc">Price ↑</option><option value="price_desc">Price ↓</option></select>
    <input name="max" type="number" placeholder="Max price" className="inp" defaultValue={sp.max} />
    <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="stock" value="1" defaultChecked={!!sp.stock} />{s.stock}</label>
    <button className="btn col-span-2 md:col-span-1">OK</button></form>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{data?.map(p => <ProductCard key={p.id} p={p} />)}</div></>);
}
