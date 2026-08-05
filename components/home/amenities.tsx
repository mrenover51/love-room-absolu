import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { amenities } from "@/lib/constants";
import { Reveal } from "@/components/shared/reveal";

export function Amenities() {
  return (
    <section className="bg-[#F5F2EC] py-28 text-[#171411] sm:py-40">
      <div className="page-shell">
        <Reveal><p className="eyebrow text-[#9A7844]">Tout est là</p><h2 className="mt-5 max-w-2xl font-heading text-5xl leading-[1.08] sm:text-6xl lg:text-7xl">Le confort, sans compromis.</h2></Reveal>
        <div className="mt-16 grid grid-cols-2 gap-px bg-black/10 sm:grid-cols-3 lg:grid-cols-4">
          {amenities.map(({ label, icon: Icon }, index) => (
            <Reveal key={`${label}-${index}`} delay={Math.min(index, 7) * .025} className="h-full">
              <Link href="/equipements" className="group relative flex h-full min-h-36 flex-col border border-transparent bg-[#F5F2EC] p-6 transition-all duration-500 hover:z-10 hover:border-[#A98245]/45 hover:bg-white hover:shadow-[0_24px_55px_rgba(50,36,20,.1)] sm:min-h-40 sm:p-7">
                <Icon className="size-5 stroke-[1.5] text-[#9A7844] transition-transform duration-500 group-hover:-translate-y-1" aria-hidden="true" />
                <p className="mt-auto pt-7 text-sm leading-6">{label}</p>
                <ArrowUpRight className="absolute bottom-6 right-6 size-4 translate-y-1 text-[#9A7844] opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100" aria-hidden="true" />
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
