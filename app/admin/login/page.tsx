"use client";
import { createBrowserClient } from "@supabase/ssr"; import { useState } from "react";
export default function Login() {
  const [e, setE] = useState(""), [p, setP] = useState(""), [err, setErr] = useState("");
  const go = async (ev: any) => { ev.preventDefault(); const sb = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    const { error } = await sb.auth.signInWithPassword({ email: e, password: p }); error ? setErr(error.message) : (location.href = "/admin"); };
  return <form onSubmit={go} className="max-w-sm mx-auto space-y-3 mt-20"><input className="inp" type="email" placeholder="Email" onChange={x => setE(x.target.value)} /><input className="inp" type="password" placeholder="Mot de passe" onChange={x => setP(x.target.value)} /><button className="btn w-full">Login</button><p className="text-red-400">{err}</p></form>;
}
