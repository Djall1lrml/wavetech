import Link from "next/link"; import { pub } from "@/lib/supabase"; import { getLang, t } from "@/lib/i18n"; import ProductCard from "@/components/ProductCard"; import LandingProductFilters from "@/components/LandingProductFilters";
export const revalidate = 60;
export default async function Home() {
  const s = t();
  const lang = getLang();
  const db = pub();
  const [{ data }, { data: allProducts }, { data: categories }] = await Promise.all([
    db.from("products").select("*,product_images(*)").eq("featured", true).limit(8),
    db.from("products").select("*,product_images(*)").order("created_at", { ascending: false }),
    db.from("categories").select("id,slug,name_fr,name_ar").order("id"),
  ]);
  const benefitIcons = [
    <svg key="delivery" aria-hidden="true" viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 8h12v10H2zM14 11h4l4 4v3h-8z" /><circle cx="6.5" cy="19" r="1.5" /><circle cx="18.5" cy="19" r="1.5" /><path d="M5 11h6M5 14h4" />
    </svg>,
    <svg key="payment" aria-hidden="true" viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18M7 15h4" /><path d="m15 14 1.5 1.5L19 13" />
    </svg>,
    <svg key="play" aria-hidden="true" viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 5v14l11-7L8 5Z" /><path d="M4 8v8M2 10v4" />
    </svg>,
  ];
  return (<>
    <section className="relative isolate mb-10 flex min-h-[28rem] items-center justify-center overflow-hidden rounded-2xl bg-slate-950 px-5 py-12 text-center sm:min-h-[32rem]">
      <img src="/wavetech-wave.svg" alt="" aria-hidden="true" className="absolute inset-0 -z-20 h-full w-full object-cover" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-b from-slate-950/45 via-blue-950/45 to-slate-950/75" />
      <div className="max-w-3xl">
        <p className="mb-6 font-pixel text-xs leading-7 text-cyan-200 sm:text-sm">{s.welcome}</p>
        <h1 className="font-pixel text-lg leading-[2] text-white drop-shadow-lg sm:text-2xl md:text-3xl">{s.hero}</h1>
        <Link href="/shop" className="btn mt-8">{s.shopNow} →</Link>
      </div>
    </section>
    <h2 className="mb-4 text-lg font-semibold text-slate-900">{s.feat}</h2>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{data?.map(p => <ProductCard key={p.id} p={p} />)}</div>
    <section className="mt-12">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">{s.allProducts}</h2>
      <LandingProductFilters
        products={allProducts || []}
        categories={(categories || []).map(category => ({
          id: category.id,
          slug: category.slug,
          name: lang === "ar" ? category.name_ar || category.name_fr : category.name_fr,
        }))}
        language={lang}
      />
    </section>
    <section className="my-12">
      <h2 className="mb-5 text-center text-xl font-bold text-slate-900">{s.benefitsTitle}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {s.why.map((w, index) => <article key={w} className="flex min-h-36 items-center gap-4 rounded-2xl border border-blue-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md sm:flex-col sm:justify-center sm:text-center">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-blue-50 text-blue-700">{benefitIcons[index]}</span>
          <h3 className="font-semibold text-slate-800">{w}</h3>
        </article>)}
      </div>
    </section>
  </>);
}
