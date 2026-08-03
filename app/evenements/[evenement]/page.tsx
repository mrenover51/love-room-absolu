import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarCheck, Check, Clock3, Sparkles } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PremiumButton } from "@/components/shared/premium-button";
import { EventCountdown } from "@/components/events/event-countdown";
import {
  eventEdition,
  getSeasonalEvent,
  seasonalEvents,
} from "@/lib/events/events";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";
import { getPublicPricingConfig } from "@/lib/booking/server-pricing";
import type { PublicPricingConfig } from "@/lib/booking/types";
export const dynamicParams = false;
export const revalidate = 86400;
export function generateStaticParams() {
  return seasonalEvents.map((event) => ({ evenement: event.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ evenement: string }>;
}): Promise<Metadata> {
  const event = getSeasonalEvent((await params).evenement);
  if (!event) return {};
  const edition = eventEdition(event);
  return pageMetadata({
    title: `${event.name} ${edition.year} en Love Room en Champagne | Absolu`,
    description: event.description,
    path: `/evenements/${event.slug}`,
    image: event.image,
    imageAlt: `Séjour ${event.name.toLowerCase()} dans la Suite Absolu`,
  });
}
export default async function EventPage({
  params,
}: {
  params: Promise<{ evenement: string }>;
}) {
  const event = getSeasonalEvent((await params).evenement);
  if (!event) notFound();
  const edition = eventEdition(event),
    pricing: PublicPricingConfig = await getPublicPricingConfig(),
    start = edition.start.toISOString().slice(0, 10),
    end = edition.end.toISOString().slice(0, 10),
    promotions =
      pricing.promotions?.filter(
        (item) => item.startDate < end && item.endDate > start,
      ) ?? [],
    related = seasonalEvents
      .filter(
        (item) =>
          item.slug !== event.slug &&
          (item.season === event.season || item.personal === event.personal),
      )
      .slice(0, 4),
    canonical = `${siteConfig.url}/evenements/${event.slug}`;
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Event",
        "@id": `${canonical}#event-${edition.year}`,
        name: `${event.name} ${edition.year} chez Absolu`,
        description: event.description,
        startDate: edition.start.toISOString(),
        endDate: edition.end.toISOString(),
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        location: {
          "@type": "Place",
          name: "Suite Absolu",
          address: {
            "@type": "PostalAddress",
            streetAddress: "36 rue Pasteur",
            postalCode: "51190",
            addressLocality: "Avize",
            addressCountry: "FR",
          },
        },
        image: event.gallery.map((image) => `${siteConfig.url}${image}`),
        organizer: { "@id": `${siteConfig.url}/#organization` },
        ...(siteConfig.startingPrice !== undefined
          ? {
              offers: {
                "@type": "Offer",
                url: `${siteConfig.url}/reservation`,
                price: siteConfig.startingPrice,
                priceCurrency: "EUR",
                availability: "https://schema.org/LimitedAvailability",
                validFrom: new Date().toISOString(),
              },
            }
          : {}),
      },
      {
        "@type": "FAQPage",
        mainEntity: event.faq.map(([question, answer]) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: { "@type": "Answer", text: answer },
        })),
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
            name: "Événements",
            item: `${siteConfig.url}/evenements`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: event.name,
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
        <section className="relative flex min-h-[82svh] items-end overflow-hidden pb-16 pt-32">
          <Image
            src={event.image}
            alt={`${event.name} romantique chez Absolu à Avize`}
            fill
            preload
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/20" />
          <div className="page-shell relative">
            <nav aria-label="Fil d’Ariane" className="text-xs text-white/55">
              <Link href="/">Accueil</Link> ›{" "}
              <Link href="/evenements">Événements</Link> ›{" "}
              <span>{event.name}</span>
            </nav>
            <p className="eyebrow mt-9 text-[#C9A86A]">
              {event.eyebrow} · édition {edition.year}
            </p>
            <h1 className="mt-4 max-w-5xl font-heading text-6xl leading-none sm:text-8xl">
              {event.name} en Champagne
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">
              {event.promise}
            </p>
            <PremiumButton href="/reservation" className="mt-8">
              Voir les disponibilités
            </PremiumButton>
          </div>
        </section>
        <section className="page-shell py-24">
          <div className="grid gap-10 lg:grid-cols-[1fr_.9fr]">
            <article>
              <p className="eyebrow text-[#C9A86A]">Préparer votre édition</p>
              <h2 className="mt-4 font-heading text-5xl">
                Une landing page qui reste utile chaque année
              </h2>
              <p className="mt-6 text-lg leading-8 text-white/55">
                {event.description} Chez Absolu, l’expérience réunit une suite
                indépendante, une baignoire balnéo, un sauna infrarouge et une
                ambiance lumineuse modulable. L’objectif n’est pas de remplir
                chaque minute, mais de protéger un temps réellement partagé.
              </p>
              <p className="mt-5 leading-8 text-white/45">
                La période indiquée sert de repère éditorial. Les
                disponibilités, prix, options et conditions sont toujours ceux
                du moteur de réservation au moment de votre choix. Pour les
                vendanges, les dates réelles varient selon la maturité du raisin
                et les décisions de chaque domaine.
              </p>
            </article>
            <EventCountdown
              target={edition.start.toISOString()}
              personal={event.personal}
            />
          </div>
        </section>
        <section className="bg-[#F6F2EC] py-24 text-[#201B18]">
          <div className="page-shell">
            <p className="eyebrow text-[#8B6B36]">Offres spéciales</p>
            <h2 className="mt-4 font-heading text-5xl">
              Les avantages réellement disponibles
            </h2>
            {promotions.length ? (
              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {promotions.map((promotion, index) => (
                  <article
                    key={`${promotion.startDate}-${index}`}
                    className="rounded-2xl border border-black/10 bg-white p-6"
                  >
                    <Sparkles className="size-5 text-[#8B6B36]" />
                    <h3 className="mt-4 font-heading text-3xl">
                      −{promotion.discountPercent}% sur les nuitées
                    </h3>
                    <p className="mt-3 text-sm text-black/50">
                      Offre configurée du {promotion.startDate} au{" "}
                      {promotion.endDate}, sous réserve des dates et conditions
                      affichées lors de la réservation.
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-8 rounded-2xl border border-dashed border-black/15 p-6">
                <p className="font-medium">
                  Aucune offre spéciale publiée pour cette édition.
                </p>
                <p className="mt-2 text-sm text-black/50">
                  Le calendrier et le tarif direct restent consultables en temps
                  réel. Une offre apparaîtra ici uniquement lorsqu’elle aura été
                  configurée.
                </p>
              </div>
            )}
          </div>
        </section>
        <section className="bg-[#101010] py-24">
          <div className="page-shell">
            <p className="eyebrow text-[#C9A86A]">Galerie</p>
            <h2 className="mt-4 font-heading text-5xl">
              L’atmosphère de votre séjour
            </h2>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {event.gallery.map((image, index) => (
                <figure
                  key={image}
                  className={`relative overflow-hidden rounded-2xl ${index === 0 ? "aspect-[4/3] md:col-span-2" : "aspect-[4/3]"}`}
                >
                  <Image
                    src={image}
                    alt={`${event.name} chez Absolu, vue ${index + 1}`}
                    fill
                    sizes={
                      index === 0
                        ? "(max-width:768px)100vw,66vw"
                        : "(max-width:768px)100vw,33vw"
                    }
                    className="object-cover"
                  />
                </figure>
              ))}
            </div>
          </div>
        </section>
        <section className="bg-white py-24 text-[#201B18]">
          <div className="page-shell grid gap-12 lg:grid-cols-2">
            <div>
              <p className="eyebrow text-[#8B6B36]">Conseils</p>
              <h2 className="mt-4 font-heading text-5xl">
                Construire un moment fluide
              </h2>
              <ul className="mt-8 space-y-4">
                {event.tips.map((tip) => (
                  <li key={tip} className="flex gap-3 text-black/60">
                    <Check className="mt-1 size-4 shrink-0 text-[#8B6B36]" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="eyebrow text-[#8B6B36]">Historique</p>
              <h2 className="mt-4 font-heading text-5xl">
                Éditions précédentes
              </h2>
              <div className="mt-8 space-y-3">
                {[1, 2, 3].map((offset) => (
                  <div
                    key={offset}
                    className="flex items-center gap-3 rounded-xl border border-black/10 p-4"
                  >
                    <Clock3 className="size-4 text-[#8B6B36]" />
                    <span>Édition {edition.year - offset}</span>
                    <span className="ml-auto text-xs text-black/35">
                      Archive éditoriale
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs leading-6 text-black/40">
                Ces archives attestent la continuité de la page, pas une offre
                commerciale passée ni un événement public organisé.
              </p>
            </div>
          </div>
        </section>
        <section className="bg-[#F6F2EC] py-24 text-[#201B18]">
          <div className="page-shell mx-auto max-w-4xl">
            <p className="eyebrow text-[#8B6B36]">Questions fréquentes</p>
            <h2 className="mt-4 font-heading text-5xl">FAQ — {event.name}</h2>
            <div className="mt-10 divide-y divide-black/10">
              {event.faq.map(([question, answer]) => (
                <details key={question}>
                  <summary className="cursor-pointer py-5 font-heading text-2xl">
                    {question}
                  </summary>
                  <p className="pb-6 leading-8 text-black/55">{answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
        <section className="bg-[#090909] py-24 text-center">
          <div className="page-shell">
            <CalendarCheck className="mx-auto size-7 text-[#C9A86A]" />
            <h2 className="mt-5 font-heading text-5xl">
              Préparer {event.name.toLowerCase()}
            </h2>
            <PremiumButton href="/reservation" className="mt-8">
              Réserver votre édition {edition.year}
            </PremiumButton>
            <div className="mt-12 flex flex-wrap justify-center gap-4 text-sm text-white/45">
              {related.map((item) => (
                <Link
                  key={item.slug}
                  href={`/evenements/${item.slug}`}
                  className="hover:text-white"
                >
                  {item.name}
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
