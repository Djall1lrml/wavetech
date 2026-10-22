import { pub } from "@/lib/supabase"; import { t } from "@/lib/i18n"; import { dzd } from "@/lib/util"; import AddToCart from "@/components/AddToCart"; import ProductCard from "@/components/ProductCard";
import { notFound } from "next/navigation";
export async function generateMetadata({ params }: any) {
  const { data: p } = await pub().from("products").select("name,description,product_images(url)").eq("slug", params.slug).single();
  return { title: p?.name, description: p?.description?.slice(0, 150), openGraph: { images: p?.product_images?.[0]?.url } };
}
export default async function Product({ params }: any) {
  const s = t(); const { data: p } = await pub().from("products").select("*,product_images(*)").eq("slug", params.slug).single();
  if (!p) notFound();
  const { data: rel } = await pub().from("products").select("*,product_images(*)").eq("category_id", p.category_id).neq("id", p.id).limit(4);
  return (<><div className="grid md:grid-cols-2 gap-6">
    <div className="flex md:grid gap-2 overflow-x-auto snap-x">{p.product_images.map((i: any) => <img key={i.id} src={i.url} alt={p.name} className="snap-center rounded-lg min-w-full md:min-w-0" />)}</div>
    <div><h1 className="font-pixel text-base leading-relaxed text-neon-c">{p.name}</h1>
      <p className="my-4 text-xl font-bold">{dzd(p.price)} {p.old_price && <><s className="opacity-50 text-sm">{dzd(p.old_price)}</s> <span className="text-neon-c text-sm">-{Math.round(100 - p.price * 100 / p.old_price)}%</span></>}</p>
      <p className={p.stock > 0 ? "text-green-400" : "text-red-400"}>{p.stock > 0 ? s.stock : s.out}</p>
      <p className="my-4 opacity-80">{p.description}</p>
      <ul className="mb-4 text-sm">{Object.entries(p.specs || {}).map(([k, v]) => <li key={k}><b>{k}:</b> {String(v)}</li>)}</ul>
      <AddToCart id={p.id} name={p.name} price={p.price} stock={p.stock} label={s.order} disabled={p.stock <= 0} /></div></div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-10">{rel?.map(r => <ProductCard key={r.id} p={r} />)}</div></>);
}
