"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Bot,
  CalendarDays,
  ChevronRight,
  Gift,
  Search,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  assistantScenarios,
  findAssistantAnswer,
} from "@/lib/assistant/knowledge";

type Message = {
  id: string;
  role: "assistant" | "user";
  content: string;
  href?: string;
  linkLabel?: string;
};
type Pricing = {
  extras?: { key: string; label: string; amount: number; enabled?: boolean }[];
};
const welcome: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Bonsoir, je suis l’assistant Absolu. Je peux vous aider à choisir un séjour, vérifier des dates, consulter les tarifs et retrouver une information fiable.",
};
const euros = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export function BookingAssistant() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false),
    [prompt, setPrompt] = useState(""),
    [checkIn, setCheckIn] = useState(""),
    [checkOut, setCheckOut] = useState("");
  const [messages, setMessages] = useState<Message[]>([welcome]);
  const [pricing, setPricing] = useState<Pricing | null>(null);
  const [checking, setChecking] = useState(false),
    [dates, setDates] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null),
    inputRef = useRef<HTMLInputElement>(null), sessionRef = useRef("");
  const reduced = useReducedMotion();
  useEffect(() => {
    const saved=localStorage.getItem("absolu-concierge-session");sessionRef.current=saved??crypto.randomUUID();if(!saved)localStorage.setItem("absolu-concierge-session",sessionRef.current);void fetch(`/api/assistant?session=${encodeURIComponent(sessionRef.current)}`).then(response=>response.ok?response.json():null).then((data:{messages?:{id:number;role:"assistant"|"user";content:string}[]} | null)=>{if(data?.messages?.length)setMessages(data.messages.map(item=>({id:String(item.id),role:item.role,content:item.content})));}).catch(()=>undefined);
    try {
      const stored = localStorage.getItem("absolu-assistant-history");
      if (stored) {
        const parsed = JSON.parse(stored) as Message[];
        if (Array.isArray(parsed) && parsed.length)
          queueMicrotask(() => setMessages(parsed.slice(-30)));
      }
    } catch {}
  }, []);
  useEffect(() => {
    if (messages.length > 1)
      localStorage.setItem(
        "absolu-assistant-history",
        JSON.stringify(messages.slice(-30)),
      );
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: reduced ? "auto" : "smooth",
    });
  }, [messages, reduced]);
  useEffect(() => {
    if (open) {
      void fetch("/api/pricing")
        .then((response) => (response.ok ? response.json() : null))
        .then(setPricing)
        .catch(() => null);
      setTimeout(() => inputRef.current?.focus(), 250);
    }
  }, [open]);
  const extras = useMemo(
    () =>
      pricing?.extras?.filter(
        (item) =>
          item.enabled !== false &&
          ["champagne", "romantic-decoration", "petals"].includes(item.key),
      ) ?? [],
    [pricing],
  );
  const add = (
    role: Message["role"],
    content: string,
    link?: { href?: string; label?: string },
  ) =>
    setMessages((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        role,
        content,
        href: link?.href,
        linkLabel: link?.label,
      },
    ]);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const value = prompt.trim();
    if (!value) return;
    add("user", value);
    setPrompt("");
    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query: value, sessionId: sessionRef.current || crypto.randomUUID(), context: { checkIn: checkIn || undefined, checkOut: checkOut || undefined } }),
      });
      const data = (await response.json()) as {
        answer?: string;
        href?: string;
        label?: string;
        suggestions?: string[];
      };
      add(
        "assistant",
        response.ok && data.answer ? `${data.answer}${data.suggestions?.length ? `\n\nVous pouvez aussi demander : ${data.suggestions.join(" · ")}` : ""}` : findAssistantAnswer(value),
        data,
      );
    } catch {
      add("assistant", findAssistantAnswer(value));
    }
  };
  const checkDates = async () => {
    if (!checkIn || !checkOut || checkOut <= checkIn) {
      add(
        "assistant",
        "Choisissez une date de départ postérieure à la date d’arrivée.",
      );
      setDates(false);
      return;
    }
    setChecking(true);
    try {
      const response = await fetch(
        `/api/availability?from=${encodeURIComponent(checkIn)}&to=${encodeURIComponent(checkOut)}`,
      );
      const data = (await response.json()) as {
        blockedDates?: unknown[];
        externalCalendarWarning?: boolean;
      };
      if (!response.ok) throw new Error();
      const available = !data.blockedDates?.length;
      add(
        "user",
        `Séjour du ${new Date(`${checkIn}T12:00:00`).toLocaleDateString("fr-FR")} au ${new Date(`${checkOut}T12:00:00`).toLocaleDateString("fr-FR")}`,
      );
      add(
        "assistant",
        available
          ? `Ces dates ne présentent pas de blocage dans le calendrier actuel.${data.externalCalendarWarning ? " Une source externe signale toutefois un problème de synchronisation : demandez confirmation." : " Vous pouvez poursuivre vers le récapitulatif de réservation."}`
          : "Une partie de cette période est indisponible. Essayez d’autres dates dans le calendrier de réservation.",
      );
    } catch {
      add(
        "assistant",
        "Le calendrier est temporairement indisponible. Consultez la page Réservation ou contactez Absolu.",
      );
    }
    setChecking(false);
    setDates(false);
  };
  if (pathname.startsWith("/admin")) return null;
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Ouvrir l’assistant de réservation"
        aria-expanded={open}
        className="fixed bottom-5 right-5 z-[60] grid size-16 place-items-center rounded-full border border-[#E5C98E]/35 bg-[#15110F] text-[#E5C98E] shadow-[0_18px_60px_rgba(0,0,0,.45)] transition hover:scale-105 sm:bottom-7 sm:right-7"
      >
        <span className="absolute inset-0 animate-ping rounded-full border border-[#C9A86A]/20" />
        <Bot className="relative size-6" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Assistant de réservation Absolu"
            initial={reduced ? false : { opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: reduced ? 0 : 0.32 }}
            className="fixed inset-x-3 bottom-3 z-[80] flex h-[min(760px,calc(100svh-1.5rem))] flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[#0C0B0A]/98 text-white shadow-2xl backdrop-blur-xl sm:inset-x-auto sm:bottom-7 sm:right-7 sm:w-[430px]"
          >
            <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-full bg-[#C9A86A]/15">
                  <Sparkles className="size-4 text-[#E5C98E]" />
                </span>
                <div>
                  <p className="font-heading text-xl">Assistant Absolu</p>
                  <p className="text-[10px] uppercase tracking-widest text-emerald-300/70">
                    Données du site en direct
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid size-11 place-items-center"
                aria-label="Fermer"
              >
                <X className="size-5" />
              </button>
            </header>
            {!dates ? (
              <>
                <div
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto px-4 py-5"
                >
                  <div className="space-y-4" aria-live="polite">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <p
                          className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === "user" ? "rounded-br-md bg-[#8B6B36]" : "rounded-bl-md border border-white/10 bg-white/[.05] text-white/70"}`}
                        >
                          {message.content}
                          {message.href && (
                            <Link
                              href={message.href}
                              onClick={() => setOpen(false)}
                              className="mt-3 block text-xs text-[#E5C98E] underline underline-offset-4"
                            >
                              {message.linkLabel ?? "En savoir plus"} →
                            </Link>
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                  {messages.length === 1 && (
                    <div className="mt-6">
                      <p className="text-[10px] uppercase tracking-widest text-white/35">
                        Quel séjour recherchez-vous ?
                      </p>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {assistantScenarios.map((scenario) => (
                          <button
                            key={scenario.id}
                            type="button"
                            onClick={() => {
                              add("user", scenario.label);
                              add("assistant", scenario.answer);
                            }}
                            className="rounded-xl border border-white/10 p-3 text-left text-xs hover:border-[#C9A86A]/50"
                          >
                            {scenario.label}
                            <ChevronRight className="mt-2 size-3 text-[#C9A86A]" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="mt-6 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDates(true)}
                      className="flex items-center gap-2 rounded-xl bg-[#C9A86A] px-4 py-3 text-xs font-semibold text-black"
                    >
                      <CalendarDays className="size-4" />
                      Vérifier des dates
                    </button>
                    <Link
                      href="/bons-cadeaux"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-xs"
                    >
                      <Gift className="size-4 text-[#C9A86A]" />
                      Bon cadeau
                    </Link>
                  </div>
                  {extras.length > 0 && (
                    <div className="mt-6">
                      <p className="text-[10px] uppercase tracking-widest text-white/35">
                        Options actuelles
                      </p>
                      <div className="mt-3 space-y-2">
                        {extras.map((extra) => (
                          <div
                            key={extra.key}
                            className="flex justify-between rounded-xl bg-white/[.035] px-4 py-3 text-xs"
                          >
                            <span>{extra.label}</span>
                            <span className="text-[#E5C98E]">
                              {euros.format(extra.amount / 100)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <form
                  onSubmit={submit}
                  className="border-t border-white/10 p-3"
                >
                  <label className="relative block">
                    <span className="sr-only">Votre question</span>
                    <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/30" />
                    <input
                      ref={inputRef}
                      value={prompt}
                      onChange={(event) => setPrompt(event.target.value)}
                      maxLength={300}
                      placeholder="Posez votre question…"
                      className="min-h-13 w-full rounded-full border border-white/10 bg-white/[.05] pl-11 pr-14 text-sm outline-none focus:border-[#C9A86A]/60"
                    />
                    <button
                      className="absolute right-1 top-1 grid size-11 place-items-center rounded-full bg-[#C9A86A] text-black"
                      aria-label="Envoyer"
                    >
                      <Send className="size-4" />
                    </button>
                  </label>
                  <p className="mt-2 px-3 text-[9px] text-white/25">
                    Ne partagez aucune donnée bancaire ou sensible.
                  </p>
                </form>
              </>
            ) : (
              <div className="flex-1 p-6">
                <button
                  onClick={() => setDates(false)}
                  className="text-xs text-white/45"
                >
                  ← Retour
                </button>
                <p className="eyebrow mt-8 text-[#C9A86A]">
                  Calendrier connecté
                </p>
                <h2 className="mt-3 font-heading text-4xl">Vos dates</h2>
                <div className="mt-8 grid gap-4">
                  {[
                    ["Arrivée", checkIn, setCheckIn],
                    ["Départ", checkOut, setCheckOut],
                  ].map(([label, value, setter]) => (
                    <label
                      key={label as string}
                      className="text-xs text-white/45"
                    >
                      {label as string}
                      <input
                        type="date"
                        value={value as string}
                        min={
                          label === "Départ"
                            ? checkIn
                            : new Date().toISOString().slice(0, 10)
                        }
                        onChange={(event) =>
                          (setter as (value: string) => void)(
                            event.target.value,
                          )
                        }
                        className="mt-2 min-h-12 w-full rounded-xl border border-white/10 bg-white/[.05] px-4"
                      />
                    </label>
                  ))}
                  <button
                    disabled={checking}
                    onClick={checkDates}
                    className="mt-3 min-h-13 rounded-xl bg-[#C9A86A] text-sm font-semibold text-black disabled:opacity-50"
                  >
                    {checking
                      ? "Vérification…"
                      : "Consulter les disponibilités"}
                  </button>
                  <Link
                    href="/reservation"
                    onClick={() => setOpen(false)}
                    className="text-center text-xs text-[#E5C98E]"
                  >
                    Ouvrir le calendrier complet
                  </Link>
                </div>
              </div>
            )}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
