"use client";

import Image from "next/image";
import { Play } from "lucide-react";
import { useRef, useState } from "react";
import type { PremiumVideo } from "@/lib/video/catalog";

export function PremiumPlayer({
  video,
  onPlay,
}: {
  video: PremiumVideo;
  onPlay?: () => void;
}) {
  const [activated, setActivated] = useState(false);
  const localRef = useRef<HTMLVideoElement>(null);
  const activate = () => {
    setActivated(true);
    onPlay?.();
  };
  const seek = (seconds: number) => {
    if (video.provider !== "local") return;
    setActivated(true);
    requestAnimationFrame(() => {
      if (localRef.current) {
        localRef.current.currentTime = seconds;
        void localRef.current.play();
      }
    });
  };
  const embed =
    video.provider === "youtube"
      ? `https://www.youtube-nocookie.com/embed/${video.source}?autoplay=1&rel=0`
      : `https://player.vimeo.com/video/${video.source}?autoplay=1&dnt=1`;

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0B0B0B] shadow-2xl shadow-black/40">
      <div className="relative aspect-video bg-black">
        {!activated ? (
          <button
            type="button"
            onClick={activate}
            className="group absolute inset-0 w-full"
            aria-label={`Lire : ${video.title}`}
          >
            <Image
              src={video.poster}
              alt={video.posterAlt}
              fill
              preload
              sizes="(max-width: 1024px) 100vw, 75vw"
              className="object-cover opacity-80 transition duration-700 group-hover:scale-[1.02] group-hover:opacity-65"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
            <span className="absolute left-1/2 top-1/2 grid size-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/35 bg-black/35 backdrop-blur transition group-hover:scale-105 group-hover:bg-[#C9A86A] group-hover:text-black">
              <Play className="ml-1 size-7 fill-current" />
            </span>
            <span className="absolute bottom-5 left-5 rounded-full bg-black/65 px-4 py-2 text-xs uppercase tracking-wider">
              Cliquer pour charger le lecteur
            </span>
          </button>
        ) : video.provider === "local" ? (
          <video
            ref={localRef}
            controls
            autoPlay
            playsInline
            preload="metadata"
            poster={video.poster}
            className="h-full w-full"
            aria-label={video.title}
          >
            <source src={video.source} />
            {video.captions && (
              <track
                default
                src={video.captions}
                kind="subtitles"
                srcLang="fr"
                label={video.captionsLabel ?? "Français"}
              />
            )}
            Votre navigateur ne prend pas en charge la vidéo HTML5.
          </video>
        ) : (
          <iframe
            src={embed}
            title={video.title}
            loading="lazy"
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            className="h-full w-full border-0"
          />
        )}
      </div>
      <div className="grid gap-8 p-6 lg:grid-cols-[1fr_18rem]">
        <div>
          <p className="text-xs uppercase tracking-[.18em] text-[#C9A86A]">
            {video.category}
          </p>
          <h2 className="mt-3 font-heading text-4xl">{video.title}</h2>
          <p className="mt-4 leading-7 text-white/50">{video.description}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-white/35">
            Chapitres
          </p>
          <ol className="mt-3 space-y-2">
            {video.chapters.map((chapter) => (
              <li key={chapter.startOffset}>
                <button
                  type="button"
                  onClick={() => seek(chapter.startOffset)}
                  disabled={video.provider !== "local"}
                  className="flex w-full justify-between gap-4 py-1 text-left text-sm text-white/60 enabled:hover:text-[#C9A86A] disabled:cursor-default"
                >
                  <span>{chapter.title}</span>
                  <span>
                    {Math.floor(chapter.startOffset / 60)}:
                    {String(chapter.startOffset % 60).padStart(2, "0")}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
