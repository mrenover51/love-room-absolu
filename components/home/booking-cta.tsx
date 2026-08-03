import Image from "next/image";
import { PremiumButton } from "@/components/shared/premium-button";

export function BookingCta() {
  return (
    <section
      id="reservation"
      className="section-space relative overflow-hidden border-t border-white/[.07]"
    >
      <Image
        src="/images/optimized/lit.webp"
        alt=""
        fill
        sizes="100vw"
        className="object-cover opacity-20 transition-transform duration-[1600ms] hover:scale-[1.02]"
      />
      <div className="absolute inset-0 bg-black/80" />
      <div className="absolute inset-x-1/4 bottom-0 h-48 bg-[#C9A86A]/10 blur-[100px]" />
      <div className="page-shell relative text-center">
        <p className="eyebrow text-[#C9A86A]">Votre séjour</p>
        <h2 className="mx-auto mt-6 max-w-3xl font-heading text-5xl leading-tight sm:text-6xl">
          Et si le prochain souvenir commençait ici&nbsp;?
        </h2>
        <p className="mx-auto mt-6 max-w-xl leading-8 text-white/55">
          Choisissez votre soir, puis laissez la Champagne, la chaleur du sauna
          et la douceur de la suite écrire la suite.
        </p>
        <PremiumButton href="/reservation" className="mt-10">
          Préparer votre séjour
        </PremiumButton>
      </div>
    </section>
  );
}
