"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Clock3, MapPin, Search } from "lucide-react";
import {
  restaurantCategories,
  type RestaurantCategory,
  type RestaurantEntry,
} from "@/lib/restaurants/restaurants";
export function RestaurantDirectory({ items }: { items: RestaurantEntry[] }) {
  const [category, setCategory] = useState<RestaurantCategory | "Tous">("Tous");
  const [query, setQuery] = useState("");
  const filtered = useMemo(
    () =>
      items.filter(
        (item) =>
          (category === "Tous" || item.category === category) &&
          `${item.name} ${item.city} ${item.category}`
            .toLocaleLowerCase("fr")
            .includes(query.toLocaleLowerCase("fr")),
      ),
    [category, items, query],
  );
  return (
    <>
      <div className="flex flex-col gap-5 rounded-3xl border border-black/10 bg-white p-6 lg:flex-row lg:items-center">
        <label className="relative flex-1">
          <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-black/40" />
          <span className="sr-only">Rechercher un restaurant</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Restaurant, ville, cuisine…"
            className="min-h-12 w-full rounded-full border border-black/15 pl-11 pr-4 outline-none focus:border-[#8B6B36]"
          />
        </label>
        <div className="flex gap-2 overflow-x-auto">
          {(["Tous", ...restaurantCategories] as const).map((item, keyIndex) => (
            <button
              key={`${item}-${keyIndex}`}
              onClick={() => setCategory(item)}
              aria-pressed={category === item}
              className={`shrink-0 rounded-full px-4 py-2 text-xs ${category === item ? "bg-[#201B18] text-white" : "border border-black/15"}`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-6 text-sm text-black/45">
        {filtered.length} adresse{filtered.length > 1 ? "s" : ""}
      </p>
      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item) => (
          <article
            key={item.slug}
            className="flex flex-col rounded-3xl border border-black/10 bg-white p-6"
          >
            <p className="text-[.65rem] uppercase tracking-wider text-[#8B6B36]">
              {item.category}
            </p>
            <h2 className="mt-3 font-heading text-3xl">
              <Link
                href={`/restaurants/${item.slug}`}
                className="hover:text-[#8B6B36]"
              >
                {item.name}
              </Link>
            </h2>
            <div className="mt-5 space-y-2 text-sm text-black/50">
              <p className="flex gap-2">
                <MapPin className="size-4 shrink-0" />
                {item.city}
              </p>
              <p className="flex gap-2">
                <Clock3 className="size-4 shrink-0" />
                Environ {item.drive} depuis Absolu
              </p>
            </div>
            <p className="mt-5 flex-1 leading-7 text-black/55">{item.why}</p>
            <Link
              href={`/restaurants/${item.slug}`}
              className="mt-6 text-sm text-[#8B6B36]"
            >
              Voir la fiche premium →
            </Link>
          </article>
        ))}
      </div>
    </>
  );
}
