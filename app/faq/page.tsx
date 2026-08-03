import Link from "next/link";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { PremiumFaqCenter } from "@/components/faq/premium-faq-center";
import { InteriorHero } from "@/components/shared/interior-hero";
import { faqCategories, premiumFaqItems } from "@/lib/faq/faq-data";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

export const metadata = pageMetadata({
  title: "FAQ Love Room : 308 réponses pour préparer votre séjour",
  description:
    "Réservation, paiement, spa privatif, sauna, parking et horaires : consultez les réponses détaillées du centre d’aide Absolu à Avize.",
  path: "/faq",
  image: "/images/optimized/salledebain.webp",
  imageAlt: "Baignoire balnéo de la Suite Absolu à Avize",
});

const featured = [
  "Peut-on arriver discrètement ?",
  "Le linge est-il fourni ?",
  "Le parking est-il gratuit ?",
  "Le sauna est-il privatif ?",
  "Comment fonctionne la baignoire balnéo ?",
  "Les animaux sont-ils acceptés ?",
];
const articles = [
  {
    href: "/blog/que-faire-epernay-en-amoureux",
    label: "Que faire à Épernay en amoureux ?",
    text: "Activités, rythme et idées pour composer une escapade à deux.",
  },
  {
    href: "/blog/caves-de-champagne",
    label: "Les caves de Champagne",
    text: "Préparer une visite et l’intégrer sereinement à votre séjour.",
  },
  {
    href: "/blog/restaurant-romantique-champagne",
    label: "Choisir un restaurant romantique",
    text: "Nos repères pour réserver une table autour d’Avize et d’Épernay.",
  },
];

export default function FaqPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${siteConfig.url}/faq#faq`,
    url: `${siteConfig.url}/faq`,
    name: "Centre FAQ Absolu",
    inLanguage: "fr-FR",
    mainEntity: premiumFaqItems.map((item) => ({
      "@type": "Question",
      "@id": `${siteConfig.url}/faq#${item.id}`,
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
  const popular = featured
    .map((question) =>
      premiumFaqItems.find((item) => item.question === question),
    )
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
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
        <InteriorHero
          image="/images/optimized/entree1.webp"
          title="Préparer votre séjour, l’esprit léger"
          eyebrow="Avant de pousser la porte · 308 réponses"
          description="Horaires, réservation, baignoire balnéo ou sauna privatif : retrouvez chaque détail utile pour arriver à Avize avec une seule chose en tête, profiter de votre temps à deux."
        />
        <section className="border-b border-white/10 bg-[#0C0C0C] py-20">
          <div className="page-shell">
            <p className="eyebrow text-[#C9A86A]">Questions populaires</p>
            <h2 className="mt-4 font-heading text-5xl">
              Les réponses les plus consultées
            </h2>
            <div className="mt-9 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {popular.map((item) => (
                <Link
                  key={item.id}
                  href={`#${item.id}`}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5 text-white/70 transition hover:border-[#C9A86A]/50 hover:text-white"
                >
                  <span className="block text-[.65rem] uppercase tracking-wider text-[#C9A86A]">
                    {item.category}
                  </span>
                  <span className="mt-2 block font-heading text-xl">
                    {item.question}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
        <section className="bg-[#F6F2EC] py-20 text-[#201B18] sm:py-28">
          <div className="page-shell">
            <PremiumFaqCenter
              items={premiumFaqItems}
              categories={faqCategories}
            />
          </div>
        </section>
        <section className="bg-[#111] py-24">
          <div className="page-shell">
            <p className="eyebrow text-[#C9A86A]">Articles associés</p>
            <h2 className="mt-4 font-heading text-5xl">
              Nos conseils pour aller plus loin
            </h2>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {articles.map((article) => (
                <article
                  key={article.href}
                  className="rounded-2xl border border-white/10 p-7"
                >
                  <h3 className="font-heading text-3xl">
                    <Link href={article.href} className="hover:text-[#C9A86A]">
                      {article.label}
                    </Link>
                  </h3>
                  <p className="mt-4 leading-7 text-white/50">{article.text}</p>
                  <Link
                    href={article.href}
                    className="mt-6 inline-block text-sm text-[#C9A86A]"
                  >
                    Lire le guide →
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className="bg-[#EDE5DB] py-20 text-center text-[#201B18]">
          <div className="page-shell">
            <p className="eyebrow text-[#8B6B36]">
              Une attention particulière ?
            </p>
            <h2 className="mt-4 font-heading text-5xl">
              Préparons votre séjour ensemble
            </h2>
            <p className="mx-auto mt-5 max-w-2xl leading-8 text-black/55">
              Si un détail compte pour vous, confiez-le-nous. Nous vous
              répondrons avec simplicité, afin que votre arrivée soit déjà le
              début de la parenthèse.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/contact"
                className="rounded-full bg-[#201B18] px-7 py-3 text-sm text-white"
              >
                Échanger avec nous
              </Link>
              <Link
                href="/reservation"
                className="rounded-full border border-black/20 px-7 py-3 text-sm"
              >
                Préparer votre séjour
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
