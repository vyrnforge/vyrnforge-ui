import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const requiredThemes = ["light", "dark"];
const requiredDensities = ["compact", "standard", "comfortable"];
const allowedProperties = new Set([
  "background-color",
  "border-top-color",
  "border-top-left-radius",
  "color",
  "height",
  "min-height",
  "z-index",
]);

function read(root, relativePath) {
  return readFileSync(path.join(root, relativePath), "utf8").replaceAll(
    "\r\n",
    "\n",
  );
}

function readJson(root, relativePath) {
  return JSON.parse(read(root, relativePath));
}

export function loadVisualRegressionInputs(root = repositoryRoot) {
  return {
    root,
    matrix: readJson(root, "docs/metadata/visual-regression-matrix.json"),
    designTokens: readJson(root, "docs/metadata/design-tokens.json"),
    tokensCss: read(root, "packages/ui-core/src/styles/tokens.css"),
    fixtureRegistry: read(
      root,
      "apps/regression-fixtures/src/fixtureRegistry.ts",
    ),
    browserContract: read(root, "tests/browser/visual-regression.spec.ts"),
    gridTokensCss: read(
      root,
      "packages/ui-data-grid/src/styles/tokens/data-grid.tokens.css",
    ),
    browserWorkflow: read(root, ".github/workflows/_browser.yml"),
    packageJson: readJson(root, "package.json"),
  };
}

function equalStringArrays(left, right) {
  return (
    Array.isArray(left) &&
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  );
}

export function verifyVisualRegressionContract({
  root = repositoryRoot,
  matrix,
  designTokens,
  tokensCss,
  fixtureRegistry,
  browserContract,
  gridTokensCss,
  browserWorkflow,
  packageJson,
}) {
  const failures = [];

  if (matrix.schemaVersion !== 1) {
    failures.push("visual regression matrix schemaVersion must be 1");
  }
  if (matrix.task !== "VF-3011" || matrix.gate !== "G3") {
    failures.push("visual regression matrix must belong to VF-3011 and G3");
  }
  if (matrix.status !== "active") {
    failures.push("visual regression matrix status must be active");
  }
  if (
    matrix.runner?.comparison !== "computed-style-token-baseline" ||
    matrix.runner?.screenshotEvidence !== "artifact-per-case"
  ) {
    failures.push(
      "visual regression runner must combine computed-style token baselines with per-case screenshots",
    );
  }
  if (
    !equalStringArrays(matrix.dimensions?.themes, requiredThemes) ||
    !equalStringArrays(matrix.dimensions?.densities, requiredDensities)
  ) {
    failures.push(
      "visual regression dimensions must cover light/dark and compact/standard/comfortable",
    );
  }

  const canonicalTokens = new Set(
    designTokens.categories.flatMap((category) =>
      category.tokens.map((token) => token.name),
    ),
  );
  const declaredSharedTokens = new Set(
    [...tokensCss.matchAll(/(--vf-[a-z0-9-]+)\s*:/gu)].map((match) => match[1]),
  );
  const suiteIds = new Set();
  let calculatedCaseCount = 0;

  for (const suite of matrix.suites ?? []) {
    if (!suite.id || suiteIds.has(suite.id)) {
      failures.push(`visual suite ID must be unique: ${suite.id ?? "missing"}`);
    }
    suiteIds.add(suite.id);

    if (!fixtureRegistry.includes(`id: "${suite.fixtureId}"`)) {
      failures.push(
        `visual suite ${suite.id} references unknown fixture ${suite.fixtureId}`,
      );
    }
    if (!suite.tokenRootSelector || !suite.screenshotSelector) {
      failures.push(
        `visual suite ${suite.id} must declare token and screenshot roots`,
      );
    }
    if (!Array.isArray(suite.targets) || suite.targets.length === 0) {
      failures.push(`visual suite ${suite.id} must declare visual targets`);
      continue;
    }

    calculatedCaseCount += suite.themes.length * suite.densities.length;
    const targetIds = new Set();

    for (const target of suite.targets) {
      if (!target.id || targetIds.has(target.id)) {
        failures.push(
          `visual target ID must be unique inside ${suite.id}: ${target.id ?? "missing"}`,
        );
      }
      targetIds.add(target.id);

      if (!target.selector || !target.expectations?.length) {
        failures.push(
          `visual target ${suite.id}/${target.id} must declare selector expectations`,
        );
        continue;
      }

      for (const expectation of target.expectations) {
        if (!allowedProperties.has(expectation.property)) {
          failures.push(
            `${suite.id}/${target.id} uses unsupported visual property ${expectation.property}`,
          );
        }
        if (expectation.token.startsWith("--vf-")) {
          if (
            !canonicalTokens.has(expectation.token) &&
            !declaredSharedTokens.has(expectation.token)
          ) {
            failures.push(
              `${suite.id}/${target.id} references unknown shared token ${expectation.token}`,
            );
          }
        } else if (expectation.token.startsWith("--udg-")) {
          const escaped = expectation.token.replace(
            /[.*+?^${}()|[\]\\]/gu,
            "\\$&",
          );
          if (!new RegExp(`${escaped}\\s*:`, "u").test(gridTokensCss)) {
            failures.push(
              `${suite.id}/${target.id} references undefined grid token ${expectation.token}`,
            );
          }
        } else {
          failures.push(
            `${suite.id}/${target.id} token must use --vf-* or --udg-*`,
          );
        }
      }
    }
  }

  if (matrix.expectedCaseCount !== calculatedCaseCount) {
    failures.push(
      `expectedCaseCount ${matrix.expectedCaseCount} does not match ${calculatedCaseCount} expanded cases`,
    );
  }
  if (calculatedCaseCount < 14) {
    failures.push("visual regression matrix must include at least 14 cases");
  }
  for (const requiredSuite of [
    "shared-components",
    "data-grid",
    "dialog-overlay",
  ]) {
    if (!suiteIds.has(requiredSuite)) {
      failures.push(`visual regression matrix is missing ${requiredSuite}`);
    }
  }

  for (const requiredToken of [
    "visual-regression-matrix.json",
    "artifactDirectory",
    "screenshot",
    "observeTarget",
  ]) {
    if (!browserContract.includes(requiredToken)) {
      failures.push(`browser visual contract must reference ${requiredToken}`);
    }
  }

  if (
    packageJson.scripts?.["test:visual"] !==
      "playwright test tests/browser/visual-regression.spec.ts --project=chromium" ||
    packageJson.scripts?.["verify:visual-regression"] !==
      "node scripts/verify-visual-regression-contract.mjs"
  ) {
    failures.push(
      "package scripts must expose deterministic test:visual and verify:visual-regression commands",
    );
  }

  if (
    !browserWorkflow.includes("test-results/visual-evidence/") ||
    !browserWorkflow.includes("Upload visual regression evidence")
  ) {
    failures.push(
      "_browser.yml must upload successful visual-regression evidence",
    );
  }

  for (const evidencePath of Object.values(matrix.evidence ?? {})) {
    if (!existsSync(path.join(root, evidencePath))) {
      failures.push(
        `visual regression evidence path is missing: ${evidencePath}`,
      );
    }
  }

  return failures;
}

function run() {
  const failures = verifyVisualRegressionContract(loadVisualRegressionInputs());

  if (failures.length > 0) {
    console.error("Visual regression contract verification failed:");
    for (const failure of failures) {
      console.error(`  - ${failure}`);
    }
    process.exit(1);
  }

  console.log(
    "Visual regression contract passed: 14 computed-style baseline cases cover shared components, UniversalDataGrid, and Dialog across the required theme/density matrix with screenshot artifacts.",
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  run();
}
