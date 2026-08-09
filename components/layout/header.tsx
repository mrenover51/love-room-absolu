"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight, ChevronDown, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MobileMenu } from "./mobile-menu";
import { LanguageSelector } from "@/components/i18n/language-selector";

const exploreColumns = [
  {
    title: "Découvrir",
    links: [
      {
        label: "Guide touristique",
        detail: "La Champagne à deux",
        href: "/guide-touristique",
      },
      {
        label: "Restaurants",
        detail: "Nos adresses choisies",
        href: "/restaurants",
      },
      {
        label: "Carte interactive",
        detail: "Explorer les alentours",
        href: "/carte-touristique",
      },
      {
        label: "Maisons de Champagne",
        detail: "L’Avenue de Champagne",
        href: "/guide-touristique/avenue-de-champagne",
      },
      { label: "Magazine", detail: "Histoires et art de vivre", href: "/blog" },
      {
        label: "Notre histoire",
        detail: "Les origines d’Absolu",
        href: "/notre-histoire",
      },
      {
        label: "L’art de recevoir",
        detail: "Notre manière de vous accueillir",
        href: "/l-art-de-recevoir",
      },
    ],
  },
  {
    title: "Expérience",
    links: [
      {
        label: "Équipements",
        detail: "Le confort en privé",
        href: "/equipements",
      },
      { label: "Vidéos", detail: "Découvrir l’atmosphère", href: "/videos" },
      {
        label: "Inspirations",
        detail: "Imaginer votre séjour",
        href: "/experiences-romantiques",
      },
      {
        label: "Avis clients",
        detail: "L’expérience des couples",
        href: "/avis",
      },
      { label: "FAQ", detail: "Préparer votre venue", href: "/faq" },
      {
        label: "Bons cadeaux",
        detail: "Offrir une parenthèse",
        href: "/bons-cadeaux",
      },
    ],
  },
] as const;

function NavLink({
  href,
  label,
  active,
  onNavigate,
}: {
  href: string;
  label: string;
  active: boolean;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={`group relative py-3 text-[.65rem] font-semibold uppercase tracking-[.2em] transition-colors duration-300 ${active ? "text-white" : "text-white/60 hover:text-white"}`}
    >
      <span>{label}</span>
      <span
        aria-hidden="true"
        className={`absolute inset-x-0 bottom-1 h-px origin-left bg-gradient-to-r from-[#A98245] to-[#E7D4AD] transition-transform duration-500 ease-out ${active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`}
      />
    </Link>
  );
}

export function Header() {
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 32);
    const closeOnOutside = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node))
        setMegaOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMegaOpen(false);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    document.addEventListener("pointerdown", closeOnOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("scroll", update);
      document.removeEventListener("pointerdown", closeOnOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return (
    <>
      <header
        ref={headerRef}
        onMouseLeave={() => setMegaOpen(false)}
        className={`luxury-header fixed inset-x-0 top-0 z-40 border-b bg-[#0B0908]/68 backdrop-blur-xl transition-[height,background-color,border-color,box-shadow] duration-500 ${scrolled || megaOpen ? "border-[#D0AE72]/15 bg-[#0B0908]/90 shadow-[0_18px_55px_rgba(24,13,9,.24)]" : "border-white/[.07]"}`}
      >
        <div
          className={`grid w-full grid-cols-[1fr_auto_1fr] items-center px-6 transition-[height] duration-500 ease-out sm:px-10 xl:px-12 2xl:px-14 ${scrolled ? "h-[74px]" : "h-24"}`}
        >
          <Link
            href="/"
            className="w-fit pr-12 font-heading text-xl tracking-[.34em] text-white transition-colors duration-300 hover:text-[#E7D4AD] lg:text-2xl"
            aria-label="Absolu, accueil"
          >
            ABSOLU
          </Link>

          <nav
            className="hidden items-center gap-10 xl:flex 2xl:gap-14"
            aria-label="Navigation principale"
          >
            <NavLink
              href="/la-suite"
              label="La Suite"
              active={pathname.startsWith("/la-suite")}
              onNavigate={() => setMegaOpen(false)}
            />
            <NavLink
              href="/galerie"
              label="Galerie"
              active={pathname.startsWith("/galerie")}
              onNavigate={() => setMegaOpen(false)}
            />
            <button
              type="button"
              onMouseEnter={() => setMegaOpen(true)}
              onFocus={() => setMegaOpen(true)}
              onClick={() => setMegaOpen(true)}
              className="group relative flex items-center gap-2 py-3 text-[.65rem] font-semibold uppercase tracking-[.2em] text-white/60 transition-colors duration-300 hover:text-white"
              aria-expanded={megaOpen}
              aria-controls="explore-menu"
            >
              Explorer{" "}
              <ChevronDown
                className={`size-3.5 transition-transform duration-500 ${megaOpen ? "rotate-180" : ""}`}
                aria-hidden="true"
              />
              <span
                aria-hidden="true"
                className={`absolute inset-x-0 bottom-1 h-px origin-left bg-gradient-to-r from-[#A98245] to-[#E7D4AD] transition-transform duration-500 ${megaOpen ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`}
              />
            </button>
            <NavLink
              href="/contact"
              label="Contact"
              active={pathname.startsWith("/contact")}
              onNavigate={() => setMegaOpen(false)}
            />
          </nav>

          <div className="ml-auto hidden items-center gap-8 pl-12 xl:flex">
            <Link
              href="/reservation"
              className="premium-action inline-flex min-h-11 items-center rounded-full border border-[#DEC38E] bg-[linear-gradient(135deg,#D7B778,#B88C50)] px-8 text-[.65rem] font-semibold uppercase tracking-[.2em] text-[#110D0A] shadow-[0_12px_32px_rgba(91,61,46,.24)] hover:brightness-105"
            >
              Réserver maintenant
            </Link>
            <LanguageSelector locale="fr" />
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="col-start-3 ml-auto grid size-12 place-items-center text-white transition-colors hover:text-[#D8BD87] xl:hidden"
            aria-label="Ouvrir le menu"
            aria-expanded={mobileOpen}
          >
            <Menu aria-hidden="true" />
          </button>
        </div>

        <div
          id="explore-menu"
          className={`material-glass absolute inset-x-8 top-full hidden origin-top overflow-hidden rounded-[1.75rem] border border-[#D0AE72]/18 transition-[opacity,transform,visibility] duration-300 ease-out xl:block ${megaOpen ? "visible translate-y-0 opacity-100" : "invisible -translate-y-3 opacity-0"}`}
          aria-hidden={!megaOpen}
        >
          <div className="mx-auto grid w-[min(calc(100%_-_6rem),70rem)] grid-cols-2 gap-16 py-12">
            {exploreColumns.map((column, columnIndex) => (
              <section
                key={`${column.title}-${columnIndex}`}
                className={
                  columnIndex === 0 ? "border-r border-white/10 pr-16" : ""
                }
              >
                <p className="eyebrow text-[#C9A86A]">{column.title}</p>
                <nav
                  className="mt-5 grid grid-cols-2 gap-x-8"
                  aria-label={column.title}
                >
                  {column.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMegaOpen(false)}
                      tabIndex={megaOpen ? 0 : -1}
                      className="group flex min-h-20 items-center justify-between gap-3 border-b border-white/[.08] py-3 transition-colors duration-300 hover:border-[#C9A86A]/50"
                    >
                      <span>
                        <strong className="block font-heading text-lg font-normal text-[#F6F2EC] transition-colors group-hover:text-[#E7D4AD]">
                          {link.label}
                        </strong>
                        <span className="mt-1 block text-[.6rem] uppercase tracking-[.12em] text-white/35">
                          {link.detail}
                        </span>
                      </span>
                      <ArrowUpRight
                        className="size-4 shrink-0 text-[#C9A86A] opacity-0 transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:opacity-100"
                        aria-hidden="true"
                      />
                    </Link>
                  ))}
                </nav>
              </section>
            ))}
          </div>
        </div>
      </header>
      <MobileMenu open={mobileOpen} onClose={closeMobile} pathname={pathname} />
    </>
  );
}
