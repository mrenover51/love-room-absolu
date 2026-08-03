import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { ArticleCard } from "@/components/magazine/article-card";
import { MagazineExplorer } from "@/components/magazine/magazine-explorer";
import {
  magazineArticles,
  magazineCategories,
  magazineTags,
} from "@/lib/magazine/articles";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Magazine Absolu | Champagne, escapades et art de vivre",
  description:
    "Plus de 100 guides et inspirations pour découvrir la Champagne, préparer une escapade romantique et cultiver l’art de vivre à deux.",
  path: "/blog",
  image: "/images/magazine-hero.png",
  imageAlt: "Magazine de voyage Absolu face aux vignobles de Champagne",
});
const cards = magazineArticles.map(
  ({ slug, title, excerpt, category, tags, image, readingTime }) => ({
    slug,
    title,
    excerpt,
    category,
    tags,
    image,
    readingTime,
  }),
);
export default function Magazine() {
  const featured = magazineArticles
    .filter((article) => article.featured)
    .slice(0, 4);
  return (
    <>
      <Header />
      <main>
        <section className="relative flex min-h-[82svh] items-end overflow-hidden pb-16 pt-32">
          <Image
            src="/images/magazine-hero.png"
            alt="Carnet de voyage face aux vignobles de Champagne"
            fill
            preload
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-black/15" />
          <div className="page-shell relative">
            <p className="eyebrow text-[#C9A86A]">Le Magazine Absolu</p>
            <h1 className="mt-4 max-w-5xl font-heading text-7xl leading-none sm:text-8xl lg:text-9xl">
              Voyager. Ressentir. Se retrouver.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">
              Des chemins entre les vignes, des tables que l’on aimerait garder
              secrètes et des idées à vivre à deux. Le Magazine Absolu raconte
              la Champagne comme on feuillette un carnet de voyage.
            </p>
          </div>
        </section>
        <nav
          aria-label="Catégories du magazine"
          className="border-b border-white/10 bg-[#090909]"
        >
          <div className="page-shell flex gap-6 overflow-x-auto py-5">
            {magazineCategories.map((category) => (
              <Link
                key={category}
                href={`/blog/categorie/${encodeURIComponent(
                  category
                    .toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .replace(/[^a-z0-9]+/g, "-"),
                )}`}
                className="whitespace-nowrap text-xs uppercase tracking-wider text-white/55 hover:text-white"
              >
                {category}
              </Link>
            ))}
            <Link
              href="/blog/auteur/redaction-absolu"
              className="whitespace-nowrap text-xs uppercase tracking-wider text-white/55 hover:text-white"
            >
              La rédaction
            </Link>
            <Link
              href="/blog/recherche"
              className="whitespace-nowrap text-xs uppercase tracking-wider text-[#C9A86A]"
            >
              Recherche
            </Link>
          </div>
        </nav>
        <section className="page-shell py-24">
          <div className="flex items-end justify-between">
            <div>
              <p className="eyebrow text-[#C9A86A]">À la une</p>
              <h2 className="mt-4 font-heading text-5xl">
                Des histoires pour imaginer la vôtre
              </h2>
            </div>
            <p className="hidden text-sm text-white/35 md:block">
              {magazineArticles.length} articles
            </p>
          </div>
          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            {featured.map((article, index) => (
              <ArticleCard
                key={article.slug}
                article={article}
                priority={index < 2}
              />
            ))}
          </div>
        </section>
        <section className="border-t border-white/10 bg-[#0C0C0C] py-24">
          <div className="page-shell">
            <p className="eyebrow text-[#C9A86A]">Explorer</p>
            <h2 className="mt-4 font-heading text-5xl">Poursuivre le voyage</h2>
            <div className="mt-10">
              <MagazineExplorer
                articles={cards}
                categories={[...magazineCategories]}
                tags={magazineTags}
              />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
