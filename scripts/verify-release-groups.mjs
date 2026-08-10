import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getReleasePackageMap, readReleaseGroups } from "./release-groups.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const expectedGroups = {
  "non-grid-beta": {
    channel: "beta",
    version: "0.2.0-beta.2",
    distTag: "beta",
    packages: [
      "@vyrnforge/ui-core",
      "@vyrnforge/ui-behaviors",
      "@vyrnforge/ui-components",
      "@vyrnforge/ui-elements",
    ],
  },
  "data-grid-alpha": {
    channel: "alpha",
    version: "0.1.0-alpha.2",
    distTag: "alpha",
    packages: ["@vyrnforge/ui-data-grid"],
  },
};

const workspaceConsumers = [
  "apps/docs/package.json",
  "apps/regression-fixtures/package.json",
  "examples/basic-playground/package.json",
];

const versionExports = new Map([
  [
    "@vyrnforge/ui-core",
    ["packages/ui-core/src/index.ts", "vyrnForgeUiCoreVersion"],
  ],
  [
    "@vyrnforge/ui-behaviors",
    ["packages/ui-behaviors/src/index.ts", "vyrnForgeUiBehaviorsVersion"],
  ],
  [
    "@vyrnforge/ui-components",
    ["packages/ui-components/src/index.ts", "vyrnForgeUiComponentsVersion"],
  ],
  [
    "@vyrnforge/ui-elements",
    ["packages/ui-elements/src/index.ts", "vyrnForgeUiElementsVersion"],
  ],
]);

function read(root, relativePath) {
  return readFileSync(path.join(root, relativePath), "utf8");
}

function readJson(root, relativePath) {
  return JSON.parse(read(root, relativePath));
}

function packageNames(releaseGroup) {
  return (releaseGroup.packages ?? []).map((packageInfo) => packageInfo.name);
}

function sameMembers(actual, expected) {
  const actualSorted = [...actual].sort();
  const expectedSorted = [...expected].sort();
  return (
    actualSorted.length === expectedSorted.length &&
    actualSorted.every((value, index) => value === expectedSorted[index])
  );
}

export function verifyReleaseGroups({ root = repositoryRoot } = {}) {
  const failures = [];
  const manifestPath = "docs/metadata/release-groups.json";
  if (!existsSync(path.join(root, manifestPath))) {
    return [`BT-8002 evidence is missing: ${manifestPath}`];
  }

  const manifest = readReleaseGroups({ root });
  if (manifest.task?.id !== "BT-8002" || manifest.task?.status !== "done") {
    failures.push("release group manifest must record BT-8002 as done");
  }
  if (!manifest.task?.unlocks?.includes("BT-8003")) {
    failures.push("BT-8002 must unlock BT-8003");
  }

  for (const [releaseGroupId, expected] of Object.entries(expectedGroups)) {
    const actual = manifest.groups?.[releaseGroupId];
    if (!actual) {
      failures.push(`release group is missing: ${releaseGroupId}`);
      continue;
    }
    if (actual.channel !== expected.channel) {
      failures.push(`${releaseGroupId}: channel must be ${expected.channel}`);
    }
    if (actual.version !== expected.version) {
      failures.push(`${releaseGroupId}: version must be ${expected.version}`);
    }
    if (actual.distTag !== expected.distTag) {
      failures.push(`${releaseGroupId}: distTag must be ${expected.distTag}`);
    }
    if (!sameMembers(packageNames(actual), expected.packages)) {
      failures.push(`${releaseGroupId}: package membership is invalid`);
    }
  }

  const betaPackages = packageNames(manifest.groups?.["non-grid-beta"] ?? {});
  if (betaPackages.includes("@vyrnforge/ui-data-grid")) {
    failures.push("non-grid beta must not include ui-data-grid");
  }
  if (
    manifest.groups?.["data-grid-alpha"]?.version ===
    manifest.groups?.["non-grid-beta"]?.version
  ) {
    failures.push("data-grid alpha must keep an independent version");
  }

  const releasePackageEntries = Object.values(manifest.groups ?? {}).flatMap(
    (releaseGroup) => releaseGroup.packages ?? [],
  );
  const packageMap = getReleasePackageMap(manifest);
  if (releasePackageEntries.length !== 5 || packageMap.size !== 5) {
    failures.push(
      "release groups must classify all five publishable packages once",
    );
  }
  if (
    manifest.rules?.nonGridBetaPackageCount !== 4 ||
    manifest.rules?.dataGridAlphaPackageCount !== 1 ||
    manifest.rules?.exactInternalVersions !== true ||
    manifest.rules?.dataGridExcludedFromNonGridBeta !== true ||
    manifest.rules?.releaseWorkflowRequiresGroupSelection !== true
  ) {
    failures.push("release group enforcement rules are incomplete");
  }

  for (const [packageName, packageInfo] of packageMap) {
    const packageJsonPath = path.join(packageInfo.directory, "package.json");
    const packageJson = readJson(root, packageJsonPath);
    if (packageJson.name !== packageName) {
      failures.push(`${packageJsonPath}: package name mismatch`);
    }
    if (packageJson.version !== packageInfo.version) {
      failures.push(
        `${packageName}: package version must be ${packageInfo.version}`,
      );
    }

    for (const [dependencyName, dependencyVersion] of Object.entries(
      packageInfo.dependencies ?? {},
    )) {
      if (packageJson.dependencies?.[dependencyName] !== dependencyVersion) {
        failures.push(
          `${packageName}: ${dependencyName} must use exact ${dependencyVersion}`,
        );
      }
    }

    for (const [dependencyName, dependencyVersion] of Object.entries(
      packageJson.dependencies ?? {},
    )) {
      if (!dependencyName.startsWith("@vyrnforge/")) continue;
      const targetPackage = packageMap.get(dependencyName);
      if (!targetPackage) {
        failures.push(
          `${packageName}: unknown VyrnForge dependency ${dependencyName}`,
        );
        continue;
      }
      if (dependencyVersion !== targetPackage.version) {
        failures.push(
          `${packageName}: ${dependencyName} must match ${targetPackage.version}`,
        );
      }
    }

    const versionExport = versionExports.get(packageName);
    if (versionExport) {
      const [sourcePath, exportName] = versionExport;
      const source = read(root, sourcePath);
      if (!source.includes(`${exportName} = "${packageInfo.version}"`)) {
        failures.push(
          `${packageName}: public version export must be ${packageInfo.version}`,
        );
      }
    }
  }

  const packageLock = readJson(root, "package-lock.json");
  for (const packageInfo of packageMap.values()) {
    const lockedPackage = packageLock.packages?.[packageInfo.directory];
    if (lockedPackage?.version !== packageInfo.version) {
      failures.push(
        `package-lock.json: ${packageInfo.directory} must be ${packageInfo.version}`,
      );
    }
    for (const [dependencyName, dependencyVersion] of Object.entries(
      packageInfo.dependencies ?? {},
    )) {
      if (lockedPackage?.dependencies?.[dependencyName] !== dependencyVersion) {
        failures.push(
          `package-lock.json: ${packageInfo.name} ${dependencyName} must be ${dependencyVersion}`,
        );
      }
    }
  }

  for (const relativePath of workspaceConsumers) {
    const packageJson = readJson(root, relativePath);
    const lockEntryPath = relativePath.replace(/\/package\.json$/u, "");
    const lockEntry = packageLock.packages?.[lockEntryPath];
    for (const [dependencyName, dependencyVersion] of Object.entries(
      packageJson.dependencies ?? {},
    )) {
      if (!dependencyName.startsWith("@vyrnforge/")) continue;
      const targetPackage = packageMap.get(dependencyName);
      if (targetPackage && dependencyVersion !== targetPackage.version) {
        failures.push(
          `${relativePath}: ${dependencyName} must be ${targetPackage.version}`,
        );
      }
      if (
        targetPackage &&
        lockEntry?.dependencies?.[dependencyName] !== targetPackage.version
      ) {
        failures.push(
          `package-lock.json: ${lockEntryPath} ${dependencyName} must be ${targetPackage.version}`,
        );
      }
    }
  }

  const packagesMetadata = readJson(root, "docs/metadata/packages.json");
  if (
    !sameMembers(
      packagesMetadata.releaseGroups?.nonGridBeta ?? [],
      expectedGroups["non-grid-beta"].packages,
    )
  ) {
    failures.push("packages.json nonGridBeta release group is invalid");
  }
  if (
    !sameMembers(
      packagesMetadata.releaseGroups?.dataGridAlpha ?? [],
      expectedGroups["data-grid-alpha"].packages,
    )
  ) {
    failures.push("packages.json dataGridAlpha release group is invalid");
  }

  const betaScope = readJson(root, "docs/metadata/non-grid-beta-scope.json");
  if (
    betaScope.program?.targetVersion !== expectedGroups["non-grid-beta"].version
  ) {
    failures.push("BT-8001 targetVersion must match the beta release group");
  }

  const releaseWorkflow = read(root, ".github/workflows/release.yml");
  for (const marker of [
    "release-group:",
    "non-grid-beta",
    "data-grid-alpha",
    '--release-group "$RELEASE_GROUP"',
  ]) {
    if (!releaseWorkflow.includes(marker)) {
      failures.push(
        `release workflow is missing release-group contract marker: ${marker}`,
      );
    }
  }
  const versioningPolicy = read(root, "docs/release/versioning-policy.md");
  for (const marker of [
    "0.2.0-beta.2",
    "0.1.0-alpha.2",
    "non-grid-beta",
    "data-grid-alpha",
  ]) {
    if (!versioningPolicy.includes(marker)) {
      failures.push(`versioning policy is missing marker: ${marker}`);
    }
  }

  return failures.sort();
}

export function assertReleaseGroups(options) {
  const failures = verifyReleaseGroups(options);
  if (failures.length > 0) {
    throw new Error(
      `Release group verification failed:\n- ${failures.join("\n- ")}`,
    );
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  assertReleaseGroups();
  console.log(
    "BT-8002 passed: four packages are synchronized at 0.2.0-beta.2, ui-data-grid remains 0.1.0-alpha.2, and release tooling requires an explicit group.",
  );
}
