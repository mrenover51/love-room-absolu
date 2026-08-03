"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, Search, Sparkles } from "lucide-react";
import type { FaqCategory, PremiumFaqItem } from "@/lib/faq/faq-data";

type View = "Toutes" | "Populaires" | "Récentes";
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fr");

export function PremiumFaqCenter({ items, categories }: { items: PremiumFaqItem[]; categories: readonly FaqCategory[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<FaqCategory | "Toutes">("Toutes");
  const [view, setView] = useState<View>("Toutes");
  const [open, setOpen] = useState<string | null>(items[0]?.id ?? null);
  const [limit, setLimit] = useState(12);
  const filtered = useMemo(() => {
    const term = normalize(query.trim());
    return items.filter((item) => (category === "Toutes" || item.category === category) && (view === "Toutes" || (view === "Populaires" ? item.popular : item.recent)) && (!term || normalize(`${item.question} ${item.answer} ${item.category}`).includes(term)));
  }, [category, items, query, view]);
  const updateCategory = (value: FaqCategory | "Toutes") => { setCategory(value); setLimit(12); setOpen(null); };

  return <div>
    <div className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-sm sm:p-8">
      <label htmlFor="faq-search" className="font-heading text-3xl">Quelle est votre question ?</label>
      <div className="relative mt-5"><Search aria-hidden className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-black/40"/><input id="faq-search" type="search" value={query} onChange={(event) => { setQuery(event.target.value); setLimit(12); }} placeholder="Rechercher : parking, sauna, horaires…" className="min-h-14 w-full rounded-full border border-black/15 bg-[#F6F2EC] pl-12 pr-5 outline-none transition focus:border-[#8B6B36]" /></div>
      <div className="mt-6 flex flex-wrap gap-2" aria-label="Filtres éditoriaux">{(["Toutes", "Populaires", "Récentes"] as View[]).map((option) => <button type="button" key={option} onClick={() => { setView(option); setLimit(12); }} aria-pressed={view === option} className={`rounded-full px-4 py-2 text-xs transition ${view === option ? "bg-[#201B18] text-white" : "border border-black/15 hover:border-black/35"}`}>{option === "Toutes" ? "Toutes les questions" : `Questions ${option.toLowerCase()}`}</button>)}</div>
    </div>
    <nav aria-label="Catégories de questions" className="mt-8 flex gap-2 overflow-x-auto pb-3">{(["Toutes", ...categories] as const).map((option) => <button type="button" key={option} onClick={() => updateCategory(option)} aria-pressed={category === option} className={`shrink-0 rounded-full px-4 py-2 text-sm transition ${category === option ? "bg-[#8B6B36] text-white" : "border border-black/15 bg-white hover:border-[#8B6B36]"}`}>{option}</button>)}</nav>
    <div className="mt-8 flex items-end justify-between gap-4"><div><p className="eyebrow text-[#8B6B36]">Centre d’aide Absolu</p><h2 className="mt-3 font-heading text-4xl">{category === "Toutes" ? "Toutes les réponses" : category}</h2></div><p aria-live="polite" className="text-sm text-black/45">{filtered.length} résultat{filtered.length > 1 ? "s" : ""}</p></div>
    <div className="mt-8 space-y-3">{filtered.slice(0, limit).map((item) => {
      const isOpen = open === item.id;
      const similar = items.filter((candidate) => candidate.category === item.category && candidate.id !== item.id).slice(0, 2);
      return <article key={item.id} id={item.id} className="scroll-mt-28 overflow-hidden rounded-2xl border border-black/10 bg-white">
        <h3><button type="button" onClick={() => setOpen(isOpen ? null : item.id)} aria-expanded={isOpen} aria-controls={`${item.id}-answer`} className="flex w-full items-center justify-between gap-5 px-5 py-5 text-left font-heading text-xl sm:px-7 sm:text-2xl"><span><span className="mb-2 block font-sans text-[.65rem] uppercase tracking-[.15em] text-[#8B6B36]">{item.category}{item.popular ? " · Populaire" : item.recent ? " · Récent" : ""}</span>{item.question}</span><ChevronDown className={`size-5 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} /></button></h3>
        <div id={`${item.id}-answer`} className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}><div className="overflow-hidden"><div className="border-t border-black/10 px-5 pb-7 pt-6 sm:px-7"><div className="space-y-5 leading-8 text-black/60">{item.answer.split("\n\n").map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div><div className="mt-7 flex flex-wrap gap-3">{item.related.map((link) => <Link key={link.href} href={link.href} className="rounded-full border border-[#8B6B36]/30 px-4 py-2 text-xs text-[#6F522A] hover:bg-[#8B6B36] hover:text-white">{link.label}</Link>)}</div><aside className="mt-7 border-l-2 border-[#C9A86A] pl-4"><p className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#8B6B36]"><Sparkles className="size-3"/>Questions similaires</p><div className="mt-3 flex flex-col gap-2 text-sm">{similar.map((question) => <button type="button" key={question.id} onClick={() => setOpen(question.id)} className="text-left text-black/55 underline-offset-4 hover:underline">{question.question}</button>)}</div></aside></div></div></div>
      </article>;
    })}</div>
    {filtered.length > limit && <div className="mt-10 text-center"><button type="button" onClick={() => setLimit((current) => current + 12)} className="rounded-full bg-[#201B18] px-7 py-3 text-sm text-white hover:bg-[#8B6B36]">Afficher 12 réponses supplémentaires</button></div>}
    {!filtered.length && <div className="mt-8 rounded-2xl border border-dashed border-black/20 p-10 text-center"><p className="font-heading text-3xl">Aucune réponse exacte</p><p className="mt-3 text-black/50">Essayez un terme plus court ou consultez une autre catégorie.</p><Link href="/contact" className="mt-5 inline-block text-[#8B6B36] underline">Poser votre question à Absolu</Link></div>}
  </div>;
}
