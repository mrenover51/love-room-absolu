import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock3, Globe2, MapPin, Phone, Route } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PremiumButton } from "@/components/shared/premium-button";
import { getRestaurant, restaurants } from "@/lib/restaurants/restaurants";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";
export const dynamicParams = false;
export function generateStaticParams() {
  return restaurants.map((item) => ({ restaurant: item.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ restaurant: string }>;
}): Promise<Metadata> {
  const item = getRestaurant((await params).restaurant);
  if (!item) return {};
  return pageMetadata({
    title: `${item.name} : restaurant près d'Absolu`,
    description: `${item.name} à ${item.city} : présentation, adresse, téléphone, trajet depuis Avize, carte et conseils pour votre soirée romantique.`,
    path: `/restaurants/${item.slug}`,
    image: "/images/restaurant-directory-hero.png",
    imageAlt: `Illustration éditoriale pour ${item.name}`,
  });
}
export default async function RestaurantPage({
  params,
}: {
  params: Promise<{ restaurant: string }>;
}) {
  const item = getRestaurant((await params).restaurant);
  if (!item) notFound();
  const canonical = `${siteConfig.url}/restaurants/${item.slug}`;
  const related = restaurants
    .filter(
      (other) =>
        other.slug !== item.slug &&
        (other.category === item.category || other.city === item.city),
    )
    .slice(0, 4);
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Restaurant",
        "@id": `${canonical}#restaurant`,
        name: item.name,
        url: canonical,
        sameAs: [item.website, item.sourceUrl],
        telephone: item.phone,
        address: {
          "@type": "PostalAddress",
          streetAddress: item.address,
          addressLocality: item.city,
          addressCountry: "FR",
        },
        servesCuisine: item.category,
        image: `${siteConfig.url}/images/restaurant-directory-hero.png`,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Accueil",
            item: siteConfig.url,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Restaurants",
            item: `${siteConfig.url}/restaurants`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: item.name,
            item: canonical,
          },
        ],
      },
    ],
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
      <main>
        <section className="relative flex min-h-[72svh] items-end overflow-hidden pb-16 pt-32">
          <Image
            src="/images/restaurant-directory-hero.png"
            alt="Table romantique, illustration éditoriale non contractuelle"
            fill
            preload
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/20" />
          <div className="page-shell relative">
            <nav aria-label="Fil d’Ariane" className="text-xs text-white/55">
              <Link href="/">Accueil</Link> <span>›</span>{" "}
              <Link href="/restaurants">Restaurants</Link> <span>›</span>{" "}
              <span>{item.name}</span>
            </nav>
            <p className="eyebrow mt-9 text-[#C9A86A]">
              {item.category} · {item.city}
            </p>
            <h1 className="mt-4 max-w-5xl font-heading text-6xl leading-none sm:text-8xl">
              {item.name}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">
              {item.presentation}
            </p>
            <p className="mt-3 text-xs text-white/40">
              Visuel d’ambiance — ne représente pas nécessairement cet
              établissement.
            </p>
          </div>
        </section>
        <section className="bg-[#F4EFE8] py-20 text-[#201B18]">
          <div className="page-shell grid gap-10 lg:grid-cols-[1.1fr_.9fr]">
            <article>
              <p className="eyebrow text-[#8B6B36]">Pourquoi y aller</p>
              <h2 className="mt-4 font-heading text-5xl">
                Une table à intégrer à votre escapade
              </h2>
              <p className="mt-6 text-lg leading-8 text-black/60">{item.why}</p>
              <h3 className="mt-12 font-heading text-3xl">Nos conseils</h3>
              <p className="mt-5 leading-8 text-black/55">{item.advice}</p>
              <p className="mt-5 leading-8 text-black/55">
                Les coordonnées ont été rapprochées de la fiche de l’Office de
                tourisme d’Épernay consultée en août 2026. Menus, horaires,
                tarifs et services évoluent : vérifiez-les auprès du restaurant
                avant votre déplacement.
              </p>
            </article>
            <aside className="rounded-[2rem] border border-black/10 bg-white p-8">
              <h2 className="font-heading text-3xl">Informations pratiques</h2>
              <dl className="mt-7 space-y-5 text-sm">
                <div className="flex gap-3">
                  <MapPin className="size-5 text-[#8B6B36]" />
                  <div>
                    <dt className="text-black/40">Adresse</dt>
                    <dd className="mt-1">{item.address}</dd>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Clock3 className="size-5 text-[#8B6B36]" />
                  <div>
                    <dt className="text-black/40">Depuis Absolu</dt>
                    <dd className="mt-1">Environ {item.drive}</dd>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Phone className="size-5 text-[#8B6B36]" />
                  <div>
                    <dt className="text-black/40">Téléphone</dt>
                    <dd className="mt-1">
                      {item.phone ? (
                        <a href={`tel:${item.phone.replaceAll(" ", "")}`}>
                          {item.phone}
                        </a>
                      ) : (
                        <a
                          href={item.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          À vérifier sur la fiche officielle
                        </a>
                      )}
                    </dd>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Globe2 className="size-5 text-[#8B6B36]" />
                  <div>
                    <dt className="text-black/40">Site internet</dt>
                    <dd className="mt-1">
                      <a
                        href={item.website}
                        target="_blank"
                        rel="noreferrer"
                        className="underline"
                      >
                        Consulter le site
                      </a>
                    </dd>
                  </div>
                </div>
              </dl>
              <a
                href={item.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-7 inline-block text-xs text-[#8B6B36] underline"
              >
                Vérifier sur la source touristique officielle
              </a>
            </aside>
          </div>
        </section>
        <section className="bg-[#111] py-20">
          <div className="page-shell grid gap-4 md:grid-cols-3">
            {["salledebain.webp", "lit.webp", "entree2.webp"].map(
              (image, keyIndex) => (
                <figure key={`${image}-${keyIndex}`}>
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                    <Image
                      src={`/images/optimized/${image}`}
                      alt="Ambiance de la Suite Absolu avant ou après le restaurant"
                      fill
                      sizes="(max-width:768px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                  <figcaption className="mt-3 text-xs text-white/35">
                    Votre parenthèse chez Absolu · photo de la suite, pas du
                    restaurant
                  </figcaption>
                </figure>
              ),
            )}
          </div>
        </section>
        <section className="bg-white py-20 text-[#201B18]">
          <div className="page-shell grid gap-10 lg:grid-cols-2">
            <div>
              <p className="eyebrow text-[#8B6B36]">Itinéraire</p>
              <h2 className="mt-4 font-heading text-5xl">Avant votre soirée</h2>
              <ol className="mt-7 space-y-5 leading-7 text-black/55">
                <li>
                  <b className="text-black">1.</b> Confirmez la table et les
                  éventuelles contraintes alimentaires.
                </li>
                <li>
                  <b className="text-black">2.</b> Quittez Absolu avec une marge
                  pour le trajet et le stationnement.
                </li>
                <li>
                  <b className="text-black">3.</b> Gardez du temps au retour
                  pour profiter des équipements privatifs.
                </li>
              </ol>
              <h2 className="mt-14 font-heading text-5xl">
                Après votre séjour
              </h2>
              <p className="mt-6 leading-8 text-black/55">
                Pour un déjeuner le lendemain, vérifiez l’heure de départ de la
                suite, réservez le service choisi et adaptez l’étape à votre
                route. Une halte à Épernay ou Hautvillers peut prolonger
                l’expérience sans surcharger la journée.
              </p>
            </div>
            <iframe
              title={`Itinéraire Google Maps vers ${item.name}`}
              src={`https://www.google.com/maps?q=${encodeURIComponent(item.address)}&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="min-h-[520px] w-full rounded-2xl border-0"
              allowFullScreen
            />
          </div>
        </section>
        <section className="bg-[#0A0A0A] py-20 text-center">
          <div className="page-shell">
            <Route className="mx-auto size-6 text-[#C9A86A]" />
            <h2 className="mt-5 font-heading text-5xl">
              Associer cette table à votre nuit chez Absolu
            </h2>
            <PremiumButton href="/reservation" className="mt-8">
              Voir les disponibilités
            </PremiumButton>
            <div className="mt-12 flex flex-wrap justify-center gap-5 text-sm text-white/45">
              {related.map((other) => (
                <Link
                  key={other.slug}
                  href={`/restaurants/${other.slug}`}
                  className="hover:text-white"
                >
                  {other.name}
                </Link>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-5 text-sm text-[#C9A86A]">
              <Link href="/experiences-romantiques/week-end-romantique">
                Week-end romantique
              </Link>
              <Link href="/blog/restaurant-romantique-champagne">
                Guide des restaurants romantiques
              </Link>
              <Link href="/love-room/epernay">Love Room près d’Épernay</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
