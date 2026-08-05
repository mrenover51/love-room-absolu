import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { experiences } from "@/lib/constants";
import { Reveal } from "@/components/shared/reveal";
import { SectionHeading } from "@/components/shared/section-heading";

const experienceLinks = ["/equipements/baignoire-balneo", "/equipements/sauna", "/equipements/douche-italienne"] as const;

export function ExperienceGrid() {
  return (
    <section id="experiences" className="bg-[#0D0D0D] py-28 sm:py-40">
      <div className="page-shell">
        <Reveal><SectionHeading light eyebrow="Expériences privées" title="Tout ce qu’il faut pour oublier le reste." description="Trois espaces, une même intention : offrir à votre couple un rituel de détente et le luxe rare de ne penser à rien." /></Reveal>
        <div className="mt-16 grid gap-7 lg:grid-cols-3">
          {experiences.map((item, i) => (
            <Reveal key={`${item.title}-${i}`} delay={i * .08} className="h-full">
              <Link href={experienceLinks[i]} className="luxury-card group relative block min-h-[36rem] overflow-hidden border border-white/[.08] bg-[#151515] focus-visible:ring-1 focus-visible:ring-[#C9A86A]" aria-label={`${item.title} — découvrir`}>
                <Image src={item.natural} alt={`${item.title} de la suite Absolu`} fill sizes="(min-width: 1024px) 33vw, 100vw" className={`object-cover transition-[transform,opacity] duration-1000 group-hover:scale-[1.035] ${item.position}`} />
                <Image src={item.ambient} alt="" aria-hidden="true" fill sizes="(min-width: 1024px) 33vw, 100vw" className={`hidden object-cover opacity-0 transition-[transform,opacity] duration-1000 group-hover:scale-[1.035] group-hover:opacity-100 group-focus-visible:opacity-100 md:block ${item.position}`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-8 lg:p-9">
                  <p className="mb-3 text-[.65rem] uppercase tracking-[.22em] text-[#D8C8B6]">{item.detail}</p>
                  <div className="flex items-end justify-between gap-5"><h3 className="font-heading text-3xl leading-tight">{item.title}</h3><ArrowUpRight className="mb-1 size-5 shrink-0 text-[#C9A86A] transition-transform duration-500 group-hover:-translate-y-1 group-hover:translate-x-1" aria-hidden="true" /></div>
                  <p className="mt-4 max-w-sm text-sm leading-7 text-white/60">{item.description}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
