import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
export const sizeBudgetManifestPath =
  "docs/metadata/beta-package-size-budgets.json";
export const sizeBudgetDocumentationPath =
  "docs/release/beta-package-size-budgets.md";
export const sizeBudgetReportPath =
  "test-results/beta-package-artifacts/size-report.json";
export const tarballReportPath =
  "test-results/beta-package-artifacts/tarball-report.json";

const measuredMetricNames = [
  "packedBytes",
  "unpackedBytes",
  "fileCount",
  "runtimeJavaScriptBytes",
  "declarationBytes",
  "cssBytes",
];

function readJson(root, relativePath) {
  return JSON.parse(readFileSync(path.join(root, relativePath), "utf8"));
}

function listFiles(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(entry.parentPath ?? entry.path, entry.name));
}

function sumFileBytes(files, predicate) {
  return files
    .filter(predicate)
    .reduce((total, file) => total + statSync(file).size, 0);
}

export function readSizeBudgetManifest({ root = repositoryRoot } = {}) {
  return readJson(root, sizeBudgetManifestPath);
}

export function collectSizeMeasurements({ root = repositoryRoot } = {}) {
  const manifest = readSizeBudgetManifest({ root });
  const tarballReport = readJson(root, tarballReportPath);
  const tarballs = new Map(
    (tarballReport.packages ?? []).map((packageReport) => [
      packageReport.name,
      packageReport,
    ]),
  );

  return manifest.packages.map((packageBudget) => {
    const tarball = tarballs.get(packageBudget.name);
    if (!tarball) {
      throw new Error(
        `${packageBudget.name}: missing from ${tarballReportPath}`,
      );
    }
    const distDirectory = path.join(root, packageBudget.directory, "dist");
    if (!existsSync(distDirectory)) {
      throw new Error(`${packageBudget.name}: built dist directory is missing`);
    }
    const files = listFiles(distDirectory);
    return {
      name: packageBudget.name,
      directory: packageBudget.directory,
      packedBytes: tarball.packedSize,
      unpackedBytes: tarball.unpackedSize,
      fileCount: tarball.fileCount,
      runtimeJavaScriptBytes: sumFileBytes(files, (file) =>
        /\.(?:cjs|mjs|js)$/u.test(file),
      ),
      declarationBytes: sumFileBytes(files, (file) => file.endsWith(".d.ts")),
      cssBytes: sumFileBytes(files, (file) => file.endsWith(".css")),
    };
  });
}

function parseIsoDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/u.test(value ?? "")
    ? new Date(`${value}T23:59:59.999Z`)
    : null;
}

export function evaluateSizeBudgets({
  manifest,
  measurements,
  now = new Date(),
}) {
  const failures = [];
  const measurementMap = new Map(
    measurements.map((measurement) => [measurement.name, measurement]),
  );
  const waiverResults = [];

  for (const packageBudget of manifest.packages ?? []) {
    const measurement = measurementMap.get(packageBudget.name);
    if (!measurement) {
      failures.push(`${packageBudget.name}: size measurement is missing`);
      continue;
    }
    for (const metric of measuredMetricNames) {
      const actual = measurement[metric];
      const limit = packageBudget.budgets?.[metric];
      if (!Number.isInteger(actual) || actual < 0) {
        failures.push(
          `${packageBudget.name}: ${metric} measurement is invalid`,
        );
        continue;
      }
      if (!Number.isInteger(limit) || limit < 0) {
        failures.push(`${packageBudget.name}: ${metric} budget is invalid`);
        continue;
      }
      if (actual <= limit) continue;

      const matchingWaivers = (manifest.waivers ?? []).filter(
        (waiver) =>
          waiver.package === packageBudget.name && waiver.metric === metric,
      );
      const approved = matchingWaivers.find((waiver) => {
        const expiry = parseIsoDate(waiver.expiresOn);
        const fieldsPresent =
          Number.isInteger(waiver.maxValue) &&
          waiver.maxValue >= actual &&
          typeof waiver.owner === "string" &&
          waiver.owner.trim() &&
          typeof waiver.reason === "string" &&
          waiver.reason.trim() &&
          expiry &&
          expiry >= now;
        return Boolean(fieldsPresent);
      });
      if (!approved) {
        failures.push(
          `${packageBudget.name}: ${metric} ${actual} exceeds ${limit} without an approved waiver`,
        );
      } else {
        waiverResults.push({
          package: packageBudget.name,
          metric,
          actual,
          budget: limit,
          waiver: approved,
        });
      }
    }
  }

  for (const waiver of manifest.waivers ?? []) {
    const expiry = parseIsoDate(waiver.expiresOn);
    if (!expiry) {
      failures.push(
        `${waiver.package ?? "unknown"}: waiver expiry must use YYYY-MM-DD`,
      );
      continue;
    }
    const durationDays = Math.ceil((expiry - now) / 86_400_000);
    if (durationDays < 0) {
      failures.push(
        `${waiver.package}: waiver for ${waiver.metric} is expired`,
      );
    }
    if (durationDays > (manifest.waiverPolicy?.maximumDurationDays ?? 30)) {
      failures.push(
        `${waiver.package}: waiver for ${waiver.metric} exceeds the maximum duration`,
      );
    }
  }

  return { failures: [...new Set(failures)].sort(), waiverResults };
}

export function verifySizeBudgetContract({ root = repositoryRoot } = {}) {
  const failures = [];
  for (const requiredFile of [
    sizeBudgetManifestPath,
    sizeBudgetDocumentationPath,
    "scripts/verify-beta-package-size-budgets.mjs",
    "scripts/verify-beta-package-size-budgets.test.mjs",
  ]) {
    if (!existsSync(path.join(root, requiredFile))) {
      failures.push(`BT-8004 required file is missing: ${requiredFile}`);
    }
  }
  if (failures.length) return failures;

  const manifest = readSizeBudgetManifest({ root });
  if (manifest.task?.id !== "BT-8004" || manifest.task?.status !== "done") {
    failures.push("size budget contract must record BT-8004 as done");
  }
  if (
    JSON.stringify(manifest.task?.dependsOn) !== JSON.stringify(["BT-8003"])
  ) {
    failures.push("BT-8004 must depend on BT-8003");
  }
  if (
    JSON.stringify(manifest.task?.unlocksAfterMerge) !==
    JSON.stringify(["BT-8012"])
  ) {
    failures.push("BT-8004 must unlock BT-8012 after merge");
  }
  const expectedPackages = [
    "@vyrnforge/ui-core",
    "@vyrnforge/ui-behaviors",
    "@vyrnforge/ui-components",
    "@vyrnforge/ui-elements",
  ];
  const actualPackages = (manifest.packages ?? []).map(({ name }) => name);
  if (JSON.stringify(actualPackages) !== JSON.stringify(expectedPackages)) {
    failures.push(
      "BT-8004 must budget exactly the four non-grid beta packages",
    );
  }
  if (actualPackages.some((name) => name.includes("ui-data-grid"))) {
    failures.push("BT-8004 must not include ui-data-grid");
  }
  if (
    JSON.stringify(manifest.metrics ?? []) !==
    JSON.stringify(measuredMetricNames)
  ) {
    failures.push("BT-8004 metric list is incomplete or reordered");
  }
  for (const packageBudget of manifest.packages ?? []) {
    for (const metric of measuredMetricNames) {
      if (!Number.isInteger(packageBudget.baseline?.[metric])) {
        failures.push(
          `${packageBudget.name}: missing integer ${metric} baseline`,
        );
      }
      if (!Number.isInteger(packageBudget.budgets?.[metric])) {
        failures.push(
          `${packageBudget.name}: missing integer ${metric} budget`,
        );
      }
      if (
        Number.isInteger(packageBudget.baseline?.[metric]) &&
        Number.isInteger(packageBudget.budgets?.[metric]) &&
        packageBudget.baseline[metric] > packageBudget.budgets[metric]
      ) {
        failures.push(
          `${packageBudget.name}: ${metric} baseline exceeds its approved budget`,
        );
      }
    }
  }

  const documentation = readFileSync(
    path.join(root, sizeBudgetDocumentationPath),
    "utf8",
  );
  for (const marker of [
    "BT-8004",
    "packed bytes",
    "declaration bytes",
    "CSS bytes",
    "30 days",
    "size-report.json",
  ]) {
    if (!documentation.includes(marker)) {
      failures.push(`${sizeBudgetDocumentationPath}: missing ${marker}`);
    }
  }

  const packageWorkflow = readFileSync(
    path.join(root, ".github/workflows/_packages.yml"),
    "utf8",
  );
  if (!packageWorkflow.includes("verify:beta-package-size-budgets")) {
    failures.push("_packages.yml must enforce beta package size budgets");
  }
  if (!packageWorkflow.includes("size-report.json")) {
    failures.push("_packages.yml must retain the size report as CI evidence");
  }

  return failures.sort();
}
