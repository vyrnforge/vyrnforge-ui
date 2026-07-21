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
const components = full || readBoolean("CI_SCOPE_UI_COMPONENTS");
const dataGrid = full || readBoolean("CI_SCOPE_UI_DATA_GRID");
const fixtures = full || readBoolean("CI_SCOPE_FIXTURES");

runNpm(["run", "verify:ci"]);
runNpm(["run", "format:check"]);
runNpm(["run", "lint"]);
runNpm(["run", "lint:css"]);
runNpm(["run", "verify:metadata"]);
runNpm(["run", "verify:component-maturity"]);
runNpm(["run", "verify:repository-inventory"]);
runNpm(["run", "test:coverage"]);

if (core || components || dataGrid || fixtures) {
  runNpm(["run", "fixtures:verify"]);
}

if (full) {
  runNpm(["run", "typecheck"]);
  process.exit(0);
}

// Build package prerequisites once, then suppress pretypecheck scripts so targeted
// package checks do not repeatedly rebuild the same dependency chain.
if (core || components || dataGrid) {
  runNpm(["run", "build", "--workspace", "@vyrnforge/ui-core"]);
}
if (components || dataGrid) {
  runNpm(["run", "build", "--workspace", "@vyrnforge/ui-components"]);
}
if (dataGrid) {
  runNpm(["run", "build", "--workspace", "@vyrnforge/ui-data-grid"]);
}

const selected = [
  [core, "@vyrnforge/ui-core"],
  [components, "@vyrnforge/ui-components"],
  [dataGrid, "@vyrnforge/ui-data-grid"],
].filter(([enabled]) => enabled);

for (const [, workspace] of selected) {
  runNpm(["--ignore-scripts", "run", "typecheck", "--workspace", workspace]);
}
