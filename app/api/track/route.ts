import { NextResponse } from "next/server"; import { admin } from "@/lib/supabase"; import { limited } from "@/lib/util";
export async function GET(req: Request) {
  if (limited("t:" + (req.headers.get("x-forwarded-for") || "x"), 20)) return NextResponse.json({ error: "429" }, { status: 429 });
  const q = (new URL(req.url).searchParams.get("q") || "").trim().replace(/[\s.-]/g, "");
  const { data } = await admin().from("orders").select("code,status,total,created_at").or(`code.eq.${q.toUpperCase().replace(/[^A-Z0-9]/g, "")},phone.eq.${q.replace(/[^0-9]/g, "")}`).order("created_at", { ascending: false }).limit(5);
  return NextResponse.json({ orders: data || [] });
}
