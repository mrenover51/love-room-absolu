import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";
import { localCities } from "@/lib/local-seo/cities";
import { searchIntents } from "@/lib/seo-intents/intents";
import {
  magazineArticles,
  magazineCategories,
  magazineTags,
} from "@/lib/magazine/articles";
import { equipmentItems } from "@/lib/equipment/equipment-data";
import { restaurants } from "@/lib/restaurants/restaurants";
import { touristAttractions } from "@/lib/tourism/attractions";
import { resourcePillars } from "@/lib/ai-seo/resources";
import { getPublishedReviews } from "@/lib/reviews/reviews";
import { getPublishedPartners } from "@/lib/partners/partners";
import { seasonalEvents } from "@/lib/events/events";
import { giftThemes } from "@/lib/gifts/catalog";
import { conversationalAnswers } from "@/lib/ai-seo/conversations";
import { locales } from "@/lib/i18n/config";
const routes = [
  {
    path: "",
    priority: 1,
    changeFrequency: "weekly" as const,
    images: ["lit.webp", "salledebain.webp", "sauna.webp"],
  },
  {
    path: "/la-suite",
    priority: 0.9,
    changeFrequency: "monthly" as const,
    images: ["entree2.webp", "lit.webp", "salledebain.webp"],
  },
  {
    path: "/galerie",
    priority: 0.8,
    changeFrequency: "monthly" as const,
    images: ["lit.webp", "sauna.webp", "douche.webp"],
  },
  { path: "/videos", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/equipements", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/bons-cadeaux", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/blog", priority: 0.7, changeFrequency: "weekly" as const },
  { path: "/contact", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/faq", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/reservation", priority: 0.9, changeFrequency: "daily" as const },
  { path: "/love-room", priority: 0.8, changeFrequency: "monthly" as const },
  {
    path: "/experiences-romantiques",
    priority: 0.8,
    changeFrequency: "monthly" as const,
  },
  { path: "/plan-du-site", priority: 0.5, changeFrequency: "weekly" as const },
  { path: "/restaurants", priority: 0.8, changeFrequency: "weekly" as const },
  {
    path: "/guide-touristique",
    priority: 0.8,
    changeFrequency: "weekly" as const,
  },
  {
    path: "/carte-touristique",
    priority: 0.75,
    changeFrequency: "weekly" as const,
  },
  { path: "/ressources", priority: 0.8, changeFrequency: "weekly" as const },
  { path: "/avis", priority: 0.8, changeFrequency: "weekly" as const },
  { path: "/glossaire", priority: 0.6, changeFrequency: "monthly" as const },
  {
    path: "/lexique-love-room",
    priority: 0.6,
    changeFrequency: "monthly" as const,
  },
  {
    path: "/comparateur-love-room",
    priority: 0.75,
    changeFrequency: "monthly" as const,
  },
  { path: "/partenaires", priority: 0.6, changeFrequency: "weekly" as const },
  { path: "/presse", priority: 0.55, changeFrequency: "monthly" as const },
  { path: "/medias", priority: 0.5, changeFrequency: "monthly" as const },
  { path: "/influenceurs", priority: 0.5, changeFrequency: "monthly" as const },
  {
    path: "/communiques-presse",
    priority: 0.5,
    changeFrequency: "monthly" as const,
  },
  { path: "/evenements", priority: 0.75, changeFrequency: "weekly" as const },
  { path: "/reponses", priority: 0.8, changeFrequency: "monthly" as const },
];
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [reviews, partners] = await Promise.all([
    getPublishedReviews(),
    getPublishedPartners(),
  ]);
  const staticRoutes = routes.map(({ path, images, ...route }) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: new Date(),
    ...route,
    alternates: { languages: { fr: `${siteConfig.url}${path}` } },
    images: images?.map(
      (image) => `${siteConfig.url}/images/optimized/${image}`,
    ),
  }));
  const giftRoutes = giftThemes.map((gift) => ({ url: `${siteConfig.url}/bons-cadeaux/${gift.slug}`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.75, alternates: { languages: { fr: `${siteConfig.url}/bons-cadeaux/${gift.slug}` } }, images: [`${siteConfig.url}${gift.image}`] }));
  const answerRoutes = conversationalAnswers.map((item) => ({ url: `${siteConfig.url}/reponses/${item.slug}`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.78, alternates: { languages: { fr: `${siteConfig.url}/reponses/${item.slug}` } } }));
  const internationalRoutes = locales.flatMap((locale) => ["", "/blog", "/guides", "/faq"].map((path) => ({ url: `${siteConfig.url}/${locale}${path}`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: path ? 0.65 : 0.82, alternates: { languages: Object.fromEntries(locales.map(code => [code, `${siteConfig.url}/${code}${path}`])) } })));
  const localRoutes = localCities.map((city) => ({
    url: `${siteConfig.url}/love-room/${city.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
    alternates: {
      languages: { fr: `${siteConfig.url}/love-room/${city.slug}` },
    },
    images: [`${siteConfig.url}${city.image}`],
  }));
  const intentRoutes = searchIntents.map((intent) => ({
    url: `${siteConfig.url}/experiences-romantiques/${intent.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.75,
    alternates: {
      languages: {
        fr: `${siteConfig.url}/experiences-romantiques/${intent.slug}`,
      },
    },
    images: [`${siteConfig.url}${intent.image}`],
  }));
  const toSlug = (value: string) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-");
  const articleRoutes = magazineArticles.map((article) => ({
    url: `${siteConfig.url}/blog/${article.slug}`,
    lastModified: article.modified,
    changeFrequency: "monthly" as const,
    priority: article.featured ? 0.8 : 0.65,
    alternates: { languages: { fr: `${siteConfig.url}/blog/${article.slug}` } },
    images: [`${siteConfig.url}${article.image}`],
  }));
  const archiveRoutes = [
    ...magazineCategories.map(
      (category) => `/blog/categorie/${toSlug(category)}`,
    ),
    ...magazineTags.map((tag) => `/blog/tag/${toSlug(tag)}`),
    "/blog/auteur/redaction-absolu",
  ].map((path) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));
  const equipmentRoutes = equipmentItems.map((item) => ({
    url: `${siteConfig.url}/equipements/${item.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: item.status === "confirmed" ? 0.75 : 0.55,
    alternates: {
      languages: { fr: `${siteConfig.url}/equipements/${item.slug}` },
    },
    images: item.gallery.map((image) => `${siteConfig.url}${image}`),
  }));
  const restaurantRoutes = restaurants.map((item) => ({
    url: `${siteConfig.url}/restaurants/${item.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.65,
    alternates: {
      languages: { fr: `${siteConfig.url}/restaurants/${item.slug}` },
    },
    images: [`${siteConfig.url}/images/restaurant-directory-hero.png`],
  }));
  const restaurantSelections = [
    "top-10-romantiques",
    "top-champagne",
    "top-brunch",
    "top-terrasse",
  ].map((slug) => ({
    url: `${siteConfig.url}/restaurants/selection/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.65,
  }));
  const attractionRoutes = touristAttractions.map((item) => ({
    url: `${siteConfig.url}/guide-touristique/${item.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.65,
    alternates: {
      languages: { fr: `${siteConfig.url}/guide-touristique/${item.slug}` },
    },
    images: [`${siteConfig.url}/images/tourism-guide-hero.png`],
  }));
  const tourismSelections = [
    "top-activites",
    "top-romantique",
    "top-detente",
  ].map((slug) => ({
    url: `${siteConfig.url}/guide-touristique/selection/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.65,
  }));
  const resourceRoutes = resourcePillars.map((item) => ({
    url: `${siteConfig.url}/ressources/${item.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.75,
    alternates: {
      languages: { fr: `${siteConfig.url}/ressources/${item.slug}` },
    },
  }));
  const reviewRoutes = reviews.map((item) => ({
    url: `${siteConfig.url}/avis/${item.slug}`,
    lastModified: new Date(item.published_at),
    changeFrequency: "monthly" as const,
    priority: item.featured ? 0.75 : 0.6,
    alternates: { languages: { fr: `${siteConfig.url}/avis/${item.slug}` } },
  }));
  const partnerRoutes = partners.map((item) => ({
    url: `${siteConfig.url}/partenaires/${item.slug}`,
    lastModified: item.published_at ? new Date(item.published_at) : new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
    alternates: {
      languages: { fr: `${siteConfig.url}/partenaires/${item.slug}` },
    },
    ...(item.image_url ? { images: [item.image_url] } : {}),
  }));
  const eventRoutes = seasonalEvents.map((item) => ({
    url: `${siteConfig.url}/evenements/${item.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.75,
    alternates: {
      languages: { fr: `${siteConfig.url}/evenements/${item.slug}` },
    },
    images: item.gallery.map((image) => `${siteConfig.url}${image}`),
  }));
  return [
    ...staticRoutes,
    ...giftRoutes,
    ...answerRoutes,
    ...internationalRoutes,
    ...localRoutes,
    ...intentRoutes,
    ...articleRoutes,
    ...archiveRoutes,
    ...equipmentRoutes,
    ...restaurantRoutes,
    ...restaurantSelections,
    ...attractionRoutes,
    ...tourismSelections,
    ...resourceRoutes,
    ...reviewRoutes,
    ...partnerRoutes,
    ...eventRoutes,
  ];
}
