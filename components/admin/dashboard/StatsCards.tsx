"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Banknote, CalendarCheck, ChartNoAxesCombined, CheckCircle2, CircleDollarSign, Clock, Euro, Moon, Percent, ReceiptText, WalletCards, XCircle } from "lucide-react";
import type { DashboardStats } from "@/lib/dashboard/dashboard-data";
import { euro } from "./dashboard-ui";

const config = [
  ["todayRevenue", "CA aujourd’hui", Euro, "money"], ["weekRevenue", "CA semaine", ChartNoAxesCombined, "money"], ["monthRevenue", "CA mois", Banknote, "money"], ["yearRevenue", "CA année", CircleDollarSign, "money"],
  ["reservations", "Réservations", CalendarCheck, "number"], ["confirmedReservations", "Confirmées", CheckCircle2, "number"], ["cancelledReservations", "Annulées", XCircle, "number"], ["occupancy", "Occupation", Percent, "percent"],
  ["averageBasket", "Panier moyen", ReceiptText, "money"], ["averageStay", "Durée moyenne", Moon, "nights"], ["pendingPayments", "Paiements en attente", WalletCards, "number"], ["pendingRequests", "Demandes en attente", Clock, "number"],
] as const;

function Count({ value, mode }: { value: number; mode: "money" | "number" | "percent" | "nights" }) {
  const [shown, setShown] = useState(0);
  useEffect(() => { let frame = 0; const start = performance.now(); const tick = (time: number) => { const progress = Math.min(1, (time - start) / 800); setShown(Math.round(value * (1 - Math.pow(1 - progress, 3)) * 10) / 10); if (progress < 1) frame = requestAnimationFrame(tick); }; frame = requestAnimationFrame(tick); return () => cancelAnimationFrame(frame); }, [value]);
  return <>{mode === "money" ? euro(shown) : mode === "percent" ? `${shown} %` : mode === "nights" ? `${shown} nuit${shown > 1 ? "s" : ""}` : shown.toLocaleString("fr-FR")}</>;
}

export function StatsCards({ stats }: { stats: DashboardStats }) {
  const comparison = stats.previousMonthRevenue ? Math.round((stats.monthRevenue - stats.previousMonthRevenue) / stats.previousMonthRevenue * 100) : 0;
  return <><section className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-12">{config.map(([key, label, Icon, mode], index) => <motion.article key={key} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .04, duration: .45 }} whileHover={{ y: -3 }} className={`group rounded-2xl border border-white/[.07] bg-[#121212] p-4 shadow-lg transition-colors hover:border-[#C8A66A]/30 ${index < 4 ? "col-span-2 sm:col-span-1 xl:col-span-3" : "col-span-1"}`}><div className="flex items-center justify-between"><Icon className="size-4 text-[#C8A66A]" /><span className="size-1.5 rounded-full bg-white/15 transition-colors group-hover:bg-[#C8A66A]" /></div><p className="mt-5 truncate text-[10px] uppercase tracking-[.14em] text-[#B8B2A8]">{label}</p><p className="mt-1 text-xl font-semibold tracking-tight text-[#F6F2EC] sm:text-2xl"><Count value={stats[key]} mode={mode} /></p></motion.article>)}</section><div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#C8A66A]/20 bg-[#C8A66A]/[.06] px-4 py-3 text-xs"><span className="text-white/60">Évolution du CA par rapport au mois précédent</span><strong className={comparison >= 0 ? "text-emerald-300" : "text-rose-300"}>{comparison >= 0 ? "+" : ""}{comparison} %</strong></div></>;
}
