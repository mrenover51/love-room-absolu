import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, CalendarDays, Clock3, Users } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PremiumButton } from "@/components/shared/premium-button";
import {
  getPublishedReview,
  reviewCriteria,
  reviewLabels,
} from "@/lib/reviews/reviews";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";
export const revalidate = 300;
export async function generateMetadata({
  params,
}: {
  params: Promise<{ avis: string }>;
}): Promise<Metadata> {
  const review = await getPublishedReview((await params).avis);
  return review
    ? pageMetadata({
        title: `${review.title} — avis vérifié Absolu`,
        description: `Avis vérifié de ${review.reviewer_name}, note ${review.overall_rating.toFixed(1)}/10 après un séjour romantique chez Absolu à Avize.`,
        path: `/avis/${review.slug}`,
      })
    : {};
}
export default async function ReviewPage({
  params,
}: {
  params: Promise<{ avis: string }>;
}) {
  const review = await getPublishedReview((await params).avis);
  if (!review) notFound();
  const canonical = `${siteConfig.url}/avis/${review.slug}`;
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": `${siteConfig.url}/#suite-product`,
        name: "Suite romantique Absolu",
        url: siteConfig.url,
        image: `${siteConfig.url}/images/optimized/lit.webp`,
      },
      {
        "@type": "Review",
        "@id": `${canonical}#review`,
        url: canonical,
        name: review.title,
        reviewBody: review.body,
        datePublished: review.published_at,
        author: { "@type": "Person", name: review.reviewer_name },
        itemReviewed: { "@id": `${siteConfig.url}/#suite-product` },
        reviewRating: {
          "@type": "Rating",
          ratingValue: review.overall_rating,
          bestRating: 10,
          worstRating: 1,
        },
        positiveNotes: {
          "@type": "ItemList",
          itemListElement: reviewCriteria.map((key, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: reviewLabels[key],
            description: `${review[key]}/10`,
          })),
        },
        comment: review.owner_response
          ? {
              "@type": "Comment",
              text: review.owner_response,
              dateCreated: review.owner_responded_at,
              author: { "@type": "Organization", name: "Absolu" },
            }
          : undefined,
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
            name: "Avis clients",
            item: `${siteConfig.url}/avis`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: review.title,
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
        <header className="page-shell pb-16 pt-36">
          <nav className="text-xs text-white/45">
            <Link href="/">Accueil</Link> ›{" "}
            <Link href="/avis">Avis clients</Link> › {review.title}
          </nav>
          <div className="mt-12 flex flex-wrap items-center gap-4">
            <span className="rounded-2xl bg-[#C9A86A] px-4 py-3 font-heading text-3xl text-black">
              {review.overall_rating.toFixed(1)}/10
            </span>
            <span className="flex items-center gap-2 text-sm text-emerald-300">
              <BadgeCheck className="size-5" />
              Séjour vérifié
            </span>
            {review.featured && (
              <span className="rounded-full border border-[#C9A86A]/40 px-3 py-1 text-xs text-[#C9A86A]">
                Avis mis en avant
              </span>
            )}
          </div>
          <h1 className="mt-8 max-w-5xl font-heading text-6xl sm:text-8xl">
            {review.title}
          </h1>
          <p className="mt-6 text-lg text-white/55">{review.reviewer_name}</p>
          <div className="mt-7 flex flex-wrap gap-5 text-sm text-white/45">
            <span className="flex gap-2">
              <CalendarDays className="size-4" />
              Séjour en{" "}
              {new Intl.DateTimeFormat("fr-FR", {
                month: "long",
                year: "numeric",
              }).format(new Date(`${review.stay_date}T12:00:00Z`))}
            </span>
            <span className="flex gap-2">
              <Clock3 className="size-4" />
              {review.nights} nuit{review.nights > 1 ? "s" : ""}
            </span>
            <span className="flex gap-2">
              <Users className="size-4" />
              {review.stay_type}
            </span>
          </div>
        </header>
        <section className="bg-[#F3EEE7] py-20 text-[#201B18]">
          <div className="page-shell grid gap-14 lg:grid-cols-[1.2fr_.8fr]">
            <article>
              <p className="eyebrow text-[#8B6B36]">Témoignage</p>
              <h2 className="mt-4 font-heading text-5xl">
                L’expérience racontée
              </h2>
              <p className="mt-7 whitespace-pre-line text-xl leading-9 text-black/65">
                {review.body}
              </p>
              {review.owner_response && (
                <aside className="mt-12 rounded-3xl border border-[#8B6B36]/25 bg-white p-7">
                  <p className="eyebrow text-[#8B6B36]">
                    Réponse du propriétaire
                  </p>
                  <p className="mt-5 leading-8 text-black/60">
                    {review.owner_response}
                  </p>
                </aside>
              )}
            </article>
            <aside>
              <h2 className="font-heading text-4xl">Notes détaillées</h2>
              <dl className="mt-7 space-y-4">
                {reviewCriteria.map((key) => (
                  <div
                    key={key}
                    className="flex justify-between border-b border-black/10 pb-3"
                  >
                    <dt>{reviewLabels[key]}</dt>
                    <dd className="font-medium">{review[key]}/10</dd>
                  </div>
                ))}
              </dl>
            </aside>
          </div>
        </section>
        {review.photo_urls.length > 0 && (
          <section className="bg-[#111] py-20">
            <div className="page-shell">
              <p className="eyebrow text-[#C9A86A]">Galerie client</p>
              <h2 className="mt-4 font-heading text-5xl">Photos du séjour</h2>
              <div className="mt-9 grid gap-4 md:grid-cols-3">
                {review.photo_urls.map((url, index) => (
                  <figure
                    key={url}
                    className="relative aspect-[4/3] overflow-hidden rounded-2xl"
                  >
                    <Image
                      src={url}
                      alt={`Photo client associée à l’avis ${review.title}, vue ${index + 1}`}
                      fill
                      sizes="(max-width:768px) 100vw,33vw"
                      className="object-cover"
                    />
                  </figure>
                ))}
              </div>
            </div>
          </section>
        )}
        <section className="bg-[#090909] py-20 text-center">
          <div className="page-shell">
            <h2 className="font-heading text-5xl">
              Vivre votre propre séjour chez Absolu
            </h2>
            <PremiumButton href="/reservation" className="mt-8">
              Voir les disponibilités
            </PremiumButton>
            <div className="mt-9 flex justify-center gap-5 text-sm text-[#C9A86A]">
              <Link href="/avis">Tous les avis vérifiés</Link>
              <Link href="/comparateur-love-room">Comparer Absolu</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
