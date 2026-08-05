import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { glossaryTerms } from "@/lib/ai-seo/glossary";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata({
  title: "Lexique de la Love Room romantique",
  description:
    "Le vocabulaire essentiel pour comparer une Love Room, ses équipements et ses conditions de réservation.",
  path: "/lexique-love-room",
});
export default function Lexicon() {
  const groups = [
    { title: "Choisir l’hébergement", terms: glossaryTerms.slice(0, 6) },
    { title: "Comprendre la Champagne", terms: glossaryTerms.slice(6, 14) },
    { title: "Préparer la réservation", terms: glossaryTerms.slice(14, 22) },
    { title: "Comprendre le référencement", terms: glossaryTerms.slice(22) },
  ];
  return (
    <>
      <Header />
      <main className="page-shell pb-24 pt-36">
        <Breadcrumb current="Lexique Love Room" />
        <p className="eyebrow mt-12 text-[#C9A86A]">Vocabulaire thématique</p>
        <h1 className="mt-4 font-heading text-7xl">Lexique de la Love Room</h1>
        <div className="mt-16 space-y-16">
          {groups.map((group, keyIndex) => (
            <section key={`${group.title}-${keyIndex}`}>
              <h2 className="font-heading text-5xl">{group.title}</h2>
              <div className="mt-7 grid gap-4 md:grid-cols-2">
                {group.terms.map(([term, definition], keyIndex) => (
                  <article
                    key={`${term}-${keyIndex}`}
                    className="border-l border-[#C9A86A]/40 pl-5"
                  >
                    <h3 className="font-heading text-2xl">{term}</h3>
                    <p className="mt-3 leading-7 text-white/55">{definition}</p>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
        <Link href="/glossaire" className="mt-16 inline-block text-[#C9A86A]">
          Toutes les définitions par ordre éditorial →
        </Link>
      </main>
      <Footer />
    </>
  );
}
