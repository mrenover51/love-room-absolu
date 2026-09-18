import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (file) => readFileSync(file, "utf8");

test("les sept locales européennes sont déclarées", () => {
  const config = read("lib/i18n/config.ts");
  assert.match(config, /\["fr", "en", "de", "nl", "it", "es", "pt"\]/);
  for (const locale of ["fr", "en", "de", "nl", "it", "es", "pt"])
    assert.match(config, new RegExp(`\\b${locale}: \\{`));
});

test("les hreflang demandés sont produits depuis une source unique", () => {
  const routing = read("lib/i18n/routing.ts");
  for (const code of ["fr-FR", "de-DE", "nl-NL", "it-IT", "es-ES", "pt-PT", "en"])
    assert.match(routing, new RegExp(code));
});

test("le changement de langue utilise une route équivalente contrôlée", () => {
  const selector = read("components/i18n/language-selector.tsx");
  const routing = read("lib/i18n/routing.ts");
  assert.match(selector, /languageSwitchTarget\(pathname, next\)/);
  assert.match(routing, /routeFromPathname\(pathname\) \?\? "home"/);
  assert.match(selector, /max-age=31536000/);
});

test("aucune détection de langue ne redirige selon IP ou Accept-Language", () => {
  const proxy = read("proxy.ts");
  assert.doesNotMatch(proxy, /accept-language|geo|country/i);
  assert.match(proxy, /x-absolu-locale/);
  assert.doesNotMatch(proxy, /NextResponse\.redirect/);
});

test("les intégrations métier restent hors du routage localisé", () => {
  const routes = read("lib/i18n/routing.ts");
  for (const protectedPath of ["/api", "/admin", "/mon-sejour", "/stripe", "/ical", "/cron"])
    assert.doesNotMatch(routes, new RegExp(`\\"${protectedPath}`));
});

test("le sitemap international reste limité aux onze pages utiles par langue", () => {
  const routing = read("lib/i18n/routing.ts");
  const match = routing.match(/indexableTranslatedRoutes[^=]*= \[([^\]]+)\]/);
  assert.ok(match);
  assert.equal([...match[1].matchAll(/"[^"]+"/g)].length, 11);
  for (const weak of ["gallery", "gifts", "blog", "guide", "restaurants", "conditions", "privacy"])
    assert.doesNotMatch(match[1], new RegExp(`"${weak}"`));
});

test("les pages internationales faibles sont noindex et absentes des alternates", () => {
  const page = read("app/[locale]/[section]/page.tsx");
  assert.match(page, /isIndexableTranslatedRoute/);
  assert.match(page, /index: false, follow: true/);
  assert.match(page, /indexable \? \{ languages:/);
});

test("le tunnel public reçoit une copie localisée sans toucher aux calculs métier", () => {
  const flow = read("components/reservation/booking-flow.tsx");
  const copy = read("lib/i18n/booking.ts");
  for (const locale of ["fr", "en", "de", "nl", "it", "es", "pt"])
    assert.match(copy, new RegExp(`\\b${locale}:`));
  assert.match(flow, /bookingCopy\(locale\)/);
  assert.match(flow, /calculatePriceFromConfig/);
  assert.match(flow, /\/api\/stripe\/create-checkout-session/);
});

test("le schéma global français n'est pas injecté sur les pages étrangères", () => {
  const layout = read("app/layout.tsx");
  const breadcrumb = read("components/seo/Breadcrumb.tsx");
  assert.match(layout, /locale === "fr" && <StructuredData/);
  assert.match(breadcrumb, /isLocale\(segments\[0\]\)/);
});

test("les anciennes routes balnéo et sauna redirigent directement vers leur page française", () => {
  const config = read("next.config.ts");
  assert.match(config, /source: "\/balneo", destination: "\/fr\/balneo", permanent: true/);
  assert.match(config, /source: "\/sauna", destination: "\/fr\/sauna", permanent: true/);
});

test("les sections localisées inconnues sont arrêtées en 404 sans toucher aux routes privées réelles", () => {
  const proxy = read("proxy.ts");
  assert.match(proxy, /routeForLocalizedSection/);
  assert.match(proxy, /status:404/);
  assert.match(proxy, /x-robots-tag":"noindex, nofollow/);
  for (const path of ["admin", "api", "mon-sejour", "checkout", "callback", "token"])
    assert.doesNotMatch(proxy, new RegExp(`segments\\[1\\]===\\"${path}\\"`));
  assert.match(proxy, /pathname\.startsWith\("\/admin"\).*updateSession/);
  assert.match(proxy, /matcher:\["\/admin:\/path\*"|matcher:\["\/admin\/?:path\*"|matcher:\["\/admin\/\:path\*"/);
});

test("la confirmation française ne contient plus de mojibake", () => {
  const confirmation = read("components/reservation/confirmation-details.tsx");
  assert.doesNotMatch(confirmation, /Ã|Â|â€™|â€œ|â€|�/);
});
