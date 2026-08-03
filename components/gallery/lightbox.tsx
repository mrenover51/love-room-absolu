"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Images,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  galleryCategories,
  type GalleryCategory,
  type LuxuryGalleryImage,
} from "@/lib/gallery/gallery-data";

export function Lightbox({
  images,
}: {
  images: readonly LuxuryGalleryImage[];
}) {
  const [category, setCategory] = useState<GalleryCategory>("Tout");
  const [active, setActive] = useState<number | null>(null);
  const [zoomed, setZoomed] = useState(false);
  const [views, setViews] = useState<Record<string, number>>({});
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const reduced = useReducedMotion();
  const filtered = useMemo(
    () =>
      category === "Tout"
        ? images
        : images.filter((image) =>
            image.categories.includes(
              category as Exclude<GalleryCategory, "Tout">,
            ),
          ),
    [category, images],
  );
  const current = active === null ? null : images[active];
  const close = useCallback(() => {
    setActive(null);
    setZoomed(false);
    setTimeout(() => triggerRef.current?.focus(), 0);
  }, []);
  const move = useCallback(
    (step: number) => {
      setZoomed(false);
      setActive((index) =>
        index === null ? null : (index + step + images.length) % images.length,
      );
    },
    [images.length],
  );
  const open = (image: LuxuryGalleryImage, trigger: HTMLButtonElement) => {
    triggerRef.current = trigger;
    setActive(images.indexOf(image));
    setViews((value) => ({
      ...value,
      [image.src]: (value[image.src] ?? 0) + 1,
    }));
  };

  useEffect(() => {
    if (active === null) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    [-1, 1].forEach((offset) => {
      const preload = new window.Image();
      preload.src =
        images[(active + offset + images.length) % images.length].src;
    });
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") move(-1);
      if (event.key === "ArrowRight") move(1);
      if (event.key === "+" || event.key === "=") setZoomed(true);
      if (event.key === "-") setZoomed(false);
      if (event.key === "Tab") {
        const controls = document
          .querySelector<HTMLElement>("[data-lightbox]")
          ?.querySelectorAll<HTMLElement>("button");
        if (!controls?.length) return;
        const first = controls[0],
          last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", key);
    };
  }, [active, close, images, move]);

  const popular = [...images]
    .sort((a, b) => (views[b.src] ?? 0) - (views[a.src] ?? 0))
    .filter((image) => views[image.src])
    .slice(0, 4);
  const recent = [...images]
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, 5);
  const similar = current
    ? images
        .filter(
          (image) =>
            image.src !== current.src &&
            image.categories.some((item) => current.categories.includes(item)),
        )
        .slice(0, 4)
    : [];

  return (
    <div onContextMenu={(event) => event.preventDefault()}>
      <nav
        aria-label="Catégories de la galerie"
        className="flex gap-2 overflow-x-auto pb-3"
      >
        {galleryCategories.map((item) => {
          const count =
            item === "Tout"
              ? images.length
              : images.filter((image) =>
                  image.categories.includes(
                    item as Exclude<GalleryCategory, "Tout">,
                  ),
                ).length;
          return (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              aria-pressed={category === item}
              className={`shrink-0 rounded-full border px-5 py-3 text-xs uppercase tracking-wider transition ${category === item ? "border-[#C9A86A] bg-[#C9A86A] text-black" : "border-white/15 text-white/60 hover:border-white/40"}`}
            >
              {item} <span className="ml-1 opacity-50">{count}</span>
            </button>
          );
        })}
      </nav>

      {filtered.length ? (
        <div className="mt-10 columns-1 gap-4 sm:columns-2 lg:columns-3">
          {filtered.map((image, index) => (
            <motion.button
              key={image.src}
              type="button"
              onClick={(event) => open(image, event.currentTarget)}
              initial={reduced ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "80px" }}
              transition={{ delay: reduced ? 0 : Math.min(index * 0.04, 0.2) }}
              className="group relative mb-4 block w-full break-inside-avoid overflow-hidden rounded-2xl bg-[#121212] text-left"
              aria-label={`Agrandir : ${image.alt}`}
            >
              <span
                className={`relative block ${image.orientation === "wide" ? "aspect-[16/10]" : image.orientation === "square" ? "aspect-square" : "aspect-[4/5]"}`}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  loading={index < 2 ? "eager" : "lazy"}
                  className="object-cover transition duration-1000 group-hover:scale-[1.035]"
                  draggable={false}
                />
                <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-70 transition group-hover:opacity-100" />
              </span>
              <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5">
                <span>
                  <span className="block text-sm text-white">
                    {image.caption}
                  </span>
                  <span className="mt-2 block text-[10px] uppercase tracking-widest text-white/45">
                    {image.categories.slice(0, 2).join(" · ")}
                  </span>
                </span>
                <ZoomIn
                  className="size-5 shrink-0 text-white/70"
                  aria-hidden="true"
                />
              </span>
            </motion.button>
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-3xl border border-dashed border-white/15 px-6 py-16 text-center">
          <Images className="mx-auto size-7 text-[#C9A86A]" />
          <h2 className="mt-5 font-heading text-3xl">
            Cette collection sera bientôt enrichie
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-white/45">
            Aucune photo dédiée n’est encore publiée dans cette catégorie.
            Découvrez les autres espaces de la suite en attendant la prochaine
            prise de vue.
          </p>
        </div>
      )}

      <section className="mt-24">
        <div className="flex items-end justify-between">
          <div>
            <p className="eyebrow text-[#C9A86A]">Dernières publications</p>
            <h2 className="mt-4 font-heading text-5xl">Photos récentes</h2>
          </div>
          <p className="hidden text-xs text-white/35 sm:block">
            Faites glisser pour explorer
          </p>
        </div>
        <div className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-5">
          {recent.map((image) => (
            <button
              key={image.src}
              type="button"
              onClick={(event) => open(image, event.currentTarget)}
              className="group relative aspect-[4/5] w-[78vw] shrink-0 snap-start overflow-hidden rounded-2xl sm:w-72"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 640px) 78vw, 288px"
                className="object-cover transition duration-700 group-hover:scale-105"
                draggable={false}
              />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-5 pt-16 text-left text-sm">
                {image.caption}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-20 rounded-3xl border border-white/10 bg-white/[.03] p-7 sm:p-10">
        <p className="eyebrow text-[#C9A86A]">Pendant votre visite</p>
        <h2 className="mt-4 font-heading text-4xl">Photos populaires</h2>
        {popular.length ? (
          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {popular.map((image) => (
              <button
                key={image.src}
                type="button"
                onClick={(event) => open(image, event.currentTarget)}
                className="relative aspect-square overflow-hidden rounded-xl"
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, 25vw"
                  className="object-cover"
                  draggable={false}
                />
              </button>
            ))}
          </div>
        ) : (
          <p className="mt-5 max-w-xl text-sm leading-7 text-white/45">
            Ouvrez vos photos préférées : les plus consultées apparaîtront ici,
            uniquement pour cette visite et sans suivi publicitaire.
          </p>
        )}
      </section>

      <AnimatePresence>
        {current && active !== null && (
          <motion.div
            data-lightbox
            role="dialog"
            aria-modal="true"
            aria-label="Visionneuse plein écran"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col bg-black/97 p-3 sm:p-6"
          >
            <div className="flex items-center justify-between text-sm text-white/60">
              <p aria-live="polite">
                {active + 1} / {images.length}
              </p>
              <div className="flex">
                <button
                  type="button"
                  onClick={() => setZoomed((value) => !value)}
                  className="grid size-12 place-items-center"
                  aria-label={zoomed ? "Réduire l’image" : "Zoomer l’image"}
                >
                  {zoomed ? <ZoomOut /> : <ZoomIn />}
                </button>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={close}
                  className="grid size-12 place-items-center"
                  aria-label="Fermer la visionneuse"
                >
                  <X />
                </button>
              </div>
            </div>
            <div className="relative min-h-0 flex-1 overflow-hidden">
              <motion.div
                key={current.src}
                drag={zoomed ? false : "x"}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.16}
                onDragEnd={(_, info) => {
                  if (Math.abs(info.offset.x) > 65)
                    move(info.offset.x < 0 ? 1 : -1);
                }}
                initial={reduced ? false : { opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0, scale: zoomed ? 1.65 : 1 }}
                transition={{ duration: reduced ? 0 : 0.3 }}
                className={`relative h-full w-full ${zoomed ? "cursor-zoom-out" : "touch-pan-y cursor-grab"}`}
                onDoubleClick={() => setZoomed((value) => !value)}
              >
                <Image
                  src={current.src}
                  alt={current.alt}
                  fill
                  sizes="100vw"
                  quality={90}
                  className="select-none object-contain"
                  draggable={false}
                />
              </motion.div>
              <button
                type="button"
                onClick={() => move(-1)}
                className="absolute left-0 top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-black/50"
                aria-label="Photo précédente"
              >
                <ChevronLeft />
              </button>
              <button
                type="button"
                onClick={() => move(1)}
                className="absolute right-0 top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-black/50"
                aria-label="Photo suivante"
              >
                <ChevronRight />
              </button>
            </div>
            <div className="pt-4 text-center">
              <p className="text-sm text-white/70">{current.caption}</p>
              <div className="mx-auto mt-3 flex max-w-xl justify-center gap-2 overflow-x-auto">
                {similar.map((image) => (
                  <button
                    key={image.src}
                    type="button"
                    onClick={(event) => open(image, event.currentTarget)}
                    className="relative size-12 shrink-0 overflow-hidden rounded-md opacity-60 hover:opacity-100"
                    aria-label={`Photo similaire : ${image.alt}`}
                  >
                    <Image
                      src={image.src}
                      alt=""
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
