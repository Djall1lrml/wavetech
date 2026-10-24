"use client";
import { useState } from "react";
export default function Track() {
  const [q, setQ] = useState(""); const [o, setO] = useState<any[] | null>(null);
  const go = async (e: any) => { e.preventDefault(); const r = await fetch("/api/track?q=" + encodeURIComponent(q)); setO((await r.json()).orders || []); };
  return (<div className="max-w-md mx-auto"><form onSubmit={go} className="flex gap-2"><input className="inp" placeholder="Phone or code / الهاتف أو الرمز" onChange={e => setQ(e.target.value)} /><button className="btn">OK</button></form>
    {o?.map(x => <p key={x.code} className="bg-card p-3 mt-3 rounded">{x.code} — <b className="text-neon-c">{x.status}</b> — {x.total} DA</p>)}{o && !o.length && <p className="mt-4">No orders found.</p>}</div>);
}
