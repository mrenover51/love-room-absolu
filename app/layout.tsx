import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/lib/site-config";
import { ServiceWorkerRegistration } from "@/components/pwa/service-worker-registration";
import { ConsentManager } from "@/components/privacy/consent-manager";
import { ThemeControl } from "@/components/theme/theme-control";
import { analyticsConfig } from "@/lib/analytics/providers";

const serif = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const sans = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const provisionalUrl = siteConfig.url;

export const metadata: Metadata = {
  manifest: "/manifest.webmanifest",
  metadataBase: new URL(provisionalUrl),
  title: "Absolu | Love Room avec jacuzzi et sauna privatif",
  description:
    "Découvrez Absolu, une Love Room haut de gamme avec jacuzzi, sauna infrarouge et ambiance romantique, pensée pour une parenthèse à deux.",
  keywords: [
    "love room",
    "suite romantique",
    "jacuzzi privatif",
    "sauna infrarouge",
    "week-end en amoureux",
  ],
  alternates: { canonical: provisionalUrl },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: provisionalUrl,
    siteName: "Absolu",
    title: "Absolu | Love Room avec jacuzzi et sauna privatif",
    description:
      "Une suite romantique haut de gamme avec jacuzzi, sauna et ambiance lumineuse, pensée pour deux.",
    images: [{ url: "/images/optimized/lit.webp", width: 1448, height: 1086, alt: "La suite romantique Absolu" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Absolu | Love Room avec jacuzzi et sauna privatif",
    description: "Une parenthèse hors du temps, pensée pour deux.",
    images: ["/images/optimized/lit.webp"],
  },
  verification: analyticsConfig.searchConsoleVerification ? { google: analyticsConfig.searchConsoleVerification } : undefined,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const structuredData: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: "Absolu",
    url: provisionalUrl,
    description: "Suite romantique avec jacuzzi privatif, sauna infrarouge et ambiance lumineuse.",
    image: [`${provisionalUrl}/images/optimized/lit.webp`, `${provisionalUrl}/images/optimized/salledebain.webp`],
    amenityFeature: [
      { "@type": "LocationFeatureSpecification", name: "Jacuzzi privatif", value: true },
      { "@type": "LocationFeatureSpecification", name: "Sauna infrarouge", value: true },
      { "@type": "LocationFeatureSpecification", name: "Wi-Fi", value: true },
      { "@type": "LocationFeatureSpecification", name: "Kitchenette équipée", value: true },
    ],
    floorSize: { "@type": "QuantitativeValue", value: 35, unitCode: "MTK" },
    numberOfRooms: 1,
  };
  if(siteConfig.address) structuredData.address={"@type":"PostalAddress",streetAddress:siteConfig.address,addressLocality:siteConfig.city,addressRegion:siteConfig.region};
  if(siteConfig.phone) structuredData.telephone=siteConfig.phone;
  if(siteConfig.email) structuredData.email=siteConfig.email;
  if(siteConfig.latitude!==undefined&&siteConfig.longitude!==undefined) structuredData.geo={"@type":"GeoCoordinates",latitude:siteConfig.latitude,longitude:siteConfig.longitude};
  if(siteConfig.startingPrice!==undefined) structuredData.priceRange=`À partir de ${siteConfig.startingPrice} EUR`;
  const graph={"@context":"https://schema.org","@graph":[structuredData,{"@type":"Organization","@id":`${provisionalUrl}/#organization`,name:siteConfig.commercialName,url:provisionalUrl},{"@type":"WebSite","@id":`${provisionalUrl}/#website`,name:siteConfig.commercialName,url:provisionalUrl,inLanguage:"fr-FR",publisher:{"@id":`${provisionalUrl}/#organization`},potentialAction:{"@type":"SearchAction",target:{"@type":"EntryPoint",urlTemplate:`${provisionalUrl}/recherche?q={search_term_string}`},"query-input":"required name=search_term_string"}}]};
  return (
    <html lang="fr" suppressHydrationWarning className={`${serif.variable} ${sans.variable} dark antialiased`}>
      <body><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replaceAll("<", "\\u003c") }} />{children}<ConsentManager/><ThemeControl/><ServiceWorkerRegistration/></body>
    </html>
  );
}
