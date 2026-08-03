export type VideoProvider = "local" | "youtube" | "vimeo";

export type VideoChapter = {
  title: string;
  startOffset: number;
  endOffset: number;
};

export type PremiumVideo = {
  slug: string;
  title: string;
  description: string;
  category: string;
  provider: VideoProvider;
  source: string;
  poster: string;
  posterAlt: string;
  captions?: string;
  captionsLabel?: string;
  durationSeconds: number;
  uploadDate: string;
  quality: "4K" | "Full HD" | "HD";
  chapters: VideoChapter[];
  featured?: boolean;
};

// Ajouter uniquement des vidéos réellement publiées, avec durée, date, miniature
// et chapitres vérifiés. Le JSON-LD est généré exclusivement depuis ce tableau.
export const publishedVideos: readonly PremiumVideo[] = [];

export const plannedVideos = [
  {
    title: "Visite complète",
    description: "Un parcours continu de l’entrée à l’espace bien-être.",
    poster: "/images/optimized/entree1.webp",
  },
  {
    title: "Baignoire balnéo",
    description: "Les détails, l’eau et l’ambiance de l’espace balnéo.",
    poster: "/images/optimized/salledebainviolet.webp",
  },
  {
    title: "Sauna",
    description: "Une immersion dans le sauna infrarouge privatif.",
    poster: "/images/optimized/saunaviolet.webp",
  },
  {
    title: "Éclairage",
    description: "Le passage de la lumière naturelle à l’ambiance du soir.",
    poster: "/images/optimized/doucheviolet.webp",
  },
  {
    title: "Champagne",
    description:
      "Une séquence dédiée sera publiée après un tournage authentique.",
    poster: "/images/optimized/entree2.webp",
  },
  {
    title: "Romantisme",
    description: "Une visite sensorielle de la chambre et de ses atmosphères.",
    poster: "/images/optimized/lit.webp",
  },
] as const;

export function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${minutes}:${remaining.toString().padStart(2, "0")}`;
}

export function isoDuration(seconds: number) {
  return `PT${Math.floor(seconds / 60)}M${seconds % 60}S`;
}
