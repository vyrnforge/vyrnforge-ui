import { existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

import {
  readReleaseArtifactManifest,
  releaseArtifactDirectory,
} from "./release-artifact.mjs";
import { getReleaseGroup, readReleaseGroups, repositoryRoot } from "./release-groups.mjs";

export const measuredSizeMetrics = [
  "packedBytes",
  "unpackedBytes",
  "fileCount",
  "runtimeJavaScriptBytes",
  "declarationBytes",
  "cssBytes",
];

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

export function collectReleaseSizeMeasurements({
  releaseGroupId,
  artifactDir = releaseArtifactDirectory,
  root = repositoryRoot,
} = {}) {
  const manifest = readReleaseGroups({ root });
  const releaseGroup = getReleaseGroup(releaseGroupId, { root, manifest });
  const artifact = readReleaseArtifactManifest({ root, artifactDir });
  const artifactMap = new Map(
    (artifact.packages ?? []).map((packageInfo) => [packageInfo.name, packageInfo]),
  );

  return releaseGroup.packages
    .filter((packageInfo) => packageInfo.policies?.sizeBudget)
    .map((packageInfo) => {
      const packed = artifactMap.get(packageInfo.name);
      if (!packed) throw new Error(`${packageInfo.name}: release artifact is missing`);
      const distDirectory = path.join(root, packageInfo.directory, "dist");
      if (!existsSync(distDirectory)) {
        throw new Error(`${packageInfo.name}: built dist directory is missing`);
      }
      const files = listFiles(distDirectory);
      return {
        name: packageInfo.name,
        packedBytes: packed.packedSize,
        unpackedBytes: packed.unpackedSize,
        fileCount: packed.fileCount,
        runtimeJavaScriptBytes: sumFileBytes(files, (file) => /\.(?:cjs|mjs|js)$/u.test(file)),
        declarationBytes: sumFileBytes(files, (file) => file.endsWith(".d.ts")),
        cssBytes: sumFileBytes(files, (file) => file.endsWith(".css")),
      };
    });
}

export function evaluateReleaseSizeBudgets({ releaseGroup, measurements }) {
  const failures = [];
  const measurementMap = new Map(
    measurements.map((measurement) => [measurement.name, measurement]),
  );

  for (const packageInfo of releaseGroup.packages ?? []) {
    const budget = packageInfo.policies?.sizeBudget;
    if (!budget) continue;
    const measurement = measurementMap.get(packageInfo.name);
    if (!measurement) {
      failures.push(`${packageInfo.name}: size measurement is missing`);
      continue;
    }
    for (const metric of measuredSizeMetrics) {
      const actual = measurement[metric];
      const limit = budget[metric];
      if (!Number.isInteger(actual) || actual < 0) {
        failures.push(`${packageInfo.name}: ${metric} measurement is invalid`);
      } else if (!Number.isInteger(limit) || limit < 0) {
        failures.push(`${packageInfo.name}: ${metric} budget is invalid`);
      } else if (actual > limit) {
        failures.push(`${packageInfo.name}: ${metric} ${actual} exceeds ${limit}`);
      }
    }
  }
  return [...new Set(failures)].sort();
}

export function verifyReleaseSizeBudgets({
  releaseGroupId,
  artifactDir = releaseArtifactDirectory,
  root = repositoryRoot,
} = {}) {
  const manifest = readReleaseGroups({ root });
  const releaseGroup = getReleaseGroup(releaseGroupId, { root, manifest });
  const measurements = collectReleaseSizeMeasurements({ releaseGroupId, artifactDir, root });
  return evaluateReleaseSizeBudgets({ releaseGroup, measurements });
}
