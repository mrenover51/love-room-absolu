import Link from "next/link";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { equipmentItems } from "@/lib/equipment/equipment-data";
import { localCities } from "@/lib/local-seo/cities";
import {
  magazineArticles,
  magazineCategories,
  magazineTags,
} from "@/lib/magazine/articles";
import { pageMetadata } from "@/lib/seo";
import { searchIntents } from "@/lib/seo-intents/intents";
import { restaurants } from "@/lib/restaurants/restaurants";
import { touristAttractions } from "@/lib/tourism/attractions";
import { resourcePillars } from "@/lib/ai-seo/resources";
import { getPublishedReviews } from "@/lib/reviews/reviews";
import { semanticClusters } from "@/lib/seo/internal-links";

export const metadata = pageMetadata({
  title: "Plan du site | Absolu",
  description:
    "Retrouvez toutes les pages, destinations, expériences, équipements et guides du magazine Absolu.",
  path: "/plan-du-site",
});
const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");
const mainPages = [
  { href: "/la-suite", label: "La suite Absolu" },
  { href: "/galerie", label: "Galerie" },
  { href: "/videos", label: "Vidéos immersives" },
  { href: "/reservation", label: "Réserver" },
  { href: "/bons-cadeaux", label: "Bons cadeaux" },
  { href: "/faq", label: "Questions fréquentes" },
  { href: "/contact", label: "Contact" },
];

function LinkSection({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <section>
      <h2 className="font-heading text-4xl">{title}</h2>
      <ul className="mt-6 columns-1 gap-x-10 space-y-3 text-sm text-white/60 sm:columns-2 lg:columns-3">
        {links.map((link) => (
          <li key={link.href} className="break-inside-avoid">
            <Link href={link.href} className="hover:text-[#C9A86A]">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default async function SiteMapPage() {
  const reviews = await getPublishedReviews();
  return (
    <>
      <Header />
      <main className="page-shell pb-24 pt-36">
        <Breadcrumb current="Plan du site" />
        <p className="eyebrow mt-10 text-[#C9A86A]">Navigation exhaustive</p>
        <h1 className="mt-4 font-heading text-6xl sm:text-8xl">Plan du site</h1>
        <p className="mt-6 max-w-2xl leading-8 text-white/60">
          Explorez l’ensemble de nos destinations, expériences romantiques,
          équipements et conseils en Champagne.
        </p>
        <div className="mt-20 space-y-20">
          <LinkSection
            title="Clusters sémantiques"
            links={semanticClusters.map((cluster) => ({
              href: cluster.links[0].href,
              label: cluster.label,
            }))}
          />
          <LinkSection title="Absolu" links={mainPages} />
          <LinkSection
            title="Avis clients vérifiés"
            links={[
              { href: "/avis", label: "Tous les avis clients" },
              ...reviews.map((review) => ({
                href: `/avis/${review.slug}`,
                label: review.title,
              })),
            ]}
          />
          <LinkSection
            title="Love Rooms et villes proches"
            links={[
              { href: "/love-room", label: "Toutes les destinations" },
              ...localCities.map((city) => ({
                href: `/love-room/${city.slug}`,
                label: `Love Room près de ${city.name}`,
              })),
            ]}
          />
          <LinkSection
            title="Expériences romantiques"
            links={[
              {
                href: "/experiences-romantiques",
                label: "Toutes les inspirations",
              },
              ...searchIntents.map((intent) => ({
                href: `/experiences-romantiques/${intent.slug}`,
                label: intent.keyword,
              })),
            ]}
          />
          <LinkSection
            title="Équipements de la suite"
            links={[
              { href: "/equipements", label: "Tous les équipements" },
              ...equipmentItems.map((item) => ({
                href: `/equipements/${item.slug}`,
                label: item.name,
              })),
            ]}
          />
          <LinkSection
            title="Restaurants autour d’Absolu"
            links={[
              { href: "/restaurants", label: "Annuaire des restaurants" },
              ...restaurants.map((item) => ({
                href: `/restaurants/${item.slug}`,
                label: `${item.name} — ${item.city}`,
              })),
            ]}
          />
          <LinkSection
            title="Guide touristique de la Champagne"
            links={[
              { href: "/guide-touristique", label: "Toutes les activités" },
              ...touristAttractions.map((item) => ({
                href: `/guide-touristique/${item.slug}`,
                label: item.name,
              })),
            ]}
          />
          <LinkSection
            title="Ressources et comparatifs"
            links={[
              { href: "/ressources", label: "Centre de ressources" },
              {
                href: "/comparateur-love-room",
                label: "Comparateur Love Room",
              },
              { href: "/glossaire", label: "Glossaire" },
              { href: "/lexique-love-room", label: "Lexique Love Room" },
              ...resourcePillars.map((item) => ({
                href: `/ressources/${item.slug}`,
                label: item.title,
              })),
            ]}
          />
          <LinkSection
            title="Magazine et conseils"
            links={[
              { href: "/blog", label: "Le magazine Absolu" },
              {
                href: "/blog/auteur/redaction-absolu",
                label: "La rédaction Absolu",
              },
              ...magazineCategories.map((category) => ({
                href: `/blog/categorie/${slugify(category)}`,
                label: `Dossier ${category}`,
              })),
              ...magazineTags.map((tag) => ({
                href: `/blog/tag/${slugify(tag)}`,
                label: `Conseils ${tag}`,
              })),
              ...magazineArticles.map((article) => ({
                href: `/blog/${article.slug}`,
                label: article.title,
              })),
            ]}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
