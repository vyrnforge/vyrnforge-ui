import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
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

function readAffectedPackages() {
  return [...new Set(
    (process.env.CI_AFFECTED_PACKAGES ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  )].sort();
}

function workspaceManifest(packageName) {
  const packagePath = packageName.replace(/^@vyrnforge\//, "");
  const manifestPath = path.join(root, "packages", packagePath, "package.json");
  if (!existsSync(manifestPath)) {
    throw new Error(`CI selected unknown workspace ${packageName}`);
  }
  return JSON.parse(readFileSync(manifestPath, "utf8"));
}

function runWorkspaceScript(packageName, script, extraArgs = []) {
  const manifest = workspaceManifest(packageName);
  if (!manifest.scripts?.[script]) return;
  runNpm(["--ignore-scripts", "run", script, "--workspace", packageName, ...extraArgs]);
}

const full = readBoolean("CI_SCOPE_FULL");
const metadata = full || readBoolean("CI_SCOPE_METADATA");
const fixtures = full || readBoolean("CI_SCOPE_FIXTURES");
const selectedPackages = readAffectedPackages();

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
