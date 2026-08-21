import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  discoverPublishableWorkspaces,
  getReleaseLineEntries,
  getReleasePackageMap,
  readReleaseGroups,
  releaseGroupsPath,
  releaseGroupsSchemaPath,
  releaseGroupsSchemaVersion,
  validateReleaseGroupsV2,
} from "./release-groups.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

function read(root, relativePath) {
  return readFileSync(path.join(root, relativePath), "utf8");
}

function readJson(root, relativePath) {
  return JSON.parse(read(root, relativePath));
}

export function verifyReleaseGroups({ root = repositoryRoot } = {}) {
  const failures = [];

  if (!existsSync(path.join(root, releaseGroupsPath))) {
    return [`release-group manifest is missing: ${releaseGroupsPath}`];
  }
  if (!existsSync(path.join(root, releaseGroupsSchemaPath))) {
    return [`release-group schema is missing: ${releaseGroupsSchemaPath}`];
  }

  let manifest;
  let schema;
  try {
    manifest = readReleaseGroups({ root });
  } catch (error) {
    return [`release-group manifest is invalid JSON: ${error.message}`];
  }
  try {
    schema = readJson(root, releaseGroupsSchemaPath);
  } catch (error) {
    return [`release-group schema is invalid JSON: ${error.message}`];
  }

  if (schema.properties?.schemaVersion?.const !== releaseGroupsSchemaVersion) {
    failures.push(
      `release-group schema must describe schemaVersion ${releaseGroupsSchemaVersion}`,
    );
  }

  failures.push(...validateReleaseGroupsV2(manifest));
  if (failures.length > 0) return [...new Set(failures)].sort();

  const packageMap = getReleasePackageMap(manifest);
  let discoveredPublishable = [];
  try {
    discoveredPublishable = discoverPublishableWorkspaces({ root });
  } catch (error) {
    failures.push(`publishable workspace discovery failed: ${error.message}`);
  }

  const discoveredByName = new Map(
    discoveredPublishable.map((packageInfo) => [packageInfo.name, packageInfo]),
  );
  for (const packageInfo of discoveredPublishable) {
    const classified = packageMap.get(packageInfo.name);
    if (!classified) {
      failures.push(
        `${packageInfo.name}: publishable workspace is not classified in release metadata`,
      );
      continue;
    }
    if (classified.directory !== packageInfo.directory) {
      failures.push(
        `${packageInfo.name}: release metadata directory must be ${packageInfo.directory}`,
      );
    }
  }
  for (const packageInfo of packageMap.values()) {
    if (!discoveredByName.has(packageInfo.name)) {
      failures.push(
        `${packageInfo.name}: release metadata classifies a workspace that is not publishable`,
      );
    }
  }

  for (const [, releaseLine] of getReleaseLineEntries(manifest)) {
    for (const packageInfo of releaseLine.packages) {
      const packageJsonPath = path.join(packageInfo.directory, "package.json");
      if (!existsSync(path.join(root, packageJsonPath))) {
        failures.push(`${packageInfo.name}: missing ${packageJsonPath}`);
        continue;
      }

      const packageJson = readJson(root, packageJsonPath);
      if (packageJson.name !== packageInfo.name) {
        failures.push(`${packageJsonPath}: package name mismatch`);
      }
      if (packageJson.private === true) {
        failures.push(`${packageInfo.name}: release package must be publishable`);
      }
      if (packageJson.version !== releaseLine.version) {
        failures.push(
          `${packageInfo.name}: package version must be ${releaseLine.version}`,
        );
      }

      for (const [dependencyName, dependencyVersion] of Object.entries(
        packageInfo.dependencies ?? {},
      )) {
        if (packageJson.dependencies?.[dependencyName] !== dependencyVersion) {
          failures.push(
            `${packageInfo.name}: metadata dependency ${dependencyName} must match package.json ${dependencyVersion}`,
          );
        }

        const targetPackage = packageMap.get(dependencyName);
        if (!targetPackage) {
          failures.push(
            `${packageInfo.name}: unknown VyrnForge dependency ${dependencyName}`,
          );
          continue;
        }
        if (dependencyVersion !== targetPackage.version) {
          failures.push(
            `${packageInfo.name}: ${dependencyName} must match ${targetPackage.version}`,
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
            `${packageInfo.name}: package.json references unclassified ${dependencyName}`,
          );
          continue;
        }
        if (packageInfo.dependencies?.[dependencyName] !== dependencyVersion) {
          failures.push(
            `${packageInfo.name}: ${dependencyName} must be declared in release metadata`,
          );
        }
        if (dependencyVersion !== targetPackage.version) {
          failures.push(
            `${packageInfo.name}: ${dependencyName} must use exact ${targetPackage.version}`,
          );
        }
      }

      const versionExport = packageInfo.policies?.versionExport;
      if (versionExport) {
        if (!existsSync(path.join(root, versionExport.path))) {
          failures.push(
            `${packageInfo.name}: version export source is missing: ${versionExport.path}`,
          );
        } else {
          const source = read(root, versionExport.path);
          if (
            !source.includes(
              `${versionExport.symbol} = "${releaseLine.version}"`,
            )
          ) {
            failures.push(
              `${packageInfo.name}: ${versionExport.symbol} must be ${releaseLine.version}`,
            );
          }
        }
      }
    }
  }

  const packageLockPath = "package-lock.json";
  if (!existsSync(path.join(root, packageLockPath))) {
    failures.push(`${packageLockPath} is missing`);
  } else {
    const packageLock = readJson(root, packageLockPath);
    for (const packageInfo of packageMap.values()) {
      const lockedPackage = packageLock.packages?.[packageInfo.directory];
      if (!lockedPackage) {
        failures.push(
          `package-lock.json: missing workspace ${packageInfo.directory}`,
        );
        continue;
      }
      if (lockedPackage.version !== packageInfo.version) {
        failures.push(
          `package-lock.json: ${packageInfo.directory} must be ${packageInfo.version}`,
        );
      }
      for (const [dependencyName, dependencyVersion] of Object.entries(
        packageInfo.dependencies ?? {},
      )) {
        if (
          lockedPackage.dependencies?.[dependencyName] !== dependencyVersion
        ) {
          failures.push(
            `package-lock.json: ${packageInfo.name} ${dependencyName} must be ${dependencyVersion}`,
          );
        }
      }
    }
  }

  const releaseWorkflowPath = ".github/workflows/release.yml";
  if (!existsSync(path.join(root, releaseWorkflowPath))) {
    failures.push(`${releaseWorkflowPath} is missing`);
  } else {
    const releaseWorkflow = read(root, releaseWorkflowPath);
    for (const marker of [
      "release-group:",
      '--release-group "$RELEASE_GROUP"',
    ]) {
      if (!releaseWorkflow.includes(marker)) {
        failures.push(
          `release workflow is missing release-group contract marker: ${marker}`,
        );
      }
    }
  }

  return [...new Set(failures)].sort();
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
    "Release group verification passed: schema, metadata, package manifests, dependency declarations, lockfile, and workflow selection are consistent.",
  );
}
