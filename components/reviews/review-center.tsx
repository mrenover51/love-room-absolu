"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Search,
  Star,
} from "lucide-react";
import type { PublishedReview } from "@/lib/reviews/reviews";
const stayLabels: Record<string, string> = {
  couple: "Séjour en couple",
  anniversaire: "Anniversaire",
  "demande-en-mariage": "Demande en mariage",
  "lune-de-miel": "Lune de miel",
  "week-end": "Week-end romantique",
  autre: "Autre séjour",
};
export function ReviewCenter({ reviews }: { reviews: PublishedReview[] }) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [score, setScore] = useState("all");
  const [sort, setSort] = useState("recent");
  const [page, setPage] = useState(1);
  const perPage = 9;
  const filtered = useMemo(
    () =>
      reviews
        .filter(
          (review) =>
            (type === "all" || review.stay_type === type) &&
            (score === "all" || review.overall_rating >= Number(score)) &&
            `${review.title} ${review.body} ${review.reviewer_name}`
              .toLocaleLowerCase("fr")
              .includes(query.toLocaleLowerCase("fr")),
        )
        .sort((a, b) =>
          sort === "rating"
            ? b.overall_rating - a.overall_rating
            : sort === "oldest"
              ? a.published_at.localeCompare(b.published_at)
              : b.published_at.localeCompare(a.published_at),
        ),
    [query, reviews, score, sort, type],
  );
  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const update = () => setPage(1);
  return (
    <>
      <div className="grid gap-3 rounded-3xl border border-black/10 bg-white p-5 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <label className="relative">
          <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-black/40" />
          <span className="sr-only">Rechercher dans les avis</span>
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              update();
            }}
            placeholder="Rechercher dans les avis…"
            className="min-h-12 w-full rounded-full border border-black/15 pl-11 pr-4"
          />
        </label>
        <select
          aria-label="Type de séjour"
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            update();
          }}
          className="rounded-full border border-black/15 bg-white px-4"
        >
          <option value="all">Tous les séjours</option>
          {Object.entries(stayLabels).map(([value, label], keyIndex) => (
            <option key={`${value}-${keyIndex}`} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select
          aria-label="Note minimale"
          value={score}
          onChange={(e) => {
            setScore(e.target.value);
            update();
          }}
          className="rounded-full border border-black/15 bg-white px-4"
        >
          <option value="all">Toutes les notes</option>
          <option value="9">9 et plus</option>
          <option value="8">8 et plus</option>
          <option value="7">7 et plus</option>
        </select>
        <select
          aria-label="Trier les avis"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-full border border-black/15 bg-white px-4"
        >
          <option value="recent">Plus récents</option>
          <option value="oldest">Plus anciens</option>
          <option value="rating">Mieux notés</option>
        </select>
      </div>
      <p className="mt-6 text-sm text-black/45" aria-live="polite">
        {filtered.length} avis vérifié{filtered.length > 1 ? "s" : ""}
      </p>
      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {filtered.slice((page - 1) * perPage, page * perPage).map((review) => (
          <article
            key={review.id}
            className="flex flex-col rounded-3xl border border-black/10 bg-white p-6"
          >
            <div className="flex items-center justify-between">
              <span className="rounded-xl bg-[#201B18] px-3 py-2 font-heading text-2xl text-white">
                {review.overall_rating.toFixed(1)}
              </span>
              {review.verified && (
                <span className="flex items-center gap-1 text-xs text-emerald-700">
                  <BadgeCheck className="size-4" />
                  Séjour vérifié
                </span>
              )}
            </div>
            <p className="mt-5 text-xs uppercase tracking-wider text-[#8B6B36]">
              {stayLabels[review.stay_type] ?? review.stay_type}
            </p>
            <h2 className="mt-3 font-heading text-3xl">
              <Link href={`/avis/${review.slug}`}>{review.title}</Link>
            </h2>
            <p className="mt-4 line-clamp-5 flex-1 leading-7 text-black/55">
              {review.body}
            </p>
            <p className="mt-5 text-sm text-black/40">
              {review.reviewer_name} ·{" "}
              {new Intl.DateTimeFormat("fr-FR", {
                month: "long",
                year: "numeric",
              }).format(new Date(`${review.stay_date}T12:00:00Z`))}
            </p>
            <Link
              href={`/avis/${review.slug}`}
              className="mt-5 text-sm text-[#8B6B36]"
            >
              Lire l’avis complet →
            </Link>
          </article>
        ))}
      </div>
      {!filtered.length && (
        <div className="mt-8 rounded-3xl border border-dashed border-black/20 p-12 text-center">
          <Star className="mx-auto size-6 text-[#8B6B36]" />
          <p className="mt-4 font-heading text-3xl">
            Aucun avis ne correspond à ces filtres
          </p>
          <button
            onClick={() => {
              setQuery("");
              setType("all");
              setScore("all");
              setPage(1);
            }}
            className="mt-4 text-sm text-[#8B6B36] underline"
          >
            Réinitialiser la recherche
          </button>
        </div>
      )}
      {pages > 1 && (
        <nav
          aria-label="Pagination des avis"
          className="mt-10 flex items-center justify-center gap-4"
        >
          <button
            disabled={page === 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            className="rounded-full border border-black/15 p-3 disabled:opacity-30"
          >
            <ChevronLeft className="size-4" />
            <span className="sr-only">Page précédente</span>
          </button>
          <span className="text-sm">
            Page {page} sur {pages}
          </span>
          <button
            disabled={page === pages}
            onClick={() => setPage((value) => Math.min(pages, value + 1))}
            className="rounded-full border border-black/15 p-3 disabled:opacity-30"
          >
            <ChevronRight className="size-4" />
            <span className="sr-only">Page suivante</span>
          </button>
        </nav>
      )}
    </>
  );
}
