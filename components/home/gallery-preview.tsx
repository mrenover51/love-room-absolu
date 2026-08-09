import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { galleryImages } from "@/lib/constants";

export function GalleryPreview() {
  return (
    <section
      id="galerie"
      className="section-space border-y border-white/[.06] bg-[#0D0D0D]"
    >
      <div className="page-shell">
        <p className="eyebrow text-[#C9A86A]">En images</p>
        <div className="mt-6 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="max-w-3xl font-heading text-5xl leading-[1.04] sm:text-6xl lg:text-7xl">
            Quelques instants d’Absolu.
          </h2>
          <Link
            href="/galerie"
            className="premium-action w-fit border border-white/25 px-7 py-3 text-xs uppercase tracking-[.16em] hover:border-[#C9A86A] hover:text-[#D8BD87]"
          >
            Voir toute la galerie
          </Link>
        </div>
        <div className="mt-16 grid grid-cols-2 gap-4 lg:grid-cols-12">
          {galleryImages.slice(0, 6).map((img, index) => (
            <Link
              href="/galerie"
              key={`${img.src}-${index}`}
              className={`gallery-tile luxury-card group relative overflow-hidden border border-white/[.08] ${index === 0 ? "col-span-2 aspect-[16/10] lg:col-span-7 lg:row-span-2" : index === 1 ? "col-span-2 aspect-[16/9] lg:col-span-5" : "aspect-square lg:col-span-5"}`}
              aria-label={`Ouvrir la galerie : ${img.alt}`}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes={
                  index === 0
                    ? "(min-width:1024px) 58vw, 100vw"
                    : "(min-width:1024px) 42vw, 50vw"
                }
                className="object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.04]"
              />
              <span className="absolute bottom-5 right-5 z-10 grid size-11 translate-y-2 place-items-center rounded-full border border-white/20 bg-black/35 text-[#E7D4AD] opacity-0 backdrop-blur-md transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
