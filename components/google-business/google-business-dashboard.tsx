"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import {
  BarChart3,
  CalendarDays,
  Camera,
  CheckCircle2,
  ExternalLink,
  Eye,
  MapPin,
  MessageSquareReply,
  MousePointerClick,
  Phone,
  Plus,
  Send,
  Sparkles,
  Star,
} from "lucide-react";

type Review = {
  reviewId?: string;
  starRating?: string;
  comment?: string;
  createTime?: string;
  reviewer?: { displayName?: string };
  reviewReply?: { comment?: string };
};
type Post = {
  name?: string;
  summary?: string;
  topicType?: string;
  createTime?: string;
  state?: string;
};
type Media = {
  name?: string;
  googleUrl?: string;
  thumbnailUrl?: string;
  mediaFormat?: string;
  description?: string;
};
type MetricTotals = {
  views: number;
  calls: number;
  directions: number;
  websiteClicks: number;
  bookings: number;
};
type Data = {
  connected: boolean;
  metrics: null | {
    totals: MetricTotals;
    monthly: Array<MetricTotals & { month: string }>;
  };
  posts: Post[];
  reviews: Review[];
  media: Media[];
  reviewSummary?: { averageRating?: number; totalReviewCount?: number };
  errors?: number[];
};
const tabs = [
  "Vue d’ensemble",
  "Publications",
  "Avis",
  "Questions / Réponses",
  "Galerie",
] as const;
const stars: Record<string, number> = {
  ONE: 1,
  TWO: 2,
  THREE: 3,
  FOUR: 4,
  FIVE: 5,
};

export function GoogleBusinessDashboard({
  suggestions,
}: {
  suggestions: {
    restaurants: string[];
    activities: string[];
    champagne: string[];
  };
}) {
  const reduced = useReducedMotion();
  const [tab, setTab] = useState<(typeof tabs)[number]>(tabs[0]);
  const [data, setData] = useState<Data | null>(null);
  const [status, setStatus] = useState("Chargement…");
  const [publishing, setPublishing] = useState(false);
  useEffect(() => {
    fetch("/api/admin/google-business")
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        setData(result);
        setStatus("");
      })
      .catch(() => setStatus("Connexion Google indisponible."));
  }, []);
  const metrics = data?.metrics?.totals;
  const metricCards = [
    { label: "Vues", value: metrics?.views, icon: Eye },
    { label: "Appels", value: metrics?.calls, icon: Phone },
    { label: "Itinéraires", value: metrics?.directions, icon: MapPin },
    {
      label: "Clics site",
      value: metrics?.websiteClicks,
      icon: MousePointerClick,
    },
    { label: "Réservations", value: metrics?.bookings, icon: CalendarDays },
  ];

  async function publish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPublishing(true);
    setStatus("Publication vers Google…");
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    const response = await fetch("/api/admin/google-business", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    setPublishing(false);
    setStatus(
      response.ok
        ? "Publication envoyée à Google."
        : (result.error ?? "Échec de publication."),
    );
    if (response.ok)
      setData((current) =>
        current
          ? { ...current, posts: [result as Post, ...current.posts] }
          : current,
      );
  }
  async function reply(reviewId: string, comment: string) {
    setStatus("Envoi de la réponse…");
    const response = await fetch("/api/admin/google-business", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "reply", reviewId, comment }),
    });
    setStatus(
      response.ok
        ? "Réponse publiée sur Google."
        : "Google a refusé la réponse.",
    );
  }

  return (
    <div>
      <div
        className="flex gap-2 overflow-x-auto pb-2"
        role="tablist"
        aria-label="Google Business Profile"
      >
        {tabs.map((item, keyIndex) => (
          <button
            key={`${item}-${keyIndex}`}
            type="button"
            role="tab"
            aria-selected={tab === item}
            onClick={() => setTab(item)}
            className={`min-h-11 shrink-0 rounded-full px-5 text-sm transition ${tab === item ? "bg-[#C9A86A] text-black" : "border border-white/10 text-white/55"}`}
          >
            {item}
          </button>
        ))}
      </div>
      <p className="mt-4 min-h-5 text-sm text-[#C9A86A]" role="status">
        {status}
      </p>
      {!data?.connected && data && (
        <section className="mt-4 rounded-[1.5rem] border border-orange-400/20 bg-orange-400/[.05] p-6">
          <h2 className="font-heading text-3xl">Connexion Google requise</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/50">
            Ajoutez les identifiants OAuth et les identifiants de
            compte/localisation dans les variables serveur. Aucune donnée
            fictive n’est affichée avant la connexion.
          </p>
          <a
            href="https://developers.google.com/my-business/content/overview"
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-2 text-sm text-[#C9A86A]"
          >
            Demander l’accès aux API Google <ExternalLink className="size-4" />
          </a>
        </section>
      )}
      {tab === "Vue d’ensemble" && (
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {metricCards.map((item, keyIndex) => (
              <article
                key={`${item.label}-${keyIndex}`}
                className="rounded-[1.4rem] border border-white/[.08] bg-[#121212] p-5"
              >
                <item.icon className="size-5 text-[#C9A86A]" />
                <p className="mt-5 text-[10px] uppercase tracking-wider text-white/35">
                  {item.label}
                </p>
                <p className="mt-1 text-3xl font-semibold">
                  {item.value ?? "—"}
                </p>
              </article>
            ))}
          </section>
          <MonthlyTable rows={data?.metrics?.monthly ?? []} />
          <section className="mt-6 grid gap-5 lg:grid-cols-3">
            <Summary
              title="Publications Google"
              value={data?.posts.length ?? 0}
              detail="Nouveautés, offres et événements"
            />
            <Summary
              title="Avis Google"
              value={
                data?.reviewSummary?.totalReviewCount ??
                data?.reviews.length ??
                0
              }
              detail={
                data?.reviewSummary?.averageRating
                  ? `${data.reviewSummary.averageRating.toFixed(1)} / 5`
                  : "Note indisponible"
              }
            />
            <Summary
              title="Médias Google"
              value={data?.media.length ?? 0}
              detail="Photos et vidéos synchronisées"
            />
          </section>
        </motion.div>
      )}
      {tab === "Publications" && (
        <section className="mt-6 grid gap-6 xl:grid-cols-[.85fr_1.15fr]">
          <PostComposer
            onSubmit={publish}
            busy={publishing}
            suggestions={suggestions}
          />
          <div className="space-y-3">
            <h2 className="font-heading text-3xl">Publications récentes</h2>
            {data?.posts.length ? (
              data.posts.map((post, index) => (
                <article
                  key={post.name ?? index}
                  className="rounded-2xl border border-white/10 bg-[#121212] p-5"
                >
                  <div className="flex justify-between gap-3">
                    <span className="text-[10px] uppercase tracking-wider text-[#C9A86A]">
                      {post.topicType ?? "Publication"}
                    </span>
                    <span className="text-[10px] text-white/30">
                      {post.state ?? "Publié"}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-white/60">
                    {post.summary}
                  </p>
                </article>
              ))
            ) : (
              <Empty text="Aucune publication Google synchronisée." />
            )}
          </div>
        </section>
      )}
      {tab === "Avis" && (
        <section className="mt-6">
          <h2 className="font-heading text-3xl">Avis et réponses assistées</h2>
          <p className="mt-2 text-sm text-white/40">
            Chaque suggestion reste soumise à validation humaine avant
            publication.
          </p>
          <div className="mt-6 space-y-4">
            {data?.reviews.length ? (
              data.reviews.map((review, index) => (
                <ReviewCard
                  key={review.reviewId ?? index}
                  review={review}
                  onReply={reply}
                />
              ))
            ) : (
              <Empty text="Aucun avis Google synchronisé." />
            )}
          </div>
        </section>
      )}
      {tab === "Questions / Réponses" && (
        <section className="mt-6 grid gap-5 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-[#121212] p-6">
            <MessageSquareReply className="size-6 text-[#C9A86A]" />
            <h2 className="mt-5 font-heading text-3xl">
              Bibliothèque de réponses
            </h2>
            <div className="mt-5 space-y-3">
              {[
                "Le sauna est-il privatif ?",
                "Comment réserver en direct ?",
                "Où se garer à Avize ?",
                "Quels sont les horaires d’arrivée ?",
              ].map((question, keyIndex) => (
                <article
                  key={`${question}-${keyIndex}`}
                  className="rounded-xl bg-white/[.03] p-4 text-sm"
                >
                  <strong>{question}</strong>
                  <p className="mt-2 text-xs leading-6 text-white/40">
                    Suggestion préparée à partir de la FAQ Absolu. Vérifiez la
                    réponse avant de la publier sur Google.
                  </p>
                </article>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-dashed border-white/10 p-6">
            <Sparkles className="size-6 text-[#C9A86A]" />
            <h2 className="mt-5 font-heading text-3xl">
              Suggestions IA responsables
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/45">
              Les réponses automatiques ne sont jamais publiées sans validation.
              Le connecteur conserve une intervention humaine pour les horaires,
              tarifs, conditions et réclamations.
            </p>
          </div>
        </section>
      )}
      {tab === "Galerie" && (
        <section className="mt-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow text-[#C9A86A]">Photos et vidéos</p>
              <h2 className="mt-2 font-heading text-3xl">Galerie Google</h2>
            </div>
            <span className="text-sm text-white/35">
              {data?.media.length ?? 0} média(s)
            </span>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {data?.media.length ? (
              data.media.map((media, index) => (
                <a
                  key={media.name ?? index}
                  href={media.googleUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-[#121212]"
                >
                  <div className="aspect-[4/3] bg-white/[.04]">
                    {media.thumbnailUrl ? (
                      <Image
                        src={media.thumbnailUrl}
                        alt={
                          media.description ?? "Média Google Business Profile"
                        }
                        width={640}
                        height={480}
                        sizes="(max-width: 640px) 100vw, 25vw"
                        className="size-full object-cover"
                      />
                    ) : (
                      <Camera className="m-auto size-8 translate-y-16 text-white/20" />
                    )}
                  </div>
                  <p className="p-4 text-xs text-white/45">
                    {media.mediaFormat ?? "Photo"}
                  </p>
                </a>
              ))
            ) : (
              <Empty text="Aucun média Google synchronisé. Ajoutez vos photos depuis la fiche ou après connexion de l’API Media." />
            )}
          </div>
        </section>
      )}
    </div>
  );
}

function PostComposer({
  onSubmit,
  busy,
  suggestions,
}: {
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  busy: boolean;
  suggestions: {
    restaurants: string[];
    activities: string[];
    champagne: string[];
  };
}) {
  const [summary, setSummary] = useState("");
  const [type, setType] = useState("STANDARD");
  const ideas = useMemo(
    () => [
      ...suggestions.restaurants.map(
        (name) =>
          `Préparez votre soirée à Avize avec une table chez ${name}, puis retrouvez votre suite privative chez Absolu.`,
      ),
      ...suggestions.activities.map(
        (name) =>
          `Associez votre séjour romantique à ${name} et réservez votre nuit en direct chez Absolu.`,
      ),
      ...suggestions.champagne.map(
        (name) =>
          `Découvrez ${name} pendant votre escapade en Champagne, au départ de la Suite Absolu.`,
      ),
    ],
    [suggestions],
  );
  return (
    <form
      onSubmit={onSubmit}
      className="rounded-3xl border border-[#C9A86A]/20 bg-[#121212] p-6"
    >
      <p className="eyebrow text-[#C9A86A]">Nouvelle publication</p>
      <h2 className="mt-2 font-heading text-3xl">Créer pour Google</h2>
      <input type="hidden" name="action" value="post" />
      <label className="mt-6 block text-xs text-white/45">
        Format
        <select
          name="topicType"
          value={type}
          onChange={(event) => setType(event.target.value)}
          className="mt-2 min-h-12 w-full rounded-xl border border-white/10 bg-black px-4 text-white"
        >
          <option value="STANDARD">Nouveauté</option>
          <option value="OFFER">Offre</option>
          <option value="EVENT">Événement</option>
          <option value="ALERT">Information</option>
        </select>
      </label>
      <label className="mt-4 block text-xs text-white/45">
        Texte
        <textarea
          name="summary"
          required
          minLength={10}
          maxLength={1500}
          value={summary}
          onChange={(event) => setSummary(event.target.value)}
          className="mt-2 min-h-36 w-full rounded-xl border border-white/10 bg-black p-4 text-sm text-white"
        />
      </label>
      {type === "OFFER" && (
        <input
          name="couponCode"
          placeholder="Code de l’offre (facultatif)"
          className="mt-3 min-h-12 w-full rounded-xl border border-white/10 bg-black px-4"
        />
      )}
      {type === "EVENT" && (
        <div className="mt-3 grid grid-cols-2 gap-3">
          <input
            name="title"
            required
            placeholder="Nom de l’événement"
            className="col-span-2 min-h-12 rounded-xl border border-white/10 bg-black px-4"
          />
          <input
            name="startDate"
            type="date"
            required
            className="min-h-12 rounded-xl border border-white/10 bg-black px-3"
          />
          <input
            name="endDate"
            type="date"
            required
            className="min-h-12 rounded-xl border border-white/10 bg-black px-3"
          />
        </div>
      )}
      <div className="mt-5">
        <p className="text-[10px] uppercase tracking-wider text-white/30">
          Générer depuis le guide local
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {ideas.slice(0, 6).map((idea, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setSummary(idea)}
              className="rounded-full border border-white/10 px-3 py-2 text-left text-[10px] text-white/45 hover:border-[#C9A86A]/40"
            >
              Suggestion {index + 1}
            </button>
          ))}
        </div>
      </div>
      <button
        disabled={busy}
        className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#C9A86A] font-semibold text-black disabled:opacity-50"
      >
        <Send className="size-4" />
        {busy ? "Publication…" : "Publier avec Réserver maintenant"}
      </button>
    </form>
  );
}
function ReviewCard({
  review,
  onReply,
}: {
  review: Review;
  onReply: (id: string, comment: string) => void;
}) {
  const rating = stars[review.starRating ?? ""] ?? 0;
  const suggestion =
    rating >= 4
      ? `Merci ${review.reviewer?.displayName ?? ""} pour votre retour. Nous sommes ravis que votre séjour chez Absolu vous ait plu et espérons vous accueillir de nouveau à Avize.`
      : `Merci ${review.reviewer?.displayName ?? ""} d’avoir partagé votre expérience. Nous sommes désolés qu’elle n’ait pas répondu à toutes vos attentes. Contactez-nous directement afin que nous puissions comprendre précisément la situation et vous répondre personnellement.`;
  const [reply, setReply] = useState(review.reviewReply?.comment ?? suggestion);
  return (
    <article className="rounded-2xl border border-white/10 bg-[#121212] p-5">
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex items-center gap-1 text-[#C9A86A]">
          <Star className="size-4 fill-current" />
          {rating || "—"}
        </span>
        <strong>{review.reviewer?.displayName ?? "Client Google"}</strong>
        {review.reviewReply && (
          <span className="text-[10px] text-emerald-300">Réponse publiée</span>
        )}
      </div>
      <p className="mt-4 text-sm leading-7 text-white/55">
        {review.comment || "Avis sans commentaire."}
      </p>
      <label className="mt-5 block text-xs text-white/40">
        Suggestion de réponse
        <textarea
          value={reply}
          onChange={(event) => setReply(event.target.value)}
          className="mt-2 min-h-28 w-full rounded-xl border border-white/10 bg-black p-4 text-sm text-white"
        />
      </label>
      <button
        type="button"
        disabled={!review.reviewId || reply.length < 10}
        onClick={() => review.reviewId && onReply(review.reviewId, reply)}
        className="mt-3 flex min-h-11 items-center gap-2 rounded-full border border-[#C9A86A]/40 px-5 text-sm text-[#E5C98E] disabled:opacity-40"
      >
        <MessageSquareReply className="size-4" />
        Valider et publier
      </button>
    </article>
  );
}
function MonthlyTable({
  rows,
}: {
  rows: Array<MetricTotals & { month: string }>;
}) {
  return (
    <section className="mt-6 overflow-hidden rounded-[1.5rem] border border-white/[.08] bg-[#121212]">
      <div className="p-6">
        <BarChart3 className="size-5 text-[#C9A86A]" />
        <h2 className="mt-3 font-heading text-3xl">Statistiques mensuelles</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-left text-xs">
          <thead className="bg-white/[.03] text-white/35">
            <tr>
              {[
                "Mois",
                "Vues",
                "Appels",
                "Itinéraires",
                "Clics",
                "Réservations",
              ].map((label, keyIndex) => (
                <th key={`${label}-${keyIndex}`} className="px-5 py-3">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((row, keyIndex) => (
                <tr key={`${row.month}-${keyIndex}`} className="border-t border-white/[.06]">
                  <td className="px-5 py-4 text-[#C9A86A]">{row.month}</td>
                  <td>{row.views}</td>
                  <td>{row.calls}</td>
                  <td>{row.directions}</td>
                  <td>{row.websiteClicks}</td>
                  <td>{row.bookings}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-6 text-white/35">
                  Les métriques apparaîtront après connexion et synchronisation
                  Google.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
function Summary({
  title,
  value,
  detail,
}: {
  title: string;
  value: number;
  detail: string;
}) {
  return (
    <article className="rounded-[1.5rem] border border-white/[.08] bg-[#121212] p-5">
      <CheckCircle2 className="size-5 text-[#C9A86A]" />
      <p className="mt-5 text-sm">{title}</p>
      <p className="mt-1 text-3xl font-semibold">{value}</p>
      <p className="mt-1 text-[10px] text-white/35">{detail}</p>
    </article>
  );
}
function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-white/35">
      <Plus className="mx-auto mb-3 size-5" />
      {text}
    </div>
  );
}
