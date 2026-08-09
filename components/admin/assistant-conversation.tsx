"use client";

import { useMemo, useState } from "react";
import {
  Bot,
  Clock3,
  LoaderCircle,
  Send,
  Sparkles,
  UserRound,
} from "lucide-react";
import type { AdminInsights } from "@/lib/ai/admin-insights";

type Message = { id: string; role: "assistant" | "user"; content: string };
const suggestions = [
  "Quel est mon chiffre d’affaires ?",
  "Analyse mon taux d’occupation.",
  "Prévois mon CA du mois prochain.",
  "Quelles sont les périodes creuses ?",
  "Suggère une stratégie tarifaire.",
  "Analyse les annulations.",
  "Donne-moi tes recommandations.",
];
const euro = (cents: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(
    cents / 100,
  );

export function AssistantConversation({ context }: { context: AdminInsights }) {
  const intro = useMemo<Message>(
    () => ({
      id: "welcome",
      role: "assistant",
      content:
        "Bonjour. Je suis Absolu Intelligence. Je peux synthétiser l’occupation, les revenus, les prévisions, les périodes creuses et les opportunités tarifaires à partir de vos données actuelles.",
    }),
    [],
  );
  const [messages, setMessages] = useState<Message[]>([intro]);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  function answer(value: string) {
    const normalized = value.toLocaleLowerCase("fr-FR");
    if (normalized.includes("chiffre") || normalized.includes("ca"))
      return `Le chiffre d’affaires encaissé sur les données analysées est de ${euro(context.revenue)}, pour ${context.bookings} réservations.`;
    if (normalized.includes("occupation"))
      return `L’occupation prévue à 90 jours est de ${context.occupancy} %. ${context.nights} nuits confirmées figurent dans l’historique analysé.`;
    if (normalized.includes("panier"))
      return `Le panier moyen encaissé est de ${euro(context.averageBasket)}.`;
    if (normalized.includes("annulation"))
      return `Le taux d’annulation observé est de ${context.cancellationRate} %.`;
    if (normalized.includes("direct"))
      return `La réservation directe représente ${context.directShare} % des réservations analysées.`;
    if (normalized.includes("promotion") || normalized.includes("tarif"))
      return context.pricingSuggestion;
    if (normalized.includes("prévoi") || normalized.includes("prevoi"))
      return `Prévision mensuelle fondée sur les trois derniers mois complets : ${euro(context.forecastRevenue)}.`;
    if (normalized.includes("creuse"))
      return context.lowPeriods.length
        ? `Périodes actuellement les plus creuses : ${context.lowPeriods.join(", ")}.`
        : "Aucune période très creuse n’est détectée sur les six prochains mois.";
    if (normalized.includes("recommand"))
      return context.recommendations.join(" ");
    if (normalized.includes("libre") || normalized.includes("week-end"))
      return "La disponibilité exacte reste visible dans le calendrier administrateur, qui demeure la source de vérité.";
    return "Je peux analyser les revenus, l’occupation, la prévision mensuelle, les périodes creuses, les annulations, la part directe et les suggestions tarifaires.";
  }
  async function submit(value: string) {
    const clean = value.trim();
    if (!clean || loading) return;
    setMessages((current) => [
      ...current,
      { id: crypto.randomUUID(), role: "user", content: clean },
    ]);
    setPrompt("");
    setLoading(true);
    let content = answer(clean);
    try {
      const response = await fetch("/api/admin/assistant", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query: clean }),
      });
      const data = (await response.json()) as { answer?: string };
      if (response.ok && data.answer) content = data.answer;
    } catch {}
    setMessages((current) => [
      ...current,
      { id: crypto.randomUUID(), role: "assistant", content },
    ]);
    setLoading(false);
  }
  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_280px]">
      <section className="flex min-h-[620px] flex-col overflow-hidden rounded-[2rem] border border-[#8E48FF]/20 bg-[radial-gradient(circle_at_top_right,rgba(142,72,255,.12),transparent_34%),#101010]">
        <div className="flex items-center gap-3 border-b border-white/[.07] p-5">
          <span className="grid size-10 place-items-center rounded-xl bg-[#8E48FF]/15">
            <Bot className="size-5 text-[#B791FF]" />
          </span>
          <div>
            <h2 className="text-sm font-medium">Absolu Intelligence</h2>
            <p className="text-[10px] text-emerald-300">
              Analyse locale · Données protégées
            </p>
          </div>
        </div>
        <div
          className="flex-1 space-y-5 overflow-y-auto p-5 sm:p-7"
          aria-live="polite"
        >
          {messages.map((message) => (
            <article
              key={message.id}
              className={`flex max-w-2xl gap-3 ${message.role === "user" ? "ml-auto flex-row-reverse" : ""}`}
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white/[.06]">
                {message.role === "assistant" ? (
                  <Sparkles className="size-3.5 text-[#C9A86A]" />
                ) : (
                  <UserRound className="size-3.5" />
                )}
              </span>
              <p
                className={`rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === "user" ? "bg-[#8E48FF] text-white" : "border border-white/[.07] bg-white/[.035] text-white/70"}`}
              >
                {message.content}
              </p>
            </article>
          ))}
          {loading && (
            <p className="flex items-center gap-2 text-xs text-white/35">
              <LoaderCircle className="size-3.5 animate-spin" /> Analyse en
              cours…
            </p>
          )}
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void submit(prompt);
          }}
          className="m-4 flex gap-2 rounded-2xl border border-white/10 bg-black/50 p-2"
        >
          <label htmlFor="ai-prompt" className="sr-only">
            Votre demande
          </label>
          <input
            id="ai-prompt"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            maxLength={300}
            placeholder="Posez une question sur votre activité…"
            className="min-h-12 flex-1 bg-transparent px-3 text-sm outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            aria-label="Envoyer"
            className="grid size-12 place-items-center rounded-xl bg-[#C9A86A] text-black transition hover:bg-[#E5C98E] disabled:opacity-50"
          >
            <Send className="size-4" />
          </button>
        </form>
      </section>
      <aside className="rounded-[1.5rem] border border-white/[.08] bg-[#121212] p-5">
        <h2 className="flex items-center gap-2 text-sm">
          <Clock3 className="size-4 text-[#C9A86A]" />
          Suggestions
        </h2>
        <div className="mt-4 space-y-2">
          {suggestions.map((item) => (
            <button
              key={item}
              type="button"
              disabled={loading}
              onClick={() => void submit(item)}
              className="w-full rounded-xl border border-white/[.06] bg-white/[.025] p-3 text-left text-xs leading-5 text-white/55 transition hover:border-[#C9A86A]/30 hover:text-white disabled:opacity-50"
            >
              {item}
            </button>
          ))}
        </div>
        <p className="mt-6 text-[10px] leading-5 text-white/30">
          Analyse indicative fondée sur les données présentes. Aucune
          recommandation n’est appliquée automatiquement.
        </p>
      </aside>
    </div>
  );
}
