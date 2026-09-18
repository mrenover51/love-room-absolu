import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n/config";
import { indexableTranslatedRoutes, localeAlternates, localizedPath } from "@/lib/i18n/routing";
import { siteConfig } from "@/lib/site-config";

const images: Partial<Record<(typeof indexableTranslatedRoutes)[number],string[]>>={
  home:["lit.webp","salledebain.webp","sauna.webp"],suite:["entree2.webp","lit.webp"],
  equipment:["salledebain.webp","sauna.webp","douche.webp"],balneo:["salledebain.webp"],
  sauna:["sauna.webp"],gallery:["lit.webp","sauna.webp","douche.webp"],
};

export default function sitemap():MetadataRoute.Sitemap{
  return locales.flatMap((locale)=>indexableTranslatedRoutes.map((route)=>({
    url:`${siteConfig.url}${localizedPath(locale,route)}`,
    changeFrequency:route==="reservation"?"daily" as const:"monthly" as const,
    priority:route==="home"?1:(route==="reservation"||route==="suite"?0.9:0.7),
    alternates:{languages:{...localeAlternates(route),"x-default":`${siteConfig.url}${localizedPath("fr",route)}`}},
    ...(images[route]?{images:images[route]!.map((image)=>`${siteConfig.url}/images/optimized/${image}`)}:{}),
  })));
}
