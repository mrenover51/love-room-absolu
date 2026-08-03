import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
const roots = ["app", "components", "lib"],
  extensions = new Set([".ts", ".tsx"]),
  files = [];
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) await walk(path);
    else if (extensions.has(entry.name.slice(entry.name.lastIndexOf("."))))
      files.push(path);
  }
}
for (const root of roots) await walk(root);
const sources = await Promise.all(
  files.map(async (path) => [path, await readFile(path, "utf8")]),
);
const all = sources.map(([, text]) => text).join("\n"),
  errors = [];
const requiredTypes = [
  "Organization",
  "LocalBusiness",
  "LodgingBusiness",
  "Hotel",
  "TouristAttraction",
  "ImageObject",
  "VideoObject",
  "FAQPage",
  "BreadcrumbList",
  "Offer",
  "Product",
  "Review",
  "AggregateRating",
  "SearchAction",
  "WebSite",
  "WebPage",
  "Article",
  "BlogPosting",
  "Person",
  "Event",
  "Place",
  "GeoCoordinates",
];
for (const type of requiredTypes)
  if (!all.includes(`\"${type}\"`))
    errors.push(`missing schema implementation: ${type}`);
for (const [path, text] of sources) {
  if (
    text.includes('type="application/ld+json"') &&
    !text.includes("JSON.stringify") &&
    !text.includes("safeJsonLd")
  )
    errors.push(`${path}: JSON-LD is not serialized safely`);
  if (/ratingCount\s*:\s*0\b/.test(text))
    errors.push(`${path}: zero ratingCount must not be emitted`);
}
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(
  `Structured data validation passed: ${requiredTypes.length} types covered across ${files.length} source files.`,
);
