import { pub } from "@/lib/supabase";
export default async function sitemap() {
  const u = process.env.NEXT_PUBLIC_SITE_URL!; const { data } = await pub().from("products").select("slug");
  return [{ url: u }, { url: u + "/shop" }, ...(data || []).map(p => ({ url: `${u}/product/${p.slug}` }))];
}
