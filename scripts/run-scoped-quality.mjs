import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const npmCliPath = process.env.npm_execpath;

function readBoolean(name, defaultValue = false) {
  const value = process.env[name];
  if (value === undefined) return defaultValue;
  return value === "true" || value === "1";
}

function runNpm(args) {
  const command = npmCliPath
    ? process.execPath
    : process.platform === "win32"
      ? "npm.cmd"
      : "npm";
  const commandArgs = npmCliPath ? [npmCliPath, ...args] : args;
  execFileSync(command, commandArgs, { cwd: root, stdio: "inherit" });
}

function workspaceManifest(packageName) {
  const packagePath = packageName.replace(/^@vyrnforge\//, "");
  const manifestPath = path.join(root, "packages", packagePath, "package.json");
  if (!existsSync(manifestPath)) {
    throw new Error(`CI selected unknown workspace ${packageName}`);
  }
  return JSON.parse(readFileSync(manifestPath, "utf8"));
}

function discoverPackageNames() {
  const packagesRoot = path.join(root, "packages");
  return readdirSync(packagesRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(packagesRoot, entry.name, "package.json"))
    .filter(existsSync)
    .map((manifestPath) => JSON.parse(readFileSync(manifestPath, "utf8")).name)
    .filter(Boolean)
    .sort();
}

function readAffectedPackages(full) {
  if (full) return discoverPackageNames();
  return [...new Set(
    (process.env.CI_AFFECTED_PACKAGES ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  )].sort();
}

function dependenciesFor(manifest) {
  return new Set([
    ...Object.keys(manifest.dependencies ?? {}),
    ...Object.keys(manifest.peerDependencies ?? {}),
    ...Object.keys(manifest.optionalDependencies ?? {}),
  ]);
}

function orderSelectedPackages(packageNames) {
  const selected = new Set(packageNames);
  const manifests = new Map(
    packageNames.map((name) => [name, workspaceManifest(name)]),
  );
  const ordered = [];
  const visiting = new Set();
  const visited = new Set();

  function visit(name) {
    if (visited.has(name)) return;
    if (visiting.has(name)) {
      throw new Error(`Circular VyrnForge workspace dependency detected at ${name}`);
    }
    visiting.add(name);
    for (const dependency of dependenciesFor(manifests.get(name))) {
      if (selected.has(dependency)) visit(dependency);
    }
    visiting.delete(name);
    visited.add(name);
    ordered.push(name);
  }

  for (const name of [...packageNames].sort()) visit(name);
  return ordered;
}

function runWorkspaceScript(packageName, script) {
  const manifest = workspaceManifest(packageName);
  if (!manifest.scripts?.[script]) return;
  runNpm(["--ignore-scripts", "run", script, "--workspace", packageName]);
}

const full = readBoolean("CI_SCOPE_FULL");
const metadata = full || readBoolean("CI_SCOPE_METADATA");
const fixtures = full || readBoolean("CI_SCOPE_FIXTURES");
const selectedPackages = orderSelectedPackages(readAffectedPackages(full));

for (const command of [
  "format:check",
  "lint",
  "lint:css",
  "verify:documentation-current",
  "verify:package-boundaries",
]) {
  runNpm(["run", command]);
}

if (metadata) {
  for (const command of [
    "test:contracts",
    "verify:metadata",
    "verify:design-tokens",
    "verify:token-adoption",
    "verify:visual-regression",
    "verify:component-maturity",
    "verify:maturity-closure",
    "verify:assistive-technology",
    "verify:repository-inventory",
    "verify:workflows",
    "verify:templates",
    "verify:validation-model",
  ]) {
    runNpm(["run", command]);
  }
}

if (fixtures) {
  runNpm(["run", "build:packages"]);
} else {
  for (const packageName of selectedPackages) {
    runWorkspaceScript(packageName, "build");
  }
}

for (const packageName of selectedPackages) {
  runWorkspaceScript(packageName, "typecheck");
  const manifest = workspaceManifest(packageName);
  if (manifest.scripts?.["test:coverage"]) {
    runWorkspaceScript(packageName, "test:coverage");
  } else {
    runWorkspaceScript(packageName, "test");
  }
}

if (fixtures) {
  runNpm(["run", "fixtures:test:prepared"]);
  runNpm(["run", "fixtures:build:prepared"]);
}
