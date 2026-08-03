import Link from "next/link";
import { BeforeAfter } from "@/components/gallery/before-after";
import { Lightbox } from "@/components/gallery/lightbox";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { InteriorHero } from "@/components/shared/interior-hero";
import {
  atmospherePairs,
  luxuryGalleryImages,
} from "@/lib/gallery/gallery-data";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

export const metadata = pageMetadata({
  title: "Galerie de la Suite Absolu à Avize",
  description:
    "Explorez la Suite Absolu en images : baignoire balnéo, sauna privatif, coin café et ambiances lumineuses dans une galerie immersive.",
  path: "/galerie",
  image: "/images/optimized/lit.webp",
  imageAlt: "Lit de la Suite Absolu sous un éclairage romantique",
});

export default function GalleryPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ImageGallery",
        "@id": `${siteConfig.url}/galerie#gallery`,
        name: "Galerie de la Suite Absolu",
        description:
          "Photographies des espaces et équipements de la Suite Absolu à Avize.",
        url: `${siteConfig.url}/galerie`,
        associatedMedia: luxuryGalleryImages.map((image, index) => ({
          "@id": `${siteConfig.url}/galerie#image-${index + 1}`,
        })),
      },
      ...luxuryGalleryImages.map((image, index) => ({
        "@type": "ImageObject",
        "@id": `${siteConfig.url}/galerie#image-${index + 1}`,
        contentUrl: `${siteConfig.url}${image.src}`,
        url: `${siteConfig.url}${image.src}`,
        caption: image.caption,
        description: image.alt,
        name: image.alt,
        datePublished: image.publishedAt,
        representativeOfPage: index === 0,
        encodingFormat: "image/webp",
        isPartOf: { "@id": `${siteConfig.url}/galerie#gallery` },
      })),
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Accueil",
            item: siteConfig.url,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Galerie",
            item: `${siteConfig.url}/galerie`,
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replaceAll("<", "\u003c"),
        }}
      />
      <Header />
      <main>
        <InteriorHero
          image="/images/optimized/lit.webp"
          title="Galerie de la Suite Absolu"
          eyebrow="Une parenthèse en images"
          description="Explorez chaque espace, de la lumière naturelle aux ambiances du soir, puis imaginez votre propre séjour à Avize."
        />
        <section className="bg-[#080808] py-20 sm:py-28">
          <div className="page-shell">
            <div className="mb-12 max-w-3xl">
              <p className="eyebrow text-[#C9A86A]">Visite immersive</p>
              <h2 className="mt-4 font-heading text-5xl sm:text-6xl">
                Chaque détail compose l’expérience
              </h2>
              <p className="mt-6 leading-8 text-white/55">
                Filtrez les espaces, ouvrez une photo en plein écran, zoomez ou
                faites glisser sur mobile. Les images sont optimisées
                automatiquement selon votre écran afin de préserver leur
                précision sans ralentir la visite.
              </p>
            </div>
            <Lightbox images={luxuryGalleryImages} />
          </div>
        </section>
        <section className="bg-[#111] py-24">
          <div className="page-shell">
            <p className="eyebrow text-[#C9A86A]">Avant / après</p>
            <h2 className="mt-4 font-heading text-5xl sm:text-6xl">
              Un espace, deux atmosphères
            </h2>
            <p className="mt-5 max-w-2xl leading-8 text-white/50">
              Déplacez le curseur pour comparer la lumière naturelle et
              l’éclairage d’ambiance. Il ne s’agit pas d’une rénovation, mais de
              deux mises en lumière du même espace.
            </p>
            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              {atmospherePairs.map((pair) => (
                <BeforeAfter
                  key={pair.label}
                  before={luxuryGalleryImages[pair.after]}
                  after={luxuryGalleryImages[pair.before]}
                  label={pair.label}
                />
              ))}
            </div>
          </div>
        </section>
        <section className="relative overflow-hidden bg-[#EAE1D5] py-24 text-center text-[#201B18]">
          <div className="page-shell relative">
            <p className="eyebrow text-[#8B6B36]">
              La prochaine image peut être la vôtre
            </p>
            <h2 className="mx-auto mt-4 max-w-4xl font-heading text-6xl">
              Passez de la visite au séjour
            </h2>
            <p className="mx-auto mt-6 max-w-2xl leading-8 text-black/55">
              Consultez les dates disponibles et choisissez le moment où vous
              découvrirez la Suite Absolu autrement qu’en photo.
            </p>
            <Link
              href="/reservation"
              className="mt-9 inline-flex min-h-14 items-center bg-[#201B18] px-8 text-xs uppercase tracking-[.18em] text-white transition hover:bg-[#8B6B36]"
            >
              Voir les disponibilités
            </Link>
            <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-black/45">
              <Link href="/la-suite">Découvrir la suite</Link>
              <Link href="/equipements/baignoire-balneo">Baignoire balnéo</Link>
              <Link href="/equipements/sauna">Sauna privatif</Link>
              <Link href="/avis">Avis clients</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
