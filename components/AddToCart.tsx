"use client";
import { useRouter } from "next/navigation";
type Props = { id: string; name: string; price: number; stock: number; label: string; disabled: boolean };
type CartItem = { id: string; name: string; price: number; stock: number; qty: number };
export default function AddToCart({ id, name, price, stock, label, disabled }: Props) {
  const r = useRouter();
  const go = () => {
    const c: CartItem[] = JSON.parse(localStorage.getItem("cart") || "[]"); const i = c.find(x => x.id === id);
    if (i) {
      i.name = name;
      i.price = price;
      i.stock = stock;
      i.qty = Math.min(i.qty + 1, 5, stock);
    }
    else c.push({ id, name, price, stock, qty: 1 });
    localStorage.setItem("cart", JSON.stringify(c));
    (window as any).fbq?.("track", "AddToCart", { value: price, currency: "DZD" }); (window as any).gtag?.("event", "add_to_cart");
    r.push("/checkout");
  };
  return <button disabled={disabled} onClick={go} className="btn w-full disabled:opacity-40">{label}</button>;
}
