"use client";

import Image from "next/image";
import { useState } from "react";
import type { LuxuryGalleryImage } from "@/lib/gallery/gallery-data";

export function BeforeAfter({
  before,
  after,
  label,
}: {
  before: LuxuryGalleryImage;
  after: LuxuryGalleryImage;
  label: string;
}) {
  const [position, setPosition] = useState(50);
  return (
    <figure className="overflow-hidden rounded-3xl border border-white/10 bg-[#111]">
      <div className="relative aspect-[16/10] select-none overflow-hidden">
        <Image
          src={before.src}
          alt={before.alt}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
          draggable={false}
        />
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        >
          <Image
            src={after.src}
            alt={after.alt}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            draggable={false}
          />
        </div>
        <span className="absolute left-4 top-4 rounded-full bg-black/70 px-3 py-2 text-[10px] uppercase tracking-widest">
          Lumière naturelle
        </span>
        <span className="absolute right-4 top-4 rounded-full bg-black/70 px-3 py-2 text-[10px] uppercase tracking-widest">
          Ambiance lumineuse
        </span>
        <div
          className="pointer-events-none absolute inset-y-0 w-px bg-white"
          style={{ left: `${position}%` }}
        />
        <input
          aria-label={`Comparer les ambiances de ${label}`}
          type="range"
          min="0"
          max="100"
          value={position}
          onChange={(event) => setPosition(Number(event.target.value))}
          className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
        />
      </div>
      <figcaption className="p-5">
        <span className="font-heading text-2xl">{label}</span>
        <span className="ml-3 text-xs text-white/40">
          Même espace, deux ambiances
        </span>
      </figcaption>
    </figure>
  );
}
