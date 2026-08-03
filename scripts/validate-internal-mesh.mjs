import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const root = process.cwd();
const appRoot = join(root, "app");
const sourcePath = join(root, "lib", "seo", "internal-links.ts");
const source = readFileSync(sourcePath, "utf8");
const requiredClusters = [
  "romantique",
  "champagne",
  "tourisme",
  "equipements",
  "reservation",
];
const errors = [];

function routeExists(href) {
  const segments = href.split("#")[0].split("?")[0].split("/").filter(Boolean);
  let directory = appRoot;
  for (const segment of segments) {
    const exact = join(directory, segment);
    if (existsSync(exact) && statSync(exact).isDirectory()) {
      directory = exact;
      continue;
    }
    const dynamic = readdirSync(directory, { withFileTypes: true }).find(
      (entry) =>
        entry.isDirectory() &&
        entry.name.startsWith("[") &&
        entry.name.endsWith("]"),
    );
    if (!dynamic) return false;
    directory = join(directory, dynamic.name);
  }
  return existsSync(join(directory, "page.tsx"));
}

for (const [index, id] of requiredClusters.entries()) {
  const start = source.indexOf(`id: "${id}"`);
  const endId = requiredClusters[index + 1];
  const end = endId
    ? source.indexOf(`id: "${endId}"`, start)
    : source.indexOf("function rotate", start);
  if (start < 0 || end < 0) {
    errors.push(`Cluster manquant : ${id}`);
    continue;
  }
  const links = [
    ...source.slice(start, end).matchAll(/link\(\s*"(\/[^"]+)"/g),
  ].map((match) => match[1]);
  if (links.length !== 12)
    errors.push(`${id} contient ${links.length} liens au lieu de 12`);
  if (new Set(links).size !== links.length)
    errors.push(`${id} contient des liens dupliqués`);
  for (const href of links)
    if (!routeExists(href))
      errors.push(`Cible introuvable dans ${id} : ${href}`);
}

function pages(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return pages(path);
    return entry.name === "page.tsx" ? [path] : [];
  });
}

for (const page of pages(appRoot)) {
  const content = readFileSync(page, "utf8");
  if (content.includes("<Header") && !content.includes("<Footer")) {
    errors.push(
      `Page publique sans footer intelligent : ${relative(root, page).split(sep).join("/")}`,
    );
  }
}

if (
  !source.includes("slice(0, 4)") ||
  !source.includes("getInternalLinkGroups")
) {
  errors.push("Le moteur ne garantit pas quatre recommandations par groupe");
}

if (errors.length) {
  console.error(
    `Maillage interne invalide (${errors.length})\n- ${errors.join("\n- ")}`,
  );
  process.exit(1);
}

console.log(
  "Maillage interne valide : 5 clusters, 60 ancres contrôlées, aucune page publique sans navigation contextuelle.",
);
