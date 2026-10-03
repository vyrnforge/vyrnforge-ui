import { readdirSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";

const dist = path.resolve("apps/docs/dist");
const reportDirectory = path.resolve("test-results/reference-ui-evidence");
const totalBudget = 8 * 1024 * 1024;
const singleAssetBudget = 4 * 1024 * 1024;

function filesIn(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? filesIn(target) : [target];
  });
}

const assets = filesIn(dist)
  .filter((file) => /\.(?:css|js|mjs)$/u.test(file))
  .map((file) => ({
    file: path.relative(dist, file).replaceAll("\\", "/"),
    bytes: statSync(file).size,
  }))
  .sort((left, right) => right.bytes - left.bytes);

const totalBytes = assets.reduce((sum, asset) => sum + asset.bytes, 0);
const largestBytes = assets[0]?.bytes ?? 0;
const report = {
  schemaVersion: 1,
  budgets: { totalBytes: totalBudget, singleAssetBytes: singleAssetBudget },
  observed: { totalBytes, largestBytes, assets },
};

mkdirSync(reportDirectory, { recursive: true });
writeFileSync(
  path.join(reportDirectory, "performance-budget.json"),
  `${JSON.stringify(report, null, 2)}\n`,
  "utf8",
);

if (totalBytes > totalBudget) {
  throw new Error(
    `Reference JS/CSS total ${totalBytes} exceeds budget ${totalBudget}.`,
  );
}
if (largestBytes > singleAssetBudget) {
  throw new Error(
    `Reference largest JS/CSS asset ${largestBytes} exceeds budget ${singleAssetBudget}.`,
  );
}

console.log(
  `Reference asset budget passed: ${totalBytes} bytes total, ${largestBytes} bytes largest asset.`,
);
