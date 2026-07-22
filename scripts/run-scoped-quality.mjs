import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const npmCliPath = process.env.npm_execpath;

function readBoolean(name, defaultValue = false) {
  const value = process.env[name];
  if (value === undefined) {
    return defaultValue;
  }
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
const core = full || readBoolean("CI_SCOPE_UI_CORE");
const behaviors = full || readBoolean("CI_SCOPE_UI_BEHAVIORS");
const components = full || readBoolean("CI_SCOPE_UI_COMPONENTS");
const elements = full || readBoolean("CI_SCOPE_UI_ELEMENTS");
const dataGrid = full || readBoolean("CI_SCOPE_UI_DATA_GRID");
const fixtures = full || readBoolean("CI_SCOPE_FIXTURES");

runNpm(["run", "verify:ci"]);
runNpm(["run", "format:check"]);
runNpm(["run", "lint"]);
runNpm(["run", "lint:css"]);
runNpm(["run", "verify:metadata"]);
runNpm(["run", "verify:design-tokens"]);
runNpm(["run", "verify:token-adoption"]);
runNpm(["run", "verify:visual-regression"]);
runNpm(["run", "verify:g3-closure"]);
runNpm(["run", "verify:component-maturity"]);
runNpm(["run", "verify:maturity-closure"]);
runNpm(["run", "verify:assistive-technology"]);
runNpm(["run", "verify:repository-inventory"]);
runNpm(["run", "test:coverage"]);

if (core || behaviors || components || elements || dataGrid || fixtures) {
  runNpm(["run", "fixtures:verify"]);
}

if (full) {
  runNpm(["run", "typecheck"]);
  process.exit(0);
}

// Build package prerequisites once, then suppress pretypecheck scripts so targeted
// package checks do not repeatedly rebuild the same dependency chain.
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

const selected = [
  [core, "@vyrnforge/ui-core"],
  [behaviors, "@vyrnforge/ui-behaviors"],
  [components, "@vyrnforge/ui-components"],
  [elements, "@vyrnforge/ui-elements"],
  [dataGrid, "@vyrnforge/ui-data-grid"],
].filter(([enabled]) => enabled);

for (const [, workspace] of selected) {
  runNpm(["--ignore-scripts", "run", "typecheck", "--workspace", workspace]);
}
