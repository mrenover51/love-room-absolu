"use client";

import { useEffect, useRef } from "react";
import { ArrowUpRight, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

const primaryLinks = [
  { label: "La Suite", href: "/la-suite" },
  { label: "Galerie", href: "/galerie" },
  { label: "Contact", href: "/contact" },
] as const;

const discoveryLinks = [
  { label: "Guide touristique", href: "/guide-touristique" }, { label: "Restaurants", href: "/restaurants" },
  { label: "Carte interactive", href: "/carte-touristique" }, { label: "Maisons de Champagne", href: "/guide-touristique/avenue-de-champagne" },
  { label: "Magazine", href: "/blog" }, { label: "Équipements", href: "/equipements" },
  { label: "Vidéos", href: "/videos" }, { label: "Avis", href: "/avis" },
  { label: "Inspirations", href: "/experiences-romantiques" }, { label: "FAQ", href: "/faq" },
  { label: "Bons cadeaux", href: "/bons-cadeaux" },
] as const;

export function MobileMenu({ open, onClose, pathname }: { open: boolean; onClose: () => void; pathname: string }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); if (event.key === "Tab") { const items = dialogRef.current?.querySelectorAll<HTMLElement>('a[href],button:not([disabled])'); if (!items?.length) return; const first = items[0], last = items[items.length - 1]; if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); } } };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; previous?.focus(); };
  }, [open, onClose]);

  return <AnimatePresence>{open && <motion.div ref={dialogRef} initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .35 }} className="fixed inset-0 z-50 overflow-y-auto bg-[#0B0908]/98 px-6 pb-12 pt-5 backdrop-blur-2xl xl:hidden" role="dialog" aria-modal="true" aria-label="Navigation mobile">
    <div className="mx-auto max-w-2xl">
      <div className="flex h-16 items-center justify-between border-b border-white/10">
        <Link href="/" onClick={onClose} className="font-heading text-2xl tracking-[.3em]">ABSOLU</Link>
        <button type="button" onClick={onClose} className="grid size-12 place-items-center rounded-full border border-white/10 transition-colors hover:border-[#C9A86A]/50 hover:text-[#D8BD87]" aria-label="Fermer le menu"><X aria-hidden="true" /></button>
      </div>
      <motion.div initial={reduced ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: .55, delay: .08, ease: [.22, 1, .36, 1] }}>
        <Link href="/reservation" onClick={onClose} className="premium-action mt-8 flex min-h-14 w-full items-center justify-between rounded-full border border-[#DEC38E] bg-[linear-gradient(135deg,#D7B778,#B88C50)] px-7 text-xs font-semibold uppercase tracking-[.22em] text-[#110D0A] shadow-[0_14px_38px_rgba(91,61,46,.24)]">Réserver maintenant <ArrowUpRight className="size-4" aria-hidden="true" /></Link>
        <nav className="mt-9" aria-label="Navigation mobile principale">
          {primaryLinks.map(link => { const active = pathname.startsWith(link.href); return <Link key={link.href} href={link.href} onClick={onClose} aria-current={active ? "page" : undefined} className={`group flex items-center justify-between border-b border-white/10 py-4 font-heading text-3xl transition-colors ${active ? "text-[#C9A86A]" : "text-[#F6F2EC] hover:text-[#D8BD87]"}`}>{link.label}<ArrowUpRight className="size-4 opacity-30 transition-all group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:opacity-100" aria-hidden="true" /></Link>; })}
        </nav>
        <div className="mt-10"><p className="eyebrow text-[#C9A86A]">Découvrir</p><nav className="mt-5 grid grid-cols-2 gap-x-7 gap-y-1" aria-label="Découvrir Absolu">{discoveryLinks.map(link => <Link key={link.href} href={link.href} onClick={onClose} className="border-b border-white/[.07] py-3 text-sm text-white/55 transition-all duration-300 hover:translate-x-1 hover:text-white">{link.label}</Link>)}</nav></div>
      </motion.div>
    </div>
  </motion.div>}</AnimatePresence>;
}
