import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/site-config";
import { locales } from "@/lib/i18n/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/", "/maintenance", "/offline", "/recherche", "/reservation/confirmation", "/reservation/succes", "/reservation/annulee", "/reservation/indisponible"],
    },
    sitemap: [`${siteConfig.url}/sitemap.xml`, ...locales.map(locale => `${siteConfig.url}/sitemaps/${locale}/sitemap.xml`)],
    host: siteConfig.url,
  };
}
