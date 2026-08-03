import Image from "next/image";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata({
  title: "Médiathèque officielle Love Room Absolu",
  description:
    "Consultez et téléchargez les photographies officielles de la Suite Absolu à Avize pour vos contenus presse et média.",
  path: "/medias",
});
const photos = [
  ["lit.webp", "Suite romantique Absolu"],
  ["salledebain.webp", "Baignoire balnéo privative"],
  ["sauna.webp", "Sauna infrarouge privatif"],
  ["douche.webp", "Douche à l’italienne"],
  ["entree1.webp", "Entrée de la suite"],
  ["salledebainviolet.webp", "Ambiance lumineuse romantique"],
];
export default function Media() {
  return (
    <>
      <Header />
      <main className="page-shell pb-24 pt-36">
        <Breadcrumb current="Médiathèque" />
        <p className="eyebrow mt-10 text-[#C9A86A]">Actifs officiels</p>
        <h1 className="mt-4 font-heading text-6xl sm:text-8xl">
          Photos de la Suite Absolu.
        </h1>
        <p className="mt-6 max-w-2xl leading-8 text-white/55">
          Téléchargement autorisé pour une présentation éditoriale d’Absolu,
          avec crédit « Love Room Absolu ». Revente, altération trompeuse et
          utilisation pour un autre établissement interdites.
        </p>
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {photos.map(([file, alt]) => (
            <figure
              key={file}
              className="overflow-hidden rounded-2xl border border-white/10"
            >
              <div className="relative aspect-[4/3]">
                <Image
                  src={`/images/optimized/${file}`}
                  alt={alt}
                  fill
                  sizes="(max-width:768px)100vw,33vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="flex items-center justify-between gap-3 p-4 text-xs text-white/45">
                <span>{alt}</span>
                <a
                  href={`/images/optimized/${file}`}
                  download
                  className="text-[#C9A86A]"
                >
                  Télécharger
                </a>
              </figcaption>
            </figure>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
