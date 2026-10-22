import { cookies } from "next/headers"; import { createServerClient } from "@supabase/ssr"; import { redirect } from "next/navigation"; import { revalidatePath } from "next/cache";
import { admin } from "@/lib/supabase";
export const dynamic = "force-dynamic";
async function guard() {
  const c = cookies(); const sb = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { cookies: { getAll: () => c.getAll(), setAll: () => {} } });
  const { data: { user } } = await sb.auth.getUser(); if (!user) redirect("/admin/login");
  const { data } = await admin().from("admins").select("email").eq("email", user.email!).maybeSingle(); if (!data) redirect("/admin/login");
}
async function setStatus(fd: FormData) { "use server"; await guard(); await admin().from("orders").update({ status: fd.get("status") }).eq("id", fd.get("id")); revalidatePath("/admin"); }
async function setPrice(fd: FormData) { "use server"; await guard(); await admin().from("wilayas").update({ home_price: +fd.get("home")!, desk_price: +fd.get("desk")! }).eq("id", fd.get("id")); revalidatePath("/admin"); }
async function addProduct(fd: FormData) { "use server"; await guard(); const db = admin();
  const { data: p } = await db.from("products").insert({ name: fd.get("name"), slug: String(fd.get("name")).toLowerCase().replace(/\W+/g, "-") + "-" + Date.now() % 1000, price: +fd.get("price")!, stock: +fd.get("stock")!, category_id: +fd.get("cat")!, description: fd.get("desc"), featured: true }).select().single();
  const f = fd.get("img") as File; if (p && f?.size) { const path = `${p.id}/${f.name}`; await db.storage.from("products").upload(path, f); await db.from("product_images").insert({ product_id: p.id, url: db.storage.from("products").getPublicUrl(path).data.publicUrl }); }
  revalidatePath("/admin"); }
async function delProduct(fd: FormData) { "use server"; await guard(); await admin().from("products").delete().eq("id", fd.get("id")); revalidatePath("/admin"); }
async function setStock(fd: FormData) {
  "use server";
  await guard();
  const id = fd.get("id");
  const stock = Number(fd.get("stock"));
  if (typeof id !== "string" || !id || !Number.isInteger(stock) || stock < 0) {
    throw new Error("Invalid product stock");
  }
  await admin().from("products").update({ stock }).eq("id", id);
  revalidatePath("/admin");
}
export default async function Admin() {
  await guard(); const db = admin(); const today = new Date(); today.setHours(0, 0, 0, 0);
  const { data: orders } = await db.from("orders").select("*,wilayas(name)").order("created_at", { ascending: false }).limit(100);
  const { data: wil } = await db.from("wilayas").select("*").order("id"); const { data: prods } = await db.from("products").select("id,name,stock");
  const td = orders?.filter(o => new Date(o.created_at) >= today) || []; const rev = orders?.filter(o => o.status === "delivered").reduce((a, o) => a + o.total, 0);
  return (<div className="space-y-8 text-sm">
    <p className="font-pixel text-xs">Aujourd'hui: {td.length} cmd · CA livré: {rev} DA</p>
    <section><h2 className="font-pixel text-neon-c mb-2">Commandes</h2>{orders?.map(o => <form key={o.id} action={setStatus} className="bg-card p-2 mb-2 rounded flex flex-wrap gap-2 items-center">
      <input type="hidden" name="id" value={o.id} /><b>{o.code}</b><span>{o.name} {o.phone} · {o.wilayas?.name}, {o.commune}</span><span>{o.total} DA</span>
      <select name="status" defaultValue={o.status} className="inp !w-auto">{["new", "confirmed", "shipped", "delivered", "returned", "cancelled"].map(s => <option key={s}>{s}</option>)}</select><button className="btn !py-1">OK</button></form>)}</section>
    <section><h2 className="font-pixel text-neon-c mb-2">Produits</h2>
      <form action={addProduct} className="grid grid-cols-2 gap-2 mb-3"><input name="name" placeholder="Nom" className="inp" required /><input name="price" type="number" placeholder="Prix" className="inp" required /><input name="stock" type="number" placeholder="Stock" className="inp" /><select name="cat" className="inp"><option value="1">Consoles</option><option value="2">Accessoires</option></select><input name="desc" placeholder="Description" className="inp col-span-2" /><input name="img" type="file" accept="image/*" className="inp col-span-2" /><button className="btn col-span-2">Ajouter</button></form>
      {prods?.map(p => <div key={p.id} className="flex flex-wrap justify-between items-center gap-2 py-1">
        <span>{p.name}</span>
        <form action={setStock} className="flex items-center gap-2"><input type="hidden" name="id" value={p.id} /><label className="sr-only" htmlFor={`stock-${p.id}`}>Stock de {p.name}</label><input id={`stock-${p.id}`} name="stock" type="number" min="0" step="1" defaultValue={p.stock} className="inp !w-24" /><button className="btn !py-1">Mettre à jour</button></form>
        <form action={delProduct}><input type="hidden" name="id" value={p.id} /><button className="text-red-400">Supprimer</button></form>
      </div>)}</section>
    <section><h2 className="font-pixel text-neon-c mb-2">Livraison par wilaya</h2>{wil?.map(w => <form key={w.id} action={setPrice} className="flex gap-2 mb-1 items-center"><input type="hidden" name="id" value={w.id} /><span className="w-40">{w.id} {w.name}</span><input name="home" defaultValue={w.home_price} className="inp !w-24" /><input name="desk" defaultValue={w.desk_price} className="inp !w-24" /><button className="btn !py-1">OK</button></form>)}</section></div>);
}
