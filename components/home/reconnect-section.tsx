"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Flower2, HeartHandshake, Sparkles } from "lucide-react";

export function ReconnectSection() {
  const reducedMotion = useReducedMotion();
  return <section className="relative isolate overflow-hidden border-y border-[#C9A86A]/10 bg-[#11100E] py-28 text-[#F6F2EC] sm:py-40" aria-labelledby="reconnect-title">
    <motion.div aria-hidden="true" className="absolute left-1/2 top-1/2 size-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#C9A86A]/10 blur-[110px]" animate={reducedMotion ? undefined : { scale: [1, 1.08, 1], opacity: [.55, .9, .55] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} />
    <div className="page-shell relative grid items-center gap-16 lg:grid-cols-[.42fr_.58fr] lg:gap-24">
      <motion.div initial={reducedMotion ? false : { opacity: 0, scale: .94 }} whileInView={reducedMotion ? undefined : { opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: .8 }} className="relative mx-auto grid size-48 place-items-center rounded-full border border-[#C9A86A]/20 bg-white/[.04] shadow-[0_0_80px_rgba(201,168,106,.12)] backdrop-blur-xl sm:size-64">
        <span className="absolute inset-5 rounded-full border border-dashed border-[#C9A86A]/25" />
        <Flower2 className="size-20 stroke-[1] text-[#DCC18E] sm:size-28" aria-hidden="true" />
        <Sparkles className="absolute right-7 top-10 size-5 text-[#E8D6B0]" aria-hidden="true" />
      </motion.div>
      <motion.div initial={reducedMotion ? false : { opacity: 0, y: 18 }} whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: .75, delay: .1 }}>
        <p className="eyebrow flex items-center gap-3 text-[#C9A86A]"><HeartHandshake className="size-4" aria-hidden="true" />Bien-être en couple</p>
        <h2 id="reconnect-title" className="mt-5 font-heading text-5xl sm:text-6xl">Reconnectez-vous à deux</h2>
        <p className="mt-7 max-w-2xl text-base leading-8 text-white/65">Une parenthèse hors du temps, où détente, sensualité, bien-être et reconnexion à deux se rencontrent dans une atmosphère inspirée des rituels tantriques.</p>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-white/45">Ici, le Tantra évoque une philosophie de lenteur, d’écoute et de complicité : une invitation discrète à retrouver le plaisir simple d’être ensemble.</p>
      </motion.div>
    </div>
  </section>;
}
