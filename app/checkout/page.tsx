"use client";
import { useEffect, useState } from "react"; import { useRouter } from "next/navigation"; import { pub } from "@/lib/supabase"; import { dzd, validPhone } from "@/lib/util";
export default function Checkout() {
  const r = useRouter(); const [cart, setCart] = useState<any[]>([]); const [w, setW] = useState<any[]>([]);
  const [f, setF] = useState<any>({ delivery_type: "home", wilaya_id: "" }); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  useEffect(() => { setCart(JSON.parse(localStorage.getItem("cart") || "[]")); pub().from("wilayas").select("*").order("id").then(({ data }) => setW(data || [])); }, []);
  const wil = w.find(x => x.id == f.wilaya_id); const ship = wil ? (f.delivery_type === "home" ? wil.home_price : wil.desk_price) : 0;
  const sub = cart.reduce((a, i) => a + i.price * i.qty, 0); const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });
  const submit = async (e: any) => {
    e.preventDefault(); setErr("");
    if (!validPhone(f.phone || "")) return setErr("Numéro invalide / رقم غير صحيح");
    setBusy(true);
    const res = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...f, items: cart.map(i => ({ id: i.id, qty: i.qty })) }) });
    const j = await res.json(); setBusy(false);
    if (!res.ok) return setErr(j.error);
    (window as any).fbq?.("track", "Purchase", { value: j.total, currency: "DZD" }); (window as any).gtag?.("event", "purchase", { value: j.total, currency: "DZD" });
    localStorage.removeItem("cart"); r.push(`/order/${j.code}`);
  };
  return (<form onSubmit={submit} className="max-w-lg mx-auto space-y-3">
    {cart.map(i => <div key={i.id} className="flex justify-between text-sm"><span>{i.name} ×{i.qty}</span><span>{dzd(i.price * i.qty)}</span></div>)}
    <input required placeholder="Nom complet / الاسم" className="inp" onChange={set("name")} />
    <input required inputMode="tel" placeholder="05/06/07XXXXXXXX" className="inp" onChange={set("phone")} />
    <select required className="inp" onChange={set("wilaya_id")}><option value="">Wilaya / الولاية</option>{w.map(x => <option key={x.id} value={x.id}>{x.id} - {x.name}</option>)}</select>
    <input required placeholder="Commune / البلدية" className="inp" onChange={set("commune")} />
    <input required placeholder="Adresse / العنوان" className="inp" onChange={set("address")} />
    <select className="inp" onChange={set("delivery_type")}><option value="home">À domicile / للمنزل</option><option value="desk">Stop desk / مكتب</option></select>
    <textarea placeholder="Notes" className="inp" onChange={set("notes")} />
    <p className="flex justify-between"><span>Livraison</span><b>{wil ? dzd(ship) : "—"}</b></p>
    <p className="flex justify-between font-pixel text-xs text-neon-c"><span>TOTAL</span><span>{dzd(sub + ship)}</span></p>
    {err && <p className="text-red-400 text-sm">{err}</p>}
    <button disabled={busy || !cart.length} className="btn w-full disabled:opacity-40">Confirmer / تأكيد (COD)</button></form>);
}
