"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/lib/site-config";

export type BreadcrumbItem = { label: string; href: string };

const labels: Record<string, string> = {
  blog: "Magazine", auteur: "Auteur", categorie: "Catégorie", tag: "Thème",
  "guide-touristique": "Guide", restaurants: "Restaurants", equipements: "Équipements",
  ressources: "Ressources", "love-room": "Love Room", reservation: "Réservation",
  "bons-cadeaux": "Bons cadeaux", faq: "FAQ", galerie: "Galerie", contact: "Contact",
  "notre-histoire": "Notre histoire",
  "l-art-de-recevoir": "L’art de recevoir",
};

const humanize = (segment: string) => labels[segment] ?? decodeURIComponent(segment).replaceAll("-", " ").replace(/^./, letter => letter.toUpperCase());

function breadcrumbSchema(elements: { name: string; item?: string }[]) {
  return { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: elements.map((element, index) => ({ "@type": "ListItem", position: index + 1, name: element.name, ...(element.item ? { item: element.item } : {}) })) };
}

export function Breadcrumb({ current, items = [] }: { current: string; items?: BreadcrumbItem[] }) {
  return <nav aria-label="Fil d’Ariane" className="text-[.65rem] uppercase tracking-[.18em] text-white/55"><ol className="flex flex-wrap items-center gap-3"><li><Link href="/" className="transition-colors hover:text-white">Accueil</Link></li>{items.map(item => <li key={item.href} className="contents"><span aria-hidden="true">/</span><Link href={item.href} className="transition-colors hover:text-white">{item.label}</Link></li>)}<li aria-hidden="true">/</li><li aria-current="page" className="text-[#D8C8B6]">{current}</li></ol></nav>;
}

/** Adds a BreadcrumbList to every indexable public route, including pages without a visible trail. */
export function AutomaticBreadcrumb() {
  const pathname = usePathname();
  if (pathname === "/" || pathname.startsWith("/admin") || pathname.startsWith("/api") || pathname === "/maintenance" || pathname === "/offline") return null;
  const segments = pathname.split("/").filter(Boolean);
  const embeddedBreadcrumb = pathname === "/galerie" || pathname === "/notre-histoire" || pathname === "/l-art-de-recevoir" || (["avis", "bons-cadeaux", "evenements", "equipements", "experiences-romantiques", "love-room", "restaurants", "partenaires", "reponses"].includes(segments[0]) && segments.length === 2) || (segments[0] === "guide-touristique" && segments.length === 2) || (segments[0] === "blog" && segments.length === 2 && !["auteur", "categorie", "tag", "recherche"].includes(segments[1]));
  if (embeddedBreadcrumb) return null;
  const elements = [{ name: "Accueil", item: siteConfig.url }, ...segments.map((segment, index) => { const href = `/${segments.slice(0, index + 1).join("/")}`; return { name: humanize(segment), ...(index < segments.length - 1 ? { item: `${siteConfig.url}${href}` } : {}) }; })];
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(elements)).replaceAll("<", "\\u003c") }} />;
}
