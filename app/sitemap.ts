import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";
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
];
export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map(({ path, images, ...route }) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: new Date(),
    ...route,
    alternates: { languages: { fr: `${siteConfig.url}${path}` } },
    images: images?.map((image) => `${siteConfig.url}/images/optimized/${image}`),
  }));
}
