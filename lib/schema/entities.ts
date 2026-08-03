import type { StaySettings } from "@/lib/stay-config";
import { siteConfig } from "@/lib/site-config";
import { validateJsonLd, type JsonLdGraph, type JsonLdNode } from "./validator";
const url = siteConfig.url,
  organizationId = `${url}/#organization`,
  lodgingId = `${url}/#lodging`,
  websiteId = `${url}/#website`,
  imageId = `${url}/#primary-image`;
export const schemaIds = { organizationId, lodgingId, websiteId, imageId };
export const address = {
  "@type": "PostalAddress",
  streetAddress: "36 rue Pasteur",
  postalCode: "51190",
  addressLocality: "Avize",
  addressRegion: "Grand Est",
  addressCountry: "FR",
} as const;
export function rootSchema(stay: StaySettings): JsonLdGraph {
  const lodging: JsonLdNode = {
    "@type": ["Hotel", "LodgingBusiness", "LocalBusiness"],
    "@id": lodgingId,
    name: siteConfig.commercialName,
    url,
    description:
      "Suite romantique avec baignoire balnéo privative, sauna infrarouge et ambiance lumineuse à Avize.",
    image: { "@id": imageId },
    address,
    telephone: siteConfig.phone,
    email: siteConfig.email,
    parentOrganization: { "@id": organizationId },
    containedInPlace: { "@id": `${url}/#avize` },
    amenityFeature: [
      {
        "@type": "LocationFeatureSpecification",
        name: "Baignoire balnéo privative",
        value: true,
      },
      {
        "@type": "LocationFeatureSpecification",
        name: "Sauna infrarouge privatif",
        value: true,
      },
      { "@type": "LocationFeatureSpecification", name: "Wi-Fi", value: true },
      {
        "@type": "LocationFeatureSpecification",
        name: "Coin café",
        value: true,
      },
    ],
    floorSize: { "@type": "QuantitativeValue", value: 35, unitCode: "MTK" },
    numberOfRooms: 1,
    checkinTime: stay.checkIn,
    checkoutTime: stay.checkOut,
  };
  if (siteConfig.latitude !== undefined && siteConfig.longitude !== undefined)
    lodging.geo = {
      "@type": "GeoCoordinates",
      latitude: siteConfig.latitude,
      longitude: siteConfig.longitude,
    };
  if (siteConfig.startingPrice !== undefined) {
    lodging.priceRange = `À partir de ${siteConfig.startingPrice} EUR`;
    lodging.makesOffer = { "@id": `${url}/#direct-offer` };
  }
  const graph: JsonLdNode[] = [
    {
      "@type": "Organization",
      "@id": organizationId,
      name: siteConfig.commercialName,
      legalName: "SCI MICAMÉLIA",
      url,
      telephone: siteConfig.phone,
      email: siteConfig.email,
      address,
      logo: { "@id": imageId },
    },
    lodging,
    {
      "@type": "Place",
      "@id": `${url}/#avize`,
      name: "Avize",
      address: {
        "@type": "PostalAddress",
        postalCode: "51190",
        addressLocality: "Avize",
        addressRegion: "Grand Est",
        addressCountry: "FR",
      },
    },
    {
      "@type": "ImageObject",
      "@id": imageId,
      contentUrl: `${url}/images/optimized/lit.webp`,
      url: `${url}/images/optimized/lit.webp`,
      width: 1448,
      height: 1086,
      caption: "Suite romantique Absolu à Avize",
      representativeOfPage: true,
    },
    {
      "@type": "WebSite",
      "@id": websiteId,
      name: siteConfig.commercialName,
      url,
      inLanguage: "fr-FR",
      publisher: { "@id": organizationId },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${url}/recherche?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "WebPage",
      "@id": `${url}/#webpage`,
      url,
      name: "Absolu — Suite romantique à Avize",
      isPartOf: { "@id": websiteId },
      about: { "@id": lodgingId },
      primaryImageOfPage: { "@id": imageId },
      inLanguage: "fr-FR",
    },
    {
      "@type": "Product",
      "@id": `${url}/#suite-product`,
      name: "Séjour dans la Suite Absolu",
      image: { "@id": imageId },
      brand: { "@id": organizationId },
    },
  ];
  if (siteConfig.startingPrice !== undefined)
    graph.push({
      "@type": "Offer",
      "@id": `${url}/#direct-offer`,
      url: `${url}/reservation`,
      price: siteConfig.startingPrice,
      priceCurrency: "EUR",
      availability: "https://schema.org/LimitedAvailability",
      seller: { "@id": organizationId },
      itemOffered: { "@id": `${url}/#suite-product` },
    });
  return validateJsonLd({ "@context": "https://schema.org", "@graph": graph });
}
export const schemaFactories = {
  breadcrumb: (items: { name: string; url?: string }[]) => ({
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      ...(item.url ? { item: item.url } : {}),
    })),
  }),
  event: (data: { name: string; startDate: string; location: JsonLdNode }) => ({
    "@type": "Event",
    ...data,
  }),
  article: (data: JsonLdNode) => ({ "@type": "Article", ...data }),
  blogPosting: (data: JsonLdNode) => ({ "@type": "BlogPosting", ...data }),
  video: (data: JsonLdNode) => ({ "@type": "VideoObject", ...data }),
  faq: (mainEntity: JsonLdNode[]) => ({ "@type": "FAQPage", mainEntity }),
} as const;
