import Link from "next/link";
import { Download, ImageIcon, Newspaper } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata({
  title: "Espace presse Love Room Absolu | Avize Champagne",
  description:
    "Informations vérifiées, dossier presse, logo et photographies officielles de la Love Room Absolu à Avize.",
  path: "/presse",
});
const downloads = [
  {
    label: "Logo Absolu — SVG",
    href: "/media/absolu-logo.svg",
    icon: ImageIcon,
  },
  {
    label: "Dossier presse — TXT",
    href: "/media/dossier-presse-absolu.txt",
    icon: Newspaper,
  },
  {
    label: "Photo officielle de la suite",
    href: "/images/optimized/lit.webp",
    icon: ImageIcon,
  },
  {
    label: "Photo baignoire balnéo",
    href: "/images/optimized/salledebain.webp",
    icon: ImageIcon,
  },
  {
    label: "Photo sauna privatif",
    href: "/images/optimized/sauna.webp",
    icon: ImageIcon,
  },
];
export default function Press() {
  return (
    <>
      <Header />
      <main className="page-shell pb-24 pt-36">
        <Breadcrumb current="Presse" />
        <p className="eyebrow mt-10 text-[#C9A86A]">Presse & médias</p>
        <h1 className="mt-4 max-w-4xl font-heading text-6xl sm:text-8xl">
          Raconter Absolu avec des informations justes.
        </h1>
        <p className="mt-6 max-w-2xl leading-8 text-white/55">
          Journalistes, médias et créateurs peuvent télécharger les actifs
          officiels ci-dessous. Toute publication doit distinguer les
          équipements confirmés des options à vérifier.
        </p>
        <section className="mt-16 grid gap-4 md:grid-cols-2">
          {downloads.map((item) => (
            <a
              key={item.href}
              href={item.href}
              download
              className="group flex items-center gap-5 rounded-2xl border border-white/10 bg-[#121212] p-6 hover:border-[#C9A86A]/40"
            >
              <item.icon className="size-6 text-[#C9A86A]" />
              <span className="flex-1">{item.label}</span>
              <Download className="size-4 text-white/30" />
            </a>
          ))}
        </section>
        <section className="mt-20 grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="font-heading text-4xl">Repères essentiels</h2>
            <ul className="mt-6 space-y-3 text-sm leading-7 text-white/55">
              <li>Suite indépendante de 35 m² à Avize.</li>
              <li>Baignoire balnéo et sauna infrarouge privatifs.</li>
              <li>Adresse : 36 rue Pasteur, 51190 Avize.</li>
              <li>
                Positionnement : séjour romantique et œnotourisme en Champagne.
              </li>
            </ul>
          </div>
          <div>
            <h2 className="font-heading text-4xl">Contact média</h2>
            <p className="mt-6 text-sm leading-7 text-white/55">
              Pour une interview, une demande de tournage ou des fichiers haute
              définition, contactez directement l’équipe.
            </p>
            <Link
              href="mailto:love.room.absolu@gmail.com"
              className="mt-5 inline-block text-[#C9A86A] underline"
            >
              love.room.absolu@gmail.com
            </Link>
          </div>
        </section>
        <nav
          className="mt-20 flex flex-wrap gap-4"
          aria-label="Ressources média"
        >
          <Link
            href="/medias"
            className="rounded-full border border-white/20 px-5 py-3"
          >
            Médiathèque
          </Link>
          <Link
            href="/influenceurs"
            className="rounded-full border border-white/20 px-5 py-3"
          >
            Collaborations influenceurs
          </Link>
          <Link
            href="/communiques-presse"
            className="rounded-full border border-white/20 px-5 py-3"
          >
            Communiqués de presse
          </Link>
        </nav>
      </main>
      <Footer />
    </>
  );
}
