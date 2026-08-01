"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

export function ThemeControl() {
  const [theme, setTheme] = useState<Theme>("dark");

  function apply(next: Theme) {
    const dark = next === "dark" || (next === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("light", !dark);
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("absolu-theme", next);
  }

  useEffect(() => {
    queueMicrotask(() => {
      const saved = (localStorage.getItem("absolu-theme") as Theme | null) ?? "dark";
      setTheme(saved);
      apply(saved);
    });
  }, []);

  function cycle() {
    const next: Theme = theme === "dark" ? "light" : theme === "light" ? "system" : "dark";
    setTheme(next);
    apply(next);
  }

  return <button type="button" onClick={cycle} className="fixed bottom-3 right-3 z-40 grid size-10 place-items-center rounded-full border border-white/15 bg-black/80 text-white/60 backdrop-blur" aria-label={`Thème ${theme}. Changer de thème`}>
    {theme === "light" ? <Sun className="size-4" /> : <Moon className="size-4" />}
  </button>;
}
