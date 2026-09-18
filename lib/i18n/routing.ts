import { isLocale, locales, type Locale } from "./config";

export const defaultLocale: Locale = "fr";
export const localeCookie = "absolu-locale";

export const translatedRoutes = {
  home: "",
  suite: "/la-suite",
  reservation: "/reservation",
  equipment: "/equipements",
  balneo: "/balneo",
  sauna: "/sauna",
  gallery: "/galerie",
  faq: "/faq",
  contact: "/contact",
  gifts: "/bons-cadeaux",
  blog: "/blog",
  guide: "/guides",
  restaurants: "/restaurants",
  avize: "/avize",
  epernay: "/epernay",
  champagne: "/champagne",
  conditions: "/conditions",
  privacy: "/politique-confidentialite",
} as const;

export type TranslatedRoute = keyof typeof translatedRoutes;
export const indexableTranslatedRoutes: readonly TranslatedRoute[] = ["home","suite","reservation","equipment","balneo","sauna","faq","contact","avize","epernay","champagne"];

export function isIndexableTranslatedRoute(route: TranslatedRoute) {
  return indexableTranslatedRoutes.includes(route);
}

const localizedSlugs: Partial<Record<TranslatedRoute, Partial<Record<Locale,string>>>> = {
  suite:{en:"/romantic-suite",de:"/romantische-suite",nl:"/romantische-suite",it:"/suite-romantica",es:"/suite-romantica",pt:"/suite-romantica"},
  equipment:{en:"/facilities",de:"/ausstattung",nl:"/voorzieningen",it:"/dotazioni",es:"/equipamiento",pt:"/equipamentos"},
  balneo:{en:"/private-whirlpool-bath",de:"/private-whirlpool-badewanne",nl:"/prive-bubbelbad",it:"/vasca-idromassaggio-privata",es:"/banera-hidromasaje-privada",pt:"/banheira-hidromassagem-privativa"},
  sauna:{en:"/private-infrared-sauna",de:"/private-infrarotsauna",nl:"/prive-infraroodsauna",it:"/sauna-infrarossi-privata",es:"/sauna-infrarrojos-privada",pt:"/sauna-infravermelhos-privativa"},
  gallery:{en:"/gallery",de:"/galerie",nl:"/galerij",it:"/galleria",es:"/galeria",pt:"/galeria"},
  gifts:{en:"/gift-vouchers",de:"/gutscheine",nl:"/cadeaubonnen",it:"/buoni-regalo",es:"/bonos-regalo",pt:"/vales-oferta"},
  guide:{en:"/champagne-guide",de:"/champagne-reisefuehrer",nl:"/champagne-reisgids",it:"/guida-champagne",es:"/guia-champana",pt:"/guia-champagne"},
  conditions:{en:"/booking-terms",de:"/buchungsbedingungen",nl:"/boekingsvoorwaarden",it:"/condizioni-prenotazione",es:"/condiciones-reserva",pt:"/condicoes-reserva"},
  privacy:{en:"/privacy",de:"/datenschutz",nl:"/privacy",it:"/privacy",es:"/privacidad",pt:"/privacidade"},
};

const frenchLegacyPaths: Record<string, TranslatedRoute> = {
  "/": "home", "/la-suite": "suite", "/reservation": "reservation",
  "/equipements": "equipment", "/galerie": "gallery", "/faq": "faq",
  "/contact": "contact", "/bons-cadeaux": "gifts", "/guide-touristique": "guide",
  "/blog": "blog",
  "/restaurants": "restaurants", "/conditions": "conditions",
  "/politique-confidentialite": "privacy",
};

export function localizedPath(locale: Locale, route: TranslatedRoute) {
  return `/${locale}${localizedSlugs[route]?.[locale] ?? translatedRoutes[route]}`;
}

export function routeForLocalizedSection(locale: Locale, section: string): TranslatedRoute | null {
  const suffix=`/${section}`;
  return (Object.keys(translatedRoutes) as TranslatedRoute[]).find((route)=>(localizedSlugs[route]?.[locale]??translatedRoutes[route])===suffix)??null;
}

export function localizedSections(locale: Locale) {
  return (Object.keys(translatedRoutes) as TranslatedRoute[]).filter((route)=>route!=="home"&&route!=="reservation").map((route)=>({route,section:localizedPath(locale,route).split("/")[2]}));
}

export function localeFromPathname(pathname: string): Locale | null {
  const segment = pathname.split("/")[1];
  return isLocale(segment) ? segment : null;
}

export function routeFromPathname(pathname: string): TranslatedRoute | null {
  const clean = pathname.replace(/\/$/, "") || "/";
  const locale = localeFromPathname(clean);
  if (!locale) return frenchLegacyPaths[clean] ?? null;
  const section=clean.split("/")[2];
  return section?routeForLocalizedSection(locale,section):"home";
}

export function languageSwitchTarget(pathname: string, nextLocale: Locale) {
  return localizedPath(nextLocale, routeFromPathname(pathname) ?? "home");
}

export function localeAlternates(route: TranslatedRoute) {
  const hreflang = (locale: Locale) => locale === "fr" ? "fr-FR" : locale === "de" ? "de-DE" : locale === "nl" ? "nl-NL" : locale === "it" ? "it-IT" : locale === "es" ? "es-ES" : locale === "pt" ? "pt-PT" : "en";
  return Object.fromEntries(locales.map((locale) => [hreflang(locale), `https://love-room-absolu.fr${localizedPath(locale, route)}`]));
}
