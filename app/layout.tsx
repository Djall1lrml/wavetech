import "./globals.css";
import Link from "next/link";
import { getLang, t } from "@/lib/i18n";
import Lang from "@/components/Lang";
export const metadata = { title: "WaveTech — Consoles rétro Algérie", description: "Game Boy style, handhelds émulateurs et accessoires. Livraison 58 wilayas, paiement à la livraison.", openGraph: { title: "WaveTech", images: ["/og.png"] } };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  const l = getLang(), s = t();
  return (<html lang={l} dir={l === "ar" ? "rtl" : "ltr"}><head>
    <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Inter:wght@400;600&display=swap" rel="stylesheet" /></head>
    <body><header className="sticky top-0 z-20 bg-bg/90 backdrop-blur border-b border-neon-p/30 flex items-center justify-between p-3">
      <div dir="ltr" className="inline-flex items-center gap-3">
        <img src="/wavetech-profile.jpg" alt="" aria-hidden="true" className="h-8 w-8 rounded-full border border-neon-c/50 object-cover shadow-[0_0_10px_rgba(34,211,238,0.3)]" />
        <Link href="/" className="font-pixel text-neon-c text-sm">WAVETECH</Link>
      </div>
      <nav className="flex gap-4 text-sm items-center"><Link href="/shop">{s.shop}</Link><Link href="/track">{s.track}</Link><Link href="/checkout">🛒</Link><Lang /></nav></header>
      <main className="max-w-6xl mx-auto p-4">{children}</main>
      <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP}`} className="fixed bottom-4 right-4 bg-green-500 w-14 h-14 rounded-full grid place-items-center text-2xl shadow-lg">💬</a>
      <footer className="mt-16 border-t border-neon-p/20 bg-card/50">
        <div className="max-w-6xl mx-auto px-5 py-10 grid gap-8 sm:grid-cols-3">
          <div className="space-y-3">
            <Link href="/" className="inline-block font-pixel text-neon-c text-sm">WAVETECH</Link>
            <p className="max-w-xs text-sm leading-6 text-white/65">
              {l === "ar" ? "أجهزة ألعاب كلاسيكية وإكسسوارات، مع التوصيل إلى 58 ولاية." : "Consoles rétro et accessoires, livrés dans les 58 wilayas."}
            </p>
          </div>
          <div className="space-y-3">
            <h2 className="font-pixel text-[10px] text-neon-c">{l === "ar" ? "روابط سريعة" : "Liens rapides"}</h2>
            <nav className="flex flex-col items-start gap-2 text-sm text-white/70">
              <Link className="hover:text-neon-c transition" href="/shop">{s.shop}</Link>
              <Link className="hover:text-neon-c transition" href="/track">{s.track}</Link>
            </nav>
          </div>
          <div className="space-y-3">
            <h2 className="font-pixel text-[10px] text-neon-c">{l === "ar" ? "تابعنا" : "Suivez-nous"}</h2>
            <a href="https://www.instagram.com/wavetech.dz/" target="_blank" rel="noopener noreferrer" aria-label="Instagram WaveTech" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-neon-c transition">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r=".8" className="fill-current stroke-none" />
              </svg>
              <span>@wavetech.dz</span>
            </a>
          </div>
        </div>
        <div className="border-t border-white/10">
          <p className="max-w-6xl mx-auto px-5 py-4 text-xs text-white/45">
            © {new Date().getFullYear()} WaveTech
            <span className="mx-2">·</span>
            {l === "ar" ? "جميع الحقوق محفوظة" : "Tous droits réservés"}
          </p>
        </div>
      </footer></body></html>);
}
