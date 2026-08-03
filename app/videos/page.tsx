import Link from "next/link";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { VideoPlatform } from "@/components/video/video-platform";
import { isoDuration, publishedVideos } from "@/lib/video/catalog";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

export const metadata = pageMetadata({
  title: "Vidéos de la Suite Absolu à Avize",
  description:
    "Découvrez les vidéos immersives de la Suite Absolu : visite, baignoire balnéo, sauna privatif et ambiances lumineuses en Champagne.",
  path: "/videos",
  image: "/images/optimized/lit.webp",
  imageAlt: "Aperçu de la Suite Absolu à Avize",
});

export default function VideosPage() {
  const schema = publishedVideos.length
    ? {
        "@context": "https://schema.org",
        "@graph": publishedVideos.flatMap((video) => {
          const id = `${siteConfig.url}/videos#${video.slug}`;
          return [
            {
              "@type": "VideoObject",
              "@id": id,
              name: video.title,
              description: video.description,
              thumbnailUrl: [`${siteConfig.url}${video.poster}`],
              uploadDate: video.uploadDate,
              duration: isoDuration(video.durationSeconds),
              contentUrl:
                video.provider === "local"
                  ? `${siteConfig.url}${video.source}`
                  : undefined,
              embedUrl:
                video.provider === "youtube"
                  ? `https://www.youtube-nocookie.com/embed/${video.source}`
                  : video.provider === "vimeo"
                    ? `https://player.vimeo.com/video/${video.source}`
                    : undefined,
              inLanguage: "fr-FR",
            },
            ...video.chapters.map((chapter, index) => ({
              "@type": "Clip",
              "@id": `${id}-clip-${index + 1}`,
              name: chapter.title,
              startOffset: chapter.startOffset,
              endOffset: chapter.endOffset,
              video: { "@id": id },
            })),
          ];
        }),
      }
    : null;
  return (
    <>
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema).replaceAll("<", "\u003c"),
          }}
        />
      )}
      <Header />
      <main>
        <header className="page-shell pb-16 pt-36">
          <Breadcrumb current="Vidéos" />
          <p className="eyebrow mt-12 text-[#C9A86A]">Absolu en mouvement</p>
          <h1 className="mt-4 max-w-5xl font-heading text-7xl sm:text-8xl">
            Visites vidéo immersives
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-white/60">
            Découvrez bientôt la suite, ses équipements privatifs et ses
            ambiances à travers des films chapitrés et sous-titrés, pensés pour
            tous les écrans.
          </p>
        </header>
        <section className="bg-[#080808] py-20">
          <div className="page-shell">
            <VideoPlatform videos={publishedVideos} />
          </div>
        </section>
        <section className="bg-[#EAE1D5] py-24 text-center text-[#201B18]">
          <div className="page-shell">
            <p className="eyebrow text-[#8B6B36]">Voir autrement</p>
            <h2 className="mt-4 font-heading text-6xl">
              Explorez dès maintenant en images
            </h2>
            <p className="mx-auto mt-6 max-w-2xl leading-8 text-black/55">
              La galerie photographique présente les espaces réels pendant la
              préparation des premières vidéos.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-4">
              <Link
                href="/galerie"
                className="inline-flex min-h-14 items-center bg-[#201B18] px-8 text-xs uppercase tracking-[.18em] text-white"
              >
                Ouvrir la galerie
              </Link>
              <Link
                href="/reservation"
                className="inline-flex min-h-14 items-center border border-black/20 px-8 text-xs uppercase tracking-[.18em]"
              >
                Voir les disponibilités
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
