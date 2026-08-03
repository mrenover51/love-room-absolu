"use client";

import { useCallback, useEffect, useState } from "react";
import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigation } from "@/lib/constants";
import { MobileMenu } from "./mobile-menu";
import { LanguageSelector } from "@/components/i18n/language-selector";

const headerNavigation = navigation.slice(0, 5);

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 32);
    update(); window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-40 border-b transition-all duration-500 ${scrolled ? "border-white/10 bg-[#090909]/88 shadow-[0_12px_45px_rgba(0,0,0,.18)] backdrop-blur-xl" : "border-white/[.06] bg-black/15 backdrop-blur-[6px]"}`}>
        <div className={`page-shell flex items-center justify-between transition-[height] duration-500 ${scrolled ? "h-18 lg:h-20" : "h-24 lg:h-28"}`}>
          <Link href="/" className="font-heading text-xl tracking-[.3em] text-white transition-colors hover:text-[#E7D4AD] lg:text-2xl" aria-label="Absolu, accueil">ABSOLU</Link>
          <nav className="hidden items-center gap-9 xl:flex" aria-label="Navigation principale">{headerNavigation.map((item) => {const active=item.href==="/"?pathname==="/":pathname.startsWith(item.href);return <Link key={item.href} href={item.href} aria-current={active?"page":undefined} className={`group relative py-3 text-[.65rem] font-semibold uppercase tracking-[.18em] transition-colors duration-300 ${active?"text-white":"text-white/65 hover:text-white"}`}><span>{item.label}</span><span aria-hidden="true" className={`absolute inset-x-0 bottom-1 h-px origin-left bg-gradient-to-r from-[#A98245] to-[#E7D4AD] transition-transform duration-500 ease-out ${active?"scale-x-100":"scale-x-0 group-hover:scale-x-100"}`}/></Link>})}</nav>
          <div className="ml-auto hidden items-center gap-5 sm:flex lg:gap-7"><div className="hidden xl:block"><LanguageSelector locale="fr" /></div><Link href="/reservation" className="premium-action hidden min-h-12 items-center border border-[#C9A86A]/60 bg-[#C9A86A]/[.08] px-7 text-[.65rem] font-semibold uppercase tracking-[.2em] text-white lg:inline-flex">Réserver</Link></div>
          <button type="button" onClick={() => setOpen(true)} className="grid size-12 place-items-center lg:hidden" aria-label="Ouvrir le menu" aria-expanded={open}><Menu aria-hidden="true" /></button>
        </div>
      </header>
      <MobileMenu open={open} onClose={close} pathname={pathname} />
    </>
  );
}
