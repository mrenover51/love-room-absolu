export type InternalLink = { href: string; label: string };
export type InternalLinkGroup = { title: "Découvrir également" | "Nos conseils" | "À proximité"; links: InternalLink[] };

const discovery: InternalLink[] = [
  { href: "/experiences-romantiques/week-end-romantique", label: "Préparer un week-end romantique" },
  { href: "/equipements/baignoire-balneo", label: "Suite avec baignoire balnéo" },
  { href: "/equipements/sauna", label: "Profiter d’un sauna privatif" },
  { href: "/experiences-romantiques/escapade-romantique", label: "Imaginer une escapade romantique" },
];

const advice: InternalLink[] = [
  { href: "/blog/que-faire-epernay-en-amoureux", label: "Que faire à Épernay en amoureux ?" },
  { href: "/blog/route-touristique-champagne", label: "Parcourir la route du Champagne" },
  { href: "/restaurants", label: "Choisir un restaurant romantique" },
  { href: "/blog/caves-de-champagne", label: "Découvrir les caves de Champagne" },
  { href: "/guide-touristique", label: "Explorer les activités en Champagne" },
];

const nearby: InternalLink[] = [
  { href: "/love-room/avize", label: "Séjour romantique à Avize" },
  { href: "/love-room/epernay", label: "Love Room près d’Épernay" },
  { href: "/love-room/cramant", label: "Découvrir Cramant à deux" },
  { href: "/love-room/reims", label: "Escapade romantique à Reims" },
];

function rotate(items: InternalLink[], seed: number) {
  const offset = Math.abs(seed) % items.length;
  return [...items.slice(offset), ...items.slice(0, offset)];
}

/** Stable, path-aware recommendations: six contextual links on every public page. */
export function getInternalLinkGroups(pathname: string): InternalLinkGroup[] {
  const seed = [...pathname].reduce((total, character) => total + character.charCodeAt(0), 0);
  let discover = discovery;
  let guides = advice;
  let places = nearby;

  if (pathname.startsWith("/blog/")) {
    discover = [discovery[1], discovery[0], discovery[2], discovery[3]];
  } else if (pathname.startsWith("/equipements/")) {
    guides = [advice[0], advice[2], advice[1], advice[3]];
  } else if (pathname.startsWith("/love-room/")) {
    discover = [discovery[0], discovery[3], discovery[1], discovery[2]];
  } else if (pathname.startsWith("/experiences-romantiques/")) {
    places = [nearby[1], nearby[0], nearby[3], nearby[2]];
  }

  const withoutCurrent = (items: InternalLink[]) => rotate(items.filter((item) => item.href !== pathname), seed).slice(0, 2);
  return [
    { title: "Découvrir également", links: withoutCurrent(discover) },
    { title: "Nos conseils", links: withoutCurrent(guides) },
    { title: "À proximité", links: withoutCurrent(places) },
  ];
}
