import { pub } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function sitemap() {
  const u = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  let slugs: { slug: string }[] = [];
  try {
    const { data } = await pub().from("products").select("slug");
    slugs = data || [];
  } catch {}
  return [{ url: u }, { url: u + "/shop" }, ...slugs.map(p => ({ url: `${u}/product/${p.slug}` }))];
}