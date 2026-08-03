import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/lib/site-config";
import { ServiceWorkerRegistration } from "@/components/pwa/service-worker-registration";
import { ConsentManager } from "@/components/privacy/consent-manager";
import { ThemeControl } from "@/components/theme/theme-control";
import { analyticsConfig } from "@/lib/analytics/providers";
import { getStaySettings } from "@/lib/stay-settings";
import { StructuredData } from "@/components/seo/structured-data";
import { DeferredBookingAssistant } from "@/components/performance/deferred-booking-assistant";
import { CroLayer } from "@/components/cro/cro-layer";
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
const url = siteConfig.url;
export const metadata: Metadata = {
  manifest: "/manifest.webmanifest",
  metadataBase: new URL(url),
  title: "Absolu | Love Room avec baignoire balnéo et sauna privatif",
  description:
    "Découvrez Absolu, une Love Room haut de gamme avec baignoire balnéo, sauna infrarouge et ambiance romantique, pensée pour une parenthèse à deux.",
  keywords: [
    "love room",
    "suite romantique",
    "baignoire balnéo privative",
    "sauna infrarouge",
    "week-end en amoureux",
    "séjour romantique en Champagne",
  ],
  alternates: { canonical: url, languages: { "fr-FR": url, "x-default": url } },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url,
    siteName: siteConfig.commercialName,
    title: "Absolu | Love Room avec baignoire balnéo et sauna privatif",
    description:
      "Une suite romantique haut de gamme avec baignoire balnéo et sauna privatifs à Avize.",
    images: [
      {
        url: `${url}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "Suite romantique Absolu à Avize",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: process.env.NEXT_PUBLIC_TWITTER_SITE,
    creator: process.env.NEXT_PUBLIC_TWITTER_CREATOR,
    title: "Absolu | Love Room avec spa privatif",
    description: "Une parenthèse romantique à Avize, au cœur de la Champagne.",
    images: [
      { url: `${url}/opengraph-image`, alt: "Suite romantique Absolu à Avize" },
    ],
  },
  facebook: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID
    ? { appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID }
    : undefined,
  verification: {
    google: analyticsConfig.searchConsoleVerification,
    other: {
      ...(process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
        ? { "msvalidate.01": [process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION] }
        : {}),
    },
  },
};
export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const staySettings = await getStaySettings();
  return (
    <html
      lang="fr"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${serif.variable} ${sans.variable} dark antialiased`}
    >
      <body>
        <StructuredData staySettings={staySettings} />
        {children}
        <CroLayer />
        <DeferredBookingAssistant />
        <ConsentManager />
        <ThemeControl />
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
