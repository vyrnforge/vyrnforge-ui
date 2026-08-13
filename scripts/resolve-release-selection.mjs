import { appendFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  getReleaseGroup,
  getReleasePackageMap,
  readReleaseGroups,
  repositoryRoot,
  validateReleaseGroupsV2,
} from "./release-groups.mjs";

function readArgument(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

export function resolveReleaseSelection(
  releaseGroupId,
  { root = repositoryRoot, manifest = readReleaseGroups({ root }) } = {},
) {
  const failures = validateReleaseGroupsV2(manifest);
  if (failures.length > 0) {
    throw new Error(
      `cannot resolve release selection from invalid metadata: ${failures.join("; ")}`,
    );
  }

  const releaseGroup = getReleaseGroup(releaseGroupId, { root, manifest });
  const packageMap = getReleasePackageMap(manifest);
  const selectedPackages = releaseGroup.packages.map(
    (packageInfo) => packageInfo.name,
  );
  const selectedSet = new Set(selectedPackages);
  const dependencyClosure = new Set();

  function visit(packageName) {
    const packageInfo = packageMap.get(packageName);
    if (!packageInfo) {
      throw new Error(`unknown release package dependency: ${packageName}`);
    }
    for (const dependencyName of Object.keys(packageInfo.dependencies ?? {})) {
      if (!dependencyClosure.has(dependencyName)) {
        dependencyClosure.add(dependencyName);
        visit(dependencyName);
      }
    }
  }

  for (const packageName of selectedPackages) visit(packageName);

  return {
    releaseGroupId,
    channel: releaseGroup.channel,
    version: releaseGroup.version,
    distTag: releaseGroup.distTag,
    packages: selectedPackages,
    dependencyClosure: [...dependencyClosure].filter(
      (packageName) => !selectedSet.has(packageName),
    ),
  };
}

function writeGithubFile(file, entries) {
  if (!file) return;
  appendFileSync(
    file,
    `${Object.entries(entries)
      .map(([name, value]) => `${name}=${value}`)
      .join("\n")}\n`,
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const releaseGroupId = readArgument("--release-group");
  if (!releaseGroupId) {
    throw new Error("missing required --release-group");
  }

  const resolved = resolveReleaseSelection(releaseGroupId);
  writeGithubFile(readArgument("--github-output"), {
    version: resolved.version,
    "dist-tag": resolved.distTag,
    "packages-json": JSON.stringify(resolved.packages),
    "dependency-closure-json": JSON.stringify(resolved.dependencyClosure),
  });
  writeGithubFile(readArgument("--github-env"), {
    RELEASE_VERSION: resolved.version,
    RELEASE_TAG: resolved.distTag,
    VYRNFORGE_RELEASE_VERSION: resolved.version,
  });
  console.log(JSON.stringify(resolved, null, 2));
}
