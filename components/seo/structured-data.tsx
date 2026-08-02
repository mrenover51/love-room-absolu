import { siteConfig } from "@/lib/site-config";

const url = siteConfig.url;
const address = {
  "@type": "PostalAddress",
  streetAddress: "36 rue Pasteur",
  postalCode: "51190",
  addressLocality: "Avize",
  addressRegion: "Grand Est",
  addressCountry: "FR",
};

export function StructuredData() {
  const common = {
    name: siteConfig.commercialName,
    url,
    telephone: siteConfig.phone,
    email: siteConfig.email,
    address,
    image: { "@id": `${url}/#primary-image` },
  };
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Hotel", "@id": `${url}/#hotel`, ...common, parentOrganization: { "@id": `${url}/#organization` } },
      { "@type": "LocalBusiness", "@id": `${url}/#local-business`, ...common, parentOrganization: { "@id": `${url}/#organization` } },
      {
        "@type": "ImageObject",
        "@id": `${url}/#primary-image`,
        contentUrl: `${url}/images/optimized/lit.webp`,
        url: `${url}/images/optimized/lit.webp`,
        width: 1448,
        height: 1086,
        caption: "Suite romantique Absolu avec spa privatif",
      },
    ],
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replaceAll("<", "\\u003c") }} />;
}
