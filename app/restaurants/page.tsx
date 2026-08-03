import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { RestaurantDirectory } from "@/components/restaurants/restaurant-directory";
import { restaurants } from "@/lib/restaurants/restaurants";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata({
  title: "Restaurants autour de Love Room Absolu",
  description:
    "50 restaurants à Avize, Épernay et en Champagne : tables romantiques, gastronomiques, brasseries et cuisine française avec itinéraires.",
  path: "/restaurants",
  image: "/images/restaurant-directory-hero.png",
  imageAlt: "Table romantique illustrant le guide des restaurants en Champagne",
});
const selections = [
  [
    "top-10-romantiques",
    "Top 10 restaurants romantiques",
    "Une sélection pour une soirée à deux.",
  ],
  [
    "top-champagne",
    "Top Champagne",
    "Les adresses où le terroir tient la vedette.",
  ],
  ["top-brunch", "Top brunch", "Nos haltes pour prolonger la matinée."],
  ["top-terrasse", "Top terrasse", "Les tables à envisager aux beaux jours."],
] as const;
export default function RestaurantsPage() {
  return (
    <>
      <Header />
      <main>
        <section className="relative flex min-h-[78svh] items-end overflow-hidden pb-16 pt-32">
          <Image
            src="/images/restaurant-directory-hero.png"
            alt="Table romantique, illustration éditoriale non contractuelle"
            fill
            preload
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/20" />
          <div className="page-shell relative">
            <Breadcrumb current="Restaurants" />
            <p className="eyebrow mt-9 text-[#C9A86A]">50 adresses vérifiées</p>
            <h1 className="mt-4 max-w-5xl font-heading text-6xl leading-none sm:text-8xl">
              Restaurants autour de Love Room Absolu
            </h1>
            <p className="mt-6 max-w-2xl leading-8 text-white/70">
              Une table éclairée à la bougie, un accord inattendu, quelques
              bulles partagées. D’Avize aux grandes maisons de Champagne,
              choisissez l’adresse qui donnera le ton de votre soirée.
            </p>
            <p className="mt-3 text-xs text-white/40">
              Visuel d’ambiance généré — il ne représente aucun établissement
              référencé.
            </p>
          </div>
        </section>
        <section className="bg-[#0C0C0C] py-20">
          <div className="page-shell grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {selections.map(([slug, title, text]) => (
              <Link
                key={slug}
                href={`/restaurants/selection/${slug}`}
                className="rounded-2xl border border-white/10 p-6 hover:border-[#C9A86A]/50"
              >
                <span className="eyebrow text-[#C9A86A]">Sélection</span>
                <h2 className="mt-4 font-heading text-3xl">{title}</h2>
                <p className="mt-3 text-sm leading-6 text-white/50">{text}</p>
              </Link>
            ))}
          </div>
        </section>
        <section className="bg-[#F3EEE7] py-24 text-[#201B18]">
          <div className="page-shell">
            <p className="eyebrow text-[#8B6B36]">Annuaire local</p>
            <h2 className="mt-4 font-heading text-5xl">
              Choisir le goût de votre soirée
            </h2>
            <div className="mt-10">
              <RestaurantDirectory items={restaurants} />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
