import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { glossaryTerms } from "@/lib/ai-seo/glossary";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";
export const metadata = pageMetadata({
  title: "Glossaire Love Room et Champagne",
  description:
    "30 définitions claires sur les Love Rooms, équipements privatifs, réservations et séjours romantiques en Champagne.",
  path: "/glossaire",
});
export default function Glossary() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: "Glossaire Absolu",
    url: `${siteConfig.url}/glossaire`,
    hasDefinedTerm: glossaryTerms.map(([name, description]) => ({
      "@type": "DefinedTerm",
      name,
      description,
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
        <Breadcrumb current="Glossaire" />
        <p className="eyebrow mt-12 text-[#C9A86A]">Définitions fiables</p>
        <h1 className="mt-4 font-heading text-7xl">
          Glossaire Love Room et Champagne
        </h1>
        <dl className="mt-16 grid gap-5 md:grid-cols-2">
          {glossaryTerms.map(([term, definition]) => (
            <div
              key={term}
              id={term
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")}
              className="rounded-2xl border border-white/10 p-6"
            >
              <dt className="font-heading text-3xl">{term}</dt>
              <dd className="mt-4 leading-7 text-white/55">{definition}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-16 flex gap-5">
          <Link href="/lexique-love-room" className="text-[#C9A86A]">
            Consulter le lexique thématique →
          </Link>
          <Link href="/ressources" className="text-[#C9A86A]">
            Centre de ressources →
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
