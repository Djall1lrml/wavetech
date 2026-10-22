import Link from "next/link"; import { pub } from "@/lib/supabase"; import { t } from "@/lib/i18n"; import ProductCard from "@/components/ProductCard";
export const revalidate = 60;
export default async function Home() {
  const s = t();
  const { data } = await pub().from("products").select("*,product_images(*)").eq("featured", true).limit(8);
  return (<>
    <section className="wave-hero relative isolate flex min-h-[22rem] items-start justify-center overflow-hidden rounded-2xl border border-neon-c/20 px-4 pt-12 pb-32 mb-10 text-center">
      <svg aria-hidden="true" viewBox="0 0 1200 420" preserveAspectRatio="xMidYMid slice" className="pointer-events-none absolute inset-0 -z-10 h-full w-full">
        <defs>
          <linearGradient id="wave-sea" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#172554" /><stop offset="1" stopColor="#581c87" /></linearGradient>
          <linearGradient id="wave-foam" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#67e8f9" /><stop offset="1" stopColor="#c4b5fd" /></linearGradient>
        </defs>
        <circle cx="930" cy="115" r="68" fill="#ec4899" opacity=".28" />
        <circle cx="930" cy="115" r="90" fill="none" stroke="#f0abfc" strokeOpacity=".22" />
        <path d="M0 293c112-39 174-9 258 6 88 16 130-53 210-52 77 2 117 49 178 67 77 22 141-27 222-21 100 8 202 60 332 22v105H0z" fill="#312e81" opacity=".75" />
        <path d="M0 347c98-51 180-36 274-16 91 20 166 13 218-36 41-38 68-105 136-105 44 0 83 23 114 56-39-17-77-8-95 20 44-15 91-1 113 39 26 47 80 72 158 51 77-21 172-23 282 8v56H0z" fill="url(#wave-sea)" stroke="#a78bfa" strokeOpacity=".75" strokeWidth="3" />
        <path d="M626 190c44 8 83 31 116 65-27-9-52-7-72 7 48-7 91 15 107 54 13 30 49 48 89 49-41 12-89 3-119-24-31-27-38-63-70-77-28-12-56 0-75 19 17-31 44-43 79-39-22-27-43-43-71-54z" fill="url(#wave-foam)" />
        <path d="M0 347c98-51 180-36 274-16 91 20 166 13 218-36 41-38 68-105 136-105m108 65c-27-9-52-7-72 7 48-7 91 15 107 54 13 30 49 48 89 49" fill="none" stroke="#cffafe" strokeOpacity=".9" strokeWidth="4" />
        <path d="M44 385c76-30 134-20 206-4m-160 22c58-22 100-15 147-4m343-28c46-14 83-5 114 14m-80-37c26-9 52-5 72 8" fill="none" stroke="#67e8f9" strokeOpacity=".7" strokeWidth="3" strokeLinecap="round" />
        <path d="M95 91h4m82 47h4m508-72h4m126 41h4m195 105h4" stroke="#e9d5ff" strokeWidth="4" strokeLinecap="round" />
      </svg>
      <div className="relative z-10">
        <h1 className="font-pixel text-xl sm:text-3xl text-neon-p leading-relaxed drop-shadow-[0_0_12px_#a855f7]">{s.hero}</h1>
        <Link href="/shop" className="btn mt-8">{s.shop} ▶</Link>
      </div>
    </section>
    <h2 className="font-pixel text-sm text-neon-k mb-4">{s.feat}</h2>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{data?.map(p => <ProductCard key={p.id} p={p} />)}</div>
    <section className="grid grid-cols-2 gap-3 my-12 text-center text-xs">{s.why.map(w => <div key={w} className="bg-card border border-neon-c/40 rounded p-4">{w}</div>)}</section>
  </>);
}
