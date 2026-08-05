import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PremiumButton } from "@/components/shared/premium-button";
import { getResourcePillar, resourcePillars } from "@/lib/ai-seo/resources";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";
export const dynamicParams = false;
export function generateStaticParams() {
  return resourcePillars.map((item) => ({ pilier: item.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ pilier: string }>;
}): Promise<Metadata> {
  const item = getResourcePillar((await params).pilier);
  return item
    ? pageMetadata({
        title: item.title,
        description: item.description,
        path: `/ressources/${item.slug}`,
      })
    : {};
}
export default async function Pillar({
  params,
}: {
  params: Promise<{ pilier: string }>;
}) {
  const item = getResourcePillar((await params).pilier);
  if (!item) notFound();
  const canonical = `${siteConfig.url}/ressources/${item.slug}`;
  const product: Record<string, unknown> = {
    "@type": "Product",
    "@id": `${siteConfig.url}/#suite-product`,
    name: "Suite romantique Absolu",
    description:
      "Suite romantique privative à Avize avec baignoire balnéo et sauna infrarouge.",
    brand: { "@type": "Brand", name: "Absolu" },
    url: siteConfig.url,
    image: `${siteConfig.url}/images/optimized/lit.webp`,
  };
  if (siteConfig.startingPrice !== undefined)
    product.offers = {
      "@type": "Offer",
      price: siteConfig.startingPrice,
      priceCurrency: "EUR",
      url: `${siteConfig.url}/reservation`,
      availability: "https://schema.org/LimitedAvailability",
    };
  if (
    siteConfig.reviewRating !== undefined &&
    siteConfig.reviewCount !== undefined
  )
    product.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: siteConfig.reviewRating,
      ratingCount: siteConfig.reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  if (
    siteConfig.featuredReviewBody &&
    siteConfig.featuredReviewAuthor &&
    siteConfig.reviewRating !== undefined
  )
    product.review = {
      "@type": "Review",
      reviewBody: siteConfig.featuredReviewBody,
      author: { "@type": "Person", name: siteConfig.featuredReviewAuthor },
      reviewRating: {
        "@type": "Rating",
        ratingValue: siteConfig.reviewRating,
        bestRating: 5,
      },
    };
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": canonical,
        name: item.title,
        description: item.description,
        speakable: {
          "@type": "SpeakableSpecification",
          cssSelector: ["#reponse-courte", "#resume"],
        },
      },
      {
        "@type": "HowTo",
        name: `Comment ${item.title.toLowerCase()}`,
        step: item.steps.map((step, index) => ({
          "@type": "HowToStep",
          position: index + 1,
          name: step.name,
          text: step.text,
        })),
      },
      {
        "@type": "FAQPage",
        mainEntity: item.faq.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      },
      {
        "@type": "ItemList",
        name: `Ressources liées à ${item.title}`,
        itemListElement: item.satellites.map((link, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: link.label,
          url: `${siteConfig.url}${link.href}`,
        })),
      },
      product,
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
            <Link href="/ressources">Ressources</Link> › {item.title}
          </nav>
          <p className="eyebrow mt-12 text-[#C9A86A]">Guide pilier</p>
          <h1 className="mt-4 max-w-5xl font-heading text-6xl sm:text-8xl">
            {item.title}
          </h1>
          <p
            id="resume"
            className="mt-7 max-w-3xl text-lg leading-8 text-white/60"
          >
            {item.description}
          </p>
        </header>
        <section className="bg-[#F2ECE4] py-20 text-[#201B18]">
          <div className="page-shell">
            <aside
              id="reponse-courte"
              className="rounded-3xl border border-[#8B6B36]/25 bg-white p-8"
            >
              <p className="eyebrow text-[#8B6B36]">Réponse courte</p>
              <p className="mt-5 max-w-4xl text-xl leading-9">
                {item.shortAnswer}
              </p>
            </aside>
            <article className="mx-auto mt-20 max-w-4xl">
              <h2 className="font-heading text-5xl">Réponse détaillée</h2>
              <div className="mt-7 space-y-6 text-lg leading-8 text-black/60">
                {item.longAnswer.map((p, keyIndex) => (
                  <p key={`${p}-${keyIndex}`}>{p}</p>
                ))}
              </div>
              <h2 className="mt-16 font-heading text-5xl">
                Comment préparer ce choix
              </h2>
              <ol className="mt-8 space-y-5">
                {item.steps.map((step, index) => (
                  <li
                    key={`${step.name}-${index}`}
                    className="rounded-2xl border border-black/10 bg-white p-6"
                  >
                    <h3 className="font-heading text-3xl">
                      {index + 1}. {step.name}
                    </h3>
                    <p className="mt-3 leading-7 text-black/55">{step.text}</p>
                  </li>
                ))}
              </ol>
              <h2 className="mt-16 font-heading text-5xl">Comparatif</h2>
              <div className="mt-8 overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr>
                      <th className="border-b border-black/15 p-4">Critère</th>
                      <th className="border-b border-black/15 p-4">Absolu</th>
                      <th className="border-b border-black/15 p-4">
                        Alternative
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {item.comparison.map((row, keyIndex) => (
                      <tr key={`${row.criterion}-${keyIndex}`}>
                        <th className="border-b border-black/10 p-4">
                          {row.criterion}
                        </th>
                        <td className="border-b border-black/10 p-4 text-black/55">
                          {row.absolu}
                        </td>
                        <td className="border-b border-black/10 p-4 text-black/55">
                          {row.alternative}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <h2 className="mt-16 font-heading text-5xl">
                Questions fréquentes
              </h2>
              <div className="mt-7 divide-y divide-black/10">
                {item.faq.map((faq, keyIndex) => (
                  <details key={`${faq.question}-${keyIndex}`}>
                    <summary className="cursor-pointer py-5 font-heading text-2xl">
                      {faq.question}
                    </summary>
                    <p className="pb-6 leading-8 text-black/55">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </article>
          </div>
        </section>
        <section className="bg-[#090909] py-20 text-center">
          <div className="page-shell">
            <h2 className="font-heading text-5xl">Approfondir ce sujet</h2>
            <div className="mt-9 flex flex-wrap justify-center gap-5">
              {item.satellites.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-full border border-white/15 px-5 py-3 text-sm"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <PremiumButton href="/reservation" className="mt-10">
              Voir les disponibilités
            </PremiumButton>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
