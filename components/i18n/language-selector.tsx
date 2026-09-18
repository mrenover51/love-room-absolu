"use client";

import { ChevronDown } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { languageNames, locales, type Locale } from "@/lib/i18n/config";
import { languageSwitchTarget, localeCookie } from "@/lib/i18n/routing";
import { getUiDictionary } from "@/lib/i18n/ui";
import { trackConversion } from "@/lib/analytics/conversion";

function persistLocale(locale: Locale) {
  document.cookie = `${localeCookie}=${locale};path=/;max-age=31536000;samesite=lax;secure`;
}

export function LanguageSelector({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const router = useRouter();
  const reduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const labels = getUiDictionary(locale);
  function change(next: Locale) {
    setOpen(false);
    trackConversion("language_selected", { language: next });
    persistLocale(next);
    router.push(languageSwitchTarget(pathname, next));
  }

  useEffect(() => {
    const closeOnOutside = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return <motion.div ref={containerRef} initial={reduced ? false : { opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="relative z-50 inline-flex">
    <button type="button" onClick={() => setOpen(value => !value)} className="group inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 bg-black/20 px-4 text-[.65rem] font-semibold uppercase tracking-[.16em] text-white backdrop-blur-md transition-all duration-300 hover:border-[#C9A86A]/55 hover:bg-white/[.05]" aria-label={labels.chooseLanguage} aria-haspopup="listbox" aria-expanded={open} aria-controls="language-selector-options">
      <span aria-hidden="true">{locale.toUpperCase()}</span>
      <ChevronDown className={`size-3 text-white/55 transition-transform duration-300 ${open ? "rotate-180" : ""}`} aria-hidden="true" />
    </button>
    {open && <motion.div id="language-selector-options" role="listbox" aria-label={labels.chooseLanguage} initial={reduced ? false : { opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="absolute right-0 top-[calc(100%+.65rem)] z-[60] w-48 overflow-hidden rounded-2xl border border-[#C9A86A]/35 bg-[#11100F] p-1.5 text-sm normal-case tracking-normal text-[#F6F2EC] shadow-[0_20px_55px_rgba(0,0,0,.55)]">
      {locales.map(code => {
        const selected = code === locale;
        return <button key={code} type="button" role="option" aria-selected={selected} onClick={() => change(code)} className={`flex min-h-11 w-full items-center rounded-xl px-4 text-left transition-colors duration-200 ${selected ? "bg-[#C9A86A] font-semibold text-[#0B0908]" : "text-[#F6F2EC] hover:bg-[#2A241E] hover:text-white focus-visible:bg-[#2A241E]"}`}>
          {languageNames[code]}
        </button>;
      })}
    </motion.div>}
  </motion.div>;
}
