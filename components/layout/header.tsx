"use client";

import { useCallback, useEffect, useState } from "react";
import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigation } from "@/lib/constants";
import { MobileMenu } from "./mobile-menu";
import { LanguageSelector } from "@/components/i18n/language-selector";

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
      <header className={`fixed inset-x-0 top-0 z-40 transition-[background-color,box-shadow] duration-500 ${scrolled ? "bg-[#090909]/90 shadow-lg shadow-black/10 backdrop-blur-xl" : "bg-transparent"}`}>
        <div className="page-shell flex h-20 items-center justify-between lg:h-24">
          <Link href="/" className="font-heading text-xl tracking-[.24em] text-white lg:text-2xl" aria-label="Absolu, accueil">ABSOLU</Link>
          <nav className="hidden items-center gap-7 lg:flex" aria-label="Navigation principale">{navigation.map((item) => {const active=item.href==="/"?pathname==="/":pathname.startsWith(item.href);return <Link key={item.href} href={item.href} aria-current={active?"page":undefined} className={`relative py-2 text-[.68rem] font-semibold uppercase tracking-[.14em] transition-colors ${active?"text-white":"text-white/70 hover:text-white"}`}><span>{item.label}</span><span aria-hidden="true" className={`absolute inset-x-0 -bottom-1 h-px origin-left bg-[#C9A86A] transition-transform duration-500 ${active?"scale-x-100":"scale-x-0"}`}/></Link>})}</nav>
          <div className="hidden xl:block"><LanguageSelector locale="fr" /></div><Link href="/reservation" className="hidden border border-[#C9A86A]/70 px-5 py-3 text-[.68rem] font-semibold uppercase tracking-[.16em] text-white transition-colors hover:bg-[#C9A86A] hover:text-black sm:block">Réserver</Link>
          <button type="button" onClick={() => setOpen(true)} className="grid size-12 place-items-center lg:hidden" aria-label="Ouvrir le menu" aria-expanded={open}><Menu aria-hidden="true" /></button>
        </div>
      </header>
      <MobileMenu open={open} onClose={close} pathname={pathname} />
    </>
  );
}
