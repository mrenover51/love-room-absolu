import { Sparkles } from "lucide-react";

const impressions = ["Une parenthèse à deux.", "Chaque détail trouve sa place.", "Le soir révèle une autre atmosphère."];

export function Testimonials() {
  return <section className="section-space bg-[#F6F2EC] text-[#171411]"><div className="page-shell"><div className="mx-auto max-w-3xl text-center"><p className="eyebrow text-[#9A7844]">L’esprit Absolu</p><h2 className="mt-6 font-heading text-5xl leading-tight sm:text-6xl">Le luxe discret de ralentir.</h2></div><div className="mt-16 grid gap-5 md:grid-cols-3">{impressions.map((text,index)=><article key={text} className="group min-h-64 rounded-[1.5rem] border border-black/10 bg-white/35 p-8 shadow-[0_18px_50px_rgba(55,40,25,.06)] transition-all duration-500 hover:-translate-y-1.5 hover:border-[#9A7844]/40 hover:bg-white/60 hover:shadow-[0_26px_65px_rgba(55,40,25,.1)]"><div className="flex items-center justify-between"><span className="text-xs tracking-[.2em] text-[#9A7844]">0{index+1}</span><Sparkles className="size-4 text-[#9A7844]/70" aria-hidden="true" /></div><p className="mt-16 font-heading text-3xl leading-snug">{text}</p></article>)}</div></div></section>;
}
