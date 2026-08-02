"use client";

import { useMemo, useState } from "react";
import { Bot, Clock3, Send, Sparkles, UserRound } from "lucide-react";

type Context = { revenue: number; bookings: number; nights: number; bestCustomer: string; occupancy: number };
type Message = { id: string; role: "assistant" | "user"; content: string };
const suggestions = ["Quel est mon chiffre d’affaires ?", "Quel week-end est libre ?", "Quel est mon meilleur client ?", "Prévois mon CA.", "Analyse mes réservations.", "Analyse mon taux d’occupation.", "Propose des promotions."];
const euro = (cents: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(cents / 100);

export function AssistantConversation({ context }: { context: Context }) {
  const intro = useMemo<Message>(() => ({ id: "welcome", role: "assistant", content: "Bonjour. Je suis Absolu Assistant. Je peux déjà synthétiser vos indicateurs locaux ; l’analyse générative sera activée dès que votre fournisseur OpenAI sera connecté." }), []);
  const [messages, setMessages] = useState<Message[]>([intro]);
  const [prompt, setPrompt] = useState("");
  function answer(value: string) {
    const normalized = value.toLocaleLowerCase("fr-FR");
    if (normalized.includes("chiffre") || normalized.includes("ca")) return `Le chiffre d’affaires encaissé cette année est de ${euro(context.revenue)}, pour ${context.bookings} réservations.`;
    if (normalized.includes("occupation")) return `Le taux d’occupation estimé est de ${context.occupancy} %, soit ${context.nights} nuits réservées.`;
    if (normalized.includes("meilleur client")) return `${context.bestCustomer}. Ouvrez la fiche CRM pour consulter son historique détaillé.`;
    if (normalized.includes("promotion")) return "Suggestion : une offre de −10 % du dimanche au jeudi sur les périodes à faible demande, limitée à 7 jours pour préserver le positionnement premium.";
    if (normalized.includes("prévoi") || normalized.includes("prevoi")) return `Projection simple à rythme constant : ${euro(context.revenue * 1.08)}. Connectez OpenAI pour une prévision saisonnière enrichie.`;
    if (normalized.includes("libre") || normalized.includes("week-end")) return "La disponibilité exacte reste visible dans le calendrier, qui fait foi en temps réel.";
    return "J’ai enregistré votre demande. Cette analyse avancée sera disponible avec l’intégration OpenAI ; aucune donnée client n’est transmise actuellement.";
  }
  function submit(value: string) { const clean = value.trim(); if (!clean) return; setMessages((current) => [...current, { id: crypto.randomUUID(), role: "user", content: clean }, { id: crypto.randomUUID(), role: "assistant", content: answer(clean) }]); setPrompt(""); }
  return <div className="grid gap-5 xl:grid-cols-[1fr_280px]">
    <section className="flex min-h-[620px] flex-col overflow-hidden rounded-[2rem] border border-[#8E48FF]/20 bg-[radial-gradient(circle_at_top_right,rgba(142,72,255,.12),transparent_34%),#101010]">
      <div className="flex items-center gap-3 border-b border-white/[.07] p-5"><span className="grid size-10 place-items-center rounded-xl bg-[#8E48FF]/15"><Bot className="size-5 text-[#B791FF]" /></span><div><h2 className="text-sm font-medium">Absolu Intelligence</h2><p className="text-[10px] text-emerald-300">Interface locale · Données protégées</p></div></div>
      <div className="flex-1 space-y-5 overflow-y-auto p-5 sm:p-7" aria-live="polite">{messages.map((message) => <article key={message.id} className={`flex max-w-2xl gap-3 ${message.role === "user" ? "ml-auto flex-row-reverse" : ""}`}><span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white/[.06]">{message.role === "assistant" ? <Sparkles className="size-3.5 text-[#C9A86A]" /> : <UserRound className="size-3.5" />}</span><p className={`rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === "user" ? "bg-[#8E48FF] text-white" : "border border-white/[.07] bg-white/[.035] text-white/70"}`}>{message.content}</p></article>)}</div>
      <form onSubmit={(event) => { event.preventDefault(); submit(prompt); }} className="m-4 flex gap-2 rounded-2xl border border-white/10 bg-black/50 p-2"><label htmlFor="ai-prompt" className="sr-only">Votre demande</label><input id="ai-prompt" value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Posez une question sur votre activité…" className="min-h-12 flex-1 bg-transparent px-3 text-sm outline-none" /><button type="submit" aria-label="Envoyer" className="grid size-12 place-items-center rounded-xl bg-[#C9A86A] text-black transition hover:bg-[#E5C98E]"><Send className="size-4" /></button></form>
    </section>
    <aside className="rounded-[1.5rem] border border-white/[.08] bg-[#121212] p-5"><h2 className="flex items-center gap-2 text-sm"><Clock3 className="size-4 text-[#C9A86A]" />Suggestions</h2><div className="mt-4 space-y-2">{suggestions.map((item) => <button key={item} type="button" onClick={() => submit(item)} className="w-full rounded-xl border border-white/[.06] bg-white/[.025] p-3 text-left text-xs leading-5 text-white/55 transition hover:border-[#C9A86A]/30 hover:text-white">{item}</button>)}</div><p className="mt-6 text-[10px] leading-5 text-white/30">L’historique reste disponible pendant cette session. Le service est architecturé pour recevoir un fournisseur OpenAI ultérieurement.</p></aside>
  </div>;
}
