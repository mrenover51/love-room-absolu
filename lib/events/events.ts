export type SeasonalEvent = {
  slug: string;
  name: string;
  eyebrow: string;
  description: string;
  promise: string;
  season: string;
  image: string;
  personal: boolean;
  start: [number, number];
  end: [number, number];
  gallery: string[];
  faq: [string, string][];
  tips: string[];
};
const images = [
  "lit.webp",
  "salledebainviolet.webp",
  "sauna.webp",
  "entree2.webp",
  "salledebain.webp",
  "saunaviolet.webp",
];
const faq = (name: string): [string, string][] => [
  [
    `Quand réserver pour ${name.toLowerCase()} ?`,
    `Consultez le calendrier dès que votre date est connue. Les périodes symboliques et les week-ends peuvent être demandés plus tôt que les nuits en semaine.`,
  ],
  [
    "Les offres sont-elles garanties ?",
    "Seuls le prix, les prestations et les éventuelles réductions affichés dans le récapitulatif de réservation sont applicables. Cette page ne crée aucune promotion fictive.",
  ],
  [
    "Les équipements sont-ils privatifs ?",
    "Oui. La baignoire balnéo, le sauna infrarouge et la douche à l’italienne sont réservés aux occupants de la suite pendant leur séjour.",
  ],
  [
    "Peut-on ajouter une attention ?",
    "Les options effectivement disponibles apparaissent dans le tunnel de réservation. Leur prix et leur contenu sont confirmés avant paiement.",
  ],
  [
    "Où se trouve Absolu ?",
    "La Suite Absolu se situe au 36 rue Pasteur à Avize, au cœur de la Côte des Blancs, près d’Épernay.",
  ],
];
const raw: Omit<SeasonalEvent, "image" | "gallery" | "faq" | "tips">[] = [
  {
    slug: "saint-valentin",
    name: "Saint-Valentin",
    eyebrow: "14 février",
    description:
      "Préparez une Saint-Valentin en Champagne dans une suite indépendante avec baignoire balnéo et sauna privatifs à Avize.",
    promise:
      "Une soirée à deux qui laisse davantage de place à votre histoire qu’aux conventions.",
    season: "Hiver",
    personal: false,
    start: [2, 14],
    end: [2, 15],
  },
  {
    slug: "noel",
    name: "Noël",
    eyebrow: "Fêtes de fin d’année",
    description:
      "Imaginez un Noël romantique à Avize, entre lumières douces, bien-être privatif et paysages d’hiver en Champagne.",
    promise: "Créer une parenthèse chaleureuse au milieu du rythme des fêtes.",
    season: "Hiver",
    personal: false,
    start: [12, 24],
    end: [12, 26],
  },
  {
    slug: "nouvel-an",
    name: "Nouvel An",
    eyebrow: "31 décembre",
    description:
      "Célébrez le Nouvel An en couple dans une suite romantique avec spa privatif au cœur de la Champagne.",
    promise:
      "Commencer une nouvelle année dans le calme, la complicité et une atmosphère choisie.",
    season: "Hiver",
    personal: false,
    start: [12, 31],
    end: [1, 2],
  },
  {
    slug: "printemps",
    name: "Printemps",
    eyebrow: "Mars à juin",
    description:
      "Profitez du printemps en Champagne pour associer une Love Room à Avize aux premières balades dans le vignoble.",
    promise:
      "Retrouver la lumière, les coteaux et le plaisir de prendre le temps à deux.",
    season: "Printemps",
    personal: false,
    start: [3, 20],
    end: [6, 21],
  },
  {
    slug: "ete",
    name: "Été",
    eyebrow: "Juin à septembre",
    description:
      "Organisez une escapade romantique d’été en Champagne avec visites, terrasses et suite spa privative à Avize.",
    promise:
      "Composer des journées de découverte et des soirées entièrement privées.",
    season: "Été",
    personal: false,
    start: [6, 21],
    end: [9, 22],
  },
  {
    slug: "automne",
    name: "Automne",
    eyebrow: "Septembre à décembre",
    description:
      "Découvrez la Champagne en automne depuis une suite romantique à Avize avec sauna et baignoire balnéo privatifs.",
    promise:
      "Prolonger les couleurs du vignoble par une soirée douce et enveloppante.",
    season: "Automne",
    personal: false,
    start: [9, 22],
    end: [12, 21],
  },
  {
    slug: "hiver",
    name: "Hiver",
    eyebrow: "Décembre à mars",
    description:
      "Vivez un séjour romantique d’hiver à Avize avec chaleur du sauna, balnéo privative et ambiance lumineuse.",
    promise: "Faire du froid extérieur une invitation à ralentir ensemble.",
    season: "Hiver",
    personal: false,
    start: [12, 21],
    end: [3, 20],
  },
  {
    slug: "vendanges",
    name: "Vendanges",
    eyebrow: "Saison du vignoble",
    description:
      "Préparez un séjour pendant la période des vendanges en Champagne depuis la Suite Absolu à Avize.",
    promise:
      "Observer l’effervescence du vignoble tout en conservant un refuge calme à deux.",
    season: "Automne",
    personal: false,
    start: [9, 1],
    end: [10, 16],
  },
  {
    slug: "anniversaire",
    name: "Anniversaire de couple",
    eyebrow: "Votre date",
    description:
      "Célébrez un anniversaire de couple en Champagne dans une suite avec baignoire balnéo et sauna privatifs.",
    promise:
      "Transformer une date personnelle en souvenir construit autour de votre histoire.",
    season: "Toute l’année",
    personal: true,
    start: [1, 1],
    end: [12, 31],
  },
  {
    slug: "demande-en-mariage",
    name: "Demande en mariage",
    eyebrow: "Un moment unique",
    description:
      "Préparez une demande en mariage intime à Avize dans une suite romantique au cœur de la Champagne.",
    promise:
      "Préserver la sincérité de la demande dans un espace véritablement privé.",
    season: "Toute l’année",
    personal: true,
    start: [1, 1],
    end: [12, 31],
  },
  {
    slug: "lune-de-miel",
    name: "Lune de miel",
    eyebrow: "Après le mariage",
    description:
      "Prolongez votre mariage par une lune de miel en Champagne dans une suite avec spa entièrement privatif.",
    promise:
      "Créer un sas calme après les émotions du mariage et commencer la suite de l’histoire.",
    season: "Toute l’année",
    personal: true,
    start: [1, 1],
    end: [12, 31],
  },
];
export const seasonalEvents: SeasonalEvent[] = raw.map((item, index) => ({
  ...item,
  image: `/images/optimized/${images[index % images.length]}`,
  gallery: [
    `/images/optimized/${images[index % images.length]}`,
    `/images/optimized/${images[(index + 2) % images.length]}`,
    `/images/optimized/${images[(index + 4) % images.length]}`,
  ],
  faq: faq(item.name),
  tips: [
    "Choisir vos dates avant d’organiser les activités extérieures.",
    "Vérifier les options réellement proposées dans le récapitulatif.",
    "Ne prévoir qu’une activité structurante pour garder du temps dans la suite.",
    "Réserver les restaurants et visites directement auprès des établissements.",
  ],
}));
export const getSeasonalEvent = (slug: string) =>
  seasonalEvents.find((item) => item.slug === slug);
const utc = (year: number, [month, day]: [number, number]) =>
  new Date(Date.UTC(year, month - 1, day, 12));
export function eventEdition(event: SeasonalEvent, now = new Date()) {
  let year = now.getUTCFullYear();
  let start = utc(year, event.start),
    end = utc(year, event.end);
  if (event.end[0] < event.start[0]) end = utc(year + 1, event.end);
  if (end < now) {
    year++;
    start = utc(year, event.start);
    end =
      event.end[0] < event.start[0]
        ? utc(year + 1, event.end)
        : utc(year, event.end);
  }
  return { year, start, end };
}
