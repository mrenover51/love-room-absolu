export const galleryCategories = [
  "Tout",
  "Suite",
  "Baignoire balnéo",
  "Sauna",
  "Coin café",
  "Ambiance romantique",
  "Éclairage",
  "Champagne",
  "Détails",
] as const;

export type GalleryCategory = (typeof galleryCategories)[number];

export type LuxuryGalleryImage = {
  src: string;
  alt: string;
  caption: string;
  categories: Exclude<GalleryCategory, "Tout">[];
  publishedAt: string;
  orientation: "wide" | "portrait" | "square";
};

export const luxuryGalleryImages: readonly LuxuryGalleryImage[] = [
  {
    src: "/images/optimized/lit.webp",
    alt: "Lit double de la Suite Absolu avec éclairage romantique violet à Avize",
    caption: "La chambre et son atmosphère lumineuse enveloppante.",
    categories: ["Suite", "Ambiance romantique", "Éclairage"],
    publishedAt: "2026-08-03",
    orientation: "wide",
  },
  {
    src: "/images/optimized/entree2.webp",
    alt: "Entrée contemporaine et coin café de la Suite Absolu en Champagne",
    caption:
      "L’espace d’accueil, entre lignes contemporaines et matières chaleureuses.",
    categories: ["Suite", "Coin café", "Détails"],
    publishedAt: "2026-08-02",
    orientation: "portrait",
  },
  {
    src: "/images/optimized/salledebainviolet.webp",
    alt: "Baignoire balnéo privative pour deux sous un éclairage violet romantique",
    caption: "La baignoire balnéo dans son ambiance lumineuse du soir.",
    categories: ["Baignoire balnéo", "Ambiance romantique", "Éclairage"],
    publishedAt: "2026-08-01",
    orientation: "wide",
  },
  {
    src: "/images/optimized/sauna.webp",
    alt: "Sauna infrarouge privatif en bois dans la Love Room Absolu à Avize",
    caption: "Le sauna infrarouge privatif, intégré à l’espace bien-être.",
    categories: ["Sauna", "Détails"],
    publishedAt: "2026-07-31",
    orientation: "portrait",
  },
  {
    src: "/images/optimized/doucheviolet.webp",
    alt: "Douche à l’italienne avec éclairage violet dans la suite romantique Absolu",
    caption: "La douche à l’italienne sous l’éclairage d’ambiance.",
    categories: ["Ambiance romantique", "Éclairage", "Détails"],
    publishedAt: "2026-07-30",
    orientation: "portrait",
  },
  {
    src: "/images/optimized/entree1.webp",
    alt: "Vue d’ensemble de la Suite Absolu et de son coin café à Avize",
    caption: "Une vue ouverte sur les différents espaces de la suite.",
    categories: ["Suite", "Coin café"],
    publishedAt: "2026-07-29",
    orientation: "wide",
  },
  {
    src: "/images/optimized/salledebain.webp",
    alt: "Baignoire balnéo privative de la Suite Absolu en lumière naturelle",
    caption: "L’espace balnéo en lumière naturelle.",
    categories: ["Baignoire balnéo", "Détails"],
    publishedAt: "2026-07-28",
    orientation: "wide",
  },
  {
    src: "/images/optimized/saunaviolet.webp",
    alt: "Sauna privatif de la Suite Absolu avec ambiance lumineuse violette",
    caption: "Le sauna révèle une seconde atmosphère à la tombée du jour.",
    categories: ["Sauna", "Ambiance romantique", "Éclairage"],
    publishedAt: "2026-07-27",
    orientation: "portrait",
  },
  {
    src: "/images/optimized/douche.webp",
    alt: "Douche à l’italienne contemporaine de la Love Room Absolu en Champagne",
    caption: "La douche à l’italienne en lumière naturelle.",
    categories: ["Suite", "Détails"],
    publishedAt: "2026-07-26",
    orientation: "portrait",
  },
] as const;

export const atmospherePairs = [
  { before: 6, after: 2, label: "Espace balnéo" },
  { before: 3, after: 7, label: "Sauna privatif" },
  { before: 8, after: 4, label: "Douche à l’italienne" },
] as const;
