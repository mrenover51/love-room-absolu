import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata({
  title: "Communiqués de presse | Love Room Absolu",
  description:
    "Retrouvez les informations presse officielles et actualités publiées par Love Room Absolu à Avize.",
  path: "/communiques-presse",
});
export default function Releases() {
  return (
    <>
      <Header />
      <main className="page-shell pb-24 pt-36">
        <Breadcrumb current="Communiqués de presse" />
        <p className="eyebrow mt-10 text-[#C9A86A]">Actualités officielles</p>
        <h1 className="mt-4 font-heading text-6xl sm:text-8xl">
          Communiqués de presse.
        </h1>
        <p className="mt-6 max-w-2xl leading-8 text-white/55">
          Cette rubrique accueillera uniquement des annonces datées, vérifiées
          et effectivement diffusées. Aucun communiqué fictif n’est publié pour
          créer artificiellement un historique médiatique.
        </p>
        <section className="mt-14 rounded-3xl border border-dashed border-white/10 p-10 text-center">
          <h2 className="font-heading text-4xl">Aucun communiqué publié</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/40">
            Les journalistes peuvent consulter dès maintenant le dossier
            factuel, les photographies et les coordonnées de l’établissement.
          </p>
          <Link
            href="/presse"
            className="mt-6 inline-flex rounded-full border border-[#C9A86A]/40 px-6 py-3 text-[#C9A86A]"
          >
            Accéder à l’espace presse
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
