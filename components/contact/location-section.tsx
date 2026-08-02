"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ExternalLink, MapPin } from "lucide-react";

const address = "36 rue Pasteur, 51190 Avize";
const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
const embedUrl = `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;

export function LocationSection() {
  const reducedMotion = useReducedMotion();
  return <section className="relative overflow-hidden bg-[#0b0908] py-24 text-[#F6F2EC] sm:py-32" aria-labelledby="location-title">
    <div className="pointer-events-none absolute left-1/2 top-1/2 size-[38rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#C9A86A]/10 blur-[140px]" />
    <motion.div className="page-shell relative" initial={reducedMotion ? false : { opacity: 0, y: 24 }} whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
      <div className="mb-10 max-w-2xl"><p className="eyebrow text-[#C9A86A]">Au cœur de la Champagne</p><h2 id="location-title" className="mt-4 font-heading text-5xl sm:text-6xl">Nous trouver</h2><p className="mt-5 flex items-start gap-3 text-sm leading-7 text-white/65"><MapPin className="mt-1 size-4 shrink-0 text-[#C9A86A]" aria-hidden="true" /><span>36 rue Pasteur<br />51190 Avize</span></p></div>
      <div className="rounded-[2rem] border border-white/15 bg-white/[.07] p-2 shadow-[0_30px_100px_rgba(0,0,0,.45)] backdrop-blur-xl sm:p-3"><iframe title="Carte de la Love Room Absolu à Avize" src={embedUrl} className="h-[24rem] w-full rounded-[1.5rem] border-0 sm:h-[32rem]" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen /></div>
      <div className="mt-8 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center"><p className="max-w-3xl text-sm leading-7 text-white/65 sm:text-base">Située au cœur du vignoble champenois, la Love Room Absolu vous accueille dans un environnement calme et intimiste, idéal pour une parenthèse romantique à deux.</p><a href={mapsUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-full bg-[#C9A86A] px-6 text-sm font-semibold text-black transition hover:bg-[#E1C58D] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C9A86A]">Ouvrir dans Google Maps<ExternalLink className="size-4" aria-hidden="true" /></a></div>
    </motion.div>
  </section>;
}
