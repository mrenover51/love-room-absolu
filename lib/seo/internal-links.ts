export type InternalLinkKind =
  | "similar"
  | "equipment"
  | "article"
  | "restaurant"
  | "activity"
  | "faq"
  | "city"
  | "booking";

export type InternalLink = {
  href: string;
  label: string;
  kind: InternalLinkKind;
};
export type InternalLinkGroup = {
  title: "Lire également" | "Vous aimerez aussi" | "Préparer votre séjour";
  links: InternalLink[];
};
export type SemanticCluster = {
  id: "romantique" | "champagne" | "tourisme" | "equipements" | "reservation";
  label: string;
  matches: string[];
  links: InternalLink[];
};

const link = (
  href: string,
  label: string,
  kind: InternalLinkKind,
): InternalLink => ({ href, label, kind });

export const semanticClusters: SemanticCluster[] = [
  {
    id: "romantique",
    label: "Cluster romantique",
    matches: ["/experiences-romantiques", "/avis", "/galerie", "/videos"],
    links: [
      link(
        "/experiences-romantiques/week-end-romantique",
        "Composer un week-end romantique en Champagne",
        "similar",
      ),
      link(
        "/experiences-romantiques/escapade-romantique",
        "S’offrir une escapade romantique",
        "similar",
      ),
      link(
        "/experiences-romantiques/demande-en-mariage",
        "Préparer une demande en mariage intime",
        "similar",
      ),
      link(
        "/equipements/baignoire-balneo",
        "Découvrir la baignoire balnéo privative",
        "equipment",
      ),
      link(
        "/equipements/ambiance-romantique",
        "Créer une ambiance romantique à deux",
        "equipment",
      ),
      link(
        "/blog/comment-surprendre-son-partenaire",
        "Nos idées pour surprendre son partenaire",
        "article",
      ),
      link(
        "/restaurants",
        "Choisir une table romantique à proximité",
        "restaurant",
      ),
      link(
        "/guide-touristique",
        "Imaginer une activité à vivre en couple",
        "activity",
      ),
      link(
        "/faq#week-end-romantique",
        "Réponses sur les séjours romantiques",
        "faq",
      ),
      link("/love-room/avize", "Séjourner en Love Room à Avize", "city"),
      link("/avis", "Lire les expériences de nos voyageurs", "article"),
      link(
        "/reservation",
        "Consulter les disponibilités de la suite",
        "booking",
      ),
    ],
  },
  {
    id: "champagne",
    label: "Cluster Champagne",
    matches: [
      "/love-room",
      "/blog/caves",
      "/blog/route",
      "/ressources/love-room-champagne",
    ],
    links: [
      link(
        "/love-room/avize",
        "Découvrir une Love Room au cœur d’Avize",
        "city",
      ),
      link(
        "/love-room/epernay",
        "Organiser un séjour romantique près d’Épernay",
        "city",
      ),
      link(
        "/love-room/reims",
        "Préparer une escapade à deux près de Reims",
        "city",
      ),
      link(
        "/blog/caves-de-champagne",
        "Comprendre les visites de caves de Champagne",
        "article",
      ),
      link(
        "/blog/route-touristique-champagne",
        "Suivre la route touristique du Champagne",
        "article",
      ),
      link(
        "/guide-touristique/avenue-de-champagne",
        "Explorer l’avenue de Champagne",
        "activity",
      ),
      link(
        "/guide-touristique/route-du-champagne",
        "Parcourir la Route du Champagne",
        "activity",
      ),
      link(
        "/restaurants",
        "Trouver une adresse pour dîner en Champagne",
        "restaurant",
      ),
      link(
        "/equipements/champagne",
        "Vérifier l’option Champagne du séjour",
        "equipment",
      ),
      link("/faq#champagne", "Questions pratiques autour du Champagne", "faq"),
      link(
        "/carte-touristique",
        "Repérer caves et maisons sur la carte",
        "activity",
      ),
      link(
        "/reservation",
        "Réserver en direct votre séjour champenois",
        "booking",
      ),
    ],
  },
  {
    id: "tourisme",
    label: "Cluster tourisme",
    matches: [
      "/guide-touristique",
      "/carte-touristique",
      "/restaurants",
      "/blog/que-faire",
      "/blog/visiter",
    ],
    links: [
      link(
        "/guide-touristique",
        "Explorer le guide touristique de la Champagne",
        "similar",
      ),
      link(
        "/carte-touristique",
        "Afficher les bonnes adresses sur la carte",
        "activity",
      ),
      link(
        "/restaurants",
        "Comparer les restaurants autour d’Absolu",
        "restaurant",
      ),
      link(
        "/guide-touristique/visites-de-caves",
        "Préparer une visite de cave à deux",
        "activity",
      ),
      link(
        "/guide-touristique/balades-romantiques",
        "Choisir une balade romantique",
        "activity",
      ),
      link(
        "/blog/que-faire-epernay-en-amoureux",
        "Que faire à Épernay en amoureux ?",
        "article",
      ),
      link(
        "/blog/plus-beaux-villages-champagne",
        "Découvrir les plus beaux villages champenois",
        "article",
      ),
      link(
        "/love-room/epernay",
        "Dormir près d’Épernay après vos visites",
        "city",
      ),
      link(
        "/equipements/sauna",
        "Se détendre dans un sauna privatif",
        "equipment",
      ),
      link("/faq#acces", "Anticiper l’accès et les déplacements", "faq"),
      link(
        "/experiences-romantiques/sejour-romantique",
        "Construire un séjour romantique équilibré",
        "similar",
      ),
      link("/reservation", "Choisir vos dates de séjour", "booking"),
    ],
  },
  {
    id: "equipements",
    label: "Cluster équipements",
    matches: ["/equipements", "/la-suite"],
    links: [
      link(
        "/equipements",
        "Comparer tous les équipements de la suite",
        "similar",
      ),
      link(
        "/equipements/baignoire-balneo",
        "Profiter d’une baignoire balnéo privative",
        "equipment",
      ),
      link(
        "/equipements/sauna",
        "Découvrir le sauna infrarouge privatif",
        "equipment",
      ),
      link(
        "/equipements/lit-king-size",
        "Vérifier les caractéristiques de la literie",
        "equipment",
      ),
      link(
        "/equipements/coin-cafe",
        "Préparer une pause dans le coin café",
        "equipment",
      ),
      link("/galerie", "Voir les équipements en images", "article"),
      link("/videos", "Visiter la suite en vidéo", "article"),
      link(
        "/faq#equipements",
        "Consulter les réponses sur les équipements",
        "faq",
      ),
      link(
        "/experiences-romantiques/love-room-baignoire-balneo",
        "Imaginer une Love Room avec balnéo",
        "similar",
      ),
      link(
        "/restaurants",
        "Prévoir un dîner après votre moment détente",
        "restaurant",
      ),
      link(
        "/guide-touristique/spa",
        "Prolonger la détente autour d’Avize",
        "activity",
      ),
      link("/reservation", "Réserver la suite et ses équipements", "booking"),
    ],
  },
  {
    id: "reservation",
    label: "Cluster réservation",
    matches: [
      "/reservation",
      "/faq",
      "/contact",
      "/conditions",
      "/bons-cadeaux",
      "/paiement",
    ],
    links: [
      link(
        "/reservation",
        "Vérifier les dates disponibles en direct",
        "booking",
      ),
      link(
        "/faq#reservation",
        "Comprendre le déroulement de la réservation",
        "faq",
      ),
      link("/faq#paiement", "Lire les réponses concernant le paiement", "faq"),
      link(
        "/conditions-reservation",
        "Consulter les conditions de réservation",
        "booking",
      ),
      link("/bons-cadeaux", "Offrir un séjour avec un bon cadeau", "booking"),
      link("/avis", "Découvrir les avis avant de réserver", "article"),
      link("/la-suite", "Revoir les espaces de la Suite Absolu", "similar"),
      link("/equipements", "Vérifier les équipements inclus", "equipment"),
      link("/restaurants", "Préparer votre dîner à proximité", "restaurant"),
      link(
        "/carte-touristique",
        "Organiser vos déplacements autour d’Avize",
        "activity",
      ),
      link("/love-room/avize", "Découvrir Avize avant votre arrivée", "city"),
      link("/contact", "Poser une question à l’équipe Absolu", "faq"),
    ],
  },
];

function rotate(items: InternalLink[], seed: number) {
  const offset = Math.abs(seed) % items.length;
  return [...items.slice(offset), ...items.slice(0, offset)];
}

function scoreCluster(cluster: SemanticCluster, pathname: string) {
  return Math.max(
    0,
    ...cluster.matches.map((prefix) =>
      pathname.startsWith(prefix) ? prefix.length : 0,
    ),
  );
}

/** Twelve natural, deterministic and path-aware recommendations on every public page. */
export function getInternalLinkGroups(pathname: string): InternalLinkGroup[] {
  const seed = [...pathname].reduce(
    (total, character) => total + character.charCodeAt(0),
    0,
  );
  const ranked = [...semanticClusters].sort(
    (a, b) => scoreCluster(b, pathname) - scoreCluster(a, pathname),
  );
  const candidates = ranked.flatMap((cluster) => rotate(cluster.links, seed));
  const unique = candidates.filter(
    (item, index, items) =>
      item.href.split("#")[0] !== pathname &&
      items.findIndex((candidate) => candidate.href === item.href) === index,
  );
  const pick = (kinds: InternalLinkKind[]) =>
    unique.filter((item) => kinds.includes(item.kind)).slice(0, 4);

  return [
    { title: "Lire également", links: pick(["similar", "article"]) },
    {
      title: "Vous aimerez aussi",
      links: pick(["equipment", "restaurant", "activity"]),
    },
    { title: "Préparer votre séjour", links: pick(["faq", "city", "booking"]) },
  ];
}
