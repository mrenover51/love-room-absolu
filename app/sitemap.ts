import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";
const paths = ["", "/la-suite", "/galerie", "/equipements", "/bons-cadeaux", "/blog", "/contact", "/faq", "/reservation", "/mentions-legales", "/politique-confidentialite", "/conditions"];
export default function sitemap(): MetadataRoute.Sitemap { return paths.map((path, index) => { const legal = ["/mentions-legales", "/politique-confidentialite", "/conditions"].includes(path); return { url: `${siteConfig.url}${path}`, lastModified: new Date(), changeFrequency: index === 0 ? "weekly" : "monthly", priority: index === 0 ? 1 : legal ? 0.5 : 0.8 }; }); }
