import Image from "next/image";
import Link from "next/link";
import {
  Bath,
  BedDouble,
  CalendarCheck,
  Check,
  CreditCard,
  HeartHandshake,
  KeyRound,
  ShieldCheck,
  Sparkles,
  Star,
  Waves,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { PremiumButton } from "@/components/shared/premium-button";
import { Reveal } from "@/components/shared/reveal";
import { pageMetadata } from "@/lib/seo";
import { safeJsonLd } from "@/lib/schema/validator";
import { siteConfig } from "@/lib/site-config";

const title = "Notre histoire | Love Room Absolu à Avize";
const description =
  "Découvrez l’histoire de Love Room Absolu, née de plusieurs années d’accueil à Avize et du désir de créer une suite intime entièrement pensée pour les couples.";
const pageUrl = `${siteConfig.url}/notre-histoire`;
const imageUrl = `${siteConfig.url}/images/optimized/entree2.webp`;

export const metadata = pageMetadata({
  title,
  description,
  path: "/notre-histoire",
  image: "/images/optimized/entree2.webp",
  imageAlt: "Entrée chaleureuse de la suite Love Room Absolu à Avize",
});

const expectations = [
  "Le confort",
  "La propreté",
  "Le calme",
  "La qualité de l’accueil",
  "La disponibilité",
];
const intentions = [
  {
    icon: Bath,
    title: "Baignoire balnéo",
    detail: "Un rituel de détente à partager.",
  },
  {
    icon: Waves,
    title: "Sauna infrarouge",
    detail: "Une chaleur douce, en toute intimité.",
  },
  {
    icon: Sparkles,
    title: "Ambiance tamisée",
    detail: "Une lumière qui transforme le temps.",
  },
  {
    icon: BedDouble,
    title: "Literie premium",
    detail: "Le confort au cœur de la nuit.",
  },
  {
    icon: HeartHandshake,
    title: "Décoration sensible",
    detail: "Des matières choisies avec mesure.",
  },
  {
    icon: KeyRound,
    title: "Intimité",
    detail: "Un lieu entièrement réservé au couple.",
  },
];
const appreciations = [
  "Propreté particulièrement appréciée",
  "Accueil chaleureux",
  "Confort de la literie",
  "Calme et détente",
  "Excellent emplacement pour découvrir la Champagne",
];
const commitments = [
  {
    icon: Sparkles,
    title: "Préparation minutieuse",
    detail: "Chaque détail est vérifié avant votre arrivée.",
  },
  {
    icon: ShieldCheck,
    title: "Propreté irréprochable",
    detail: "Une exigence constante, séjour après séjour.",
  },
  {
    icon: HeartHandshake,
    title: "Accueil personnalisé",
    detail: "Une présence attentive, toujours discrète.",
  },
  {
    icon: CreditCard,
    title: "Paiement sécurisé",
    detail: "Un parcours clair et protégé.",
  },
  {
    icon: KeyRound,
    title: "Réservation directe",
    detail: "Une relation simple, sans intermédiaire.",
  },
  {
    icon: CalendarCheck,
    title: "Annulation jusqu’à J-5",
    detail: "Une souplesse précisée dans nos conditions.",
  },
];
const faqs = [
  {
    question: "D’où vient l’idée de Love Room Absolu ?",
    answer:
      "Love Room Absolu est née de plusieurs années passées à accueillir des voyageurs dans nos hébergements à Avize, et de l’envie de créer un lieu entièrement dédié aux couples.",
  },
  {
    question:
      "Les appréciations présentées concernent-elles Love Room Absolu ?",
    answer:
      "Non. Elles reflètent les retours reçus au fil des années par les voyageurs accueillis dans nos hébergements à Avize. Elles ne constituent pas des avis attribués à Love Room Absolu.",
  },
  {
    question: "Quelle est la philosophie d’Absolu ?",
    answer:
      "Prendre soin d’une seule suite avec une attention constante, afin que chaque couple puisse vivre un moment intime, calme et véritablement privilégié.",
  },
] as const;

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "AboutPage",
      "@id": `${pageUrl}#page`,
      name: title,
      description,
      url: pageUrl,
      primaryImageOfPage: { "@id": `${pageUrl}#image` },
      about: { "@id": `${siteConfig.url}#organization` },
    },
    {
      "@type": "Organization",
      "@id": `${siteConfig.url}#organization`,
      name: "Love Room Absolu",
      url: siteConfig.url,
      email: siteConfig.email,
      telephone: siteConfig.phone,
      address: {
        "@type": "PostalAddress",
        streetAddress: "36 rue Pasteur",
        postalCode: "51190",
        addressLocality: "Avize",
        addressCountry: "FR",
      },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Accueil",
          item: siteConfig.url,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Notre histoire",
          item: pageUrl,
        },
      ],
    },
    {
      "@type": "FAQPage",
      "@id": `${pageUrl}#faq`,
      mainEntity: faqs.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    },
    {
      "@type": "ImageObject",
      "@id": `${pageUrl}#image`,
      contentUrl: imageUrl,
      width: 1448,
      height: 1086,
      caption: "L’univers intime de Love Room Absolu à Avize",
    },
  ],
};

export default function StoryPage() {
  return (
    <>
      <Header />
      <main>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
        />
        <section className="relative flex min-h-[82svh] items-end overflow-hidden pb-16 pt-32 sm:min-h-[88svh] sm:pb-24">
          <Image
            src="/images/optimized/entree2.webp"
            alt="Entrée chaleureuse de la suite Love Room Absolu à Avize"
            fill
            fetchPriority="high"
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,9,8,.9),rgba(11,9,8,.32)_68%,rgba(11,9,8,.12))]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0908] via-transparent to-black/35" />
          <div className="page-shell relative">
            <Breadcrumb current="Notre histoire" />
            <Reveal className="mt-10 max-w-4xl">
              <p className="eyebrow text-[#D0AE72]">L’origine d’Absolu</p>
              <h1 className="mt-6 font-heading text-6xl leading-[.95] tracking-[-.025em] sm:text-8xl lg:text-9xl">
                Une nouvelle expérience née d’une belle histoire
              </h1>
              <p className="mt-8 max-w-2xl text-base leading-8 text-white/72 sm:text-lg sm:leading-9">
                Après plusieurs années à accueillir des voyageurs à Avize, nous
                avons imaginé un lieu entièrement pensé pour les couples.
              </p>
            </Reveal>
          </div>
        </section>

        <section className="material-stone section-space text-[#1B1512]">
          <div className="page-shell grid gap-16 lg:grid-cols-[.8fr_1.2fr] lg:gap-28">
            <Reveal>
              <p className="eyebrow text-[#8D6637]">Notre parcours</p>
              <h2 className="mt-6 font-heading text-5xl leading-[1.04] sm:text-7xl">
                Accueillir nous a appris à écouter.
              </h2>
            </Reveal>
            <Reveal delay={0.08}>
              <div className="space-y-6 text-base leading-9 text-[#66594F]">
                <p>
                  Depuis plusieurs années, nous accueillons des voyageurs dans
                  nos hébergements à Avize. Derrière chaque arrivée, chaque
                  échange et chaque départ, nous avons appris ce qui rend un
                  séjour réellement agréable.
                </p>
                <p>
                  Cette expérience nous a permis de comprendre que l’essentiel
                  tient souvent à des attentions simples, constantes et
                  sincères.
                </p>
              </div>
              <ul className="mt-10 grid gap-3 sm:grid-cols-2">
                {expectations.map((item, keyIndex) => (
                  <li
                    key={`${item}-${keyIndex}`}
                    className="flex items-center gap-3 border-b border-[#8D6637]/15 py-4 text-sm"
                  >
                    <Check
                      className="size-4 text-[#8D6637]"
                      aria-hidden="true"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </section>

        <section className="section-space bg-[#0B0908]">
          <div className="page-shell">
            <Reveal className="max-w-3xl">
              <p className="eyebrow text-[#D0AE72]">
                Pourquoi Love Room Absolu ?
              </p>
              <h2 className="mt-6 font-heading text-5xl leading-[1.04] sm:text-7xl">
                Imaginer un lieu qui n’appartient qu’à deux.
              </h2>
              <p className="mt-8 max-w-2xl text-base leading-8 text-white/58">
                Nous souhaitions aller plus loin : créer un espace où le confort
                ne serait jamais séparé de l’émotion, et où chaque détail
                protégerait la tranquillité du couple.
              </p>
            </Reveal>
            <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {intentions.map((item, index) => (
                <Reveal
                  key={`${item.title}-${index}`}
                  delay={index * 0.04}
                  className="h-full"
                >
                  <article className="luxury-card h-full border border-[#D0AE72]/15 bg-white/[.035] p-7">
                    <item.icon
                      className="size-5 text-[#D0AE72]"
                      aria-hidden="true"
                    />
                    <h3 className="mt-8 font-heading text-3xl">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-white/45">
                      {item.detail}
                    </p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="section-space bg-[#F3EDE4] text-[#1B1512]">
          <div className="page-shell">
            <Reveal className="mx-auto max-w-3xl text-center">
              <p className="eyebrow text-[#8D6637]">
                Une expérience de l’accueil
              </p>
              <h2 className="mt-6 font-heading text-5xl sm:text-7xl">
                Des années de retours précieux.
              </h2>
              <p className="mt-8 text-base leading-9 text-[#66594F]">
                Notre expérience de l’accueil à Avize s’appuie sur plusieurs
                années de retours très positifs de voyageurs ayant séjourné dans
                nos hébergements.
              </p>
            </Reveal>
            <div className="mx-auto mt-14 grid max-w-5xl gap-4 md:grid-cols-2">
              {appreciations.map((item, index) => (
                <Reveal
                  key={`${item}-${index}`}
                  delay={index * 0.04}
                  className={index === 4 ? "md:col-span-2" : ""}
                >
                  <article className="h-full rounded-[1.5rem] border border-[#8D6637]/15 bg-white/55 p-7 shadow-[var(--shadow-light)]">
                    <div
                      className="flex gap-1 text-[#A77D43]"
                      aria-label="Cinq étoiles"
                    >
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className="size-3.5 fill-current"
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                    <h3 className="mt-5 font-heading text-2xl">{item}</h3>
                  </article>
                </Reveal>
              ))}
            </div>
            <p className="mx-auto mt-9 max-w-3xl border-l border-[#A77D43]/40 pl-5 text-xs leading-6 text-[#75675C]">
              Ces appréciations reflètent les retours des voyageurs accueillis
              dans nos hébergements à Avize. Elles ne sont pas présentées comme
              des avis concernant Love Room Absolu.
            </p>
          </div>
        </section>

        <section className="section-space overflow-hidden bg-[#17110E]">
          <div className="page-shell grid items-center gap-16 lg:grid-cols-2 lg:gap-24">
            <Reveal>
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-[var(--shadow-lift)]">
                <Image
                  src="/images/optimized/lit.webp"
                  alt="Lit de la suite Absolu dans une atmosphère intime"
                  fill
                  sizes="(min-width:1024px) 45vw, 100vw"
                  className="object-cover transition-transform duration-[1400ms] hover:scale-[1.035]"
                />
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="eyebrow text-[#D0AE72]">Notre philosophie</p>
              <h2 className="mt-6 font-heading text-5xl leading-[1.04] sm:text-7xl">
                Une seule suite. Toute notre attention.
              </h2>
              <div className="mt-9 space-y-6 leading-9 text-white/58">
                <p>
                  Nous préférons proposer une seule suite parfaitement
                  entretenue plutôt que plusieurs expériences impersonnelles.
                </p>
                <p>
                  Ce choix nous permet de rester attentifs au lieu, à son
                  atmosphère et à ces détails silencieux qui donnent le
                  sentiment d’être attendu.
                </p>
                <p>
                  Chaque séjour doit donner le sentiment de vivre un moment
                  privilégié.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="section-space material-stone text-[#1B1512]">
          <div className="page-shell">
            <Reveal>
              <p className="eyebrow text-[#8D6637]">Nos engagements</p>
              <h2 className="mt-6 font-heading text-5xl sm:text-7xl">
                Prendre soin de l’essentiel.
              </h2>
            </Reveal>
            <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {commitments.map((item, index) => (
                <Reveal
                  key={`${item.title}-${index}`}
                  delay={index * 0.04}
                  className="h-full"
                >
                  <article className="luxury-card h-full border border-[#8D6637]/15 bg-white/55 p-7 shadow-[var(--shadow-light)]">
                    <item.icon
                      className="size-5 text-[#8D6637]"
                      aria-hidden="true"
                    />
                    <h3 className="mt-8 font-heading text-3xl">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-[#716359]">
                      {item.detail}
                    </p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-[#0B0908] py-28 sm:py-40">
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 size-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#D4A4A0]/[.07] blur-[120px]"
          />
          <Reveal className="page-shell relative mx-auto max-w-5xl text-center">
            <span
              aria-hidden="true"
              className="mx-auto block h-16 w-px bg-gradient-to-b from-transparent to-[#D0AE72]"
            />
            <blockquote className="mt-12 font-heading text-4xl italic leading-tight text-[#F7F1E8] sm:text-6xl">
              « Le véritable luxe est de prendre le temps de créer des souvenirs
              à deux. »
            </blockquote>
          </Reveal>
        </section>

        <section className="section-space border-t border-[#D0AE72]/12 bg-[#15110F] text-center">
          <Reveal className="page-shell">
            <p className="eyebrow text-[#D0AE72]">
              Votre histoire commence ici
            </p>
            <h2 className="mx-auto mt-6 max-w-4xl font-heading text-5xl leading-[1.04] sm:text-7xl">
              Prêts à vivre votre parenthèse romantique ?
            </h2>
            <PremiumButton href="/reservation" className="mt-10">
              Vivre cette expérience
            </PremiumButton>
            <div className="mt-8 flex justify-center gap-6 text-xs text-white/45">
              <Link
                href="/la-suite"
                className="transition-colors hover:text-white"
              >
                Découvrir la suite
              </Link>
              <Link href="/faq" className="transition-colors hover:text-white">
                Consulter la FAQ
              </Link>
              <Link
                href="/contact"
                className="transition-colors hover:text-white"
              >
                Nous écrire
              </Link>
            </div>
          </Reveal>
        </section>

        <section
          className="section-space material-stone border-t border-[#8D6637]/10 text-[#1B1512]"
          aria-labelledby="story-faq"
        >
          <div className="page-shell grid gap-14 lg:grid-cols-[.7fr_1.3fr] lg:gap-24">
            <Reveal>
              <p className="eyebrow text-[#8D6637]">En toute transparence</p>
              <h2
                id="story-faq"
                className="mt-6 font-heading text-5xl leading-[1.04] sm:text-6xl"
              >
                Quelques mots pour mieux nous connaître.
              </h2>
            </Reveal>
            <div className="space-y-3">
              {faqs.map((item, index) => (
                <Reveal key={`${item.question}-${index}`} delay={index * 0.04}>
                  <details className="group rounded-[1.25rem] border border-[#8D6637]/15 bg-white/45 p-6">
                    <summary className="cursor-pointer list-none font-heading text-2xl marker:hidden">
                      {item.question}
                    </summary>
                    <p className="mt-4 max-w-2xl text-sm leading-7 text-[#66594F]">
                      {item.answer}
                    </p>
                  </details>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
