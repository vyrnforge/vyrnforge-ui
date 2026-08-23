import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const taskIds = Array.from({ length: 14 }, (_, index) => `CF-${7001 + index}`);

const requiredFiles = [
  "docs/metadata/gmf4-closure.json",
  "docs/testing/gmf4-cross-framework-compatibility-gate.md",
  "docs/metadata/multi-framework.json",
  "docs/metadata/consumer-foundations.json",
  "docs/metadata/angular-consumer.json",
  "docs/metadata/angular-forms-adapter.json",
  "docs/metadata/vue-consumer.json",
  "docs/metadata/vue-model-adapter.json",
  "docs/metadata/ssr-bundler-compatibility.json",
  "docs/metadata/cross-framework-browser-matrix.json",
  "docs/metadata/component-reference-program.json",
  "docs/metadata/cross-framework-accessibility-review.json",
  "docs/metadata/multi-framework-migration-guide.json",
  "docs/testing/consumer-foundation-contracts.md",
  "docs/testing/angular-consumer-contract.md",
  "docs/testing/angular-forms-adapter-contract.md",
  "docs/testing/vue-consumer-contract.md",
  "docs/testing/vue-model-adapter-contract.md",
  "docs/testing/ssr-bundler-compatibility.md",
  "docs/testing/cross-framework-browser-matrix.md",
  "docs/testing/generated-component-reference.md",
  "docs/testing/cross-framework-accessibility-review.md",
  "docs/release/multi-framework-migration-and-limitations.md",
  "docs/quality/assistive-technology-results/cf-7010-cross-framework-nvda.json",
  "docs/quality/documentation-reviews/cf-7013-multi-framework-migration-guide.json",
  "tests/consumers/manifest.json",
  ".github/workflows/_integration.yml",
  "scripts/verify-native-element-foundations.mjs",
  "scripts/verify-multi-framework-architecture.mjs",
  "scripts/verify-package-boundaries.mjs",
  "scripts/verify-consumer-foundations.mjs",
  "scripts/verify-angular-consumer.mjs",
  "scripts/verify-angular-forms-adapter.mjs",
  "scripts/verify-vue-consumer.mjs",
  "scripts/verify-vue-model-adapter.mjs",
  "scripts/verify-ssr-bundler-compatibility.mjs",
  "scripts/verify-cross-framework-browser-matrix.mjs",
  "scripts/verify-component-reference.mjs",
  "scripts/verify-cross-framework-accessibility.mjs",
  "scripts/verify-multi-framework-migration-guide.mjs",
  "packages/ui-core/package.json",
  "packages/ui-behaviors/package.json",
  "packages/ui-components/package.json",
  "packages/ui-elements/package.json",
  "packages/ui-data-grid/package.json",
];
const dependencyVerifierScripts = [
  "scripts/verify-native-element-foundations.mjs",
  "scripts/verify-multi-framework-architecture.mjs",
  "scripts/verify-package-boundaries.mjs",
  "scripts/verify-consumer-foundations.mjs",
  "scripts/verify-angular-consumer.mjs",
  "scripts/verify-angular-forms-adapter.mjs",
  "scripts/verify-vue-consumer.mjs",
  "scripts/verify-vue-model-adapter.mjs",
  "scripts/verify-ssr-bundler-compatibility.mjs",
  "scripts/verify-cross-framework-browser-matrix.mjs",
  "scripts/verify-component-reference.mjs",
  "scripts/verify-cross-framework-accessibility.mjs",
  "scripts/verify-multi-framework-migration-guide.mjs",
];
const packagePaths = [
  "packages/ui-core/package.json",
  "packages/ui-behaviors/package.json",
  "packages/ui-components/package.json",
  "packages/ui-elements/package.json",
  "packages/ui-data-grid/package.json",
];

const includedPackages = [
  "@vyrnforge/ui-core",
  "@vyrnforge/ui-behaviors",
  "@vyrnforge/ui-components",
  "@vyrnforge/ui-elements",
];

const forbiddenRuntimeDependencies = [
  "@angular/core",
  "@angular/common",
  "@angular/forms",
  "vue",
  "pinia",
  "@ngrx/store",
  "@reduxjs/toolkit",
  "redux",
  "zustand",
];

function read(root, relativePath) {
  const absolutePath = path.join(root, relativePath);
  return existsSync(absolutePath)
    ? readFileSync(absolutePath, "utf8").replaceAll("\r\n", "\n")
    : null;
}

function readJson(root, relativePath) {
  const content = read(root, relativePath);
  return content === null ? null : JSON.parse(content);
}

function verifyDependencyScripts(root, failures) {
  for (const relativePath of dependencyVerifierScripts) {
    const result = spawnSync(
      process.execPath,
      [path.join(root, relativePath)],
      {
        cwd: root,
        encoding: "utf8",
        windowsHide: true,
      },
    );

    if (result.status !== 0) {
      const detail = [result.stdout, result.stderr]
        .filter(Boolean)
        .join("\n")
        .trim();
      failures.push(
        `GMF4 prerequisite failed: ${relativePath}${detail ? ` — ${detail}` : ""}`,
      );
    }
  }
}

function runtimeDependencyNames(packageJson) {
  return new Set([
    ...Object.keys(packageJson?.dependencies ?? {}),
    ...Object.keys(packageJson?.peerDependencies ?? {}),
    ...Object.keys(packageJson?.optionalDependencies ?? {}),
  ]);
}

export function verifyGmf4Closure({
  root = repositoryRoot,
  verifyDependencies = true,
} = {}) {
  const failures = [];

  for (const relativePath of requiredFiles) {
    if (!existsSync(path.join(root, relativePath))) {
      failures.push(`missing GMF4 evidence ${relativePath}`);
    }
  }
  if (failures.length > 0) return [...new Set(failures)].sort();

  if (verifyDependencies) verifyDependencyScripts(root, failures);

  const closure = readJson(root, "docs/metadata/gmf4-closure.json");
  const multiFramework = readJson(root, "docs/metadata/multi-framework.json");
  const rootPackage = readJson(root, "package.json");

  if (closure?.schemaVersion !== 1) {
    failures.push("GMF4 closure schemaVersion must be 1");
  }
  if (closure?.gate !== "GMF4" || closure?.status !== "evidence-complete") {
    failures.push("GMF4 closure must be evidence-complete");
  }
  if (closure?.sprint !== "S7") {
    failures.push("GMF4 closure sprint must be S7");
  }
  if (closure?.requiredCiGate !== "ci-gate") {
    failures.push("GMF4 must require ci-gate");
  }
  if (
    closure?.closureTask?.id !== "CF-7014" ||
    closure?.closureTask?.storyPoints !== 5 ||
    closure?.closureTask?.status !== "done"
  ) {
    failures.push("CF-7014 closure task must be done with 5 story points");
  }

  const tasks = new Map(
    (closure?.tasks ?? []).map((task) => [task.id, task.status]),
  );
  for (const taskId of taskIds) {
    if (tasks.get(taskId) !== "done") {
      failures.push(`${taskId} must be done in GMF4 closure metadata`);
    }
  }
  if (tasks.size !== taskIds.length) {
    failures.push(
      "GMF4 closure task inventory must contain exactly CF-7001 through CF-7014",
    );
  }

  if (
    closure?.sprintCompletion?.plannedStoryPoints !== 84 ||
    closure?.sprintCompletion?.completedStoryPoints !== 84 ||
    closure?.sprintCompletion?.status !== "complete"
  ) {
    failures.push("GMF4 must record S7 completion at 84/84 story points");
  }
  if (
    closure?.sprintCompletion?.nextSprint !== "S8" ||
    !closure?.sprintCompletion?.unlocks?.includes("BT-8001")
  ) {
    failures.push("GMF4 must advance to S8 and unlock BT-8001");
  }

  const consumers = new Set(closure?.supportModel?.supportedConsumers ?? []);
  for (const consumer of ["native-html", "react", "angular", "vue"]) {
    if (!consumers.has(consumer)) {
      failures.push(`GMF4 supported consumers must include ${consumer}`);
    }
  }
  if (consumers.size !== 4) {
    failures.push(
      "GMF4 supported consumer inventory must contain four consumers",
    );
  }

  const releasePackages = new Set(
    closure?.releaseGroup?.includedPackages ?? [],
  );
  for (const packageName of includedPackages) {
    if (!releasePackages.has(packageName)) {
      failures.push(`GMF4 release group must include ${packageName}`);
    }
  }
  if (releasePackages.has("@vyrnforge/ui-data-grid")) {
    failures.push("GMF4 non-grid release group must not include ui-data-grid");
  }
  if (
    !closure?.releaseGroup?.deferredPackages?.some(
      (entry) =>
        entry.name === "@vyrnforge/ui-data-grid" &&
        entry.status === "react-alpha-deferred",
    )
  ) {
    failures.push("GMF4 must explicitly defer the React alpha data grid");
  }

  if (
    !Array.isArray(closure?.unresolvedBlockers) ||
    closure.unresolvedBlockers.length !== 0
  ) {
    failures.push("GMF4 unresolvedBlockers must be an empty array");
  }

  for (const evidence of closure?.evidence ?? []) {
    if (!existsSync(path.join(root, evidence))) {
      failures.push(`GMF4 evidence is missing ${evidence}`);
    }
  }

  for (const command of [
    "npm run check",
    "npm run test",
    "npm run build",
    "npm run ci",
    "npm run test:gmf4-closure",
    "npm run verify:gmf4-closure",
  ]) {
    if (!(closure?.requiredCommands ?? []).includes(command)) {
      failures.push(`GMF4 closure is missing required command ${command}`);
    }
  }

  if (
    multiFramework?.program?.gate !== "GMF4" ||
    multiFramework?.program?.gateStatus !== "passed" ||
    multiFramework?.program?.status !== "gmf4-evidence-complete"
  ) {
    failures.push("multi-framework program must record passed GMF4 evidence");
  }
  if (multiFramework?.program?.currentSprint !== "S8") {
    failures.push("multi-framework currentSprint must advance to S8");
  }
  if (
    multiFramework?.gmf4Closure?.task !== "CF-7014" ||
    multiFramework?.gmf4Closure?.gateStatus !== "passed" ||
    multiFramework?.gmf4Closure?.metadata !== "docs/metadata/gmf4-closure.json"
  ) {
    failures.push(
      "multi-framework metadata must reference the passed GMF4 closure",
    );
  }

  const grid = (multiFramework?.packages ?? []).find(
    (entry) => entry.name === "@vyrnforge/ui-data-grid",
  );
  if (
    grid?.betaIncluded !== false ||
    !String(grid?.status ?? "").includes("deferred")
  ) {
    failures.push("multi-framework metadata must keep ui-data-grid deferred");
  }

  for (const relativePath of packagePaths) {
    const packageJson = readJson(root, relativePath);
    const dependencyNames = runtimeDependencyNames(packageJson);

    for (const dependency of forbiddenRuntimeDependencies) {
      if (dependencyNames.has(dependency)) {
        failures.push(
          `${relativePath} must not expose runtime dependency ${dependency}`,
        );
      }
    }
  }

  if (
    rootPackage?.scripts?.["test:gmf4-closure"] !==
      "node --test scripts/verify-gmf4-closure.test.mjs" ||
    rootPackage?.scripts?.["verify:gmf4-closure"] !==
      "node scripts/verify-gmf4-closure.mjs"
  ) {
    failures.push("root package scripts must expose GMF4 test and verifier");
  }

  for (const scriptName of ["check", "test", "build", "ci"]) {
    if (!rootPackage?.scripts?.[scriptName]) {
      failures.push(
        `root package scripts must expose canonical npm run ${scriptName}`,
      );
    }
  }

  for (const removedAlias of ["quality", "verify:ci"]) {
    if (rootPackage?.scripts?.[removedAlias]) {
      failures.push(
        `root package scripts must not restore removed alias ${removedAlias}`,
      );
    }
  }

  return [...new Set(failures)].sort();
}

export function assertGmf4Closure(options) {
  const failures = verifyGmf4Closure(options);
  if (failures.length > 0) {
    throw new Error(
      `GMF4 closure verification failed:\n- ${failures.join("\n- ")}`,
    );
  }
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  assertGmf4Closure();
  console.log(
    "GMF4 closure passed: CF-7001 through CF-7014, four packed web consumers, accessibility and migration evidence, package boundaries, and the explicit data-grid deferral are complete.",
  );
}
