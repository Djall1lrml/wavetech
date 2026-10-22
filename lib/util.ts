export const validPhone = (p: string) => /^0[567]\d{8}$/.test(p.replace(/[\s.-]/g, ""));
const hits = new Map<string, number[]>();
export function limited(key: string, max = 5, windowMs = 600000) {
  const now = Date.now(); const a = (hits.get(key) || []).filter(t => now - t < windowMs);
  a.push(now); hits.set(key, a); return a.length > max; // in-memory; use Upstash Redis for strict limits on serverless
}
export const dzd = (n: number) => n.toLocaleString("fr-DZ") + " DA";
