import { NextResponse } from "next/server"; import { admin } from "@/lib/supabase"; import { validPhone, limited } from "@/lib/util";
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "x"; const b = await req.json();
  if (limited("o:" + ip) || limited("p:" + b.phone, 3)) return NextResponse.json({ error: "Too many attempts, please try again later." }, { status: 429 });
  const phone = String(b.phone || "").replace(/[\s.-]/g, "");
  if (!validPhone(phone) || !b.name || !b.commune || !b.address || !b.wilaya_id || !b.items?.length) return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  const db = admin();
  const { data: wil } = await db.from("wilayas").select("*").eq("id", b.wilaya_id).single();
  const { data: prods } = await db.from("products").select("id,name,price,stock").in("id", b.items.map((i: any) => i.id));
  if (!wil || !prods?.length) return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  const type = b.delivery_type === "desk" ? "desk" : "home"; const ship = type === "home" ? wil.home_price : wil.desk_price;
  const lines = b.items.map((i: any) => { const p = prods.find(p => p.id === i.id)!; return { p, qty: Math.min(Math.max(+i.qty || 1, 1), 5) }; });
  if (lines.some((l: any) => !l.p || l.p.stock < l.qty)) return NextResponse.json({ error: "Product out of stock" }, { status: 400 });
  const sub = lines.reduce((a: number, l: any) => a + l.p.price * l.qty, 0); const code = "WT" + Math.random().toString(36).slice(2, 8).toUpperCase();
  const { data: o, error } = await db.from("orders").insert({ code, name: b.name, phone, wilaya_id: wil.id, commune: b.commune, address: b.address, delivery_type: type, delivery_price: ship, subtotal: sub, total: sub + ship, notes: b.notes }).select().single();
  if (error) return NextResponse.json({ error: "Server error" }, { status: 500 });
  await db.from("order_items").insert(lines.map((l: any) => ({ order_id: o.id, product_id: l.p.id, name: l.p.name, price: l.p.price, qty: l.qty })));
  for (const l of lines) await db.from("products").update({ stock: l.p.stock - l.qty }).eq("id", l.p.id);
  const msg = `🛒 New order ${code}\n${b.name} · ${phone}\n${wil.name}, ${b.commune} (${type})\n${lines.map((l: any) => `${l.p.name} ×${l.qty}`).join("\n")}\nTotal: ${o.total} DA`;
  fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text: msg }) }).catch(() => {});
  return NextResponse.json({ code, total: o.total });
}
