import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";
import { localCities } from "@/lib/local-seo/cities";
import { searchIntents } from "@/lib/seo-intents/intents";
import { magazineArticles, magazineCategories, magazineTags } from "@/lib/magazine/articles";
const routes = [
  { path: "", priority: 1, changeFrequency: "weekly" as const, images: ["lit.webp", "salledebain.webp", "sauna.webp"] },
  { path: "/la-suite", priority: 0.9, changeFrequency: "monthly" as const, images: ["entree2.webp", "lit.webp", "salledebain.webp"] },
  { path: "/galerie", priority: 0.8, changeFrequency: "monthly" as const, images: ["lit.webp", "sauna.webp", "douche.webp"] },
  { path: "/equipements", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/bons-cadeaux", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/blog", priority: 0.7, changeFrequency: "weekly" as const },
  { path: "/contact", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/faq", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/reservation", priority: 0.9, changeFrequency: "daily" as const },
  { path: "/love-room", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/experiences-romantiques", priority: 0.8, changeFrequency: "monthly" as const },
];
export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes=routes.map(({ path, images, ...route }) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: new Date(),
    ...route,
    alternates: { languages: { fr: `${siteConfig.url}${path}` } },
    images: images?.map((image) => `${siteConfig.url}/images/optimized/${image}`),
  }));
  const localRoutes=localCities.map(city=>({url:`${siteConfig.url}/love-room/${city.slug}`,lastModified:new Date(),changeFrequency:"monthly" as const,priority:0.7,alternates:{languages:{fr:`${siteConfig.url}/love-room/${city.slug}`}},images:[`${siteConfig.url}${city.image}`]}));
  const intentRoutes=searchIntents.map(intent=>({url:`${siteConfig.url}/experiences-romantiques/${intent.slug}`,lastModified:new Date(),changeFrequency:"monthly" as const,priority:0.75,alternates:{languages:{fr:`${siteConfig.url}/experiences-romantiques/${intent.slug}`}},images:[`${siteConfig.url}${intent.image}`]}));
  const toSlug=(value:string)=>value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-");
  const articleRoutes=magazineArticles.map(article=>({url:`${siteConfig.url}/blog/${article.slug}`,lastModified:article.modified,changeFrequency:"monthly" as const,priority:article.featured?0.8:0.65,alternates:{languages:{fr:`${siteConfig.url}/blog/${article.slug}`}},images:[`${siteConfig.url}${article.image}`]}));
  const archiveRoutes=[...magazineCategories.map(category=>`/blog/categorie/${toSlug(category)}`),...magazineTags.map(tag=>`/blog/tag/${toSlug(tag)}`),"/blog/auteur/redaction-absolu"].map(path=>({url:`${siteConfig.url}${path}`,lastModified:new Date(),changeFrequency:"weekly" as const,priority:0.5}));
  return [...staticRoutes,...localRoutes,...intentRoutes,...articleRoutes,...archiveRoutes];
}
