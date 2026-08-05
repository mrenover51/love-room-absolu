import Link from "next/link";
import Image from "next/image";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { pageMetadata } from "@/lib/seo";
import {
  getPublishedPartners,
  partnerCategories,
} from "@/lib/partners/partners";
export const metadata = pageMetadata({
  title: "Partenaires locaux en Champagne | Absolu",
  description:
    "Découvrez les partenaires locaux vérifiés de Love Room Absolu : restaurants, Champagne, photographes, spas, massages et activités.",
  path: "/partenaires",
});
export default async function Partners() {
  const partners = await getPublishedPartners();
  return (
    <>
      <Header />
      <main className="pb-24 pt-36">
        <section className="page-shell">
          <Breadcrumb current="Partenaires" />
          <p className="eyebrow mt-10 text-[#C9A86A]">Réseau local vérifié</p>
          <h1 className="mt-4 max-w-4xl font-heading text-6xl sm:text-8xl">
            Les belles adresses qui entourent Absolu.
          </h1>
          <p className="mt-6 max-w-2xl leading-8 text-white/55">
            Chaque partenariat publié est validé manuellement. Une présence dans
            nos guides éditoriaux ne constitue jamais, à elle seule, un
            partenariat commercial.
          </p>
          <nav
            aria-label="Catégories de partenaires"
            className="mt-10 flex flex-wrap gap-3"
          >
            {Object.entries(partnerCategories).map(([key, label]) => (
              <a
                key={key}
                href={`#${key}`}
                className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/55"
              >
                {label}
              </a>
            ))}
          </nav>
        </section>
        {Object.entries(partnerCategories).map(([category, label], keyIndex) => {
          const items = partners.filter((item) => item.category === category);
          return (
            <section
              key={`${category}-${keyIndex}`}
              id={category}
              className="page-shell mt-20 scroll-mt-28"
            >
              <h2 className="font-heading text-5xl">{label}</h2>
              {items.length ? (
                <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {items.map((item) => (
                    <article
                      key={item.id}
                      className="overflow-hidden rounded-3xl border border-white/10 bg-[#121212]"
                    >
                      <div className="relative aspect-[16/9] bg-white/[.03]">
                        {item.image_url ? (
                          <Image
                            src={item.image_url}
                            alt={`Partenaire ${item.name} à ${item.city}`}
                            fill
                            sizes="(max-width:768px) 100vw,33vw"
                            className="object-cover"
                          />
                        ) : (
                          <div className="grid size-full place-items-center font-heading text-4xl text-white/15">
                            {item.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <p className="text-xs text-[#C9A86A]">{item.city}</p>
                        <h3 className="mt-2 font-heading text-3xl">
                          <Link href={`/partenaires/${item.slug}`}>
                            {item.name}
                          </Link>
                        </h3>
                        <p className="mt-4 line-clamp-3 text-sm leading-7 text-white/45">
                          {item.description}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="mt-6 rounded-2xl border border-dashed border-white/10 p-6 text-sm text-white/35">
                  Aucun partenaire de cette catégorie n’est encore publié. Les
                  candidatures sont étudiées individuellement.
                </p>
              )}
            </section>
          );
        })}
        <section className="page-shell mt-24 rounded-3xl border border-[#C9A86A]/25 bg-[#C9A86A]/[.05] p-8 text-center">
          <h2 className="font-heading text-4xl">Proposer un partenariat</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/50">
            Vous partagez notre exigence d’accueil et intervenez en Champagne ?
            Présentez votre activité, votre site et le projet éditorial
            envisagé.
          </p>
          <Link
            href="/contact"
            className="mt-6 inline-flex min-h-12 items-center rounded-full bg-[#C9A86A] px-7 font-semibold text-black"
          >
            Contacter Absolu
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
