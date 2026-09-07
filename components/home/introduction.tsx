import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/shared/reveal";

export function Introduction() {
  return (
    <section id="suite" className="bg-[#F6F2EC] py-28 text-[#171411] sm:py-40">
      <div className="page-shell grid items-center gap-16 lg:grid-cols-[.82fr_1.18fr] lg:gap-32">
        <Reveal>
          <div className="max-w-xl">
            <p className="eyebrow text-[#9A7844]">L’expérience Absolu</p>
            <h2 className="mt-6 font-heading text-5xl leading-[1.06] sm:text-6xl lg:text-7xl">
              Une love room au cœur de la Champagne
            </h2>
            <div className="mt-10 space-y-6 text-sm leading-8 text-[#625A53] sm:text-base sm:leading-9">
              <p>
                Absolu accueille les couples à Avize, village Grand Cru de la
                Côte des Blancs, près d’Épernay. Cette adresse réelle au cœur du
                vignoble champenois permet de découvrir l’avenue de Champagne,
                les coteaux et les maisons alentour, puis de retrouver le calme
                d’une suite indépendante pensée pour deux.
              </p>
              <p>
                La baignoire balnéo et le sauna infrarouge sont privatifs : vous
                en profitez librement pendant votre séjour. La pierre claire, le
                bois, l’eau chaude et la lumière tamisée composent un refuge
                pour une nuit ou un week-end romantique en Champagne. Découvrez
                <Link
                  href="/la-suite"
                  className="mx-1 underline decoration-[#9A7844]/40 underline-offset-4"
                >
                  la suite Absolu
                </Link>
                et consultez directement les
                <Link
                  href="/reservation"
                  className="ml-1 underline decoration-[#9A7844]/40 underline-offset-4"
                >
                  disponibilités
                </Link>
                .
              </p>
              <p>
                Pour préparer votre parenthèse, explorez notre
                <Link
                  href="/love-room/epernay"
                  className="mx-1 underline decoration-[#9A7844]/40 underline-offset-4"
                >
                  guide depuis Épernay
                </Link>
                , notre{" "}
                <Link
                  href="/love-room/avize"
                  className="underline decoration-[#9A7844]/40 underline-offset-4"
                >
                  page d’Avize
                </Link>
                , le{" "}
                <Link
                  href="/guide-touristique"
                  className="mx-1 underline decoration-[#9A7844]/40 underline-offset-4"
                >
                  guide de la Champagne
                </Link>
                et nos{" "}
                <Link
                  href="/restaurants"
                  className="underline decoration-[#9A7844]/40 underline-offset-4"
                >
                  restaurants sélectionnés
                </Link>
                .
              </p>
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.1} className="relative ml-auto w-full max-w-xl">
          <div className="absolute -left-6 -top-6 h-2/3 w-2/3 border border-[#C9A86A]/45" />
          <div className="group relative aspect-[4/5] overflow-hidden shadow-[0_28px_70px_rgba(70,48,25,.16)]">
            <Image
              src="/images/optimized/entree2.webp"
              alt="Entrée contemporaine de la suite privative Absolu"
              fill
              sizes="(min-width:1024px) 45vw, 100vw"
              className="object-cover transition-transform duration-[1400ms] group-hover:scale-[1.035]"
            />
          </div>
          <p className="mt-6 text-right text-xs uppercase tracking-[.2em] text-[#7B6E61]">
            35 m² · exclusivement pour deux
          </p>
        </Reveal>
      </div>
    </section>
  );
}
