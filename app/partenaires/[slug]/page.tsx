import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import {
  getPartner,
  getPublishedPartners,
  partnerCategories,
} from "@/lib/partners/partners";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const partner = await getPartner((await params).slug);
  if (!partner) return {};
  return pageMetadata({
    title: `${partner.name}, partenaire Absolu en Champagne`,
    description: partner.description.slice(0, 155),
    path: `/partenaires/${partner.slug}`,
    image: partner.image_url ?? "/images/optimized/lit.webp",
    imageAlt: `${partner.name}, partenaire local d’Absolu`,
  });
}
export default async function PartnerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const partner = await getPartner((await params).slug);
  if (!partner) notFound();
  const canonical = `${siteConfig.url}/partenaires/${partner.slug}`;
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${canonical}#partner`,
        name: partner.name,
        url: partner.website_url,
        description: partner.description,
        address: {
          "@type": "PostalAddress",
          addressLocality: partner.city,
          addressCountry: "FR",
        },
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
            name: "Partenaires",
            item: `${siteConfig.url}/partenaires`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: partner.name,
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
      <main className="pb-24 pt-36">
        <div className="page-shell">
          <nav aria-label="Fil d’Ariane" className="text-xs text-white/45">
            <Link href="/">Accueil</Link> <span aria-hidden="true">›</span>{" "}
            <Link href="/partenaires">Partenaires</Link>{" "}
            <span aria-hidden="true">›</span> <span>{partner.name}</span>
          </nav>
          <div className="mt-12 grid gap-12 lg:grid-cols-[1.1fr_.9fr]">
            <article>
              <p className="eyebrow text-[#C9A86A]">
                {partnerCategories[partner.category]} · {partner.city}
              </p>
              <h1 className="mt-4 font-heading text-6xl sm:text-8xl">
                {partner.name}
              </h1>
              <p className="mt-8 whitespace-pre-line text-lg leading-9 text-white/60">
                {partner.description}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={partner.website_url!}
                  target="_blank"
                  rel="noopener"
                  className="rounded-full bg-[#C9A86A] px-6 py-3 font-semibold text-black"
                >
                  Visiter le site partenaire
                </a>
                <Link
                  href="/reservation"
                  className="rounded-full border border-white/20 px-6 py-3"
                >
                  Réserver votre séjour
                </Link>
              </div>
            </article>
            <aside className="relative min-h-96 overflow-hidden rounded-3xl bg-white/[.03]">
              {partner.image_url ? (
                <Image
                  src={partner.image_url}
                  alt={`${partner.name} à ${partner.city}`}
                  fill
                  preload
                  sizes="(max-width:1024px) 100vw,40vw"
                  className="object-cover"
                />
              ) : (
                <div className="grid size-full place-items-center font-heading text-8xl text-white/10">
                  {partner.name.charAt(0)}
                </div>
              )}
            </aside>
          </div>
          <p className="mt-16 border-t border-white/10 pt-6 text-xs leading-6 text-white/35">
            Partenariat vérifié par Absolu. Les horaires, tarifs et prestations
            du partenaire restent sous sa responsabilité et doivent être
            confirmés directement auprès de lui.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
export async function generateStaticParams() {
  return (await getPublishedPartners()).map((partner) => ({
    slug: partner.slug,
  }));
}
