import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildBetaScope } from "./generate-beta-scope.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const scopePath = "docs/metadata/non-grid-beta-scope.json";
const reportPath = "docs/quality/s8-non-grid-beta-scope-audit.md";

function read(root, relativePath) {
  return readFileSync(path.join(root, relativePath), "utf8");
}

function readJson(root, relativePath) {
  return JSON.parse(read(root, relativePath));
}

function nativeTagFromTarget(target) {
  return typeof target === "string" && target.startsWith("vf-")
    ? target.split("[")[0]
    : null;
}

export function verifyBetaScope({ root = repositoryRoot } = {}) {
  const failures = [];

  for (const relativePath of [scopePath, reportPath]) {
    if (!existsSync(path.join(root, relativePath))) {
      failures.push(`BT-8001 evidence is missing: ${relativePath}`);
    }
  }
  if (failures.length > 0) return failures.sort();

  const expected = buildBetaScope({ root });
  const actual = readJson(root, scopePath);
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    failures.push(
      "non-grid beta scope manifest is stale; run npm run generate:beta-scope",
    );
  }

  if (actual.program?.task?.id !== "BT-8001") {
    failures.push("beta scope manifest must identify BT-8001");
  }
  if (actual.program?.task?.status !== "done") {
    failures.push("BT-8001 scope task must be done");
  }
  if (actual.program?.status !== "scope-frozen") {
    failures.push("BT-8001 program status must be scope-frozen");
  }
  if (!actual.program?.unlocks?.includes("BT-8002")) {
    failures.push("BT-8001 must unlock BT-8002");
  }
  if (actual.program?.scopeOnly !== true) {
    failures.push("BT-8001 must remain a scope-only decision");
  }
  if (actual.program?.releaseStatus !== "not-release-ready") {
    failures.push("BT-8001 must not claim full beta release readiness");
  }

  const includedPackages = actual.releaseGroup?.includedPackages ?? [];
  for (const packageName of [
    "@vyrnforge/ui-core",
    "@vyrnforge/ui-behaviors",
    "@vyrnforge/ui-components",
    "@vyrnforge/ui-elements",
  ]) {
    if (!includedPackages.includes(packageName)) {
      failures.push(`beta scope release group is missing ${packageName}`);
    }
  }
  if (includedPackages.includes("@vyrnforge/ui-data-grid")) {
    failures.push("beta scope release group must not include ui-data-grid");
  }

  const components = actual.components ?? [];
  if (components.length !== actual.summary?.publicNonGridComponents) {
    failures.push(
      "beta scope component list must match publicNonGridComponents count",
    );
  }
  if (components.length !== actual.summary?.includedComponents) {
    failures.push("every public non-grid component must be included");
  }
  if (actual.summary?.deferredNonGridComponents !== 0) {
    failures.push(
      "BT-8001 must explicitly report zero deferred non-grid components",
    );
  }

  const customElements = readJson(
    root,
    "packages/ui-elements/custom-elements.json",
  );
  const nativeTags = new Set(
    (customElements.modules ?? [])
      .flatMap((module) => module.declarations ?? [])
      .filter((declaration) => declaration.customElement && declaration.tagName)
      .map((declaration) => declaration.tagName),
  );
  const ids = new Set();
  for (const component of components) {
    if (ids.has(component.id)) {
      failures.push(`${component.id}: duplicate beta scope component`);
    }
    ids.add(component.id);
    if (component.decision !== "included") {
      failures.push(
        `${component.id}: public non-grid component must be included`,
      );
    }
    if (component.package !== "@vyrnforge/ui-components") {
      failures.push(
        `${component.id}: beta component must come from ui-components`,
      );
    }
    if (component.react?.status !== "current") {
      failures.push(`${component.id}: React renderer must be current`);
    }
    if (component.native?.status !== "current") {
      failures.push(`${component.id}: native renderer must be current`);
    }
    if (component.angular?.status !== "verified-consumer") {
      failures.push(`${component.id}: Angular must be a verified consumer`);
    }
    if (component.vue?.status !== "verified-consumer") {
      failures.push(`${component.id}: Vue must be a verified consumer`);
    }
    const frameworkEvidence = {
      angular: "docs/metadata/angular-consumer.json",
      vue: "docs/metadata/vue-consumer.json",
    };
    for (const framework of ["angular", "vue"]) {
      if (component[framework]?.evidence !== frameworkEvidence[framework]) {
        failures.push(
          `${component.id}: ${framework} must reference current consumer evidence`,
        );
      }
    }
    const nativeTag = nativeTagFromTarget(component.native?.target);
    if (nativeTag && !nativeTags.has(nativeTag)) {
      failures.push(
        `${component.id}: native target ${nativeTag} is not in the Custom Elements Manifest`,
      );
    }
    const docsPath = component.documentation?.path;
    if (
      typeof docsPath !== "string" ||
      !existsSync(path.join(root, docsPath))
    ) {
      failures.push(`${component.id}: canonical documentation path is missing`);
    }
  }

  const gridExclusions = actual.exclusions?.publicGridComponents ?? [];
  if (gridExclusions.length !== actual.summary?.publicGridComponentsDeferred) {
    failures.push("public grid exclusion list is incomplete");
  }
  for (const component of gridExclusions) {
    if (
      component.package !== "@vyrnforge/ui-data-grid" ||
      component.decision !== "deferred"
    ) {
      failures.push(`${component.id}: grid public export must remain deferred`);
    }
  }

  if ((actual.scopeBlockers ?? []).length !== 0) {
    failures.push("BT-8001 scopeBlockers must be empty before scope freeze");
  }

  const report = read(root, reportPath);
  for (const marker of [
    "# S8 Non-Grid Beta Scope Audit",
    "67 public non-grid components",
    "58 native Custom Element tags",
    "No component maturity is promoted",
    "BT-8002",
    "Internationalization and RTL",
    "Responsive and reflow",
  ]) {
    if (!report.includes(marker)) {
      failures.push(`BT-8001 audit report is missing marker: ${marker}`);
    }
  }

  return failures.sort();
}

export function assertBetaScope(options) {
  const failures = verifyBetaScope(options);
  if (failures.length > 0) {
    throw new Error(
      `Non-grid beta scope verification failed:\n- ${failures.join("\n- ")}`,
    );
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  assertBetaScope();
  console.log(
    "BT-8001 passed: the 67-component non-grid beta scope is frozen, explicit exclusions are recorded, and BT-8002 is unlocked.",
  );
}
