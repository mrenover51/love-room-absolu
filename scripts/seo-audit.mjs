import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";

const root = process.cwd();
const appRoot = join(root, "app");
const componentsRoot = join(root, "components");
const walk = directory => readdirSync(directory, { withFileTypes: true }).flatMap(entry => { const path = join(directory, entry.name); return entry.isDirectory() ? walk(path) : [path]; });
const pages = walk(appRoot).filter(path => path.endsWith(`${sep}page.tsx`));
const sharedSources = [...walk(appRoot), ...walk(componentsRoot)].filter(path => /\.(?:ts|tsx)$/.test(path));
const issues = [];
const inbound = new Map();
const fingerprints = new Map();
const routeFor = path => { const route = relative(appRoot, dirname(path)).split(sep).join("/"); return route === "" ? "/" : `/${route}`; };
const excludedRoutes = ["/maintenance", "/offline", "/recherche", "/reservation/confirmation", "/reservation/succes", "/reservation/annulee", "/reservation/indisponible", "/bons-cadeaux/confirmation"];
const isIndexable = (route, text) => !route.startsWith("/admin") && !excludedRoutes.includes(route) && !/index\s*:\s*false/.test(text);

function routeExists(href) {
  const clean = href.split(/[?#]/)[0];
  if (!clean.startsWith("/") || clean.startsWith("/api/")) return true;
  const segments = clean.split("/").filter(Boolean);
  let directory = appRoot;
  for (const segment of segments) {
    const exact = join(directory, segment);
    if (existsSync(exact) && statSync(exact).isDirectory()) { directory = exact; continue; }
    const dynamic = existsSync(directory) ? readdirSync(directory, { withFileTypes: true }).find(entry => entry.isDirectory() && entry.name.startsWith("[") && entry.name.endsWith("]")) : null;
    if (!dynamic) return false;
    directory = join(directory, dynamic.name);
  }
  return existsSync(join(directory, "page.tsx")) || existsSync(join(directory, "route.ts"));
}

for (const sourcePath of sharedSources) {
  const text = readFileSync(sourcePath, "utf8");
  for (const match of text.matchAll(/(?:href|url)\s*[:=]\s*(?:\{\s*)?[`"'](\/[^`}"'#? ]+)/g)) {
    const href = match[1];
    if (href.startsWith("/images/") || href.includes("${")) continue;
    inbound.set(href, (inbound.get(href) ?? 0) + 1);
    if (!routeExists(href)) issues.push({ severity: "error", type: "broken-link", route: relative(root, sourcePath).split(sep).join("/"), message: `Lien interne introuvable : ${href}`, fix: "Corriger la cible ou créer une redirection permanente." });
  }
}

const globalBreadcrumb = readFileSync(join(appRoot, "layout.tsx"), "utf8").includes("AutomaticBreadcrumb");
for (const page of pages) {
  const text = readFileSync(page, "utf8");
  const route = routeFor(page);
  if (!isIndexable(route, text)) continue;
  if (!/generateMetadata|export const metadata|pageMetadata\(/.test(text)) issues.push({ severity: "error", type: "metadata", route, message: "Métadonnées absentes", fix: "Ajouter pageMetadata avec title, description et canonical." });
  if (!/description\s*:|description,/.test(text)) issues.push({ severity: "warning", type: "description", route, message: "Description non détectée", fix: "Rédiger une description unique de 140 à 160 caractères." });
  if (!globalBreadcrumb && !/Breadcrumb|BreadcrumbList|Fil d.Ariane/.test(text)) issues.push({ severity: "warning", type: "breadcrumb", route, message: "Fil d’Ariane non détecté", fix: "Ajouter le composant Breadcrumb et son JSON-LD." });
  for (const image of text.matchAll(/<Image\b[^>]*>/gs)) if (!/\balt=/.test(image[0])) issues.push({ severity: "error", type: "image-alt", route, message: "Image sans attribut ALT", fix: "Ajouter un ALT descriptif lié au contenu visible." });
  const normalized = text.replace(/import[\s\S]*?from\s+["'][^"']+["'];?/g, "").replace(/[\s\W_]+/g, " ").toLowerCase().slice(0, 12000);
  const hash = createHash("sha256").update(normalized).digest("hex");
  const duplicate = fingerprints.get(hash);
  if (duplicate) issues.push({ severity: "error", type: "duplicate", route, message: `Contenu identique à ${duplicate}`, fix: "Fusionner, canonicaliser ou réécrire la page." }); else fingerprints.set(hash, route);
}

for (const page of pages) {
  const text = readFileSync(page, "utf8");
  const route = routeFor(page);
  if (route !== "/" && !route.includes("[") && isIndexable(route, text) && !inbound.has(route)) issues.push({ severity: "warning", type: "orphan", route, message: "Page potentiellement orpheline", fix: "Ajouter au moins un lien contextuel depuis une page du même cluster." });
}

const weights = { error: 3, warning: .25 };
const penalty = issues.reduce((sum, issue) => sum + weights[issue.severity], 0);
const score = Math.max(0, Math.round(100 - Math.min(100, penalty)));
const summary = { pages: pages.length, errors: issues.filter(x => x.severity === "error").length, warnings: issues.filter(x => x.severity === "warning").length, brokenLinks: issues.filter(x => x.type === "broken-link").length, orphans: issues.filter(x => x.type === "orphan").length, duplicates: issues.filter(x => x.type === "duplicate").length };
const report = { generatedAt: new Date().toISOString(), score, status: summary.errors || summary.warnings ? "attention" : "pass", summary, searchConsole: { configured: Boolean(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION), dataAvailable: false }, lighthouse: { configured: existsSync(join(root, "lighthouserc.json")), note: "Les scores navigateur proviennent de Lighthouse CI et ne sont jamais simulés." }, issues: issues.slice(0, 250), suggestions: [...new Set(issues.map(x => x.fix))].slice(0, 12) };
const destination = join(root, "reports", "seo-audit.json");
mkdirSync(dirname(destination), { recursive: true });
writeFileSync(destination, `${JSON.stringify(report, null, 2)}\n`);
console.log(`SEO audit: ${score}/100 · ${summary.errors} errors · ${summary.warnings} warnings`);
if (summary.errors || summary.warnings) process.exitCode = 1;
