"use client";
import Link from "next/link";
import { useEffect, useState } from "react"; import { useRouter } from "next/navigation"; import { pub } from "@/lib/supabase"; import { dzd, validPhone } from "@/lib/util";
export default function Checkout() {
  const r = useRouter(); const [cart, setCart] = useState<any[]>([]); const [w, setW] = useState<any[]>([]);
  const [cartReady, setCartReady] = useState(false);
  const [f, setF] = useState<any>({ delivery_type: "home", wilaya_id: "" }); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  useEffect(() => {
    try {
      const savedCart: unknown = JSON.parse(localStorage.getItem("cart") || "[]");
      if (!Array.isArray(savedCart)) throw new Error("Cart data must be a list");
      setCart(savedCart);
    } catch {
      setErr("Unable to read cart / تعذرت قراءة السلة");
      setCart([]);
    } finally {
      setCartReady(true);
    }
    pub().from("wilayas").select("*").order("id").then(({ data, error }) => {
      if (error) {
        setErr("Unable to load delivery fees / تعذر تحميل رسوم التوصيل");
        return;
      }
      setW(data || []);
    });
  }, []);
  const wil = w.find(x => x.id == f.wilaya_id); const ship = wil ? (f.delivery_type === "home" ? wil.home_price : wil.desk_price) : 0;
  const sub = cart.reduce((a, i) => a + i.price * i.qty, 0); const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });
  const updateQuantity = (id: string, delta: number) => {
    const updated = cart.map(item => item.id === id
      ? { ...item, qty: Math.max(1, Math.min(5, item.stock || 5, item.qty + delta)) }
      : item);
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };
  const removeItem = (id: string) => {
    const updated = cart.filter(item => item.id !== id);
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };
  const submit = async (e: any) => {
    e.preventDefault(); setErr("");
    if (!validPhone(f.phone || "")) return setErr("Invalid phone number / رقم غير صحيح");
    setBusy(true);
    const res = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...f, items: cart.map(i => ({ id: i.id, qty: i.qty })) }) });
    const j = await res.json(); setBusy(false);
    if (!res.ok) return setErr(j.error);
    (window as any).fbq?.("track", "Purchase", { value: j.total, currency: "DZD" }); (window as any).gtag?.("event", "purchase", { value: j.total, currency: "DZD" });
    localStorage.removeItem("cart"); r.push(`/order/${j.code}`);
  };
  if (!cartReady) {
    return <div role="status" className="mx-auto max-w-lg py-16 text-center text-slate-600">Loading cart… / جارٍ تحميل السلة…</div>;
  }
  if (!cart.length) {
    return (
      <section className="mx-auto my-8 max-w-lg rounded-2xl border border-slate-200 bg-card px-6 py-12 text-center shadow-sm">
        <div aria-hidden="true" className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-blue-50 text-blue-700">
          <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 4h2l2.2 11.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.4L21 9H6" />
            <circle cx="10" cy="20" r="1" /><circle cx="18" cy="20" r="1" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-slate-900">Your cart is empty / سلتك فارغة</h1>
        <p className="mt-2 text-sm text-slate-600">Nothing here yet. Discover our products to get started. / لا توجد منتجات هنا حاليًا. اكتشف منتجاتنا للبدء.</p>
        {err && <p role="alert" className="mt-3 text-sm text-red-600">{err}</p>}
        <Link href="/shop" className="btn mt-6">Discover the store / اكتشف المتجر</Link>
      </section>
    );
  }
  return (<form onSubmit={submit} className="max-w-lg mx-auto space-y-3">
    {cart.map(i => <div key={i.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-card p-3 text-sm">
      <span className="min-w-32 flex-1">{i.name}</span>
      <div className="flex items-center gap-2">
        <button type="button" aria-label="Decrease / تقليل الكمية" disabled={i.qty <= 1} onClick={() => updateQuantity(i.id, -1)} className="h-8 w-8 rounded border border-slate-300 disabled:opacity-40">−</button>
        <span className="min-w-6 text-center">{i.qty}</span>
        <button type="button" aria-label="Increase / زيادة الكمية" disabled={i.qty >= Math.min(5, i.stock || 5)} onClick={() => updateQuantity(i.id, 1)} className="h-8 w-8 rounded border border-slate-300 disabled:opacity-40">+</button>
        <button type="button" aria-label="Remove / حذف" onClick={() => removeItem(i.id)} className="px-2 text-red-600">×</button>
      </div>
      <span className="font-semibold">{dzd(i.price * i.qty)}</span>
    </div>)}
    <input required placeholder="Full name / الاسم" className="inp" onChange={set("name")} />
    <input required inputMode="tel" placeholder="05/06/07XXXXXXXX" className="inp" onChange={set("phone")} />
    <select required className="inp" onChange={set("wilaya_id")}><option value="">Wilaya / الولاية</option>{w.map(x => <option key={x.id} value={x.id}>{x.id} - {x.name}</option>)}</select>
    <input required placeholder="Commune / البلدية" className="inp" onChange={set("commune")} />
    <input required placeholder="Address / العنوان" className="inp" onChange={set("address")} />
    <select className="inp" onChange={set("delivery_type")}><option value="home">Home delivery / للمنزل</option><option value="desk">Pickup desk / مكتب</option></select>
    <textarea placeholder="Notes" className="inp" onChange={set("notes")} />
    <p className="flex justify-between"><span>Delivery</span><b>{wil ? dzd(ship) : "—"}</b></p>
    <p className="flex justify-between font-pixel text-xs text-neon-c"><span>TOTAL</span><span>{dzd(sub + ship)}</span></p>
    {err && <p className="text-red-400 text-sm">{err}</p>}
    <button disabled={busy || !cart.length} className="btn w-full disabled:opacity-40">Confirm / تأكيد (COD)</button></form>);
}
