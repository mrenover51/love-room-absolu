export type GiftTheme = {
  slug: string;
  name: string;
  shortName: string;
  description: string;
  accent: string;
  image: string;
  occasion: string;
};

export const giftThemes: GiftTheme[] = [
  { slug: "anniversaire", name: "Bon cadeau anniversaire", shortName: "Anniversaire", occasion: "un anniversaire", accent: "#C9A86A", image: "/images/optimized/champagne-local-hero.avif", description: "Une parenthèse à deux pour célébrer une nouvelle année avec élégance en Champagne." },
  { slug: "noel", name: "Bon cadeau Noël", shortName: "Noël", occasion: "Noël", accent: "#A94B4B", image: "/images/optimized/saunaviolet.avif", description: "Un cadeau immatériel et précieux à glisser sous le sapin : du temps rien que pour eux." },
  { slug: "saint-valentin", name: "Bon cadeau Saint-Valentin", shortName: "Saint-Valentin", occasion: "la Saint-Valentin", accent: "#D15B86", image: "/images/optimized/salledebainviolet.avif", description: "Offrez l'expérience Absolu et laissez le couple choisir la date de son tête-à-tête." },
  { slug: "mariage", name: "Bon cadeau mariage", shortName: "Mariage", occasion: "un mariage", accent: "#D8C8B6", image: "/images/optimized/entree2.avif", description: "Une attention raffinée pour prolonger la magie des jeunes mariés dans la Côte des Blancs." },
  { slug: "couple", name: "Bon cadeau couple", shortName: "Couple", occasion: "un moment à deux", accent: "#9C6FB5", image: "/images/optimized/lit.avif", description: "Une invitation à ralentir, se retrouver et composer librement une escapade romantique." },
];

export const giftAmounts = [150, 250, 350] as const;
export const giftBySlug = (slug: string) => giftThemes.find((gift) => gift.slug === slug);
