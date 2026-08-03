"use client";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Car,
  Clock3,
  ExternalLink,
  Heart,
  MapPin,
  Search,
  Footprints,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { LeafletMap } from "./leaflet-map";
import {
  mapCategories,
  mapPlaces,
  unverifiedCategories,
  type MapCategory,
} from "@/lib/map/places";
export function TravelMap() {
  const [category, setCategory] = useState<MapCategory>("Tous"),
    [query, setQuery] = useState(""),
    [selected, setSelected] = useState(mapPlaces[0]),
    [dark, setDark] = useState(true),
    [favorites, setFavorites] = useState<string[]>([]),
    [topOnly, setTopOnly] = useState(false),
    reduced = useReducedMotion();
  useEffect(() => {
    queueMicrotask(() => {
      try {
        setFavorites(
          JSON.parse(localStorage.getItem("absolu-map-favorites") ?? "[]"),
        );
      } catch {}
    });
  }, []);
  const filtered = useMemo(
    () =>
      mapPlaces.filter(
        (place) =>
          (category === "Tous" || place.category === category) &&
          (!topOnly || place.top) &&
          `${place.name} ${place.city} ${place.category}`
            .toLocaleLowerCase("fr")
            .includes(query.toLocaleLowerCase("fr")),
      ),
    [category, query, topOnly],
  );
  const favorite = (id: string) => {
    const next = favorites.includes(id)
      ? favorites.filter((item) => item !== id)
      : [...favorites, id];
    setFavorites(next);
    localStorage.setItem("absolu-map-favorites", JSON.stringify(next));
  };
  const google = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent("36 rue Pasteur, 51190 Avize")}&destination=${encodeURIComponent(selected.address)}`;
  return (
    <div>
      <div className="grid gap-3 rounded-3xl border border-white/10 bg-white/[.04] p-4 lg:grid-cols-[1fr_auto_auto]">
        <label className="relative">
          <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/35" />
          <span className="sr-only">Rechercher un lieu</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Restaurant, cave, promenade…"
            className="min-h-12 w-full rounded-full border border-white/10 bg-black/30 pl-11 pr-4"
          />
        </label>
        <button
          onClick={() => setTopOnly((v) => !v)}
          aria-pressed={topOnly}
          className={`rounded-full border px-5 text-xs ${topOnly ? "border-[#C9A86A] text-[#C9A86A]" : "border-white/10"}`}
        >
          Top 10
        </button>
        <button
          onClick={() => setDark((v) => !v)}
          className="rounded-full border border-white/10 px-5 text-xs"
        >
          Carte {dark ? "claire" : "sombre"}
        </button>
      </div>
      <nav
        aria-label="Catégories"
        className="mt-5 flex gap-2 overflow-x-auto pb-3"
      >
        {mapCategories.map((item) => (
          <button
            key={item}
            onClick={() => setCategory(item)}
            aria-pressed={category === item}
            className={`shrink-0 rounded-full border px-4 py-2 text-xs ${category === item ? "border-[#C9A86A] bg-[#C9A86A] text-black" : "border-white/10 text-white/55"}`}
          >
            {item}
          </button>
        ))}
      </nav>
      <div className="mt-8 grid gap-6 xl:grid-cols-[390px_1fr]">
        <div className="max-h-[620px] space-y-3 overflow-y-auto pr-1">
          {filtered.map((place) => (
            <motion.article
              layout={!reduced}
              key={place.id}
              className={`cursor-pointer rounded-2xl border p-5 ${selected.id === place.id ? "border-[#C9A86A] bg-[#C9A86A]/10" : "border-white/10 bg-white/[.025]"}`}
              onClick={() => setSelected(place)}
            >
              <div className="flex justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[#C9A86A]">
                    {place.category} · {place.city}
                  </p>
                  <h2 className="mt-2 font-heading text-2xl">{place.name}</h2>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    favorite(place.id);
                  }}
                  aria-label={
                    favorites.includes(place.id)
                      ? "Retirer des favoris"
                      : "Ajouter aux favoris"
                  }
                >
                  <Heart
                    className={`size-5 ${favorites.includes(place.id) ? "fill-[#C9A86A] text-[#C9A86A]" : "text-white/30"}`}
                  />
                </button>
              </div>
              <p className="mt-3 line-clamp-2 text-xs leading-5 text-white/40">
                {place.description}
              </p>
              <div className="mt-4 flex gap-4 text-xs text-white/50">
                <span className="flex gap-1">
                  <Car className="size-3" />
                  {place.drive}
                </span>
                <span>{place.distance}</span>
              </div>
            </motion.article>
          ))}
          {!filtered.length && (
            <p className="rounded-2xl border border-dashed border-white/15 p-8 text-sm text-white/45">
              Aucun lieu vérifié dans cette catégorie. Les catégories sans
              données fiables restent volontairement vides.
            </p>
          )}
        </div>
        <div>
          <LeafletMap place={selected} dark={dark} />
          <AnimatePresence mode="wait">
            <motion.article
              key={selected.id}
              initial={reduced ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 rounded-3xl border border-white/10 bg-[#111] p-6"
            >
              <p className="eyebrow text-[#C9A86A]">Fiche pratique</p>
              <div className="mt-3 flex items-start justify-between gap-4">
                <h2 className="font-heading text-4xl">{selected.name}</h2>
                <button onClick={() => favorite(selected.id)}>
                  <Heart
                    className={`size-5 ${favorites.includes(selected.id) ? "fill-[#C9A86A] text-[#C9A86A]" : "text-white/30"}`}
                  />
                </button>
              </div>
              <p className="mt-4 flex gap-2 text-sm text-white/55">
                <MapPin className="size-4 shrink-0" />
                {selected.address}
              </p>
              <div className="mt-6 grid gap-3 text-sm sm:grid-cols-3">
                <p className="rounded-xl bg-white/[.04] p-4">
                  <Car className="mb-2 size-4 text-[#C9A86A]" />
                  Voiture
                  <br />
                  {selected.drive}
                </p>
                <p className="rounded-xl bg-white/[.04] p-4">
                  <Footprints className="mb-2 size-4 text-[#C9A86A]" />À pied
                  <br />
                  {selected.walk ?? "À calculer"}
                </p>
                <p className="rounded-xl bg-white/[.04] p-4">
                  <Clock3 className="mb-2 size-4 text-[#C9A86A]" />
                  Horaires
                  <br />À vérifier
                </p>
              </div>
              <p className="mt-5 text-sm leading-7 text-white/45">
                {selected.description}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={google}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-[#C9A86A] px-5 py-3 text-xs text-black"
                >
                  Itinéraire Google Maps
                </a>
                <a
                  href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(selected.address)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-white/15 px-5 py-3 text-xs"
                >
                  OpenStreetMap
                </a>
                <Link
                  href={selected.href}
                  className="rounded-full border border-white/15 px-5 py-3 text-xs"
                >
                  Fiche complète
                </Link>
                {selected.website && (
                  <a
                    href={selected.website}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-white/15 px-5 py-3 text-xs"
                  >
                    Site internet{" "}
                    <ExternalLink className="ml-1 inline size-3" />
                  </a>
                )}
                {selected.phone && (
                  <a
                    href={`tel:${selected.phone.replace(/\s/g, "")}`}
                    className="rounded-full border border-white/15 px-5 py-3 text-xs"
                  >
                    {selected.phone}
                  </a>
                )}
              </div>
            </motion.article>
          </AnimatePresence>
        </div>
      </div>
      <p className="mt-8 text-xs leading-6 text-white/30">
        Catégories en attente de sources structurées :{" "}
        {unverifiedCategories.join(", ")}. Les distances et horaires doivent
        être vérifiés auprès des établissements avant le déplacement.
      </p>
    </div>
  );
}
