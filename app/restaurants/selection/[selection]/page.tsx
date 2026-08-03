import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { restaurants } from "@/lib/restaurants/restaurants";
import { pageMetadata } from "@/lib/seo";
const selections = {
  "top-10-romantiques": {
    title: "Top 10 des restaurants romantiques",
    description:
      "Dix tables à envisager pour un dîner à deux autour d’Avize et d’Épernay.",
    test: (item: (typeof restaurants)[number]) =>
      item.category === "Romantique" || item.category === "Gastronomique",
    limit: 10,
  },
  "top-champagne": {
    title: "Top des restaurants Champagne",
    description:
      "Des adresses où les cuvées et le terroir champenois prolongent votre escapade.",
    test: (item: (typeof restaurants)[number]) => item.champagne,
    limit: 12,
  },
  "top-brunch": {
    title: "Top brunch autour d’Avize",
    description:
      "Les adresses à vérifier pour un brunch ou un déjeuner tardif après votre nuit.",
    test: (item: (typeof restaurants)[number]) => item.brunch,
    limit: 10,
  },
  "top-terrasse": {
    title: "Top des restaurants avec terrasse",
    description:
      "Nos tables à envisager aux beaux jours autour de la Côte des Blancs.",
    test: (item: (typeof restaurants)[number]) => item.terrace,
    limit: 12,
  },
} as const;
type Selection = keyof typeof selections;
export const dynamicParams = false;
export function generateStaticParams() {
  return Object.keys(selections).map((selection) => ({ selection }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ selection: string }>;
}): Promise<Metadata> {
  const slug = (await params).selection as Selection;
  const group = selections[slug];
  return group
    ? pageMetadata({
        title: `${group.title} | Absolu`,
        description: group.description,
        path: `/restaurants/selection/${slug}`,
        image: "/images/restaurant-directory-hero.png",
      })
    : {};
}
export default async function SelectionPage({
  params,
}: {
  params: Promise<{ selection: string }>;
}) {
  const slug = (await params).selection as Selection;
  const group = selections[slug];
  if (!group) notFound();
  const items = restaurants.filter(group.test).slice(0, group.limit);
  return (
    <>
      <Header />
      <main className="page-shell pb-24 pt-36">
        <nav aria-label="Fil d’Ariane" className="text-xs text-white/45">
          <Link href="/">Accueil</Link> <span>›</span>{" "}
          <Link href="/restaurants">Restaurants</Link> <span>›</span>{" "}
          <span>{group.title}</span>
        </nav>
        <p className="eyebrow mt-12 text-[#C9A86A]">Sélection éditoriale</p>
        <h1 className="mt-4 max-w-5xl font-heading text-6xl sm:text-8xl">
          {group.title}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-white/60">
          {group.description} Vérifiez toujours les horaires, services et
          disponibilités directement auprès de l’établissement.
        </p>
        <ol className="mt-16 grid gap-5 md:grid-cols-2">
          {items.map((item, index) => (
            <li
              key={item.slug}
              className="rounded-3xl border border-white/10 p-7"
            >
              <p className="font-heading text-5xl text-[#C9A86A]">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h2 className="mt-4 font-heading text-3xl">
                <Link
                  href={`/restaurants/${item.slug}`}
                  className="hover:text-[#C9A86A]"
                >
                  {item.name}
                </Link>
              </h2>
              <p className="mt-2 text-sm text-white/40">
                {item.city} · environ {item.drive} depuis Absolu
              </p>
              <p className="mt-5 leading-7 text-white/55">{item.why}</p>
              <Link
                href={`/restaurants/${item.slug}`}
                className="mt-6 inline-block text-sm text-[#C9A86A]"
              >
                Adresse, carte et conseils →
              </Link>
            </li>
          ))}
        </ol>
        <div className="mt-16 flex flex-wrap gap-5 text-sm">
          <Link
            href="/restaurants"
            className="rounded-full border border-white/15 px-5 py-3"
          >
            Tous les restaurants
          </Link>
          <Link
            href="/reservation"
            className="rounded-full bg-[#C9A86A] px-5 py-3 text-black"
          >
            Réserver la suite
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
