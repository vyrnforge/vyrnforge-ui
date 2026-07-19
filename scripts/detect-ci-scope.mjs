import { execFileSync } from "node:child_process";
import { appendFileSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const scopeKeys = [
  "quality",
  "metadata",
  "ui_core",
  "ui_components",
  "ui_data_grid",
  "packages",
  "consumer",
  "docs",
  "playground",
  "full",
  "docs_only"
];

const rootDocumentationFiles = new Set([
  "AGENTS.md",
  "CHANGELOG.md",
  "CONTRIBUTING.md",
  "MIGRATION.md",
  "README.md",
  "SECURITY.md"
]);

const fullValidationFiles = new Set([
  ".nvmrc",
  "package.json",
  "package-lock.json",
  "tsconfig.base.json"
]);

function createScope() {
  return Object.fromEntries(scopeKeys.map((key) => [key, false]));
}

function normalizeFile(file) {
  return file.trim().replaceAll("\\", "/").replace(/^\.\//, "");
}

function isPackageTest(file) {
  return /(?:^|\/)(?:__tests__\/|[^/]+\.(?:test|spec)\.[cm]?[jt]sx?$)/.test(file);
}

function markPackageRuntime(scope, packageName) {
  scope.quality = true;
  scope.packages = true;
  scope.consumer = true;
  scope.docs = true;
  scope.playground = true;

  if (packageName === "ui-core") {
    scope.ui_core = true;
    scope.ui_components = true;
    scope.ui_data_grid = true;
  } else if (packageName === "ui-components") {
    scope.ui_components = true;
    scope.ui_data_grid = true;
  } else {
    scope.ui_data_grid = true;
  }
}

function markPackageTests(scope, packageName) {
  scope.quality = true;
  if (packageName === "ui-core") {
    scope.ui_core = true;
  } else if (packageName === "ui-components") {
    scope.ui_components = true;
  } else {
    scope.ui_data_grid = true;
  }
}

function markPackagePayload(scope) {
  scope.packages = true;
  scope.consumer = true;
}

function markFull(scope) {
  for (const key of scopeKeys) {
    if (key !== "docs_only") {
      scope[key] = true;
    }
  }
  scope.docs_only = false;
}

function classifyPackageFile(file, scope, reasons) {
  const match = /^packages\/(ui-core|ui-components|ui-data-grid)\/(.+)$/.exec(file);
  if (!match) {
    return false;
  }

  const [, packageName, packagePath] = match;

  if (["package.json", "tsconfig.json", "tsup.config.ts"].includes(packagePath)) {
    markPackageRuntime(scope, packageName);
    reasons.add(`${packageName} package configuration`);
    return true;
  }

  if (packagePath === "README.md" || packagePath === "LICENSE") {
    markPackagePayload(scope);
    reasons.add(`${packageName} published payload metadata`);
    return true;
  }

  if (isPackageTest(packagePath)) {
    markPackageTests(scope, packageName);
    reasons.add(`${packageName} tests`);
    return true;
  }

  markPackageRuntime(scope, packageName);
  reasons.add(`${packageName} runtime or public package surface`);
  return true;
}

export function planCiScope(files, { forceFull = false } = {}) {
  const changedFiles = [...new Set(files.map(normalizeFile).filter(Boolean))].sort();
  const scope = createScope();
  const reasons = new Set();

  if (forceFull || changedFiles.length === 0) {
    markFull(scope);
    reasons.add(forceFull ? "manual full validation" : "no diff available; safe full fallback");
    return { ...scope, changed_files: changedFiles, reasons: [...reasons] };
  }

  for (const file of changedFiles) {
    if (
      fullValidationFiles.has(file) ||
      file.startsWith(".github/workflows/") ||
      file.startsWith(".github/actions/") ||
      file.startsWith("scripts/")
    ) {
      markFull(scope);
      reasons.add(`shared CI/build configuration: ${file}`);
      continue;
    }

    if (classifyPackageFile(file, scope, reasons)) {
      continue;
    }

    if (file === "LICENSE") {
      markPackagePayload(scope);
      reasons.add("root package license payload");
      continue;
    }

    if (file.startsWith("tests/package-consumer/")) {
      scope.consumer = true;
      reasons.add("external consumer fixture");
      continue;
    }

    if (file.startsWith("apps/docs/")) {
      scope.docs = true;
      reasons.add("documentation application");
      continue;
    }

    if (file.startsWith("examples/basic-playground/")) {
      scope.playground = true;
      reasons.add("playground application");
      continue;
    }

    if (file.startsWith("docs/metadata/") || file === ".ai/COMPONENT_MAP.json") {
      scope.quality = true;
      scope.metadata = true;
      scope.docs = true;
      reasons.add("public metadata");
      continue;
    }

    if (file.startsWith("docs/") || rootDocumentationFiles.has(file) || file.startsWith(".ai/")) {
      scope.docs = true;
      reasons.add("documentation or AI context");
      continue;
    }

    if (
      file.startsWith(".github/ISSUE_TEMPLATE/") ||
      file.startsWith(".github/PULL_REQUEST_TEMPLATE/") ||
      file === ".github/pull_request_template.md"
    ) {
      scope.quality = true;
      reasons.add("GitHub contribution template contract");
      continue;
    }

    // An unknown file may affect tooling or build behavior. Prefer a safe full run.
    markFull(scope);
    reasons.add(`unclassified path uses safe full validation: ${file}`);
  }

  scope.docs_only =
    scope.docs &&
    !scope.full &&
    !scope.quality &&
    !scope.packages &&
    !scope.consumer &&
    !scope.playground;

  return { ...scope, changed_files: changedFiles, reasons: [...reasons] };
}

function readArgument(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

function isZeroSha(value) {
  return !value || /^0+$/.test(value);
}

function readChangedFiles({ base, head, filesFrom }) {
  if (filesFrom) {
    return readFileSync(filesFrom, "utf8").split(/\r?\n/);
  }

  if (isZeroSha(base) || !head) {
    return [];
  }

  try {
    return execFileSync(
      "git",
      ["diff", "--name-only", "--diff-filter=ACDMRTUXB", base, head, "--"],
      { cwd: root, encoding: "utf8" }
    ).split(/\r?\n/);
  } catch (error) {
    console.warn(`Unable to calculate CI diff; using safe full validation: ${error.message}`);
    return [];
  }
}

function writeGitHubOutput(outputPath, plan) {
  for (const key of scopeKeys) {
    appendFileSync(outputPath, `${key}=${plan[key] ? "true" : "false"}\n`);
  }
  appendFileSync(outputPath, `changed_count=${plan.changed_files.length}\n`);
  appendFileSync(outputPath, `plan_json<<VYRNFORGE_CI_PLAN\n${JSON.stringify(plan)}\nVYRNFORGE_CI_PLAN\n`);
}

function isMainModule() {
  return process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
}

if (isMainModule()) {
  const forceFull = process.argv.includes("--full");
  const base = readArgument("--base") ?? process.env.CI_BASE_SHA;
  const head = readArgument("--head") ?? process.env.CI_HEAD_SHA;
  const filesFrom = readArgument("--files-from");
  const githubOutput = readArgument("--github-output") ?? process.env.GITHUB_OUTPUT;
  const files = readChangedFiles({ base, head, filesFrom });
  const plan = planCiScope(files, { forceFull: forceFull || isZeroSha(base) || !head });

  if (githubOutput) {
    writeGitHubOutput(githubOutput, plan);
  }

  process.stdout.write(`${JSON.stringify(plan, null, 2)}\n`);
}
