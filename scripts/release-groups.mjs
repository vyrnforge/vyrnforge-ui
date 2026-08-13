import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

export const releaseGroupsPath = "docs/metadata/release-groups.json";
export const releaseGroupsSchemaPath =
  "docs/metadata/release-groups.schema.json";
export const releaseGroupsSchemaVersion = 2;

function createLegacyReleaseGroupsView(manifest) {
  return Object.fromEntries(
    Object.entries(manifest.releaseLines ?? {}).map(
      ([releaseGroupId, releaseGroup]) => [
        releaseGroupId,
        {
          ...releaseGroup,
          synchronized: releaseGroup.versioning?.mode === "synchronized",
          publishTogether: releaseGroup.publication?.publishTogether === true,
          packages: (releaseGroup.packages ?? []).map((packageInfo) => ({
            ...packageInfo,
            hasCss: packageInfo.policies?.hasCss ?? false,
          })),
        },
      ],
    ),
  );
}

export function readReleaseGroups({ root = repositoryRoot } = {}) {
  const manifest = JSON.parse(
    readFileSync(path.join(root, releaseGroupsPath), "utf8"),
  );

  if (
    manifest.schemaVersion === releaseGroupsSchemaVersion &&
    !Object.hasOwn(manifest, "groups")
  ) {
    Object.defineProperty(manifest, "groups", {
      configurable: false,
      enumerable: false,
      value: createLegacyReleaseGroupsView(manifest),
      writable: false,
    });
  }

  return manifest;
}

export function getReleaseLineEntries(manifest) {
  return Object.entries(
    manifest.schemaVersion === releaseGroupsSchemaVersion
      ? (manifest.releaseLines ?? {})
      : (manifest.groups ?? {}),
  );
}

export function getReleaseGroup(
  releaseGroupId,
  { root = repositoryRoot, manifest = readReleaseGroups({ root }) } = {},
) {
  const releaseGroups =
    manifest.schemaVersion === releaseGroupsSchemaVersion
      ? manifest.releaseLines
      : manifest.groups;
  const releaseGroup = releaseGroups?.[releaseGroupId];
  if (!releaseGroup) {
    throw new Error(`unknown release group: ${releaseGroupId}`);
  }
  if (manifest.schemaVersion !== releaseGroupsSchemaVersion) {
    return releaseGroup;
  }

  return {
    ...releaseGroup,
    synchronized: releaseGroup.versioning?.mode === "synchronized",
    publishTogether: releaseGroup.publication?.publishTogether === true,
    packages: (releaseGroup.packages ?? []).map((packageInfo) => ({
      ...packageInfo,
      hasCss: packageInfo.policies?.hasCss ?? false,
    })),
  };
}

export function getReleasePackageMap(manifest) {
  const entries = getReleaseLineEntries(manifest).flatMap(
    ([releaseGroupId, releaseGroup]) =>
      (releaseGroup.packages ?? []).map((packageInfo, packageIndex) => [
        packageInfo.name,
        {
          ...packageInfo,
          hasCss: packageInfo.hasCss ?? packageInfo.policies?.hasCss ?? false,
          releaseGroupId,
          packageIndex,
          version: releaseGroup.version,
          channel: releaseGroup.channel,
          distTag: releaseGroup.distTag,
        },
      ]),
  );
  return new Map(entries);
}

export function getReleasePackageNames(releaseGroup) {
  return (releaseGroup.packages ?? []).map((packageInfo) => packageInfo.name);
}

function workspacePatterns(rootPackage) {
  if (Array.isArray(rootPackage.workspaces)) return rootPackage.workspaces;
  return rootPackage.workspaces?.packages ?? [];
}

function expandSingleLevelWorkspacePattern(root, pattern) {
  const normalized = pattern.replaceAll("\\", "/");
  if (!normalized.endsWith("/*")) {
    throw new Error(
      `unsupported workspace pattern for release discovery: ${pattern}`,
    );
  }
  const parentRelative = normalized.slice(0, -2);
  const parent = path.join(root, parentRelative);
  if (!existsSync(parent)) return [];

  return readdirSync(parent, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.posix.join(parentRelative, entry.name));
}

export function discoverPublishableWorkspaces({ root = repositoryRoot } = {}) {
  const rootPackage = JSON.parse(
    readFileSync(path.join(root, "package.json"), "utf8"),
  );
  const discovered = [];

  for (const pattern of workspacePatterns(rootPackage)) {
    for (const directory of expandSingleLevelWorkspacePattern(root, pattern)) {
      const packageJsonPath = path.join(root, directory, "package.json");
      if (!existsSync(packageJsonPath)) continue;
      const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
      if (packageJson.private === true) continue;
      if (
        typeof packageJson.name !== "string" ||
        !packageJson.name.startsWith("@vyrnforge/")
      ) {
        continue;
      }
      discovered.push({
        name: packageJson.name,
        directory,
        version: packageJson.version,
      });
    }
  }

  return discovered.sort((left, right) => left.name.localeCompare(right.name));
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function validateReleaseGroupsV2(manifest) {
  const failures = [];
  if (!isRecord(manifest)) return ["release-group manifest must be an object"];
  if (manifest.schemaVersion !== releaseGroupsSchemaVersion) {
    failures.push(
      `schemaVersion must be ${releaseGroupsSchemaVersion}`,
    );
    return failures;
  }
  if (
    manifest.sourceOfTruth?.canonical !== true ||
    manifest.sourceOfTruth?.scope !== "release-groups" ||
    typeof manifest.sourceOfTruth?.documentation !== "string"
  ) {
    failures.push("sourceOfTruth must identify canonical release-groups documentation");
  }

  const releaseLines = manifest.releaseLines;
  if (!isRecord(releaseLines) || Object.keys(releaseLines).length === 0) {
    failures.push("releaseLines must contain at least one release line");
    return failures;
  }

  const packageOwners = new Map();
  const packageDirectories = new Map();

  for (const [releaseLineId, releaseLine] of Object.entries(releaseLines)) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(releaseLineId)) {
      failures.push(`${releaseLineId}: invalid release-line id`);
    }
    for (const [field, value] of [
      ["intent", releaseLine.intent],
      ["channel", releaseLine.channel],
      ["version", releaseLine.version],
      ["distTag", releaseLine.distTag],
    ]) {
      if (typeof value !== "string" || value.length === 0) {
        failures.push(`${releaseLineId}: ${field} must be a non-empty string`);
      }
    }
    if (!["synchronized", "independent"].includes(releaseLine.versioning?.mode)) {
      failures.push(`${releaseLineId}: versioning.mode is invalid`);
    }
    if (
      typeof releaseLine.publication?.publishable !== "boolean" ||
      typeof releaseLine.publication?.publishTogether !== "boolean"
    ) {
      failures.push(`${releaseLineId}: publication policy is incomplete`);
    }
    if (
      releaseLine.tagIdentity?.scope !== "release-line" ||
      !["preserve-only", "none"].includes(releaseLine.tagIdentity?.legacyPolicy)
    ) {
      failures.push(`${releaseLineId}: tagIdentity policy is incomplete`);
    }
    if (!Array.isArray(releaseLine.releaseDependencies)) {
      failures.push(`${releaseLineId}: releaseDependencies must be an array`);
    }
    if (!Array.isArray(releaseLine.packages) || releaseLine.packages.length === 0) {
      failures.push(`${releaseLineId}: packages must be a non-empty ordered array`);
      continue;
    }

    for (const [packageIndex, packageInfo] of releaseLine.packages.entries()) {
      if (
        typeof packageInfo.name !== "string" ||
        !packageInfo.name.startsWith("@vyrnforge/")
      ) {
        failures.push(`${releaseLineId}[${packageIndex}]: invalid package name`);
        continue;
      }
      if (
        typeof packageInfo.directory !== "string" ||
        !packageInfo.directory.startsWith("packages/")
      ) {
        failures.push(`${packageInfo.name}: invalid workspace directory`);
      }
      if (typeof packageInfo.role !== "string" || packageInfo.role.length === 0) {
        failures.push(`${packageInfo.name}: role must be declared`);
      }
      if (!isRecord(packageInfo.dependencies)) {
        failures.push(`${packageInfo.name}: dependencies must be an object`);
      }
      if (!isRecord(packageInfo.policies)) {
        failures.push(`${packageInfo.name}: policies must be an object`);
      }

      if (packageOwners.has(packageInfo.name)) {
        failures.push(
          `${packageInfo.name}: classified more than once (${packageOwners.get(packageInfo.name)} and ${releaseLineId})`,
        );
      } else {
        packageOwners.set(packageInfo.name, releaseLineId);
      }
      if (packageDirectories.has(packageInfo.directory)) {
        failures.push(
          `${packageInfo.directory}: assigned to more than one package`,
        );
      } else {
        packageDirectories.set(packageInfo.directory, packageInfo.name);
      }
    }
  }

  for (const [releaseLineId, releaseLine] of Object.entries(releaseLines)) {
    const declaredReleaseDependencies = new Set(
      (releaseLine.releaseDependencies ?? []).map(
        (dependency) => dependency.releaseLine,
      ),
    );

    for (const dependency of releaseLine.releaseDependencies ?? []) {
      if (!releaseLines[dependency.releaseLine]) {
        failures.push(
          `${releaseLineId}: unknown release dependency ${dependency.releaseLine}`,
        );
      }
      if (dependency.releaseLine === releaseLineId) {
        failures.push(`${releaseLineId}: release line cannot depend on itself`);
      }
      if (dependency.policy !== "exact") {
        failures.push(
          `${releaseLineId}: ${dependency.releaseLine} dependency policy must be exact`,
        );
      }
    }

    const packageIndexes = new Map(
      (releaseLine.packages ?? []).map((packageInfo, index) => [
        packageInfo.name,
        index,
      ]),
    );
    for (const [packageIndex, packageInfo] of (
      releaseLine.packages ?? []
    ).entries()) {
      for (const dependencyName of Object.keys(packageInfo.dependencies ?? {})) {
        const targetReleaseLine = packageOwners.get(dependencyName);
        if (!targetReleaseLine) {
          failures.push(
            `${packageInfo.name}: unknown VyrnForge dependency ${dependencyName}`,
          );
          continue;
        }
        if (targetReleaseLine === releaseLineId) {
          if ((packageIndexes.get(dependencyName) ?? Infinity) >= packageIndex) {
            failures.push(
              `${packageInfo.name}: ${dependencyName} must appear earlier in release order`,
            );
          }
        } else if (!declaredReleaseDependencies.has(targetReleaseLine)) {
          failures.push(
            `${packageInfo.name}: cross-line dependency ${dependencyName} requires ${targetReleaseLine} in releaseDependencies`,
          );
        }
      }
    }
  }

  const visiting = new Set();
  const visited = new Set();
  function visit(releaseLineId) {
    if (visiting.has(releaseLineId)) {
      failures.push(`release-line dependency cycle includes ${releaseLineId}`);
      return;
    }
    if (visited.has(releaseLineId)) return;
    visiting.add(releaseLineId);
    for (const dependency of releaseLines[releaseLineId]?.releaseDependencies ??
      []) {
      if (releaseLines[dependency.releaseLine]) visit(dependency.releaseLine);
    }
    visiting.delete(releaseLineId);
    visited.add(releaseLineId);
  }
  for (const releaseLineId of Object.keys(releaseLines)) visit(releaseLineId);

  return [...new Set(failures)].sort();
}

export function migrateReleaseGroupsV1(
  manifest,
  { releaseLinePolicies, classifyPackage },
) {
  if (manifest?.schemaVersion !== 1) {
    throw new Error("release-group migration requires schemaVersion 1");
  }
  if (typeof classifyPackage !== "function") {
    throw new Error("release-group migration requires classifyPackage");
  }
  if (!isRecord(releaseLinePolicies)) {
    throw new Error("release-group migration requires releaseLinePolicies");
  }

  const groups = manifest.groups ?? {};
  const packageOwner = new Map();
  for (const [releaseLineId, releaseLine] of Object.entries(groups)) {
    for (const packageInfo of releaseLine.packages ?? []) {
      packageOwner.set(packageInfo.name, releaseLineId);
    }
  }

  const releaseLines = {};
  for (const [releaseLineId, releaseLine] of Object.entries(groups)) {
    const policy = releaseLinePolicies[releaseLineId];
    if (!policy) {
      throw new Error(`missing migration policy for ${releaseLineId}`);
    }
    const releaseDependencies = new Set();
    const packages = (releaseLine.packages ?? []).map((packageInfo) => {
      const classification = classifyPackage(packageInfo, {
        releaseLineId,
        releaseLine,
      });
      if (!classification?.role) {
        throw new Error(`missing package role for ${packageInfo.name}`);
      }
      for (const dependencyName of Object.keys(packageInfo.dependencies ?? {})) {
        const targetReleaseLine = packageOwner.get(dependencyName);
        if (targetReleaseLine && targetReleaseLine !== releaseLineId) {
          releaseDependencies.add(targetReleaseLine);
        }
      }
      return {
        name: packageInfo.name,
        directory: packageInfo.directory,
        role: classification.role,
        dependencies: { ...(packageInfo.dependencies ?? {}) },
        policies: {
          hasCss: Boolean(packageInfo.hasCss),
          versionExport: classification.versionExport ?? null,
          ...(classification.policies ?? {}),
        },
      };
    });

    releaseLines[releaseLineId] = {
      intent: policy.intent,
      channel: releaseLine.channel,
      version: releaseLine.version,
      distTag: releaseLine.distTag,
      versioning: {
        mode: releaseLine.synchronized ? "synchronized" : "independent",
      },
      publication: {
        publishable: policy.publishable ?? true,
        publishTogether: Boolean(releaseLine.publishTogether),
      },
      tagIdentity: {
        scope: "release-line",
        legacyPolicy: policy.legacyPolicy ?? "preserve-only",
      },
      validation: {
        artifacts: true,
        provenance: true,
        registry: true,
        consumer: true,
        ...(policy.validation ?? {}),
      },
      releaseDependencies: [...releaseDependencies].map((targetReleaseLine) => ({
        releaseLine: targetReleaseLine,
        policy: "exact",
      })),
      packages,
    };
  }

  const migrated = {
    $schema: "./release-groups.schema.json",
    schemaVersion: releaseGroupsSchemaVersion,
    sourceOfTruth: {
      canonical: true,
      scope: "release-groups",
      documentation:
        manifest.sourceOfTruth?.documentation ??
        "docs/release/versioning-policy.md",
    },
    releaseLines,
  };

  const failures = validateReleaseGroupsV2(migrated);
  if (failures.length > 0) {
    throw new Error(`migrated release metadata is invalid: ${failures.join("; ")}`);
  }
  return migrated;
}
