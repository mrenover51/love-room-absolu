"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  BadgeEuro,
  CalendarRange,
  ChartNoAxesCombined,
  CircleGauge,
  Lightbulb,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import type { AdminInsights } from "@/lib/ai/admin-insights";

const euro = (value: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value / 100);

export function AssistantInsights({ insights }: { insights: AdminInsights }) {
  const reduced = useReducedMotion();
  const cards = [
    ["Occupation à 90 jours", `${insights.occupancy} %`, CircleGauge],
    ["Prévision mensuelle", euro(insights.forecastRevenue), TrendingUp],
    ["Revenus encaissés", euro(insights.revenue), BadgeEuro],
    ["Panier moyen", euro(insights.averageBasket), ChartNoAxesCombined],
  ] as const;
  return (
    <div className="space-y-5">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value, Icon], index) => (
          <motion.article
            key={label}
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduced ? 0 : index * 0.06 }}
            className="relative overflow-hidden rounded-[1.5rem] border border-white/[.08] bg-[#121212] p-5"
          >
            <div className="absolute -right-8 -top-8 size-24 rounded-full bg-[#8E48FF]/10 blur-2xl" />
            <Icon className="size-4 text-[#C9A86A]" />
            <p className="mt-5 text-xs text-white/40">{label}</p>
            <p className="mt-1 font-heading text-3xl text-[#F6F2EC]">{value}</p>
          </motion.article>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.25fr_.75fr]">
        <article className="rounded-[1.5rem] border border-white/[.08] bg-[#121212] p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <CalendarRange className="size-5 text-[#C9A86A]" />
            <div>
              <p className="text-[10px] uppercase tracking-[.2em] text-[#C9A86A]">
                Prévision
              </p>
              <h2 className="font-heading text-2xl">
                Occupation des six prochains mois
              </h2>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-6 gap-2 sm:gap-4">
            {insights.monthly.map((month) => (
              <div
                key={month.label}
                className="flex min-w-0 flex-col items-center"
              >
                <div className="flex h-44 w-full items-end rounded-xl bg-white/[.025] p-1.5">
                  <motion.div
                    initial={reduced ? false : { height: 0 }}
                    animate={{ height: `${Math.max(4, month.occupancy)}%` }}
                    transition={{
                      duration: reduced ? 0 : 0.8,
                      ease: "easeOut",
                    }}
                    className="w-full rounded-lg bg-gradient-to-t from-[#8E48FF] to-[#D4B7FF]"
                  />
                </div>
                <strong className="mt-2 text-xs">{month.occupancy} %</strong>
                <span className="mt-1 truncate text-[9px] capitalize text-white/35">
                  {month.label}
                </span>
              </div>
            ))}
          </div>
        </article>
        <article className="rounded-[1.5rem] border border-[#C9A86A]/20 bg-[radial-gradient(circle_at_top_right,rgba(201,168,106,.12),transparent_45%),#121212] p-5 sm:p-6">
          <Sparkles className="size-5 text-[#E5C98E]" />
          <p className="mt-5 text-[10px] uppercase tracking-[.2em] text-[#C9A86A]">
            Suggestion tarifaire
          </p>
          <h2 className="mt-2 font-heading text-3xl">Décision assistée</h2>
          <p className="mt-5 text-sm leading-7 text-white/60">
            {insights.pricingSuggestion}
          </p>
          <p className="mt-6 border-l border-[#C9A86A]/50 pl-4 text-[10px] leading-5 text-white/35">
            Recommandation uniquement. Aucun tarif n’est modifié
            automatiquement.
          </p>
        </article>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <article className="rounded-[1.5rem] border border-white/[.08] bg-[#121212] p-5 sm:p-6">
          <h2 className="flex items-center gap-2 font-heading text-2xl">
            <Lightbulb className="size-5 text-[#C9A86A]" />
            Recommandations
          </h2>
          <div className="mt-5 space-y-3">
            {insights.recommendations.map((item, index) => (
              <div
                key={item}
                className="flex gap-3 rounded-xl border border-white/[.06] bg-white/[.025] p-4 text-sm leading-6 text-white/60"
              >
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#C9A86A]/10 text-[10px] text-[#E5C98E]">
                  {index + 1}
                </span>
                {item}
              </div>
            ))}
          </div>
        </article>
        <article className="rounded-[1.5rem] border border-white/[.08] bg-[#121212] p-5 sm:p-6">
          <h2 className="font-heading text-2xl">Analyse des réservations</h2>
          <dl className="mt-5 grid grid-cols-2 gap-3">
            <Metric label="Réservations" value={String(insights.bookings)} />
            <Metric label="Nuits confirmées" value={String(insights.nights)} />
            <Metric label="Part directe" value={`${insights.directShare} %`} />
            <Metric
              label="Annulations"
              value={`${insights.cancellationRate} %`}
            />
          </dl>
          <div className="mt-5 rounded-xl border border-white/[.06] p-4 text-sm text-white/55">
            <strong className="text-white">Périodes creuses :</strong>{" "}
            {insights.lowPeriods.length
              ? insights.lowPeriods.join(", ")
              : "aucune période critique détectée"}
            .
          </div>
        </article>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/[.025] p-4">
      <dt className="text-[10px] text-white/35">{label}</dt>
      <dd className="mt-1 font-heading text-2xl text-[#E5C98E]">{value}</dd>
    </div>
  );
}
