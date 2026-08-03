import {
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, extname, join, relative } from "node:path";

const root = process.cwd();
const budget = JSON.parse(
  readFileSync(join(root, "performance-budget.json"), "utf8"),
);
const files = (directory) =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? files(path) : [path];
  });
const publicImages = files(join(root, "public", "images"));
const optimized = publicImages.filter((path) =>
  path.includes(`${join("images", "optimized")}`),
);
const sourceFiles = [
  ...files(join(root, "app")),
  ...files(join(root, "components")),
].filter((path) => [".ts", ".tsx"].includes(extname(path)));
const clientBoundaries = sourceFiles.filter((path) =>
  readFileSync(path, "utf8").startsWith('"use client"'),
).length;
const largest = (items) =>
  items
    .map((path) => ({
      path: relative(root, path).replaceAll("\\", "/"),
      bytes: statSync(path).size,
    }))
    .sort((a, b) => b.bytes - a.bytes)[0];
const eagerImages = sourceFiles.reduce(
  (count, path) =>
    count + (readFileSync(path, "utf8").match(/\bpreload\b/g)?.length ?? 0),
  0,
);
const checks = {
  optimizedImageBudget:
    (largest(optimized)?.bytes ?? 0) <= budget.assets.maxOptimizedImageBytes,
  originalImageBudget:
    (largest(publicImages)?.bytes ?? 0) <= budget.assets.maxOriginalImageBytes,
  clientBoundaryBudget: clientBoundaries <= budget.assets.maxClientBoundaries,
  modernFormatsPresent:
    optimized.some((path) => extname(path) === ".avif") &&
    optimized.some((path) => extname(path) === ".webp"),
  heroPreloadsLimited: eagerImages <= 20,
};
const report = {
  generatedAt: new Date().toISOString().slice(0, 10),
  status: Object.values(checks).every(Boolean) ? "pass" : "fail",
  checks,
  inventory: {
    sourceFiles: sourceFiles.length,
    clientBoundaries,
    images: publicImages.length,
    optimizedImages: optimized.length,
    eagerImages,
    largestOriginal: largest(publicImages),
    largestOptimized: largest(optimized),
  },
  budgets: budget,
};
const destination = join(root, "reports", "performance.json");
mkdirSync(dirname(destination), { recursive: true });
writeFileSync(destination, `${JSON.stringify(report, null, 2)}\n`);
console.log(`Performance audit ${report.status}: ${destination}`);
if (report.status === "fail") process.exit(1);
