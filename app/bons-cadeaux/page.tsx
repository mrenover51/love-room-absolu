import Image from "next/image";
import Link from "next/link";
import { Gift, Heart, ShieldCheck } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { JsonLd } from "@/components/seo/json-ld";
import { giftThemes } from "@/lib/gifts/catalog";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";
export const metadata = pageMetadata({
  title: "Bons cadeaux personnalisés pour couple | Absolu",
  description:
    "Créez un bon cadeau romantique personnalisé : anniversaire, Noël, Saint-Valentin, mariage ou couple. Aperçu, paiement Stripe et envoi numérique.",
  path: "/bons-cadeaux",
});
export default function GiftCardsPublic() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Bons cadeaux Love Room Absolu",
    itemListElement: giftThemes.map((gift, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${siteConfig.url}/bons-cadeaux/${gift.slug}`,
      name: gift.name,
    })),
  };
  return (
    <>
      <Header />
      <main>
        <JsonLd data={schema} />
        <section className="page-shell pb-20 pt-36">
          <Breadcrumb current="Bons cadeaux" />
          <div className="mt-14 grid items-end gap-8 lg:grid-cols-[1fr_.6fr]">
            <div>
              <p className="eyebrow text-[#C9A86A]">L’art d’offrir</p>
              <h1 className="mt-5 max-w-4xl font-heading text-6xl sm:text-8xl">
                Un cadeau que l’on n’oublie pas dans un tiroir.
              </h1>
            </div>
            <p className="pb-2 leading-8 text-white/55">
              Offrez ce qui devient rare&nbsp;: du temps à deux. Une nuit dans
              la Suite Absolu, la chaleur du sauna, quelques bulles et un
              souvenir qui continuera longtemps après le séjour.
            </p>
          </div>
        </section>
        <section className="page-shell grid gap-5 pb-24 md:grid-cols-2 lg:grid-cols-3">
          {giftThemes.map((gift, index) => (
            <Link
              key={gift.slug}
              href={`/bons-cadeaux/${gift.slug}`}
              className={`group relative min-h-96 overflow-hidden rounded-[2rem] border border-white/10 ${index === 0 ? "lg:col-span-2" : ""}`}
            >
              <Image
                src={gift.image}
                alt={`${gift.name} personnalisé`}
                fill
                sizes={
                  index === 0
                    ? "(max-width:1024px)100vw,66vw"
                    : "(max-width:768px)100vw,33vw"
                }
                className="object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-7">
                <p
                  className="text-[10px] uppercase tracking-[.25em]"
                  style={{ color: gift.accent }}
                >
                  À offrir avec vos mots
                </p>
                <h2 className="mt-2 font-heading text-4xl">{gift.name}</h2>
                <p className="mt-3 max-w-lg text-sm text-white/60">
                  {gift.description}
                </p>
              </div>
            </Link>
          ))}
        </section>
        <section className="border-y border-white/10 bg-white/[.025]">
          <div className="page-shell grid gap-8 py-20 md:grid-cols-3">
            {[
              [
                Gift,
                "Choisissez",
                "Une occasion et un montant de 150 €, 250 € ou 350 €.",
              ],
              [
                Heart,
                "Personnalisez",
                "Ajoutez les prénoms, un message, une couleur et votre photo.",
              ],
              [
                ShieldCheck,
                "Confiez-leur la parenthèse",
                "Stripe valide le paiement, puis le bon unique est envoyé par email.",
              ],
            ].map(([Icon, title, text], keyIndex) => (
              <article key={`${String(title)}-${keyIndex}`}>
                <Icon className="size-7 text-[#C9A86A]" />
                <h2 className="mt-5 font-heading text-3xl">{String(title)}</h2>
                <p className="mt-3 text-sm leading-7 text-white/45">
                  {String(text)}
                </p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
