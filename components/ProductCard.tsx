import Link from "next/link"; import { dzd } from "@/lib/util";
export default function ProductCard({ p }: { p: any }) {
  const img = p.product_images?.sort((a: any, b: any) => a.position - b.position)[0]?.url;
  return (<Link href={`/product/${p.slug}`} className="bg-card rounded-lg border border-slate-200 hover:border-neon-c hover:-translate-y-1 transition overflow-hidden block">
    <div className="aspect-square bg-slate-100">{img && <img src={img} alt={p.name} loading="lazy" className="w-full h-full object-cover" />}</div>
    <div className="p-3"><h3 className="text-sm font-semibold">{p.name}</h3>
    <p className="text-neon-c font-pixel text-xs mt-2">{dzd(p.price)} {p.old_price && <s className="opacity-50 text-[10px]">{dzd(p.old_price)}</s>}</p></div></Link>);
}
