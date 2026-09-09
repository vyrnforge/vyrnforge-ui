import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { getReleaseGroup, readReleaseGroups } from "./release-groups.mjs";

export const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
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
  const releaseManifest = readReleaseGroups({ root });
  const releaseGroup = getReleaseGroup("non-grid-beta", {
    root,
    manifest: releaseManifest,
  });
  return {
    releaseGroup: releaseGroup.id ?? "non-grid-beta",
    packages: releaseGroup.packages.map((packageInfo) => ({
      name: packageInfo.name,
      directory: packageInfo.directory,
      budgets: packageInfo.policies?.sizeBudget,
    })),
  };
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

export function evaluateSizeBudgets({ manifest, measurements }) {
  const failures = [];
  const measurementMap = new Map(
    measurements.map((measurement) => [measurement.name, measurement]),
  );

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
        failures.push(`${packageBudget.name}: ${metric} measurement is invalid`);
      } else if (!Number.isInteger(limit) || limit < 0) {
        failures.push(`${packageBudget.name}: ${metric} budget is invalid`);
      } else if (actual > limit) {
        failures.push(`${packageBudget.name}: ${metric} ${actual} exceeds ${limit}`);
      }
    }
  }

  return { failures: [...new Set(failures)].sort(), waiverResults: [] };
}

export function verifySizeBudgetContract({ root = repositoryRoot } = {}) {
  const failures = [];
  for (const requiredFile of [
    "docs/metadata/release-groups.json",
    "scripts/verify-beta-package-size-budgets.mjs",
    "scripts/verify-beta-package-size-budgets.test.mjs",
  ]) {
    if (!existsSync(path.join(root, requiredFile))) {
      failures.push(`size-budget implementation file is missing: ${requiredFile}`);
    }
  }
  if (failures.length) return failures;

  const manifest = readSizeBudgetManifest({ root });
  const releaseManifest = readReleaseGroups({ root });
  const betaReleaseGroup = getReleaseGroup("non-grid-beta", {
    root,
    manifest: releaseManifest,
  });
  const expectedPackages = betaReleaseGroup.packages.map(({ name }) => name);
  const actualPackages = (manifest.packages ?? []).map(({ name }) => name);
  if (JSON.stringify(actualPackages) !== JSON.stringify(expectedPackages)) {
    failures.push(
      "size budgets must cover every package in the canonical non-grid-beta release group, in release order",
    );
  }
  if (actualPackages.some((name) => name.includes("ui-data-grid"))) {
    failures.push("non-grid-beta size budgets must not include ui-data-grid");
  }
  for (const packageBudget of manifest.packages ?? []) {
    for (const metric of measuredMetricNames) {
      if (!Number.isInteger(packageBudget.budgets?.[metric])) {
        failures.push(
          `${packageBudget.name}: release-groups.json must define integer ${metric} sizeBudget`,
        );
      }
    }
  }

  const packageWorkflowPath = ".github/workflows/ci.yml";
  const packageWorkflow = readFileSync(
    path.join(root, packageWorkflowPath),
    "utf8",
  );
  if (!packageWorkflow.includes("verify:beta-package-size-budgets")) {
    failures.push(
      `${packageWorkflowPath} must enforce non-grid beta package size budgets`,
    );
  }
  if (!packageWorkflow.includes("size-report.json")) {
    failures.push(
      `${packageWorkflowPath} must retain the size report as CI evidence`,
    );
  }

  return failures.sort();
}
