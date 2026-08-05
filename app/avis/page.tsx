import Link from "next/link";
import { BadgeCheck, MessageSquareQuote, Star } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { ReviewCenter } from "@/components/reviews/review-center";
import {
  getPublishedReviews,
  reviewCriteria,
  reviewLabels,
  reviewStats,
} from "@/lib/reviews/reviews";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";
export const revalidate = 300;
export const metadata = pageMetadata({
  title: "Avis clients vérifiés sur la Suite Absolu",
  description:
    "Consultez les avis vérifiés, notes détaillées, photos clients et réponses du propriétaire après un séjour chez Absolu à Avize.",
  path: "/avis",
});
export default async function ReviewsPage() {
  const reviews = await getPublishedReviews();
  const stats = reviewStats(reviews);
  const featured = reviews.filter((item) => item.featured).slice(0, 3);
  const product: Record<string, unknown> = {
    "@type": "Product",
    "@id": `${siteConfig.url}/#suite-product`,
    name: "Suite romantique Absolu",
    url: siteConfig.url,
    image: `${siteConfig.url}/images/optimized/lit.webp`,
  };
  if (stats.count)
    product.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: stats.overall.toFixed(1),
      ratingCount: stats.count,
      bestRating: 10,
      worstRating: 1,
    };
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      product,
      ...reviews.map((review) => ({
        "@type": "Review",
        "@id": `${siteConfig.url}/avis/${review.slug}#review`,
        url: `${siteConfig.url}/avis/${review.slug}`,
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
      })),
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
          <Breadcrumb current="Avis clients" />
          <p className="eyebrow mt-12 text-[#C9A86A]">Séjours authentifiés</p>
          <h1 className="mt-4 max-w-5xl font-heading text-7xl sm:text-8xl">
            Avis clients vérifiés
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-white/60">
            Chaque badge vérifié correspond à une réservation reliée à un séjour
            terminé. Aucun avis de démonstration n’est publié.
          </p>
          {stats.count ? (
            <div className="mt-10 flex items-end gap-5">
              <span className="font-heading text-7xl text-[#C9A86A]">
                {stats.overall.toFixed(1)}
              </span>
              <div className="pb-2">
                <p className="flex gap-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className="size-4 fill-[#C9A86A] text-[#C9A86A]"
                    />
                  ))}
                </p>
                <p className="mt-2 text-sm text-white/45">
                  {stats.count} avis vérifiés
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-10 rounded-2xl border border-white/10 p-6 text-white/55">
              <p className="flex items-center gap-2 text-white">
                <BadgeCheck className="size-5 text-[#C9A86A]" />
                La collecte d’avis vérifiés est prête.
              </p>
              <p className="mt-3 text-sm leading-7">
                Les statistiques apparaîtront automatiquement après publication
                du premier avis lié à un séjour terminé.
              </p>
            </div>
          )}
        </header>
        {stats.count > 0 && (
          <section className="bg-[#111] py-20">
            <div className="page-shell grid gap-12 lg:grid-cols-2">
              <div>
                <h2 className="font-heading text-5xl">Notes détaillées</h2>
                <div className="mt-8 space-y-5">
                  {reviewCriteria.map((key) => (
                    <div key={key}>
                      <div className="flex justify-between text-sm">
                        <span>{reviewLabels[key]}</span>
                        <span>{stats.criteria[key].toFixed(1)}/10</span>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-[#C9A86A]"
                          style={{ width: `${stats.criteria[key] * 10}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h2 className="font-heading text-5xl">Répartition des notes</h2>
                <div className="mt-8 space-y-3">
                  {stats.distribution.map((row, keyIndex) => (
                    <div
                      key={`${row.rating}-${keyIndex}`}
                      className="grid grid-cols-[2rem_1fr_2rem] items-center gap-3 text-sm"
                    >
                      <span>{row.rating}</span>
                      <div className="h-2 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full bg-[#8B6B36]"
                          style={{
                            width: `${stats.count ? (row.count / stats.count) * 100 : 0}%`,
                          }}
                        />
                      </div>
                      <span className="text-right text-white/40">
                        {row.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
        <section className="bg-[#F3EEE7] py-24 text-[#201B18]">
          <div className="page-shell">
            <p className="eyebrow text-[#8B6B36]">Consulter</p>
            <h2 className="mt-4 font-heading text-5xl">
              Tous les commentaires récents
            </h2>
            <div className="mt-10">
              <ReviewCenter reviews={reviews} />
            </div>
          </div>
        </section>
        <section className="bg-[#0A0A0A] py-20">
          <div className="page-shell">
            <p className="eyebrow text-[#C9A86A]">Ils parlent de nous</p>
            <h2 className="mt-4 font-heading text-5xl">Avis mis en avant</h2>
            {featured.length ? (
              <div className="mt-9 grid gap-5 md:grid-cols-3">
                {featured.map((review) => (
                  <blockquote
                    key={review.id}
                    className="rounded-2xl border border-white/10 p-7"
                  >
                    <MessageSquareQuote className="size-5 text-[#C9A86A]" />
                    <p className="mt-5 leading-7 text-white/60">
                      « {review.body} »
                    </p>
                    <footer className="mt-5 text-sm text-white/40">
                      <Link href={`/avis/${review.slug}`}>
                        {review.reviewer_name} ·{" "}
                        {review.overall_rating.toFixed(1)}/10
                      </Link>
                    </footer>
                  </blockquote>
                ))}
              </div>
            ) : (
              <p className="mt-7 max-w-2xl leading-8 text-white/50">
                Cette section accueillera les témoignages mis en avant dès que
                des avis authentiques auront été publiés.
              </p>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
