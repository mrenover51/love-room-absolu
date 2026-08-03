import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { searchIntents } from "@/lib/seo-intents/intents";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Expériences et séjours romantiques en Champagne | Absolu",
  description:
    "Explorez 14 façons de vivre une parenthèse à deux dans la Suite Absolu : Love Room, week-end romantique, anniversaire ou lune de miel.",
  path: "/experiences-romantiques",
  image: "/images/romantic-intents-hero.png",
  imageAlt: "Ambiance éditoriale pour une expérience romantique à deux",
});
export default function IntentHub() {
  return (
    <>
      <Header />
      <main>
        <section className="relative flex min-h-[78svh] items-end overflow-hidden pb-16 pt-32">
          <Image
            src="/images/romantic-intents-hero.png"
            alt="Deux verres et une attention dans une ambiance romantique"
            fill
            preload
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/35 to-black/20" />
          <div className="page-shell relative">
            <p className="eyebrow text-[#C9A86A]">
              Une parenthèse à votre image
            </p>
            <h1 className="mt-4 max-w-4xl font-heading text-6xl leading-none sm:text-8xl">
              Expériences romantiques
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">
              Un anniversaire murmuré, une surprise longtemps préparée ou le
              simple désir de se retrouver. Choisissez l’intention qui ressemble
              à votre histoire, la Suite Absolu lui donnera un écrin.
            </p>
          </div>
        </section>
        <section className="bg-[#F6F2EC] py-24 text-[#201B18]">
          <div className="page-shell">
            <h2 className="font-heading text-5xl">
              Quelle histoire avez-vous envie de vivre&nbsp;?
            </h2>
            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {searchIntents.map((intent) => (
                <Link
                  key={intent.slug}
                  href={`/experiences-romantiques/${intent.slug}`}
                  className="group rounded-[1.5rem] border border-black/10 bg-white/60 p-6 transition hover:-translate-y-1 hover:border-[#9A783E]"
                >
                  <p className="text-xs uppercase tracking-wider text-[#8B6B36]">
                    {intent.eyebrow}
                  </p>
                  <h3 className="mt-3 font-heading text-3xl">
                    {intent.keyword}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-[#655D55]">
                    {intent.promise.charAt(0).toUpperCase() +
                      intent.promise.slice(1)}
                    .
                  </p>
                  <span className="mt-6 inline-block text-sm text-[#8B6B36]">
                    Imaginer ce moment →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
