import Link from "next/link";
import { ArrowUpRight, Heart, KeyRound, Sparkles, Waves } from "lucide-react";
import { Reveal } from "@/components/shared/reveal";

const reasons = [
  { title: "100 % privatif", text: "Votre espace, votre rythme, votre parenthèse.", icon: KeyRound, href: "/la-suite" },
  { title: "Spa & bien-être", text: "Baignoire balnéo et sauna infrarouge rien que pour vous.", icon: Waves, href: "/equipements" },
  { title: "Ambiance romantique", text: "Une lumière modulable qui transforme chaque instant.", icon: Heart, href: "/galerie" },
  { title: "Prestations haut de gamme", text: "Chaque détail accompagne un séjour simple et confortable.", icon: Sparkles, href: "/reservation" },
] as const;

export function WhyAbsolu() {
  return (
    <section className="bg-[#0B0908] py-28 sm:py-40">
      <div className="page-shell">
        <Reveal><div className="text-center"><p className="eyebrow text-[#C9A86A]">L’essentiel, en privé</p><h2 className="mt-5 font-heading text-5xl leading-tight sm:text-6xl lg:text-7xl">Pourquoi choisir Absolu ?</h2></div></Reveal>
        <div className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {reasons.map(({ title, text, icon: Icon, href }, index) => (
            <Reveal key={title} delay={index * .06} className="h-full">
              <Link href={href} className="luxury-card group relative block h-full min-h-72 border border-white/[.09] bg-[#0E0E0E] p-8 hover:bg-[#15120F]">
                <Icon className="size-6 stroke-[1.4] text-[#C9A86A] transition-transform duration-500 group-hover:-translate-y-1" aria-hidden="true" />
                <h3 className="mt-12 font-heading text-2xl">{title}</h3>
                <p className="mt-4 text-sm leading-7 text-white/55">{text}</p>
                <ArrowUpRight className="absolute bottom-8 right-8 size-5 text-[#C9A86A] transition-transform duration-500 group-hover:-translate-y-1 group-hover:translate-x-1" aria-hidden="true" />
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
