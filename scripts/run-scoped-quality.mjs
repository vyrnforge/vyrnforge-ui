import { execFileSync } from "node:child_process";
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

const full = readBoolean("CI_SCOPE_FULL");
const metadata = full || readBoolean("CI_SCOPE_METADATA");
const historicalEvidence = readBoolean("CI_SCOPE_HISTORICAL_EVIDENCE");
const core = full || readBoolean("CI_SCOPE_UI_CORE");
const behaviors = full || readBoolean("CI_SCOPE_UI_BEHAVIORS");
const components = full || readBoolean("CI_SCOPE_UI_COMPONENTS");
const elements = full || readBoolean("CI_SCOPE_UI_ELEMENTS");
const dataGrid = full || readBoolean("CI_SCOPE_UI_DATA_GRID");
const fixtures = full || readBoolean("CI_SCOPE_FIXTURES");

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

if (historicalEvidence) {
  runNpm(["run", "test:historical-evidence"]);
  runNpm(["run", "verify:historical-evidence"]);
}

const selected = [
  [core, "@vyrnforge/ui-core"],
  [behaviors, "@vyrnforge/ui-behaviors"],
  [components, "@vyrnforge/ui-components"],
  [elements, "@vyrnforge/ui-elements"],
  [dataGrid, "@vyrnforge/ui-data-grid"],
].filter(([enabled]) => enabled);

if (fixtures) {
  runNpm(["run", "build:packages"]);
} else {
  if (core || behaviors || components || elements || dataGrid) {
    runNpm(["run", "build", "--workspace", "@vyrnforge/ui-core"]);
  }
  if (behaviors || components || elements) {
    runNpm(["run", "build", "--workspace", "@vyrnforge/ui-behaviors"]);
  }
  if (components || dataGrid) {
    runNpm(["run", "build", "--workspace", "@vyrnforge/ui-components"]);
  }
  if (elements) {
    runNpm(["run", "build", "--workspace", "@vyrnforge/ui-elements"]);
  }
  if (dataGrid) {
    runNpm(["run", "build", "--workspace", "@vyrnforge/ui-data-grid"]);
  }
}

for (const [, workspace] of selected) {
  runNpm(["--ignore-scripts", "run", "typecheck", "--workspace", workspace]);
  runNpm([
    "--ignore-scripts",
    "run",
    "test:coverage",
    "--workspace",
    workspace,
  ]);
}

if (fixtures) {
  runNpm(["run", "fixtures:test:prepared"]);
  runNpm(["run", "fixtures:build:prepared"]);
}
