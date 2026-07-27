import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const expectedTasks = Array.from(
  { length: 7 },
  (_, index) => `EL-${6005 + index}`,
);
const expectedTags = [
  "vf-text",
  "vf-heading",
  "vf-caption",
  "vf-label",
  "vf-code-text",
  "vf-badge",
  "vf-card",
  "vf-panel",
  "vf-stack",
  "vf-inline",
  "vf-page",
  "vf-section",
  "vf-empty-state",
  "vf-loading-state",
  "vf-error-state",
  "vf-button",
  "vf-icon-button",
  "vf-button-group",
  "vf-toolbar-button",
  "vf-text-input",
  "vf-textarea",
  "vf-search-input",
  "vf-number-input",
  "vf-date-input",
  "vf-datetime-input",
  "vf-checkbox",
  "vf-radio",
  "vf-radio-group",
  "vf-switch",
  "vf-select",
  "vf-slider",
  "vf-rating",
  "vf-toggle-button",
  "vf-toggle-button-group",
  "vf-segmented-control",
  "vf-field",
  "vf-validation-message",
  "vf-tabs",
  "vf-breadcrumbs",
  "vf-side-nav",
];

const requiredFiles = [
  "packages/ui-elements/src/components/dom.ts",
  "packages/ui-elements/src/components/display.ts",
  "packages/ui-elements/src/components/actions.ts",
  "packages/ui-elements/src/components/inputs.ts",
  "packages/ui-elements/src/components/selection.ts",
  "packages/ui-elements/src/components/values.ts",
  "packages/ui-elements/src/components/field.ts",
  "packages/ui-elements/src/components/navigation.ts",
  "packages/ui-elements/src/components/index.ts",
  "packages/ui-elements/src/styles/index.css",
  "apps/regression-fixtures/src/nativeCoreElements.tsx",
  "tests/browser/native-core-elements.spec.ts",
  "docs/metadata/native-core-elements.json",
  "docs/testing/native-core-element-contracts.md",
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

export function verifyNativeCoreElements({ root = repositoryRoot } = {}) {
  const failures = [];
  for (const file of requiredFiles) {
    if (!existsSync(path.join(root, file))) {
      failures.push(`missing native core element file ${file}`);
    }
  }

  const metadata = readJson(root, "docs/metadata/native-core-elements.json");
  if (!metadata) return [...new Set(failures)].sort();
  if (metadata.schemaVersion !== 1) {
    failures.push("native core element schemaVersion must be 1");
  }
  if (metadata.program?.batch !== "EL-6005-EL-6011") {
    failures.push("native core element batch must be EL-6005-EL-6011");
  }
  if (metadata.program?.gate !== "GMF3") {
    failures.push("native core element gate must be GMF3");
  }

  const tasks = new Map(
    (metadata.tasks ?? []).map((task) => [task.id, task.status]),
  );
  for (const taskId of expectedTasks) {
    if (tasks.get(taskId) !== "done") failures.push(`${taskId} must be done`);
  }
  if (tasks.size !== expectedTasks.length) {
    failures.push(
      "native core element task inventory must contain exactly EL-6005 through EL-6011",
    );
  }

  const tags = metadata.registration?.tags ?? [];
  if (metadata.registration?.count !== 40 || tags.length !== 40) {
    failures.push("native core element registration count must be 40");
  }
  if (JSON.stringify(tags) !== JSON.stringify(expectedTags)) {
    failures.push(
      "native core element tag catalog must match the canonical order",
    );
  }
  if (new Set(tags).size !== tags.length) {
    failures.push("native core element tags must be unique");
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
  requireIncludes(failures, registry, "packages/ui-elements/src/registry.ts", [
    "vyrnForgeElementDefinitions",
    "vyrnForgeElementRegistrations",
    ...expectedTags,
  ]);

  const actions = read(root, "packages/ui-elements/src/components/actions.ts");
  requireIncludes(
    failures,
    actions,
    "packages/ui-elements/src/components/actions.ts",
    [
      "resolveActionState",
      "createToggleController",
      'this.dispatchTypedEvent("vf-action"',
    ],
  );

  const selection = read(
    root,
    "packages/ui-elements/src/components/selection.ts",
  );
  requireIncludes(
    failures,
    selection,
    "packages/ui-elements/src/components/selection.ts",
    [
      "resolveToggleInputState",
      "VyrnForgeFormAssociatedElement",
      "vf-checked-change",
    ],
  );

  const values = read(root, "packages/ui-elements/src/components/values.ts");
  requireIncludes(
    failures,
    values,
    "packages/ui-elements/src/components/values.ts",
    [
      "createNumericValueController",
      "createToggleGroupController",
      "vf-value-change",
    ],
  );

  const navigation = read(
    root,
    "packages/ui-elements/src/components/navigation.ts",
  );
  requireIncludes(
    failures,
    navigation,
    "packages/ui-elements/src/components/navigation.ts",
    [
      "createTabsController",
      "createNavigationController",
      'setAttribute("role", "tablist")',
    ],
  );

  const styles = read(root, "packages/ui-elements/src/styles/index.css");
  requireIncludes(
    failures,
    styles,
    "packages/ui-elements/src/styles/index.css",
    ["./native-elements.css", "./forms/input.css", "./navigation/tabs.css"],
  );
  if (styles?.includes("@vyrnforge/ui-components")) {
    failures.push(
      "ui-elements styles must not import @vyrnforge/ui-components",
    );
  }

  const fixture = read(
    root,
    "apps/regression-fixtures/src/nativeCoreElements.tsx",
  );
  requireIncludes(
    failures,
    fixture,
    "apps/regression-fixtures/src/nativeCoreElements.tsx",
    [
      "registerVyrnForgeElements",
      "new FormData",
      "vf-segmented-control",
      "vf-side-nav",
    ],
  );
  const browser = read(root, "tests/browser/native-core-elements.spec.ts");
  requireIncludes(
    failures,
    browser,
    "tests/browser/native-core-elements.spec.ts",
    [
      "deterministic 40-element",
      "native-core-submission",
      "ArrowRight",
      "ArrowDown",
    ],
  );

  const packageRoot = read(root, "package.json");
  requireIncludes(failures, packageRoot, "package.json", [
    "test:native-core-elements",
    "verify:native-core-elements",
  ]);

  return [...new Set(failures)].sort();
}

export function assertNativeCoreElements(options) {
  const failures = verifyNativeCoreElements(options);
  if (failures.length) {
    throw new Error(
      `Native core element verification failed:\n- ${failures.join("\n- ")}`,
    );
  }
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  assertNativeCoreElements();
  console.log(
    "Native core elements passed: EL-6005 through EL-6011 and the 40-tag catalog are complete.",
  );
}
