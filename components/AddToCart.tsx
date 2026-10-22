"use client";
import { useRouter } from "next/navigation";
export default function AddToCart({ id, name, price, label, disabled }: any) {
  const r = useRouter();
  const go = () => {
    const c = JSON.parse(localStorage.getItem("cart") || "[]"); const i = c.find((x: any) => x.id === id);
    i ? i.qty++ : c.push({ id, name, price, qty: 1 }); localStorage.setItem("cart", JSON.stringify(c));
    (window as any).fbq?.("track", "AddToCart", { value: price, currency: "DZD" }); (window as any).gtag?.("event", "add_to_cart");
    r.push("/checkout");
  };
  return <button disabled={disabled} onClick={go} className="btn w-full disabled:opacity-40">{label}</button>;
}
