import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { gzipSync } from "node:zlib";

const distRoot = path.resolve("apps/docs/dist");
const budgets = {
  javascriptGzip: 700 * 1024,
  cssGzip: 40 * 1024,
  totalGzip: 760 * 1024,
  largestAssetRaw: 6 * 1024 * 1024,
};

function collectFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory() ? collectFiles(entryPath) : [entryPath];
  });
}

if (!existsSync(distRoot)) {
  throw new Error("Reference performance verification requires apps/docs/dist.");
}

const files = collectFiles(distRoot);
const assets = files.map((filePath) => {
  const bytes = readFileSync(filePath);
  return {
    filePath,
    raw: statSync(filePath).size,
    gzip: gzipSync(bytes).byteLength,
    extension: path.extname(filePath),
  };
});

const javascriptGzip = assets
  .filter((asset) => asset.extension === ".js")
  .reduce((total, asset) => total + asset.gzip, 0);
const cssGzip = assets
  .filter((asset) => asset.extension === ".css")
  .reduce((total, asset) => total + asset.gzip, 0);
const totalGzip = assets.reduce((total, asset) => total + asset.gzip, 0);
const largestAssetRaw = Math.max(...assets.map((asset) => asset.raw));

const failures = [];
for (const [label, actual, budget] of [
  ["JavaScript gzip", javascriptGzip, budgets.javascriptGzip],
  ["CSS gzip", cssGzip, budgets.cssGzip],
  ["total site gzip", totalGzip, budgets.totalGzip],
  ["largest raw asset", largestAssetRaw, budgets.largestAssetRaw],
]) {
  if (actual > budget) {
    failures.push(`${label} ${actual} bytes exceeds budget ${budget} bytes`);
  }
}

if (failures.length > 0) {
  console.error("Reference performance budget failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(
    `Reference performance budget passed: JS gzip ${javascriptGzip}, CSS gzip ${cssGzip}, total gzip ${totalGzip}, largest raw asset ${largestAssetRaw} bytes.`,
  );
}
