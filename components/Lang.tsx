"use client";
export default function Lang() {
  const set = (l: string) => { document.cookie = `lang=${l};path=/;max-age=31536000`; location.reload(); };
  return <span className="font-pixel text-[10px]"><button onClick={() => set("fr")}>FR</button> | <button onClick={() => set("ar")}>AR</button></span>;
}
