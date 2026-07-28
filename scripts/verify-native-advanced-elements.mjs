import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const expectedTasks = [
  "EL-6012",
  "EL-6013",
  "EL-6014",
  "EL-6015",
  "EL-6016",
  "EL-6017",
];
const expectedTags = [
  "vf-autocomplete",
  "vf-multi-select",
  "vf-transfer-list",
  "vf-dialog",
  "vf-drawer",
  "vf-popover",
  "vf-menu",
  "vf-tooltip",
  "vf-toast",
  "vf-toast-viewport",
  "vf-confirm-dialog",
  "vf-app-shell",
  "vf-page-header",
  "vf-page-toolbar",
];
const requiredFiles = [
  "packages/ui-elements/src/components/collections.ts",
  "packages/ui-elements/src/components/overlays.ts",
  "packages/ui-elements/src/components/feedback.ts",
  "packages/ui-elements/src/components/composition.ts",
  "apps/regression-fixtures/src/nativeAdvancedElements.tsx",
  "tests/browser/native-advanced-elements.spec.ts",
  "docs/metadata/native-advanced-elements.json",
  "docs/testing/native-advanced-element-contracts.md",
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

export function verifyNativeAdvancedElements({ root = repositoryRoot } = {}) {
  const failures = [];
  for (const file of requiredFiles) {
    if (!existsSync(path.join(root, file))) {
      failures.push(`missing native advanced element file ${file}`);
    }
  }

  const metadata = readJson(
    root,
    "docs/metadata/native-advanced-elements.json",
  );
  if (!metadata) return [...new Set(failures)].sort();
  if (metadata.schemaVersion !== 1) {
    failures.push("native advanced element schemaVersion must be 1");
  }
  if (metadata.program?.batch !== "EL-6012-EL-6017") {
    failures.push("native advanced element batch must be EL-6012-EL-6017");
  }
  if (metadata.program?.gate !== "GMF3") {
    failures.push("native advanced element gate must be GMF3");
  }

  const tasks = new Map(
    (metadata.tasks ?? []).map((task) => [task.id, task.status]),
  );
  for (const taskId of expectedTasks) {
    if (tasks.get(taskId) !== "done") failures.push(`${taskId} must be done`);
  }
  if (tasks.size !== expectedTasks.length) {
    failures.push(
      "native advanced task inventory must contain exactly EL-6012 through EL-6017",
    );
  }

  const tags = metadata.registration?.addedTags ?? [];
  if (
    metadata.registration?.previousCount !== 40 ||
    metadata.registration?.addedCount !== 14 ||
    metadata.registration?.totalCount !== 54 ||
    tags.length !== 14
  ) {
    failures.push("native advanced registration counts must be 40 + 14 = 54");
  }
  if (JSON.stringify(tags) !== JSON.stringify(expectedTags)) {
    failures.push("native advanced tag catalog must match the canonical order");
  }

  const packageJson = readJson(root, "packages/ui-elements/package.json");
  const dependencies = Object.keys(packageJson?.dependencies ?? {}).sort();
  if (
    JSON.stringify(dependencies) !==
    JSON.stringify(["@vyrnforge/ui-behaviors", "@vyrnforge/ui-core"])
  ) {
    failures.push(
      "ui-elements runtime dependencies must remain ui-core and ui-behaviors only",
    );
  }

  const registry = read(root, "packages/ui-elements/src/registry.ts");
  requireIncludes(
    failures,
    registry,
    "packages/ui-elements/src/registry.ts",
    expectedTags,
  );
  const collection = read(
    root,
    "packages/ui-elements/src/components/collections.ts",
  );
  requireIncludes(
    failures,
    collection,
    "packages/ui-elements/src/components/collections.ts",
    [
      "createAutocompleteController",
      "createMultiSelectController",
      "createTransferListController",
      "VyrnForgeFormAssociatedElement",
    ],
  );
  const overlays = read(
    root,
    "packages/ui-elements/src/components/overlays.ts",
  );
  requireIncludes(
    failures,
    overlays,
    "packages/ui-elements/src/components/overlays.ts",
    [
      "createDialogController",
      "createPopoverController",
      "createNavigationController",
      "createTooltipController",
    ],
  );
  const feedback = read(
    root,
    "packages/ui-elements/src/components/feedback.ts",
  );
  requireIncludes(
    failures,
    feedback,
    "packages/ui-elements/src/components/feedback.ts",
    ["createToastController", "createConfirmDialogController"],
  );

  const fixture = read(
    root,
    "apps/regression-fixtures/src/nativeAdvancedElements.tsx",
  );
  requireIncludes(
    failures,
    fixture,
    "apps/regression-fixtures/src/nativeAdvancedElements.tsx",
    ["registerVyrnForgeElements", "new FormData", "vf-toast-viewport"],
  );
  const browser = read(root, "tests/browser/native-advanced-elements.spec.ts");
  requireIncludes(
    failures,
    browser,
    "tests/browser/native-advanced-elements.spec.ts",
    ["deterministic 54-element", "native-advanced-submission", "Escape"],
  );
  const packageRoot = read(root, "package.json");
  requireIncludes(failures, packageRoot, "package.json", [
    "test:native-advanced-elements",
    "verify:native-advanced-elements",
  ]);

  for (const sourcePath of [
    "packages/ui-elements/src/components/collections.ts",
    "packages/ui-elements/src/components/overlays.ts",
    "packages/ui-elements/src/components/feedback.ts",
    "packages/ui-elements/src/components/composition.ts",
  ]) {
    const source = read(root, sourcePath);
    if (source?.includes("@vyrnforge/ui-components")) {
      failures.push(`${sourcePath} must not import @vyrnforge/ui-components`);
    }
  }

  return [...new Set(failures)].sort();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const failures = verifyNativeAdvancedElements();
  if (failures.length > 0) {
    console.error(failures.join("\n"));
    process.exitCode = 1;
  } else {
    console.log("Native advanced element evidence is internally complete.");
  }
}
