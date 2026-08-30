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
  for (const marker of ["chromium, firefox, webkit", "VYRNFORGE_BROWSER"]) {
    if (!runtime.includes(marker)) {
      failures.push(`consumer runtime is missing browser selector ${marker}`);
    }
  }

  return failures.sort();
}
