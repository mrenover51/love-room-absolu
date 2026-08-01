"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import Link from "next/link";
import { navigation } from "@/lib/constants";

export function MobileMenu({ open, onClose, pathname }: { open: boolean; onClose: () => void; pathname:string }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); if(event.key === "Tab"){const items=dialogRef.current?.querySelectorAll<HTMLElement>('a[href],button:not([disabled])');if(!items?.length)return;const first=items[0],last=items[items.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}} };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; previous?.focus(); };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div ref={dialogRef} className="fixed inset-0 z-50 bg-[#080808]/98 px-6 py-5 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation mobile">
      <div className="flex items-center justify-between">
        <Link href="/" onClick={onClose} className="font-heading text-2xl tracking-[.22em]">ABSOLU</Link>
        <button type="button" onClick={onClose} className="grid size-12 place-items-center" aria-label="Fermer le menu"><X aria-hidden="true" /></button>
      </div>
      <nav className="mt-20 flex flex-col" aria-label="Navigation mobile">
        {navigation.map((item, index) => {const active=item.href==="/"?pathname==="/":pathname.startsWith(item.href);return <Link key={item.href} href={item.href} onClick={onClose} autoFocus={index === 0} aria-current={active?"page":undefined} className={`border-b border-white/10 py-5 font-heading text-3xl ${active?"text-[#C9A86A]":"text-[#F6F2EC]"}`}>{item.label}</Link>})}
      </nav>
      <p className="absolute bottom-8 text-xs uppercase tracking-[.2em] text-white/40">Une parenthèse à deux</p>
    </div>
  );
}
