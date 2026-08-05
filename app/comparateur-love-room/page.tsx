import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata({
  title: "Comparateur Love Room : pourquoi choisir Absolu ?",
  description:
    "Comparez Absolu, la réservation directe et Avize selon les équipements, la localisation et la préparation du séjour.",
  path: "/comparateur-love-room",
});
const rows = [
  [
    "Localisation",
    "Avize, Côte des Blancs",
    "Variable",
    "Village viticole proche d’Épernay",
  ],
  [
    "Baignoire balnéo",
    "Dans la suite, privative",
    "Parfois partagée",
    "Vérifier la fiche",
  ],
  [
    "Sauna",
    "Infrarouge et privatif",
    "Pas toujours inclus",
    "Vérifier la fiche",
  ],
  [
    "Réservation",
    "Directe sur le site",
    "Intermédiaire possible",
    "Lire les conditions",
  ],
  [
    "Programme local",
    "Caves, restaurants, vignoble",
    "Selon destination",
    "Préserver du temps à deux",
  ],
];
export default function Compare() {
  return (
    <>
      <Header />
      <main className="page-shell pb-24 pt-36">
        <Breadcrumb current="Comparateur Love Room" />
        <p className="eyebrow mt-12 text-[#C9A86A]">Aide à la décision</p>
        <h1 className="mt-4 max-w-5xl font-heading text-7xl">
          Pourquoi choisir Absolu, réserver en direct et séjourner à Avize ?
        </h1>
        <p className="mt-7 max-w-3xl text-lg leading-8 text-white/60">
          Absolu réunit une suite indépendante, des équipements de bien-être
          privatifs et une implantation au cœur de la Côte des Blancs. Le
          tableau distingue les faits confirmés des points à vérifier.
        </p>
        <section className="mt-16">
          <h2 className="font-heading text-5xl">Comparatif essentiel</h2>
          <div className="mt-8 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr>
                  {["Critère", "Absolu", "Autre hébergement", "Conseil"].map(
                    (h, keyIndex) => (
                      <th key={`${h}-${keyIndex}`} className="border-b border-white/15 p-4">
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIndex) => (
                  <tr key={`row-${rowIndex}`}>
                    {row.map((cell, index) => (
                      <td
                        key={`cell-${rowIndex}-${index}`}
                        className={`border-b border-white/10 p-4 ${index ? "text-white/55" : "font-medium"}`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <div className="mt-16 grid gap-5 md:grid-cols-3">
          {[
            ["Pourquoi choisir Absolu ?", "/ressources/love-room-champagne"],
            ["Pourquoi réserver en direct ?", "/ressources/reserver-en-direct"],
            ["Pourquoi choisir Avize ?", "/ressources/pourquoi-avize"],
          ].map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="rounded-2xl border border-white/10 p-6 font-heading text-3xl"
            >
              {label}
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
