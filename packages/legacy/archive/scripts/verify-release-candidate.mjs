import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  getReleaseGroup,
  getReleasePackageMap,
  readReleaseGroups,
} from "./release-groups.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const npmCliPath = process.env.npm_execpath;
const localDependencySpecPattern =
  /^(?:workspace:|file:|link:|\.{1,2}(?:[\\/]|$)|[A-Za-z]:[\\/]|\/)/;

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function readJson(relativePath) {
  return JSON.parse(readFileSync(path.join(root, relativePath), "utf8"));
}

function readArgument(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

function runNpm(args) {
  if (npmCliPath) {
    return execFileSync(process.execPath, [npmCliPath, ...args], {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  }

  return execFileSync(process.platform === "win32" ? "npm.cmd" : "npm", args, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function isPublished(packageName, version) {
  try {
    const output = runNpm([
      "view",
      `${packageName}@${version}`,
      "version",
      "--json",
      "--registry=https://registry.npmjs.org",
    ]);
    return JSON.parse(output) === version;
  } catch (error) {
    const output = `${error.stdout ?? ""}\n${error.stderr ?? ""}`;
    if (/\bE404\b|404 Not Found/i.test(output)) {
      return false;
    }
    throw error;
  }
}

const releaseGroupId = readArgument("--release-group");
const version = readArgument("--version");
const distTag = readArgument("--dist-tag");

assert(releaseGroupId, "missing required --release-group");
assert(version, "missing required --version");
assert(distTag, "missing required --dist-tag");

const manifest = readReleaseGroups({ root });
const releaseGroup = getReleaseGroup(releaseGroupId, { root, manifest });
const packageMap = getReleasePackageMap(manifest);
const selectedNames = new Set(
  releaseGroup.packages.map((packageInfo) => packageInfo.name),
);

assert(
  version === releaseGroup.version,
  `${releaseGroupId} version must be ${releaseGroup.version}`,
);
assert(
  distTag === releaseGroup.distTag,
  `${releaseGroupId} dist-tag must be ${releaseGroup.distTag}`,
);

const prereleaseMatch =
  /^(\d+)\.(\d+)\.(\d+)-([0-9A-Za-z-]+)(?:\.[0-9A-Za-z-]+)*$/.exec(version);
assert(prereleaseMatch, `version must be a valid prerelease: ${version}`);
assert(
  prereleaseMatch[4] === releaseGroup.channel,
  `${releaseGroupId} requires a ${releaseGroup.channel} prerelease: ${version}`,
);

const rootPackage = readJson("package.json");
assert(rootPackage.private === true, "root package.json must remain private");

for (const packageInfo of releaseGroup.packages) {
  const packageJson = readJson(
    path.join(packageInfo.directory, "package.json"),
  );
  assert(
    packageJson.version === releaseGroup.version,
    `${packageInfo.name} must be ${releaseGroup.version}`,
  );
  assert(
    !Object.hasOwn(packageJson, "private"),
    `${packageInfo.name} must be publishable`,
  );

  for (const dependencyGroup of [
    "dependencies",
    "devDependencies",
    "peerDependencies",
    "optionalDependencies",
  ]) {
    for (const [dependencyName, dependencySpec] of Object.entries(
      packageJson[dependencyGroup] ?? {},
    )) {
      assert(
        typeof dependencySpec === "string" &&
          !localDependencySpecPattern.test(dependencySpec),
        `${packageInfo.name}: ${dependencyName} uses a local dependency specification`,
      );
      if (!dependencyName.startsWith("@vyrnforge/")) continue;
      const targetPackage = packageMap.get(dependencyName);
      assert(targetPackage, `${packageInfo.name}: unknown ${dependencyName}`);
      assert(
        dependencySpec === targetPackage.version,
        `${packageInfo.name}: ${dependencyName} must use exact ${targetPackage.version}`,
      );
      if (!selectedNames.has(dependencyName)) {
        assert(
          isPublished(dependencyName, targetPackage.version),
          `${packageInfo.name}: dependency ${dependencyName}@${targetPackage.version} must already be published`,
        );
      }
    }
  }

  for (const [dependencyName, dependencyVersion] of Object.entries(
    packageInfo.dependencies ?? {},
  )) {
    assert(
      packageJson.dependencies?.[dependencyName] === dependencyVersion,
      `${packageInfo.name}: ${dependencyName} must use exact ${dependencyVersion}`,
    );
  }

  assert(
    !isPublished(packageInfo.name, releaseGroup.version),
    `${packageInfo.name}@${releaseGroup.version} already exists in npm`,
  );
}

console.log(
  `Release candidate verification passed: ${releaseGroupId} ${version} (${distTag})`,
);
