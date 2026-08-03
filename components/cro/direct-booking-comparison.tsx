"use client";

import { useMemo, useState } from "react";
import { Check, Minus, ShieldCheck } from "lucide-react";

const rows = [
  [
    "Disponibilités synchronisées",
    "Oui",
    "Selon la plateforme",
    "Selon la plateforme",
  ],
  [
    "Échange direct avec Absolu",
    "Oui",
    "Via la messagerie",
    "Via la messagerie",
  ],
  [
    "Options de séjour Absolu",
    "Catalogue complet",
    "Peut varier",
    "Peut varier",
  ],
  ["Conditions et prix", "Affichés avant paiement", "À vérifier", "À vérifier"],
] as const;

export function DirectBookingComparison() {
  const [direct, setDirect] = useState("");
  const [platform, setPlatform] = useState("");
  const saving = useMemo(() => {
    const directValue = Number(direct.replace(",", "."));
    const platformValue = Number(platform.replace(",", "."));
    return directValue > 0 && platformValue > 0
      ? platformValue - directValue
      : null;
  }, [direct, platform]);
  const money = (value: number) =>
    value.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
  return (
    <section className="mt-20" aria-labelledby="direct-title">
      <p className="eyebrow text-[#C9A86A]">
        Comparer sans promesse artificielle
      </p>
      <h2 id="direct-title" className="mt-4 font-heading text-5xl">
        Pourquoi réserver en direct ?
      </h2>
      <div className="mt-8 overflow-x-auto rounded-3xl border border-white/10">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="bg-white/[.04]">
            <tr>
              <th className="p-5">Critère</th>
              <th className="p-5 text-[#C9A86A]">Absolu en direct</th>
              <th className="p-5">Booking</th>
              <th className="p-5">Airbnb</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {rows.map((row) => (
              <tr key={row[0]}>
                {row.map((cell, index) => (
                  <td
                    key={cell}
                    className={`p-5 ${index === 1 ? "text-white" : "text-white/50"}`}
                  >
                    {index === 1 ? (
                      <span className="flex items-center gap-2">
                        <Check className="size-4 text-[#C9A86A]" />
                        {cell}
                      </span>
                    ) : (
                      cell
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-8 grid gap-6 rounded-3xl border border-[#C9A86A]/25 bg-[#C9A86A]/[.05] p-6 lg:grid-cols-[1fr_.8fr] lg:p-8">
        <div>
          <div className="flex items-center gap-3">
            <ShieldCheck className="size-5 text-[#C9A86A]" />
            <h3 className="font-heading text-3xl">Calculateur d’économies</h3>
          </div>
          <p className="mt-3 max-w-xl text-sm leading-7 text-white/50">
            Comparez les montants finaux affichés pour les mêmes dates, le même
            nombre de voyageurs et les mêmes prestations. Nous ne supposons
            aucun tarif tiers.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs text-white/45">
            Prix direct (€)
            <input
              inputMode="decimal"
              value={direct}
              onChange={(event) => setDirect(event.target.value)}
              className="mt-2 min-h-12 w-full rounded-xl border border-white/15 bg-black px-4 text-white"
            />
          </label>
          <label className="text-xs text-white/45">
            Prix plateforme (€)
            <input
              inputMode="decimal"
              value={platform}
              onChange={(event) => setPlatform(event.target.value)}
              className="mt-2 min-h-12 w-full rounded-xl border border-white/15 bg-black px-4 text-white"
            />
          </label>
          <p
            className={`sm:col-span-2 flex items-center gap-2 rounded-xl p-4 text-sm ${saving !== null && saving > 0 ? "bg-emerald-400/10 text-emerald-200" : "bg-white/[.04] text-white/55"}`}
          >
            <Minus className="size-4" />
            {saving === null
              ? "Saisissez les deux prix finaux."
              : saving > 0
                ? `Économie constatée en direct : ${money(saving)}`
                : saving === 0
                  ? "Les deux montants sont identiques."
                  : `La plateforme est moins chère de ${money(Math.abs(saving))} pour cette comparaison.`}
          </p>
        </div>
      </div>
    </section>
  );
}
