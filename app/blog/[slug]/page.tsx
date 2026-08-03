import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock3 } from "lucide-react";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { ArticleCard } from "@/components/magazine/article-card";
import {
  getMagazineArticle,
  magazineArticles,
  magazineAuthor,
  relatedArticles,
} from "@/lib/magazine/articles";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

export const dynamicParams = false;
export function generateStaticParams() {
  return magazineArticles.map(({ slug }) => ({ slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const article = getMagazineArticle((await params).slug);
  if (!article) return {};
  const metadata = pageMetadata({
    title: `${article.title} | Magazine Absolu`,
    description: article.description,
    path: `/blog/${article.slug}`,
    image: article.image,
    imageAlt: article.imageAlt,
  });
  return {
    ...metadata,
    openGraph: {
      ...metadata.openGraph,
      type: "article",
      publishedTime: article.published,
      modifiedTime: article.modified,
      authors: [magazineAuthor.name],
      section: article.category,
      tags: [...article.tags],
    },
  };
}
export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const article = getMagazineArticle((await params).slug);
  if (!article) notFound();
  const canonical = `${siteConfig.url}/blog/${article.slug}`;
  const related = relatedArticles(article);
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${canonical}/#article`,
        headline: article.title,
        description: article.description,
        image: `${siteConfig.url}${article.image}`,
        datePublished: article.published,
        dateModified: article.modified,
        mainEntityOfPage: canonical,
        articleSection: article.category,
        keywords: article.tags.join(", "),
        wordCount: article.sections
          .flatMap((section) => section.paragraphs)
          .join(" ")
          .split(/\s+/).length,
        author: {
          "@type": "Organization",
          name: magazineAuthor.name,
          url: `${siteConfig.url}${magazineAuthor.url}`,
        },
        publisher: { "@id": `${siteConfig.url}/#organization` },
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
            name: "Magazine",
            item: `${siteConfig.url}/blog`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: article.title,
            item: canonical,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: article.faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      },
    ],
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replaceAll("<", "\\u003c"),
        }}
      />
      <Header />
      <main>
        <header className="page-shell pb-12 pt-36">
          <nav aria-label="Fil d’Ariane" className="text-xs text-white/45">
            <Link href="/">Accueil</Link> <span>›</span>{" "}
            <Link href="/blog">Magazine</Link> <span>›</span>{" "}
            <span>{article.category}</span>
          </nav>
          <div className="mt-10 max-w-5xl">
            <Link
              href={`/blog/categorie/${article.category
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9]+/g, "-")}`}
              className="eyebrow text-[#C9A86A]"
            >
              {article.category}
            </Link>
            <h1 className="mt-5 font-heading text-6xl leading-[.95] sm:text-8xl">
              {article.title}
            </h1>
            <p className="mt-7 max-w-3xl text-lg leading-8 text-white/60">
              {article.excerpt}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-white/40">
              <Link href={magazineAuthor.url} className="transition-colors hover:text-[#C9A86A]">Par {article.author}</Link>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock3 className="size-4" />
                {article.readingTime} min
              </span>
              <span>•</span>
              <time dateTime={article.published}>
                {new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(
                  new Date(`${article.published}T12:00:00Z`),
                )}
              </time>
            </div>
          </div>
        </header>
        <figure className="page-shell">
          <div className="relative aspect-[16/8] overflow-hidden rounded-[2rem]">
            <Image
              src={article.image}
              alt={article.imageAlt}
              fill
              preload
              sizes="(max-width: 1200px) 100vw, 1200px"
              className="object-cover"
            />
          </div>
        </figure>
        <div className="page-shell grid gap-14 py-20 lg:grid-cols-[220px_minmax(0,760px)] lg:justify-center">
          <aside>
            <nav
              aria-label="Sommaire"
              className="sticky top-28 border-l border-white/15 pl-5"
            >
              <p className="text-xs uppercase tracking-wider text-[#C9A86A]">
                Sommaire
              </p>
              <ol className="mt-5 space-y-3 text-sm text-white/45">
                {article.sections.map((section) => (
                  <li key={section.id}>
                    <a href={`#${section.id}`} className="hover:text-white">
                      {section.title}
                    </a>
                  </li>
                ))}
                <li>
                  <a href="#faq">Questions fréquentes</a>
                </li>
              </ol>
            </nav>
          </aside>
          <article className="space-y-16 [&_h2]:font-heading [&_h2]:text-4xl [&_p]:mt-5 [&_p]:text-[1.05rem] [&_p]:leading-8 [&_p]:text-white/60">
            {article.sections.map((section, index) => (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-32"
              >
                <h2>{section.title}</h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {index === 2 && (
                  <figure className="relative mt-10 aspect-[16/9] overflow-hidden rounded-2xl">
                    <Image
                      src="/images/optimized/salledebain.webp"
                      alt="Baignoire balnéo privative de la Suite Absolu"
                      fill
                      sizes="760px"
                      className="object-cover"
                    />
                  </figure>
                )}
              </section>
            ))}
            <section id="faq" className="scroll-mt-32">
              <h2>Questions fréquentes</h2>
              <div className="mt-6 divide-y divide-white/10">
                {article.faq.map((item) => (
                  <details key={item.question}>
                    <summary className="cursor-pointer py-5 font-heading text-2xl">
                      {item.question}
                    </summary>
                    <p className="pb-6">{item.answer}</p>
                  </details>
                ))}
              </div>
            </section>
            <aside aria-label="Liens contextuels" className="rounded-2xl border border-[#C9A86A]/25 bg-[#C9A86A]/5 p-7">
              <p className="eyebrow text-[#C9A86A]">Pour prolonger l’expérience</p>
              <p className="mt-4 leading-8 text-white/60">
                Après cette lecture, imaginez un <Link href="/experiences-romantiques/week-end-romantique" className="text-white underline decoration-[#C9A86A] underline-offset-4">week-end romantique en Champagne</Link>, puis découvrez notre <Link href="/equipements/baignoire-balneo" className="text-white underline decoration-[#C9A86A] underline-offset-4">suite avec baignoire balnéo privative</Link>.
              </p>
            </aside>
            <div className="flex flex-wrap gap-2 border-t border-white/10 pt-8">
              {article.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/blog/tag/${encodeURIComponent(
                    tag
                      .toLowerCase()
                      .normalize("NFD")
                      .replace(/[\u0300-\u036f]/g, "")
                      .replace(/[^a-z0-9]+/g, "-"),
                  )}`}
                  className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/50"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </article>
        </div>
        <section className="border-t border-white/10 bg-[#0C0C0C] py-24">
          <div className="page-shell">
            <p className="eyebrow text-[#C9A86A]">Poursuivre la lecture</p>
            <h2 className="mt-4 font-heading text-5xl">Articles liés</h2>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {related.map((item) => (
                <ArticleCard key={item.slug} article={item} />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
