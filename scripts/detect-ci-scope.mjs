import { execFileSync } from "node:child_process";
import { appendFileSync, existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const scopeKeys = [
  "quality",
  "integration",
  "security",
  "metadata",
  "packages",
  "consumer",
  "docs",
  "playground",
  "fixtures",
  "browser",
  "full",
  "docs_only",
];

const rootDocumentationFiles = new Set([
  "AGENTS.md",
  "CHANGELOG.md",
  "CONTRIBUTING.md",
  "MIGRATION.md",
  "README.md",
  "SECURITY.md",
]);

const fullValidationFiles = new Set([
  ".nvmrc",
  ".node-version",
  "package.json",
  "package-lock.json",
  "tsconfig.base.json",
]);

function readJson(file) {
  return JSON.parse(readFileSync(file, "utf8"));
}

function discoverPackages() {
  const packagesRoot = path.join(root, "packages");
  const records = [];

  for (const directory of readdirSync(packagesRoot, { withFileTypes: true })) {
    if (!directory.isDirectory()) continue;
    const manifestPath = path.join(packagesRoot, directory.name, "package.json");
    if (!existsSync(manifestPath)) continue;

    const manifest = readJson(manifestPath);
    records.push({
      directory: `packages/${directory.name}`,
      shortName: directory.name,
      name: manifest.name,
      manifest,
    });
  }

  const names = new Set(records.map((record) => record.name));
  for (const record of records) {
    const dependencyMaps = [
      record.manifest.dependencies,
      record.manifest.peerDependencies,
      record.manifest.optionalDependencies,
    ];
    record.vyrnforgeDependencies = new Set(
      dependencyMaps
        .flatMap((dependencies) => Object.keys(dependencies ?? {}))
        .filter((name) => names.has(name)),
    );
  }

  return records.sort((a, b) => a.directory.localeCompare(b.directory));
}

const packageRecords = discoverPackages();
const packageByDirectory = new Map(
  packageRecords.map((record) => [record.directory, record]),
);
const reverseDependencies = new Map(
  packageRecords.map((record) => [record.name, new Set()]),
);

for (const record of packageRecords) {
  for (const dependency of record.vyrnforgeDependencies) {
    reverseDependencies.get(dependency)?.add(record.name);
  }
}

function createScope() {
  return Object.fromEntries(scopeKeys.map((key) => [key, false]));
}

function normalizeFile(file) {
  return file.trim().replaceAll("\\", "/").replace(/^\.\//, "");
}

function isPackageTest(file) {
  return /(?:^|\/)(?:__tests__\/|[^/]+\.(?:test|spec)\.[cm]?[jt]sx?$)/.test(
    file,
  );
}

function downstreamPackages(packageName) {
  const selected = new Set([packageName]);
  const queue = [packageName];

  while (queue.length) {
    const current = queue.shift();
    for (const dependent of reverseDependencies.get(current) ?? []) {
      if (selected.has(dependent)) continue;
      selected.add(dependent);
      queue.push(dependent);
    }
  }

  return selected;
}

function markRuntimeImpact(scope, selectedPackages, packageName) {
  scope.quality = true;
  scope.packages = true;
  scope.consumer = true;
  scope.docs = true;
  scope.playground = true;
  scope.fixtures = true;
  scope.browser = true;

  for (const name of downstreamPackages(packageName)) {
    selectedPackages.add(name);
  }
}

function markPackagePayload(scope) {
  scope.packages = true;
  scope.consumer = true;
}

function markFull(scope, selectedPackages) {
  for (const key of scopeKeys) {
    if (key !== "docs_only") scope[key] = true;
  }
  for (const record of packageRecords) selectedPackages.add(record.name);
  scope.docs_only = false;
}

function findPackage(file) {
  const match = /^packages\/([^/]+)\/(.+)$/.exec(file);
  if (!match) return null;
  const directory = `packages/${match[1]}`;
  const record = packageByDirectory.get(directory);
  return record ? { record, packagePath: match[2] } : null;
}

function classifyPackageFile(file, scope, selectedPackages, reasons) {
  const match = findPackage(file);
  if (!match) return false;

  const { record, packagePath } = match;
  const configurationFiles = new Set([
    "package.json",
    "tsconfig.json",
    "tsconfig.build.json",
    "tsup.config.ts",
    "vite.config.ts",
  ]);

  if (configurationFiles.has(packagePath)) {
    markRuntimeImpact(scope, selectedPackages, record.name);
    scope.metadata = true;
    reasons.add(`${record.name} package configuration`);
    return true;
  }

  if (packagePath === "README.md" || packagePath === "LICENSE") {
    markPackagePayload(scope);
    selectedPackages.add(record.name);
    reasons.add(`${record.name} published payload metadata`);
    return true;
  }

  if (isPackageTest(packagePath)) {
    scope.quality = true;
    selectedPackages.add(record.name);
    reasons.add(`${record.name} tests`);
    return true;
  }

  markRuntimeImpact(scope, selectedPackages, record.name);
  reasons.add(`${record.name} runtime or public package surface`);
  return true;
}

export function planCiScope(files, { forceFull = false } = {}) {
  const changedFiles = [...new Set(files.map(normalizeFile).filter(Boolean))].sort();
  const scope = createScope();
  const selectedPackages = new Set();
  const reasons = new Set();

  if (forceFull || changedFiles.length === 0) {
    markFull(scope, selectedPackages);
    reasons.add(
      forceFull ? "manual full validation" : "no diff available; safe full fallback",
    );
    return finalize(scope, selectedPackages, changedFiles, reasons);
  }

  for (const file of changedFiles) {
    if (
      fullValidationFiles.has(file) ||
      file.startsWith(".github/workflows/") ||
      file.startsWith(".github/actions/") ||
      file.startsWith("scripts/")
    ) {
      markFull(scope, selectedPackages);
      reasons.add(`shared CI/build configuration: ${file}`);
      continue;
    }

    if (classifyPackageFile(file, scope, selectedPackages, reasons)) continue;

    if (file === "LICENSE") {
      markPackagePayload(scope);
      reasons.add("root package license payload");
      continue;
    }

    if (
      file.startsWith("tests/package-consumer/") ||
      file.startsWith("tests/beta-package-consumer/")
    ) {
      scope.consumer = true;
      reasons.add("external consumer fixture");
      continue;
    }

    if (file.startsWith("tests/consumers/")) {
      scope.quality = true;
      scope.metadata = true;
      scope.consumer = true;
      scope.docs = true;
      reasons.add("multi-framework consumer architecture fixture");
      continue;
    }

    if (file.startsWith("apps/docs/")) {
      scope.docs = true;
      reasons.add("documentation application");
      continue;
    }

    if (file.startsWith("examples/")) {
      scope.playground = true;
      reasons.add("example or playground application");
      continue;
    }

    if (file.startsWith("apps/regression-fixtures/")) {
      scope.quality = true;
      scope.fixtures = true;
      scope.browser = true;
      reasons.add("regression fixture application");
      continue;
    }

    if (file === "playwright.config.ts" || file.startsWith("tests/browser/")) {
      scope.quality = true;
      scope.browser = true;
      reasons.add("browser test infrastructure or contract");
      continue;
    }

    if (file.startsWith("tests/dom/")) {
      scope.quality = true;
      scope.fixtures = true;
      reasons.add("shared DOM and accessibility test utilities");
      continue;
    }

    if (file === "docs/metadata/visual-regression-matrix.json") {
      scope.quality = true;
      scope.metadata = true;
      scope.docs = true;
      scope.fixtures = true;
      scope.browser = true;
      reasons.add("visual regression metadata");
      continue;
    }

    if (file.startsWith("docs/metadata/") || file === ".ai/COMPONENT_MAP.json") {
      scope.quality = true;
      scope.metadata = true;
      scope.docs = true;
      reasons.add("public metadata");
      continue;
    }

    if (
      file.startsWith("docs/") ||
      rootDocumentationFiles.has(file) ||
      file.startsWith(".ai/")
    ) {
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

    markFull(scope, selectedPackages);
    reasons.add(`unclassified path uses safe full validation: ${file}`);
  }

  return finalize(scope, selectedPackages, changedFiles, reasons);
}

function finalize(scope, selectedPackages, changedFiles, reasons) {
  scope.integration =
    scope.packages ||
    scope.consumer ||
    scope.docs ||
    scope.playground ||
    scope.browser;

  scope.security = scope.full || changedFiles.some((file) =>
    file === "package.json" ||
    file === "package-lock.json" ||
    /(?:^|\/)package\.json$/.test(file) ||
    file.startsWith(".github/workflows/") ||
    file.startsWith(".github/actions/")
  );

  scope.docs_only =
    scope.docs &&
    !scope.full &&
    !scope.quality &&
    !scope.packages &&
    !scope.consumer &&
    !scope.playground &&
    !scope.fixtures;

  const affectedPackages = [...selectedPackages].sort();
  return {
    ...scope,
    affected_packages: affectedPackages,
    affected_packages_csv: affectedPackages.join(","),
    changed_files: changedFiles,
    reasons: [...reasons],
  };
}

function readArgument(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

function isZeroSha(value) {
  return !value || /^0+$/.test(value);
}

function readChangedFiles({ base, head, filesFrom }) {
  if (filesFrom) return readFileSync(filesFrom, "utf8").split(/\r?\n/);
  if (isZeroSha(base) || !head) return [];

  try {
    return execFileSync(
      "git",
      ["diff", "--name-only", "--diff-filter=ACDMRTUXB", base, head, "--"],
      { cwd: root, encoding: "utf8" },
    ).split(/\r?\n/);
  } catch (error) {
    console.warn(
      `Unable to calculate CI diff; using safe full validation: ${error.message}`,
    );
    return [];
  }
}

function writeGitHubOutput(outputPath, plan) {
  for (const key of scopeKeys) {
    appendFileSync(outputPath, `${key}=${plan[key] ? "true" : "false"}\n`);
  }
  appendFileSync(outputPath, `affected_packages=${plan.affected_packages_csv}\n`);
  appendFileSync(outputPath, `changed_count=${plan.changed_files.length}\n`);
  appendFileSync(
    outputPath,
    `plan_json<<VYRNFORGE_CI_PLAN\n${JSON.stringify(plan)}\nVYRNFORGE_CI_PLAN\n`,
  );
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
  const plan = planCiScope(files, {
    forceFull: forceFull || isZeroSha(base) || !head,
  });

  if (githubOutput) writeGitHubOutput(githubOutput, plan);
  process.stdout.write(`${JSON.stringify(plan, null, 2)}\n`);
}
