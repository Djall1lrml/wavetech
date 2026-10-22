"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle({ lang }: { lang: "fr" | "ar" }) {
  const [dark, setDark] = useState(false);
  const isArabic = lang === "ar";

  useEffect(() => {
    const savedTheme = localStorage.getItem("wavetech-theme");
    const isDark = savedTheme
      ? savedTheme === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", isDark);
    setDark(isDark);

    const syncTheme = (event: Event) => {
      const nextDark = (event as CustomEvent<boolean>).detail;
      setDark(nextDark);
    };
    window.addEventListener("wavetech-theme-change", syncTheme);
    return () => window.removeEventListener("wavetech-theme-change", syncTheme);
  }, []);

  const toggleTheme = () => {
    const nextDark = !dark;
    localStorage.setItem("wavetech-theme", nextDark ? "dark" : "light");
    document.documentElement.classList.toggle("dark", nextDark);
    setDark(nextDark);
    window.dispatchEvent(new CustomEvent("wavetech-theme-change", { detail: nextDark }));
  };

  const label = isArabic
    ? dark ? "الوضع النهاري" : "الوضع الليلي"
    : dark ? "Mode jour" : "Mode nuit";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      aria-pressed={dark}
      className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition hover:bg-blue-50 dark-toggle"
    >
      <span aria-hidden="true">{dark ? "☀️" : "🌙"}</span>
      <span>{label}</span>
    </button>
  );
}
