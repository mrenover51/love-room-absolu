"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Bath, Flower2, HeartHandshake, MessageCircleHeart, Radio, Sparkles, Wind } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { theme } from "@/lib/theme";

const moments = [{ label: "Moment de relaxation à deux", icon: HeartHandshake }, { label: "Bain balnéo en duo", icon: Bath }, { label: "Séance sauna privatif", icon: Radio }, { label: "Massage en couple", icon: Sparkles }, { label: "Temps de respiration", icon: Wind }, { label: "Déconnexion numérique", icon: Flower2 }, { label: "Temps de partage", icon: MessageCircleHeart }] as const;

export function TantraExperience() {
  const reducedMotion = useReducedMotion();
  return <section className="relative isolate overflow-hidden bg-[#090909] py-24 text-[#F6F2EC] sm:py-32" aria-labelledby="tantra-title">
    <div className="pointer-events-none absolute -left-40 top-12 size-[32rem] rounded-full bg-[#8E48FF]/10 blur-[120px]" /><div className="pointer-events-none absolute -right-32 bottom-0 size-[28rem] rounded-full bg-[#F13C98]/10 blur-[120px]" />
    <div className="page-shell relative"><motion.div initial={reducedMotion ? false : { opacity: 0, y: 20 }} whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: theme.durations.reveal, ease: [0.22, 1, 0.36, 1] }} className="grid gap-8 rounded-[2rem] border border-white/10 bg-white/[.055] p-6 shadow-[0_30px_100px_rgba(0,0,0,.35)] backdrop-blur-xl sm:p-10 lg:grid-cols-[.72fr_1.28fr] lg:gap-16 lg:p-14">
      <div><span className="mb-7 grid size-14 place-items-center rounded-2xl border border-[#C9A86A]/25 bg-[#C9A86A]/10"><Flower2 className="size-6 text-[#E5C98E]" aria-hidden="true" /></span><SectionHeading eyebrow="Bien-être en couple" title="Rituels de reconnexion" light /><p id="tantra-title" className="mt-6 max-w-xl text-sm leading-7 text-white/60 sm:text-base sm:leading-8">Des gestes simples pour ralentir, respirer et retrouver une complicité naturelle. Cette approche inspirée de la philosophie tantrique accompagne votre moment à deux sans constituer une prestation.</p></div>
      <div><p className="eyebrow text-[#C9A86A]">Moments à vivre</p><div className="mt-6 grid gap-3 sm:grid-cols-2">{moments.map((moment, index) => <motion.article key={moment.label} initial={reducedMotion ? false : { opacity: 0, y: 12 }} whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: theme.durations.normal, delay: reducedMotion ? 0 : index * 0.045 }} whileHover={reducedMotion ? undefined : { y: -3 }} className="group flex min-h-24 items-center gap-4 rounded-2xl border border-white/[.09] bg-black/20 p-4 backdrop-blur-md transition-colors hover:border-[#C9A86A]/30 hover:bg-white/[.07]"><span className="grid size-11 shrink-0 place-items-center rounded-xl border border-[#C9A86A]/15 bg-[#C9A86A]/10"><moment.icon className="size-5 text-[#D8C8B6] transition-colors group-hover:text-[#E5C98E]" aria-hidden="true" /></span><h3 className="text-sm leading-6 text-white/75">{moment.label}</h3></motion.article>)}</div></div>
    </motion.div></div>
  </section>;
}
