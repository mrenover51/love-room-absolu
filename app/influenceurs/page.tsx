import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata({
  title: "Collaborations créateurs et influenceurs | Absolu",
  description:
    "Proposez une collaboration éditoriale transparente avec Love Room Absolu autour du séjour romantique et de la Champagne.",
  path: "/influenceurs",
});
export default function Influencers() {
  return (
    <>
      <Header />
      <main className="page-shell pb-24 pt-36">
        <Breadcrumb current="Influenceurs" />
        <p className="eyebrow mt-10 text-[#C9A86A]">Créateurs & influenceurs</p>
        <h1 className="mt-4 max-w-4xl font-heading text-6xl sm:text-8xl">
          Des collaborations sincères, clairement identifiées.
        </h1>
        <p className="mt-6 max-w-2xl leading-8 text-white/55">
          Absolu étudie les projets cohérents avec le voyage en couple, le
          bien-être, l’hôtellerie indépendante et la Champagne. Toute invitation
          ou rémunération doit être signalée conformément aux règles
          applicables.
        </p>
        <section className="mt-16 grid gap-5 md:grid-cols-3">
          {[
            [
              "Affinité éditoriale",
              "Une audience intéressée par les séjours, le couple ou la Champagne.",
            ],
            [
              "Transparence",
              "Statistiques d’audience vérifiables et mention explicite de la collaboration.",
            ],
            [
              "Liberté de ton",
              "Aucun avis positif imposé et aucun script présenté comme un témoignage spontané.",
            ],
          ].map(([title, text], keyIndex) => (
            <article
              key={`${title}-${keyIndex}`}
              className="rounded-3xl border border-white/10 bg-[#121212] p-6"
            >
              <h2 className="font-heading text-3xl">{title}</h2>
              <p className="mt-4 text-sm leading-7 text-white/45">{text}</p>
            </article>
          ))}
        </section>
        <div className="mt-16 rounded-3xl border border-[#C9A86A]/25 p-8">
          <h2 className="font-heading text-4xl">Présenter votre projet</h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-white/50">
            Indiquez vos plateformes, statistiques récentes, audience
            géographique, concept, dates envisagées et livrables proposés.
          </p>
          <Link
            href="/contact"
            className="mt-6 inline-flex rounded-full bg-[#C9A86A] px-6 py-3 font-semibold text-black"
          >
            Envoyer une proposition
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
