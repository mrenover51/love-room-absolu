"use client";

import { ChevronDown } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { languageNames, locales, type Locale } from "@/lib/i18n/config";

export function LanguageSelector({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const router = useRouter();
  const reduced = useReducedMotion();
  function change(next: Locale) {
    const parts = pathname.split("/");
    const localized = locales.includes(parts[1] as Locale);
    let target: string;
    if (localized) { parts[1] = next; target = parts.join("/") || `/${next}`; }
    else { const section = pathname.startsWith("/blog") ? "/blog" : pathname.startsWith("/faq") ? "/faq" : pathname.startsWith("/guide-touristique") ? "/guides" : ""; target = `/${next}${section}`; }
    document.cookie = `absolu-locale=${next};path=/;max-age=31536000;samesite=lax`;
    router.push(target);
  }
  return <motion.label initial={reduced ? false : { opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="group relative inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-white/15 bg-black/20 px-4 text-[.65rem] font-semibold uppercase tracking-[.16em] text-white backdrop-blur-md transition-all duration-300 hover:border-[#C9A86A]/55 hover:bg-white/[.05]"><span aria-hidden="true">{locale.toUpperCase()}</span><ChevronDown className="size-3 text-white/45 transition-transform duration-300 group-focus-within:rotate-180" aria-hidden="true" /><span className="sr-only">Choisir la langue</span><select value={locale} onChange={event => change(event.target.value as Locale)} className="absolute inset-0 cursor-pointer appearance-none opacity-0" aria-label="Choisir la langue">{locales.map(code => <option key={code} value={code}>{languageNames[code]}</option>)}</select></motion.label>;
}
