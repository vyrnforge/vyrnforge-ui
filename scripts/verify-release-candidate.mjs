import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const npmCliPath = process.env.npm_execpath;
const packageInfos = [
  { name: "@vyrnforge/ui-core", dir: "packages/ui-core", dependencies: [] },
  {
    name: "@vyrnforge/ui-components",
    dir: "packages/ui-components",
    dependencies: ["@vyrnforge/ui-core"]
  },
  {
    name: "@vyrnforge/ui-data-grid",
    dir: "packages/ui-data-grid",
    dependencies: ["@vyrnforge/ui-core", "@vyrnforge/ui-components"]
  }
];
const localDependencySpecPattern = /^(?:workspace:|file:|link:|\.{1,2}(?:[\\/]|$)|[A-Za-z]:[\\/]|\/)/;
const allowedDistTags = new Set(["alpha", "beta", "next"]);

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
      stdio: ["ignore", "pipe", "pipe"]
    });
  }

  return execFileSync(process.platform === "win32" ? "npm.cmd" : "npm", args, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
}

function isPublished(packageName, version) {
  try {
    const output = runNpm([
      "view",
      `${packageName}@${version}`,
      "version",
      "--json",
      "--registry=https://registry.npmjs.org"
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

const version = readArgument("--version");
const distTag = readArgument("--dist-tag");

assert(version, "missing required --version");
assert(distTag, "missing required --dist-tag");
assert(allowedDistTags.has(distTag), `unsupported dist-tag: ${distTag}`);

const prereleaseMatch = /^(\d+)\.(\d+)\.(\d+)-([0-9A-Za-z-]+)(?:\.[0-9A-Za-z-]+)*$/.exec(version);
assert(prereleaseMatch, `version must be a valid prerelease: ${version}`);

const prereleaseChannel = prereleaseMatch[4];
if (distTag === "alpha") {
  assert(prereleaseChannel === "alpha", `alpha dist-tag requires an alpha prerelease: ${version}`);
}
if (distTag === "beta") {
  assert(prereleaseChannel === "beta", `beta dist-tag requires a beta prerelease: ${version}`);
}

const rootPackage = readJson("package.json");
assert(rootPackage.private === true, "root package.json must remain private");

const packages = new Map(
  packageInfos.map((packageInfo) => [
    packageInfo.name,
    readJson(path.join(packageInfo.dir, "package.json"))
  ])
);

for (const packageInfo of packageInfos) {
  const packageJson = packages.get(packageInfo.name);
  assert(packageJson.version === version, `${packageInfo.name} must be ${version}`);
  assert(!Object.hasOwn(packageJson, "private"), `${packageInfo.name} must be publishable`);

  for (const dependencyGroup of ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"]) {
    for (const [dependencyName, dependencySpec] of Object.entries(packageJson[dependencyGroup] ?? {})) {
      assert(
        typeof dependencySpec === "string" && !localDependencySpecPattern.test(dependencySpec),
        `${packageInfo.name}: ${dependencyName} uses a local dependency specification`
      );
      if (dependencyName.startsWith("@vyrnforge/")) {
        assert(
          dependencySpec === version,
          `${packageInfo.name}: ${dependencyName} must use exact ${version}`
        );
      }
    }
  }

  for (const dependencyName of packageInfo.dependencies) {
    assert(
      packageJson.dependencies?.[dependencyName] === version,
      `${packageInfo.name}: ${dependencyName} must use exact ${version}`
    );
  }

  assert(!isPublished(packageInfo.name, version), `${packageInfo.name}@${version} already exists in npm`);
}

console.log(`Release candidate verification passed: ${version} (${distTag})`);
