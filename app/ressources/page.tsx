import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { resourcePillars } from "@/lib/ai-seo/resources";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";
export const metadata = pageMetadata({
  title: "Centre de ressources Love Room et Champagne",
  description:
    "Guides, réponses directes, comparatifs et définitions pour préparer un séjour romantique à Avize et en Champagne.",
  path: "/ressources",
});
export default function Resources() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Guides piliers Absolu",
    itemListElement: resourcePillars.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.title,
      url: `${siteConfig.url}/ressources/${item.slug}`,
    })),
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replaceAll("<", "\u003c"),
        }}
      />
      <Header />
      <main className="page-shell pb-24 pt-36">
        <Breadcrumb current="Centre de ressources" />
        <p className="eyebrow mt-12 text-[#C9A86A]">Réponses vérifiables</p>
        <h1 className="mt-4 max-w-5xl font-heading text-6xl sm:text-8xl">
          Centre de ressources Absolu
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-white/60">
          Des réponses courtes pour décider, des guides approfondis pour
          vérifier et des comparatifs pour choisir sans ambiguïté.
        </p>
        <section className="mt-16 grid gap-5 md:grid-cols-3">
          {resourcePillars.map((item) => (
            <article
              key={item.slug}
              className="rounded-3xl border border-white/10 p-7"
            >
              <p className="eyebrow text-[#C9A86A]">Page pilier</p>
              <h2 className="mt-4 font-heading text-4xl">
                <Link href={`/ressources/${item.slug}`}>{item.title}</Link>
              </h2>
              <p className="mt-5 leading-7 text-white/55">{item.shortAnswer}</p>
              <Link
                href={`/ressources/${item.slug}`}
                className="mt-7 inline-block text-sm text-[#C9A86A]"
              >
                Lire le guide →
              </Link>
            </article>
          ))}
        </section>
        <section className="mt-20">
          <h2 className="font-heading text-5xl">Outils et définitions</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <Link
              href="/comparateur-love-room"
              className="rounded-2xl border border-white/10 p-6"
            >
              <h3 className="font-heading text-3xl">Comparateur Absolu</h3>
              <p className="mt-3 text-white/50">
                Comparer localisation, réservation et équipements.
              </p>
            </Link>
            <Link
              href="/glossaire"
              className="rounded-2xl border border-white/10 p-6"
            >
              <h3 className="font-heading text-3xl">Glossaire</h3>
              <p className="mt-3 text-white/50">
                Les notions expliquées simplement.
              </p>
            </Link>
            <Link
              href="/lexique-love-room"
              className="rounded-2xl border border-white/10 p-6"
            >
              <h3 className="font-heading text-3xl">Lexique Love Room</h3>
              <p className="mt-3 text-white/50">
                Le vocabulaire des séjours romantiques.
              </p>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
