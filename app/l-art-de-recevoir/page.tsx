import Image from "next/image";
import Link from "next/link";
import {
  Bath,
  BedDouble,
  CalendarCheck,
  Check,
  Coffee,
  CreditCard,
  Eye,
  HeartHandshake,
  KeyRound,
  LampWallUp,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
  Waves,
} from "lucide-react";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { PremiumButton } from "@/components/shared/premium-button";
import { Reveal } from "@/components/shared/reveal";
import { pageMetadata } from "@/lib/seo";
import { safeJsonLd } from "@/lib/schema/validator";
import { siteConfig } from "@/lib/site-config";

const title = "L’art de recevoir à Avize | Love Room Absolu";
const description =
  "Découvrez l’art de recevoir selon Love Room Absolu : une expérience intime née de plusieurs années d’accueil à Avize, au cœur de la Champagne.";
const pageUrl = `${siteConfig.url}/l-art-de-recevoir`;
const imageUrl = `${siteConfig.url}/images/optimized/lit.webp`;

export const metadata = pageMetadata({
  title,
  description,
  path: "/l-art-de-recevoir",
  image: "/images/optimized/lit.webp",
  imageAlt: "Atmosphère élégante de Love Room Absolu à Avize",
});

const lessons = [
  "Le calme",
  "Le confort",
  "La propreté",
  "L’attention portée aux détails",
  "La disponibilité",
  "L’accueil",
];
const details = [
  {
    icon: Bath,
    title: "Baignoire balnéo",
    text: "La douceur de ralentir ensemble.",
  },
  {
    icon: Waves,
    title: "Sauna infrarouge",
    text: "Une chaleur enveloppante et privée.",
  },
  {
    icon: BedDouble,
    title: "Literie premium",
    text: "Un repos profond, sans compromis.",
  },
  {
    icon: LampWallUp,
    title: "Ambiance lumineuse",
    text: "Une atmosphère qui évolue avec la soirée.",
  },
  {
    icon: Coffee,
    title: "Coin café",
    text: "Le plaisir d’un réveil à son rythme.",
  },
  {
    icon: Sparkles,
    title: "Décoration soignée",
    text: "Des matières et des lignes choisies avec mesure.",
  },
  {
    icon: KeyRound,
    title: "Intimité",
    text: "Une suite entièrement pensée pour deux.",
  },
];
const appreciations = [
  "Propreté",
  "Confort",
  "Accueil",
  "Calme",
  "Emplacement",
  "Qualité de la literie",
];
const commitments = [
  {
    icon: Sparkles,
    title: "Préparation minutieuse",
    text: "Avant chaque arrivée, la suite est préparée avec une attention entière.",
  },
  {
    icon: ShieldCheck,
    title: "Ménage rigoureux",
    text: "La propreté demeure une exigence fondamentale et constante.",
  },
  {
    icon: HeartHandshake,
    title: "Accueil personnalisé",
    text: "Une présence disponible, attentive et jamais intrusive.",
  },
  {
    icon: CreditCard,
    title: "Paiement sécurisé",
    text: "Un parcours fiable, clair et protégé.",
  },
  {
    icon: KeyRound,
    title: "Réservation directe",
    text: "Un échange simple, sans intermédiaire.",
  },
  {
    icon: CalendarCheck,
    title: "Annulation jusqu’à J-5",
    text: "Une souplesse sans frais selon nos conditions.",
  },
  {
    icon: Eye,
    title: "Disponibilité",
    text: "Une réponse attentive avant comme pendant le séjour.",
  },
];
const champagne = [
  {
    href: "/guide-touristique/cote-des-blancs",
    label: "La Côte des Blancs",
    text: "Des paysages de craie et de vignes qui racontent le Chardonnay.",
  },
  {
    href: "/guide-touristique/avenue-de-champagne",
    label: "Les maisons de Champagne",
    text: "Des caves, des savoir-faire et une histoire à découvrir à deux.",
  },
  {
    href: "/restaurants",
    label: "Les restaurants",
    text: "Des tables choisies pour prolonger la soirée avec justesse.",
  },
  {
    href: "/blog/plus-beaux-villages-champagne",
    label: "Les villages classés",
    text: "Une Champagne intime, faite de pierres claires et de chemins tranquilles.",
  },
];
const faqs = [
  {
    question: "Que signifie l’art de recevoir chez Absolu ?",
    answer:
      "C’est une attention portée à l’ensemble du séjour : la préparation du lieu, sa propreté, son calme et une présence disponible sans jamais troubler l’intimité du couple.",
  },
  {
    question:
      "Les appréciations de cette page concernent-elles Love Room Absolu ?",
    answer:
      "Non. Elles reflètent les retours laissés au fil des années par les voyageurs accueillis dans nos hébergements à Avize. Elles ne sont pas des avis attribués à Love Room Absolu.",
  },
  {
    question: "Pourquoi avoir choisi Avize ?",
    answer:
      "Avize se situe au cœur de la Côte des Blancs, à proximité des maisons de Champagne, des restaurants et de villages emblématiques. Le lieu invite naturellement à ralentir.",
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
          name: "L’art de recevoir",
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
      caption: "L’art de recevoir selon Love Room Absolu à Avize",
    },
  ],
};

export default function ArtOfHostingPage() {
  return (
    <>
      <Header />
      <main>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
        />

        <section className="relative flex min-h-[84svh] items-end overflow-hidden pb-16 pt-32 sm:min-h-[90svh] sm:pb-24">
          <Image
            src="/images/optimized/lit.webp"
            alt="Atmosphère intime et lumineuse de Love Room Absolu"
            fill
            fetchPriority="high"
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,9,8,.92),rgba(20,13,10,.36)_65%,rgba(11,9,8,.12))]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0908] via-transparent to-black/30" />
          <div className="page-shell relative">
            <Breadcrumb current="L’art de recevoir" />
            <Reveal className="mt-10 max-w-4xl">
              <p className="eyebrow text-[#D0AE72]">
                Une attention de chaque instant
              </p>
              <h1 className="mt-6 font-heading text-7xl leading-[.88] tracking-[-.035em] sm:text-9xl lg:text-[10rem]">
                L’art de recevoir
              </h1>
              <p className="mt-8 font-heading text-2xl italic text-[#E8DCCB] sm:text-3xl">
                Chaque séjour commence bien avant votre arrivée.
              </p>
              <p className="mt-6 max-w-2xl text-base leading-8 text-white/68">
                Depuis plusieurs années, nous accueillons des voyageurs à Avize
                avec une même ambition : offrir un lieu où l’on se sent
                immédiatement bien.
              </p>
            </Reveal>
          </div>
        </section>

        <section className="material-stone section-space text-[#1B1512]">
          <div className="page-shell grid gap-16 lg:grid-cols-[.82fr_1.18fr] lg:gap-28">
            <Reveal>
              <p className="eyebrow text-[#8D6637]">Notre histoire</p>
              <h2 className="mt-6 font-heading text-5xl leading-[1.04] sm:text-7xl">
                L’expérience précède toujours l’évidence.
              </h2>
            </Reveal>
            <Reveal delay={0.08}>
              <div className="space-y-6 text-base leading-9 text-[#66594F]">
                <p>
                  Avant Love Room Absolu, nous accueillions déjà des voyageurs
                  dans nos hébergements à Avize. Au fil des années, leurs mots,
                  leurs silences et leurs habitudes nous ont appris ce qui fait
                  réellement la différence.
                </p>
                <p>
                  Nous avons compris que recevoir ne consiste pas simplement à
                  ouvrir une porte. C’est préparer un lieu avec soin, anticiper
                  sans imposer et rester disponible tout en laissant chacun
                  pleinement libre de son temps.
                </p>
                <p>
                  Love Room Absolu est née naturellement de cette expérience :
                  l’envie de consacrer tout ce savoir-faire à une seule
                  parenthèse, entièrement pensée pour les couples.
                </p>
              </div>
              <ul className="mt-10 grid gap-x-8 sm:grid-cols-2">
                {lessons.map((item) => (
                  <li
                    key={item}
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
              <p className="eyebrow text-[#D0AE72]">Pourquoi une Love Room ?</p>
              <h2 className="mt-6 font-heading text-5xl leading-[1.04] sm:text-7xl">
                Un lieu où tout ramène à l’essentiel.
              </h2>
              <p className="mt-8 max-w-2xl text-base leading-8 text-white/58">
                Nous voulions créer un lieu entièrement pensé pour deux. Un
                espace où chaque matière, chaque lumière et chaque équipement
                participe à une expérience cohérente, intime et apaisée.
              </p>
            </Reveal>
            <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {details.map((item, index) => (
                <Reveal
                  key={item.title}
                  delay={index * 0.035}
                  className="h-full"
                >
                  <article
                    className={`luxury-card h-full border border-[#D0AE72]/15 bg-white/[.035] p-7 ${index === 6 ? "lg:col-start-2 lg:col-span-2" : ""}`}
                  >
                    <item.icon
                      className="size-5 text-[#D0AE72]"
                      aria-hidden="true"
                    />
                    <h3 className="mt-8 font-heading text-3xl">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-white/45">
                      {item.text}
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
                Construite au fil des années
              </p>
              <h2 className="mt-6 font-heading text-5xl leading-[1.04] sm:text-7xl">
                Des retours qui ont façonné notre manière de recevoir.
              </h2>
              <p className="mt-8 text-base leading-9 text-[#66594F]">
                Notre expérience dans l’accueil de voyageurs à Avize nous a
                permis de recevoir de nombreux retours très positifs au fil des
                années.
              </p>
            </Reveal>
            <div className="mx-auto mt-14 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {appreciations.map((item, index) => (
                <Reveal key={item} delay={index * 0.04}>
                  <article className="h-full rounded-[1.5rem] border border-[#8D6637]/15 bg-white/55 p-7 text-center shadow-[var(--shadow-light)]">
                    <div
                      className="flex justify-center gap-1 text-[#A77D43]"
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
                    <h3 className="mt-5 font-heading text-3xl">{item}</h3>
                  </article>
                </Reveal>
              ))}
            </div>
            <p className="mx-auto mt-9 max-w-3xl border-l border-[#A77D43]/40 pl-5 text-xs leading-6 text-[#75675C]">
              Ces appréciations reflètent les retours laissés par les voyageurs
              accueillis dans nos hébergements à Avize. Elles ne constituent pas
              des avis attribués à Love Room Absolu.
            </p>
          </div>
        </section>

        <section className="section-space overflow-hidden bg-[#17110E]">
          <div className="page-shell grid items-center gap-16 lg:grid-cols-[1.1fr_.9fr] lg:gap-24">
            <Reveal>
              <div className="relative aspect-[5/4] overflow-hidden rounded-[2rem] shadow-[var(--shadow-lift)]">
                <Image
                  src="/images/optimized/entree1.webp"
                  alt="Détails soignés de l’entrée de la suite Absolu"
                  fill
                  sizes="(min-width:1024px) 52vw, 100vw"
                  className="object-cover transition-transform duration-[1400ms] hover:scale-[1.035]"
                />
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="eyebrow text-[#D0AE72]">Notre philosophie</p>
              <h2 className="mt-6 font-heading text-5xl leading-[1.04] sm:text-7xl">
                Peu, mais parfaitement.
              </h2>
              <div className="mt-9 space-y-6 leading-9 text-white/58">
                <p>
                  Nous préférons proposer une seule suite entretenue avec le
                  plus grand soin plutôt que plusieurs expériences
                  standardisées.
                </p>
                <p>
                  Ce choix impose de ne rien considérer comme acquis. La qualité
                  se rejoue avant chaque arrivée, dans une lumière ajustée, un
                  espace impeccable et une attention renouvelée.
                </p>
                <p>
                  Nous voulons que chaque couple reparte avec un souvenir qui
                  lui appartient.
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
                La constance comme signature.
              </h2>
            </Reveal>
            <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {commitments.map((item, index) => (
                <Reveal
                  key={item.title}
                  delay={index * 0.035}
                  className="h-full"
                >
                  <article className="luxury-card h-full border border-[#8D6637]/15 bg-white/55 p-7 shadow-[var(--shadow-light)]">
                    <item.icon
                      className="size-5 text-[#8D6637]"
                      aria-hidden="true"
                    />
                    <h3 className="mt-8 font-heading text-3xl">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-[#716359]">
                      {item.text}
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
            className="absolute left-1/2 top-1/2 size-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#D0AE72]/[.06] blur-[120px]"
          />
          <Reveal className="page-shell relative mx-auto max-w-5xl text-center">
            <span
              aria-hidden="true"
              className="mx-auto block h-16 w-px bg-gradient-to-b from-transparent to-[#D0AE72]"
            />
            <blockquote className="mt-12 font-heading text-4xl italic leading-tight text-[#F7F1E8] sm:text-6xl">
              « Le véritable luxe n’est pas d’en faire toujours plus.
              <br />
              C’est de prendre le temps de bien faire. »
            </blockquote>
          </Reveal>
        </section>

        <section className="section-space bg-[#E8DDD0] text-[#1B1512]">
          <div className="page-shell grid gap-14 lg:grid-cols-[.7fr_1.3fr] lg:gap-24">
            <Reveal>
              <p className="eyebrow text-[#8D6637]">La Champagne autrement</p>
              <h2 className="mt-6 font-heading text-5xl leading-[1.04] sm:text-7xl">
                Avize, au cœur d’un territoire d’exception.
              </h2>
              <p className="mt-8 leading-8 text-[#66594F]">
                Ici, les grands noms côtoient les chemins tranquilles. Avize
                offre un point de départ idéal pour découvrir la Champagne dans
                ce qu’elle a de plus vivant, de plus intime et de plus sincère.
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <div className="overflow-hidden rounded-[2rem] border border-[#8D6637]/15 bg-white/55 p-4 shadow-[var(--shadow-light)]">
                <div className="relative aspect-[16/10] overflow-hidden rounded-[1.4rem]">
                  <Image
                    src="/images/optimized/sauna.webp"
                    alt="Atmosphère chaleureuse évoquant l’art de vivre en Champagne"
                    fill
                    sizes="(min-width:1024px) 55vw, 100vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
                  <MapPin
                    className="absolute bottom-6 left-6 size-5 text-[#DEC38E]"
                    aria-hidden="true"
                  />
                </div>
                <div className="grid sm:grid-cols-2">
                  {champagne.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="group border-b border-[#8D6637]/12 p-6 transition-colors hover:bg-white/55 sm:odd:border-r"
                    >
                      <h3 className="font-heading text-2xl transition-colors group-hover:text-[#8D6637]">
                        {item.label}
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-[#716359]">
                        {item.text}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="section-space border-y border-[#D0AE72]/12 bg-[#15110F] text-center">
          <Reveal className="page-shell">
            <p className="eyebrow text-[#D0AE72]">À deux, simplement</p>
            <h2 className="mx-auto mt-6 max-w-4xl font-heading text-5xl leading-[1.04] sm:text-7xl">
              Et si votre prochaine parenthèse commençait ici ?
            </h2>
            <PremiumButton href="/reservation" className="mt-10">
              Vivre cette expérience
            </PremiumButton>
            <div className="mt-9 flex flex-wrap justify-center gap-6 text-xs text-white/45">
              <Link
                href="/notre-histoire"
                className="transition-colors hover:text-white"
              >
                Lire notre histoire
              </Link>
              <Link
                href="/la-suite"
                className="transition-colors hover:text-white"
              >
                Découvrir la suite
              </Link>
              <Link
                href="/guide-touristique"
                className="transition-colors hover:text-white"
              >
                Explorer la Champagne
              </Link>
            </div>
          </Reveal>
        </section>

        <section
          className="section-space material-stone text-[#1B1512]"
          aria-labelledby="hosting-faq"
        >
          <div className="page-shell grid gap-14 lg:grid-cols-[.7fr_1.3fr] lg:gap-24">
            <Reveal>
              <p className="eyebrow text-[#8D6637]">En toute transparence</p>
              <h2
                id="hosting-faq"
                className="mt-6 font-heading text-5xl leading-[1.04] sm:text-6xl"
              >
                Comprendre notre manière de recevoir.
              </h2>
            </Reveal>
            <div className="space-y-3">
              {faqs.map((item, index) => (
                <Reveal key={item.question} delay={index * 0.04}>
                  <details className="rounded-[1.25rem] border border-[#8D6637]/15 bg-white/45 p-6">
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
