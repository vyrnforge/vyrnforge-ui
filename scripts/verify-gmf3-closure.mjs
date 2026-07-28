import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { verifyRepositoryComponentMetadata } from "./verify-component-metadata.mjs";
import { verifyMultiFrameworkArchitecture } from "./verify-multi-framework-architecture.mjs";
import { verifyNativeAdvancedElements } from "./verify-native-advanced-elements.mjs";
import { verifyNativeCoreElements } from "./verify-native-core-elements.mjs";
import { verifyNativeElementFoundations } from "./verify-native-element-foundations.mjs";
import { verifyPackageBoundaries } from "./verify-package-boundaries.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const taskIds = Array.from({ length: 18 }, (_, index) => `EL-${6001 + index}`);
const completionTags = [
  "vf-icon",
  "vf-inline-message",
  "vf-skeleton",
  "vf-top-nav",
];
const expectedStrategyCounts = new Map([
  ["direct-element", 57],
  ["renderer-mapping", 8],
  ["renderer-composition", 1],
  ["renderer-service", 1],
]);
const requiredFiles = [
  "docs/metadata/gmf3-closure.json",
  "docs/testing/gmf3-native-parity-gate.md",
  "packages/ui-elements/src/components/parity.ts",
  "packages/ui-elements/src/styles/actions/icon.css",
  "packages/ui-elements/src/styles/feedback/alert.css",
  "packages/ui-elements/src/styles/feedback/skeleton.css",
  "packages/ui-elements/src/styles/navigation/top-nav.css",
  "packages/ui-elements/src/styles/overlays/dropdown.css",
  "apps/regression-fixtures/src/nativeParityElements.tsx",
  "tests/browser/native-parity.spec.ts",
  "tests/consumers/native-html/index.html",
  "tests/consumers/native-html/architecture-probe.ts",
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

function requireIncludes(failures, content, relativePath, values) {
  if (content === null) {
    failures.push(`${relativePath} is missing`);
    return;
  }
  for (const value of values) {
    if (!content.includes(value)) {
      failures.push(`${relativePath} must include ${value}`);
    }
  }
}

export function verifyGmf3Closure({ root = repositoryRoot } = {}) {
  const failures = [
    ...verifyRepositoryComponentMetadata({ root }),
    ...verifyMultiFrameworkArchitecture({ root }),
    ...verifyNativeElementFoundations({ root }),
    ...verifyNativeCoreElements({ root }),
    ...verifyNativeAdvancedElements({ root }),
    ...verifyPackageBoundaries({ root }),
  ];

  for (const relativePath of requiredFiles) {
    if (!existsSync(path.join(root, relativePath))) {
      failures.push(`missing GMF3 evidence ${relativePath}`);
    }
  }

  const closure = readJson(root, "docs/metadata/gmf3-closure.json");
  if (!closure) return [...new Set(failures)].sort();

  if (closure.schemaVersion !== 1) {
    failures.push("GMF3 closure schemaVersion must be 1");
  }
  if (closure.gate !== "GMF3" || closure.status !== "evidence-complete") {
    failures.push("GMF3 closure must be evidence-complete");
  }
  if (closure.sprint !== "S6") {
    failures.push("GMF3 closure sprint must be S6");
  }
  if (closure.requiredCiGate !== "ci-gate") {
    failures.push("GMF3 must require ci-gate");
  }

  const tasks = new Map(
    (closure.tasks ?? []).map((task) => [task.id, task.status]),
  );
  for (const taskId of taskIds) {
    if (tasks.get(taskId) !== "done") {
      failures.push(`${taskId} must be done in GMF3 closure metadata`);
    }
  }
  if (tasks.size !== taskIds.length) {
    failures.push(
      "GMF3 closure task inventory must contain exactly EL-6001 through EL-6018",
    );
  }

  if (closure.packageFoundation?.registeredPublicTags !== 58) {
    failures.push("GMF3 package foundation must record 58 public tags");
  }
  if (closure.catalogCoverage?.publicReactRecords !== 67) {
    failures.push("GMF3 catalog coverage must record 67 public React records");
  }
  if (closure.catalogCoverage?.nativeRegisteredTags !== 58) {
    failures.push("GMF3 catalog coverage must record 58 native tags");
  }

  for (const [strategy, expectedCount] of expectedStrategyCounts) {
    if (closure.catalogCoverage?.strategies?.[strategy] !== expectedCount) {
      failures.push(
        `GMF3 catalog strategy ${strategy} must contain ${expectedCount} records`,
      );
    }
  }

  const metadata = readJson(root, "docs/metadata/components.json");
  const publicRecords = (metadata?.components ?? []).filter(
    (component) =>
      component.package === "@vyrnforge/ui-components" &&
      component.publicExport === true,
  );
  if (publicRecords.length !== 67) {
    failures.push("public non-grid component metadata must contain 67 records");
  }

  const actualStrategyCounts = new Map();
  for (const component of publicRecords) {
    const native = component.frameworkParity?.native;
    if (native?.status !== "current") {
      failures.push(`${component.id} native parity status must be current`);
      continue;
    }
    if (native.evidence !== "docs/metadata/gmf3-closure.json") {
      failures.push(`${component.id} must reference GMF3 closure evidence`);
    }
    actualStrategyCounts.set(
      native.strategy,
      (actualStrategyCounts.get(native.strategy) ?? 0) + 1,
    );
  }
  for (const [strategy, expectedCount] of expectedStrategyCounts) {
    if (actualStrategyCounts.get(strategy) !== expectedCount) {
      failures.push(
        `component metadata strategy ${strategy} must contain ${expectedCount} records`,
      );
    }
  }

  const registry = read(root, "packages/ui-elements/src/registry.ts");
  requireIncludes(
    failures,
    registry,
    "packages/ui-elements/src/registry.ts",
    completionTags,
  );
  const registryTags = [
    ...(registry?.matchAll(/tagName:\s*"(vf-[a-z0-9-]+)"/g) ?? []),
  ].map((match) => match[1]);
  if (registryTags.length !== 58 || new Set(registryTags).size !== 58) {
    failures.push("ui-elements registry must contain 58 unique vf-* tags");
  }

  const paritySource = read(
    root,
    "packages/ui-elements/src/components/parity.ts",
  );
  requireIncludes(
    failures,
    paritySource,
    "packages/ui-elements/src/components/parity.ts",
    [
      "VyrnForgeIconElement",
      "VyrnForgeInlineMessageElement",
      "VyrnForgeSkeletonElement",
      "VyrnForgeTopNavElement",
    ],
  );
  if (paritySource?.includes("@vyrnforge/ui-components")) {
    failures.push("native parity elements must not import ui-components");
  }

  const styles = read(root, "packages/ui-elements/src/styles/index.css");
  requireIncludes(
    failures,
    styles,
    "packages/ui-elements/src/styles/index.css",
    [
      "./actions/icon.css",
      "./feedback/skeleton.css",
      "./navigation/top-nav.css",
      "./overlays/dropdown.css",
    ],
  );
  for (const [relativePath, marker] of [
    [
      "packages/ui-elements/src/styles/feedback/alert.css",
      "vf-inline-message.vf-inline-message",
    ],
    [
      "packages/ui-elements/src/styles/overlays/dropdown.css",
      "vf-popover .vf-dropdown",
    ],
  ]) {
    requireIncludes(failures, read(root, relativePath), relativePath, [marker]);
  }

  const fixture = read(
    root,
    "apps/regression-fixtures/src/nativeParityElements.tsx",
  );
  requireIncludes(
    failures,
    fixture,
    "apps/regression-fixtures/src/nativeParityElements.tsx",
    [
      "vf-icon",
      "vf-inline-message",
      "vf-skeleton",
      "vf-top-nav",
      "viewport.add",
      "viewport.updateToast",
      "viewport.dismiss",
    ],
  );
  const browser = read(root, "tests/browser/native-parity.spec.ts");
  requireIncludes(failures, browser, "tests/browser/native-parity.spec.ts", [
    "deterministic 58-tag catalog",
    "renderer composition",
    "native toast service mappings",
    "shared theme and density tokens",
  ]);

  const nativeHtml = read(root, "tests/consumers/native-html/index.html");
  requireIncludes(
    failures,
    nativeHtml,
    "tests/consumers/native-html/index.html",
    [
      "@vyrnforge/ui-core/styles/index.css",
      "@vyrnforge/ui-elements/styles/index.css",
      "@vyrnforge/ui-elements/register",
      "<vf-top-nav",
      "<vf-inline-message",
    ],
  );
  const nativeProbe = read(
    root,
    "tests/consumers/native-html/architecture-probe.ts",
  );
  requireIncludes(
    failures,
    nativeProbe,
    "tests/consumers/native-html/architecture-probe.ts",
    ["vyrnForgeElementDefinitions", "registeredNativeTagCount", "58"],
  );

  for (const evidence of closure.evidence ?? []) {
    if (!existsSync(path.join(root, evidence))) {
      failures.push(`GMF3 evidence is missing ${evidence}`);
    }
  }
  if (
    !Array.isArray(closure.unresolvedBlockers) ||
    closure.unresolvedBlockers.length !== 0
  ) {
    failures.push("GMF3 unresolvedBlockers must be an empty array");
  }

  const foundation = readJson(
    root,
    "docs/metadata/native-element-foundations.json",
  );
  if (
    foundation?.program?.gateStatus !== "passed" ||
    foundation?.nativeParityClosure?.registeredPublicTags !== 58
  ) {
    failures.push("native element foundation GMF3 closure must be passed");
  }
  if ((foundation?.remainingGmf3Tasks ?? []).length !== 0) {
    failures.push("native element foundation remainingGmf3Tasks must be empty");
  }

  const multiFramework = readJson(root, "docs/metadata/multi-framework.json");
  if (multiFramework?.program?.currentSprint !== "S7") {
    failures.push("multi-framework currentSprint must advance to S7");
  }
  if (multiFramework?.nativeElementFoundation?.gateStatus !== "passed") {
    failures.push("multi-framework nativeElementFoundation must pass GMF3");
  }

  for (const command of [
    "npm run verify:ci",
    "npm run verify:metadata",
    "npm run test:browser",
    "npm run quality",
  ]) {
    if (!(closure.requiredCommands ?? []).includes(command)) {
      failures.push(`GMF3 closure is missing required command ${command}`);
    }
  }

  return [...new Set(failures)].sort();
}

export function assertGmf3Closure(options) {
  const failures = verifyGmf3Closure(options);
  if (failures.length > 0) {
    throw new Error(
      `GMF3 closure verification failed:\n- ${failures.join("\n- ")}`,
    );
  }
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  assertGmf3Closure();
  console.log(
    "GMF3 closure passed: EL-6001 through EL-6018, the 58-tag native catalog, renderer mappings, forms, browser evidence, and package boundaries are complete.",
  );
}
