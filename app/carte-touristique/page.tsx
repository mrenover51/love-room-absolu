import Link from "next/link";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { TravelMap } from "@/components/map/travel-map";
import { mapPlaces } from "@/lib/map/places";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";
export const metadata = pageMetadata({
  title: "Carte touristique interactive autour d’Avize",
  description:
    "Préparez votre séjour avec la carte interactive Absolu : restaurants, caves, activités et promenades autour d’Avize et Épernay.",
  path: "/carte-touristique",
});
export default function MapPage() {
  const schemas = {
    "@context": "https://schema.org",
    "@graph": mapPlaces.map((place) => ({
      "@type": place.kind,
      "@id": `${siteConfig.url}${place.href}#place`,
      name: place.name,
      address: {
        "@type": "PostalAddress",
        streetAddress: place.address,
        addressLocality: place.city,
        addressCountry: "FR",
      },
      url: `${siteConfig.url}${place.href}`,
      description: place.description,
      telephone: place.phone,
      sameAs: place.website ? [place.website] : undefined,
    })),
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schemas).replaceAll("<", "\u003c"),
        }}
      />
      <Header />
      <main>
        <header className="page-shell pb-16 pt-36">
          <Breadcrumb current="Carte touristique" />
          <p className="eyebrow mt-12 text-[#C9A86A]">Préparer votre séjour</p>
          <h1 className="mt-4 max-w-5xl font-heading text-7xl sm:text-8xl">
            La Champagne à portée de carte
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-white/60">
            Restaurants, caves, activités et promenades documentés autour de la
            Suite Absolu. Filtrez, enregistrez vos favoris et ouvrez un
            itinéraire en un geste.
          </p>
        </header>
        <section className="bg-[#080808] pb-24">
          <div className="page-shell">
            <TravelMap />
          </div>
        </section>
        <section className="bg-[#EAE1D5] py-24 text-center text-[#201B18]">
          <div className="page-shell">
            <p className="eyebrow text-[#8B6B36]">Votre point de départ</p>
            <h2 className="mt-4 font-heading text-6xl">
              Réserver votre séjour à Avize
            </h2>
            <p className="mx-auto mt-6 max-w-2xl leading-8 text-black/55">
              Choisissez vos dates, puis construisez votre itinéraire depuis la
              Suite Absolu au cœur de la Côte des Blancs.
            </p>
            <Link
              href="/reservation"
              className="mt-9 inline-flex min-h-14 items-center bg-[#201B18] px-8 text-xs uppercase tracking-[.18em] text-white"
            >
              Voir les disponibilités
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
