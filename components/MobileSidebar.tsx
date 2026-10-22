"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Lang from "@/components/Lang";
import ThemeToggle from "@/components/ThemeToggle";

type Category = { slug: string; name_fr: string; name_ar: string | null };

export default function MobileSidebar({ lang, categories }: { lang: "fr" | "ar"; categories: Category[] }) {
  const [open, setOpen] = useState(false);
  const closeButton = useRef<HTMLButtonElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const rtl = lang === "ar";
  const labels = rtl
    ? { open: "فتح القائمة", close: "إغلاق القائمة", shop: "المتجر", track: "تتبع الطلب", cart: "السلة", categories: "الفئات" }
    : { open: "Ouvrir le menu", close: "Fermer le menu", shop: "Shop", track: "Suivi commande", cart: "Panier", categories: "Catégories" };

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        menuButton.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const close = () => setOpen(false);
  const drawer = open ? (
    <>
      <button
        type="button"
        aria-label={labels.close}
        onClick={close}
        className="fixed inset-0 z-40 cursor-default bg-slate-950/50"
      />
      <aside
        id="mobile-navigation"
        role="dialog"
        aria-modal="true"
        aria-label={rtl ? "القائمة الرئيسية" : "Menu principal"}
        dir={rtl ? "rtl" : "ltr"}
        className={`fixed inset-y-0 ${rtl ? "right-0 border-l" : "left-0 border-r"} z-50 flex w-80 max-w-[85vw] flex-col overflow-y-auto border-slate-200 bg-white p-5 text-slate-900 shadow-2xl`}
      >
        <div className="mb-6 flex items-center justify-between">
          <span className="font-pixel text-xs text-neon-c">WAVETECH</span>
          <button ref={closeButton} type="button" aria-label={labels.close} onClick={close} className="rounded-lg px-3 py-1 text-2xl text-slate-600 hover:bg-slate-100">×</button>
        </div>
        <nav className="flex flex-col gap-1 text-sm">
          <Link onClick={close} className="rounded-lg px-3 py-3 hover:bg-blue-50" href="/shop">{labels.shop}</Link>
          <Link onClick={close} className="rounded-lg px-3 py-3 hover:bg-blue-50" href="/track">{labels.track}</Link>
          <Link onClick={close} className="rounded-lg px-3 py-3 hover:bg-blue-50" href="/checkout">{labels.cart}</Link>
        </nav>
        <h2 className="mb-2 mt-6 border-b border-slate-200 pb-2 text-sm font-semibold">{labels.categories}</h2>
        <nav className="flex flex-col gap-1 text-sm">
          {categories.map(category => (
            <Link key={category.slug} onClick={close} className="rounded-lg px-3 py-3 hover:bg-blue-50" href={`/shop?cat=${encodeURIComponent(category.slug)}`}>
              {rtl ? category.name_ar || category.name_fr : category.name_fr}
            </Link>
          ))}
        </nav>
        <div className="mt-auto space-y-3 border-t border-slate-200 pt-4">
          <ThemeToggle lang={lang} />
          <Lang />
        </div>
      </aside>
    </>
  ) : null;

  return (
    <>
      <div className="lg:hidden">
        <button
          ref={menuButton}
          type="button"
          aria-label={labels.open}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          onClick={() => setOpen(true)}
          className="rounded border border-slate-300 px-3 py-2 text-xl leading-none text-slate-800 hover:bg-slate-50"
        >
          ☰
        </button>
      </div>
      {drawer}
    </>
  );
}
