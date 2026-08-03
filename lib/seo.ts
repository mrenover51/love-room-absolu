import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

export const absoluteUrl = (path = "/") =>
  new URL(path, `${siteConfig.url}/`).toString();

type PageMetadataOptions = {
  title: string;
  description: string;
  path: string;
  index?: boolean;
  image?: string;
  imageAlt?: string;
};

/** A single source of truth for canonical, hreflang, Open Graph and X cards. */
export function pageMetadata({
  title,
  description,
  path,
  index = true,
  image = "/images/optimized/lit.webp",
  imageAlt = "Suite romantique Absolu à Avize",
}: PageMetadataOptions): Metadata {
  const canonical = absoluteUrl(path);
  const socialImage = absoluteUrl(image);

  return {
    title,
    description,
    alternates: {
      canonical,
      // Ready for translated URLs: add a locale here when its route is published.
      languages: { "fr-FR": canonical, "x-default": canonical },
    },
    robots: {
      index,
      follow: true,
      googleBot: {
        index,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      type: "website",
      locale: "fr_FR",
      siteName: siteConfig.commercialName,
      title,
      description,
      url: canonical,
      images: [
        {
          url: socialImage,
          width: image === "/images/optimized/lit.webp" ? 1448 : undefined,
          height: image === "/images/optimized/lit.webp" ? 1086 : undefined,
          alt: imageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [{ url: socialImage, alt: imageAlt }],
    },
  };
}
