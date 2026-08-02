import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Absolu — Love Room",
    short_name: "Absolu",
    description: "Suite romantique privative avec espace bien-être.",
    id: `${siteConfig.url}/`,
    start_url: `${siteConfig.url}/`,
    scope: `${siteConfig.url}/`,
    display: "standalone",
    background_color: "#090909",
    theme_color: "#090909",
    lang: "fr",
    orientation: "portrait-primary",
    categories: ["travel", "lifestyle"],
    icons: [
      { src: `${siteConfig.url}/icons/icon-192.svg`, sizes: "192x192", type: "image/svg+xml", purpose: "any" },
      { src: `${siteConfig.url}/icons/icon-512.svg`, sizes: "512x512", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
