import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
export const compatibilityMatrixPath =
  "docs/metadata/compatibility-release-matrix.json";
export const compatibilityDocumentationPath =
  "docs/testing/compatibility-release-matrix.md";
export const compatibilityReportDirectory =
  "test-results/compatibility-release-matrix";
export const compatibilityWorkflowPath = ".github/workflows/assurance.yml";
export const vueSupportEvidencePath = "docs/metadata/vue-support-evidence.json";

function read(root, relativePath) {
  return readFileSync(path.join(root, relativePath), "utf8");
}

export function readCompatibilityMatrix({ root = repositoryRoot } = {}) {
  return JSON.parse(read(root, compatibilityMatrixPath));
}

export function applyDependencyOverrides(packageJson, overrides = {}) {
  const next = structuredClone(packageJson);
  for (const group of [
    "dependencies",
    "devDependencies",
    "peerDependencies",
    "optionalDependencies",
  ]) {
    if (!overrides[group]) continue;
    next[group] = { ...(next[group] ?? {}), ...overrides[group] };
  }
  return next;
}

export function verifyCompatibilityMatrixContract({
  root = repositoryRoot,
} = {}) {
  const failures = [];
  for (const requiredFile of [
    compatibilityMatrixPath,
    compatibilityDocumentationPath,
    "scripts/run-compatibility-release-case.mjs",
    "scripts/verify-compatibility-release-matrix.test.mjs",
    compatibilityWorkflowPath,
    vueSupportEvidencePath,
  ]) {
    if (!existsSync(path.join(root, requiredFile))) {
      failures.push(`BT-8005 required file is missing: ${requiredFile}`);
    }
  }
  if (failures.length) return failures;

  const matrix = readCompatibilityMatrix({ root });
  if (matrix.task?.id !== "BT-8005" || matrix.task?.status !== "done") {
    failures.push("compatibility matrix must record BT-8005 as done");
  }
  if (
    JSON.stringify(matrix.task?.dependsOn) !==
    JSON.stringify(["CF-7014", "BT-8003"])
  ) {
    failures.push("BT-8005 must depend on CF-7014 and BT-8003");
  }
  if (
    JSON.stringify(matrix.task?.unlocksAfterMerge) !==
    JSON.stringify(["BT-8009", "BT-8010"])
  ) {
    failures.push("BT-8005 must unlock BT-8009 and BT-8010 after merge");
  }
  const cases = matrix.cases ?? [];
  const ids = cases.map(({ id }) => id);
  if (new Set(ids).size !== ids.length) {
    failures.push("compatibility matrix case IDs must be unique");
  }
  for (const fixture of ["native-html", "react", "angular", "vue"]) {
    if (!cases.some((testCase) => testCase.fixture === fixture)) {
      failures.push(`compatibility matrix is missing ${fixture}`);
    }
  }
  for (const browser of ["chromium", "firefox", "webkit"]) {
    if (
      !cases.some(
        (testCase) =>
          testCase.fixture === "native-html" && testCase.browser === browser,
      )
    ) {
      failures.push(`native HTML compatibility is missing ${browser}`);
    }
  }
  for (const version of matrix.supportPolicy?.node ?? []) {
    if (!cases.some((testCase) => testCase.node === version)) {
      failures.push(`compatibility matrix is missing Node ${version}`);
    }
  }
  for (const testCase of cases) {
    if (!/^[-a-z0-9]+$/u.test(testCase.id)) {
      failures.push(`${testCase.id}: case ID is not workflow-safe`);
    }
    if (!existsSync(path.join(root, `tests/consumers/${testCase.fixture}`))) {
      failures.push(`${testCase.id}: fixture ${testCase.fixture} is missing`);
    }
  }

  const vuePeer = JSON.parse(read(root, "packages/ui-vue/package.json"))
    .peerDependencies?.vue;
  if (vuePeer !== ">=3.5 <4") {
    failures.push("ui-vue peer policy must remain >=3.5 <4");
  }
  if (
    JSON.stringify(matrix.supportPolicy?.vue) !==
    JSON.stringify(["3.5.0", "3.5.40"])
  ) {
    failures.push(
      "Vue compatibility policy must cover supported minimum 3.5.0 and current 3.5.40",
    );
  }
  const vueCases = cases.filter((testCase) => testCase.fixture === "vue");
  if (
    JSON.stringify(vueCases.map((testCase) => testCase.id)) !==
    JSON.stringify([
      "vue35-min-node22-chromium",
      "vue35-current-node24-chromium",
    ])
  ) {
    failures.push("Vue compatibility cases must match the supported 3.5 policy");
  }
  if (
    vueCases.some(
      (testCase) =>
        testCase.browser !== "chromium" ||
        !["22.12.0", "24.18.0"].includes(testCase.node),
    )
  ) {
    failures.push("Vue compatibility cases must use supported Node/Chromium lanes");
  }

  const workflow = read(root, compatibilityWorkflowPath);
  for (const marker of [
    compatibilityMatrixPath,
    "compatibility-plan",
    "fromJSON(needs.compatibility-plan.outputs.matrix)",
    "fail-fast: false",
    "playwright install --with-deps",
    "verify:compatibility-release-case",
    "compatibility-release-matrix-${{ matrix.id }}",
  ]) {
    if (!workflow.includes(marker)) {
      failures.push(`${compatibilityWorkflowPath} is missing ${marker}`);
    }
  }

  if (matrix.verification?.workflow !== compatibilityWorkflowPath) {
    failures.push(
      `compatibility matrix verification workflow must be ${compatibilityWorkflowPath}`,
    );
  }

  const runtime = read(root, "scripts/verify-consumer-foundations-runtime.mjs");
  for (const marker of [
    "chromium, firefox, webkit",
    "VYRNFORGE_BROWSER",
    "verifySharedAccessibilityScenario",
    "keyboard-action-activation",
    "keyboard-tabs-navigation",
    "data-vue-model-programmatic",
    "Vue model state did not propagate back to native value and checked properties",
  ]) {
    if (!runtime.includes(marker)) {
      failures.push(`consumer runtime is missing Vue support evidence marker ${marker}`);
    }
  }

  const caseRunner = read(root, "scripts/run-compatibility-release-case.mjs");
  for (const marker of [
    'testCase.fixture === "vue"',
    'runtimeArguments.push("--accessibility-smoke")',
    "accessibilitySmoke",
  ]) {
    if (!caseRunner.includes(marker)) {
      failures.push(`compatibility case runner is missing ${marker}`);
    }
  }

  const evidence = JSON.parse(read(root, vueSupportEvidencePath));
  if (
    evidence.schemaVersion !== 1 ||
    evidence.sourceOfTruth?.canonical !== true ||
    evidence.sourceOfTruth?.task !== "MFD-1314"
  ) {
    failures.push("Vue support evidence must use canonical MFD-1314 schema version 1");
  }
  if (
    evidence.package !== "@vyrnforge/ui-vue" ||
    evidence.peerPolicy !== vuePeer
  ) {
    failures.push("Vue support evidence package/peer policy is stale");
  }
  if (JSON.stringify(evidence.compatibilityCases) !== JSON.stringify(vueCases.map(({ id }) => id))) {
    failures.push("Vue support evidence compatibility cases are stale");
  }
  if (evidence.manualAssistiveTechnology?.claimedComplete !== false) {
    failures.push("MFD-1314 must not claim unverified manual assistive-technology completion");
  }
  if (evidence.releaseIntegrationOwner !== "MFD-1315") {
    failures.push("Vue support evidence must reserve release integration for MFD-1315");
  }

  return failures.sort();
}
