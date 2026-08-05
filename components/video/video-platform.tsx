"use client";

import Image from "next/image";
import { Clapperboard, Clock3, Play, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { PremiumPlayer } from "@/components/video/premium-player";
import {
  formatDuration,
  plannedVideos,
  type PremiumVideo,
} from "@/lib/video/catalog";

export function VideoPlatform({ videos }: { videos: readonly PremiumVideo[] }) {
  const [activeSlug, setActiveSlug] = useState(videos[0]?.slug ?? "");
  const [views, setViews] = useState<Record<string, number>>({});
  const active = videos.find((video) => video.slug === activeSlug);
  const popular = useMemo(
    () =>
      [...videos]
        .sort((a, b) => (views[b.slug] ?? 0) - (views[a.slug] ?? 0))
        .filter((video) => views[video.slug])
        .slice(0, 4),
    [videos, views],
  );
  const similar = active
    ? videos
        .filter(
          (video) =>
            video.slug !== active.slug && video.category === active.category,
        )
        .slice(0, 3)
    : [];

  if (!videos.length)
    return (
      <>
        <section className="rounded-[2rem] border border-white/10 bg-white/[.035] p-8 sm:p-12">
          <Clapperboard className="size-8 text-[#C9A86A]" />
          <p className="eyebrow mt-8 text-[#C9A86A]">
            Production en préparation
          </p>
          <h2 className="mt-4 max-w-3xl font-heading text-5xl">
            Les films seront publiés après leur tournage
          </h2>
          <p className="mt-6 max-w-2xl leading-8 text-white/50">
            Le lecteur, les sous-titres, les chapitres et le référencement vidéo
            sont prêts. Aucune séquence factice n’est utilisée : chaque film
            apparaîtra ici avec sa durée et sa miniature réelles.
          </p>
        </section>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {plannedVideos.map((video, keyIndex) => (
            <article
              key={`${video.title}-${keyIndex}`}
              className="overflow-hidden rounded-3xl border border-white/10 bg-[#111]"
            >
              <div className="relative aspect-video">
                <Image
                  src={video.poster}
                  alt={`Aperçu photographique du futur film ${video.title}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover opacity-55 grayscale-[.2]"
                />
                <span className="absolute inset-0 grid place-items-center">
                  <span className="rounded-full border border-white/25 bg-black/40 px-4 py-2 text-[10px] uppercase tracking-widest">
                    Tournage à venir
                  </span>
                </span>
              </div>
              <div className="p-6">
                <h3 className="font-heading text-3xl">{video.title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/45">
                  {video.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </>
    );

  return (
    <>
      <PremiumPlayer
        video={active!}
        onPlay={() =>
          setViews((value) => ({
            ...value,
            [active!.slug]: (value[active!.slug] ?? 0) + 1,
          }))
        }
      />
      <section className="mt-16">
        <h2 className="font-heading text-4xl">Toutes les vidéos</h2>
        <div className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <button
              key={video.slug}
              type="button"
              onClick={() => setActiveSlug(video.slug)}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-[#111] text-left"
            >
              <span className="relative block aspect-video">
                <Image
                  src={video.poster}
                  alt={video.posterAlt}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  loading="lazy"
                  className="object-cover transition duration-700 group-hover:scale-105"
                />
                <span className="absolute inset-0 grid place-items-center bg-black/15">
                  <Play className="size-10 fill-white" />
                </span>
              </span>
              <span className="block p-5">
                <span className="flex justify-between text-[10px] uppercase tracking-widest text-white/35">
                  <span>{video.quality}</span>
                  <span className="flex items-center gap-1">
                    <Clock3 className="size-3" />
                    {formatDuration(video.durationSeconds)}
                  </span>
                </span>
                <span className="mt-3 block font-heading text-3xl">
                  {video.title}
                </span>
              </span>
            </button>
          ))}
        </div>
      </section>
      {similar.length > 0 && (
        <section className="mt-16">
          <p className="eyebrow text-[#C9A86A]">Continuer</p>
          <h2 className="mt-3 font-heading text-4xl">Vidéos similaires</h2>
          <div className="mt-6 flex flex-wrap gap-3">
            {similar.map((video) => (
              <button
                key={video.slug}
                onClick={() => setActiveSlug(video.slug)}
                className="rounded-full border border-white/15 px-5 py-3 text-sm hover:border-[#C9A86A]"
              >
                {video.title}
              </button>
            ))}
          </div>
        </section>
      )}
      {popular.length > 0 && (
        <section className="mt-16 rounded-3xl border border-white/10 p-8">
          <Sparkles className="size-5 text-[#C9A86A]" />
          <h2 className="mt-4 font-heading text-4xl">
            Populaires pendant votre visite
          </h2>
          <p className="mt-3 text-sm text-white/40">
            Classement local, sans suivi publicitaire.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {popular.map((video) => (
              <button
                key={video.slug}
                onClick={() => setActiveSlug(video.slug)}
                className="text-sm text-[#C9A86A]"
              >
                {video.title}
              </button>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
