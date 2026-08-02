"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Flame, Flower2, Sparkles, Waves } from "lucide-react";

export function WellnessAtmosphere() {
  const reducedMotion = useReducedMotion();
  return <section className="bg-[#F5F2EC] pb-24 text-[#171411] sm:pb-32"><div className="page-shell"><motion.article initial={reducedMotion ? false : { opacity: 0, y: 18 }} whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: .7 }} className="relative isolate overflow-hidden rounded-[2rem] border border-[#9A7844]/15 bg-white/60 p-7 shadow-[0_24px_80px_rgba(80,60,40,.09)] backdrop-blur-xl sm:p-10">
    <div aria-hidden="true" className="absolute -right-16 -top-20 size-72 rounded-full bg-[#C9A86A]/15 blur-[80px]" /><div aria-hidden="true" className="absolute bottom-6 right-12 flex items-end gap-2 opacity-20"><span className="size-8 rounded-full bg-[#8B7760]"/><span className="size-11 rounded-full bg-[#A18C73]"/><Flame className="ml-3 size-7 text-[#B98748]"/></div>
    <div className="relative grid items-center gap-8 md:grid-cols-[auto_1fr_auto]"><span className="grid size-16 place-items-center rounded-full border border-[#9A7844]/20 bg-[#9A7844]/10"><Flower2 className="size-8 stroke-[1.25] text-[#9A7844]" aria-hidden="true" /></span><div><p className="eyebrow text-[#9A7844]">L’esprit du lieu</p><h2 className="mt-3 font-heading text-3xl sm:text-4xl">Ambiance inspirée des rituels de bien-être</h2><p className="mt-4 max-w-3xl text-sm leading-7 text-[#665E56]">Une atmosphère pensée pour ralentir, se reconnecter et profiter pleinement d’un moment privilégié à deux.</p></div><div className="flex gap-3 text-[#9A7844]/65" aria-hidden="true"><Waves className="size-5" /><Sparkles className="size-5" /></div></div>
  </motion.article></div></section>;
}
