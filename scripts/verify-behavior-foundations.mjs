import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const expectedTasks = Array.from(
  { length: 10 },
  (_, index) => `MF-${5001 + index}`,
);
const expectedReasons = [
  "user",
  "programmatic",
  "keyboard",
  "pointer",
  "selection",
  "collection-change",
  "clear",
  "reset",
  "restore",
];
const requiredSourceFiles = [
  "packages/ui-behaviors/src/controller.ts",
  "packages/ui-behaviors/src/events.ts",
  "packages/ui-behaviors/src/controllable-state.ts",
  "packages/ui-behaviors/src/collection.ts",
  "packages/ui-behaviors/src/selection.ts",
  "packages/ui-behaviors/src/action-toggle.ts",
  "packages/ui-behaviors/src/choice.ts",
  "packages/ui-behaviors/src/numeric.ts",
  "packages/ui-behaviors/src/toggle-group.ts",
  "packages/ui-behaviors/src/tabs.ts",
  "packages/ui-behaviors/src/autocomplete.ts",
  "packages/ui-behaviors/src/multi-select.ts",
  "packages/ui-behaviors/src/transfer-list.ts",
  "packages/ui-behaviors/src/index.ts",
];
const requiredDocuments = [
  "packages/ui-behaviors/README.md",
  "docs/api/ui-behaviors-api.md",
  "docs/packages/ui-behaviors.md",
  "docs/quality/s5-framework-neutral-behaviors.md",
  "docs/testing/behavior-foundation-contracts.md",
  "docs/testing/behavior-react-parity.md",
  "docs/metadata/behavior-foundations.json",
];

function read(root, relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!existsSync(absolutePath)) return null;
  return readFileSync(absolutePath, "utf8").replaceAll("\r\n", "\n");
}

function readJson(root, relativePath) {
  const content = read(root, relativePath);
  return content === null ? null : JSON.parse(content);
}

function sameMembers(actual, expected) {
  return (
    actual.size === expected.size &&
    [...expected].every((value) => actual.has(value))
  );
}

function requireIncludes(failures, content, relativePath, requiredValues) {
  if (content === null) {
    failures.push(`${relativePath} is missing`);
    return;
  }
  for (const value of requiredValues) {
    if (!content.includes(value)) {
      failures.push(`${relativePath} must include ${value}`);
    }
  }
}

export function verifyBehaviorFoundations({ root = repositoryRoot } = {}) {
  const failures = [];

  for (const relativePath of [...requiredSourceFiles, ...requiredDocuments]) {
    if (!existsSync(path.join(root, relativePath))) {
      failures.push(
        `missing required behavior foundation file ${relativePath}`,
      );
    }
  }

  const metadata = readJson(root, "docs/metadata/behavior-foundations.json");
  if (!metadata) return [...new Set(failures)].sort();

  if (metadata.schemaVersion !== 1) {
    failures.push("behavior foundation schemaVersion must be 1");
  }
  if (metadata.program?.sprint !== "S5") {
    failures.push("behavior foundation sprint must be S5");
  }
  if (metadata.program?.batch !== "MF-5001-MF-5010") {
    failures.push("behavior foundation batch must be MF-5001-MF-5010");
  }
  if (metadata.program?.status !== "implemented") {
    failures.push("behavior foundation status must be implemented");
  }
  if (metadata.program?.gate !== "GMF2") {
    failures.push("behavior foundation gate must be GMF2");
  }
  if (metadata.program?.gateStatus !== "in-progress") {
    failures.push("GMF2 must remain in-progress after the foundation batch");
  }

  const tasks = new Map((metadata.tasks ?? []).map((task) => [task.id, task]));
  for (const taskId of expectedTasks) {
    if (tasks.get(taskId)?.status !== "done") {
      failures.push(`${taskId} must be done`);
    }
  }
  if (tasks.size !== expectedTasks.length) {
    failures.push(
      `behavior foundation metadata must contain exactly ${expectedTasks.length} tasks`,
    );
  }

  const reasons = new Set(metadata.contracts?.events?.reasons ?? []);
  if (!sameMembers(reasons, new Set(expectedReasons))) {
    failures.push("behavior foundation reason vocabulary is invalid");
  }

  const expectedFactories = [
    ["controllableState", "createControllableState"],
    ["collection", "createCollectionController"],
    ["selection", "createSelectionController"],
    ["events", "createBehaviorEvent"],
    ["choice", "createChoiceController"],
    ["numeric", "createNumericValueController"],
    ["tabs", "createTabsController"],
    ["autocomplete", "createAutocompleteController"],
    ["multiSelect", "createMultiSelectController"],
    ["transferList", "createTransferListController"],
  ];
  for (const [contractName, factory] of expectedFactories) {
    if (metadata.contracts?.[contractName]?.factory !== factory) {
      failures.push(`${contractName} factory must be ${factory}`);
    }
  }

  const packageJson = readJson(root, "packages/ui-behaviors/package.json");
  if (packageJson?.name !== "@vyrnforge/ui-behaviors") {
    failures.push("ui-behaviors package name is invalid");
  }
  const runtimeDependencies = Object.keys(packageJson?.dependencies ?? {});
  if (
    !sameMembers(new Set(runtimeDependencies), new Set(["@vyrnforge/ui-core"]))
  ) {
    failures.push("ui-behaviors may depend on ui-core only");
  }

  const tsconfig = readJson(root, "packages/ui-behaviors/tsconfig.json");
  if (
    !sameMembers(
      new Set(tsconfig?.compilerOptions?.lib ?? []),
      new Set(["ES2020"]),
    )
  ) {
    failures.push("ui-behaviors TypeScript lib must remain ES2020 only");
  }

  const indexSource = read(root, "packages/ui-behaviors/src/index.ts");
  requireIncludes(failures, indexSource, "packages/ui-behaviors/src/index.ts", [
    "createControllableState",
    "createCollectionController",
    "createSelectionController",
    "createBehaviorEvent",
    "createBehaviorEventChannel",
    "createBehaviorSnapshotChannel",
    "resolveActionState",
    "createToggleController",
    "createToggleGroupController",
    "createChoiceController",
    "createNumericValueController",
    "normalizeNumericValue",
    "createTabsController",
    "createAutocompleteController",
    "createMultiSelectController",
    "createTransferListController",
  ]);

  const eventSource = read(root, "packages/ui-behaviors/src/events.ts");
  requireIncludes(
    failures,
    eventSource,
    "packages/ui-behaviors/src/events.ts",
    expectedReasons.map((reason) => `"${reason}"`),
  );

  const apiDoc = read(root, "docs/api/ui-behaviors-api.md");
  requireIncludes(failures, apiDoc, "docs/api/ui-behaviors-api.md", [
    "Controllable state",
    "Collection and active item",
    "Selection",
    "Canonical controller events",
    "Action and toggle controls",
    "Choice controls",
    "Numeric controls",
    "Tabs",
    "Autocomplete",
    "MultiSelect",
    "Transfer List",
  ]);

  const roadmap = read(root, "docs/roadmap/00-master-roadmap.md");
  requireIncludes(
    failures,
    roadmap,
    "docs/roadmap/00-master-roadmap.md",
    expectedTasks,
  );

  const componentPackage = readJson(
    root,
    "packages/ui-components/package.json",
  );
  if (
    componentPackage?.dependencies?.["@vyrnforge/ui-behaviors"] !==
    "0.1.0-alpha.1"
  ) {
    failures.push(
      "ui-components must declare the pinned ui-behaviors runtime dependency",
    );
  }

  const migratedComponents = [
    [
      "packages/ui-components/src/components/Button/Button.tsx",
      "resolveActionState",
    ],
    [
      "packages/ui-components/src/components/ToggleButton/ToggleButton.tsx",
      "useToggleBehavior",
    ],
    [
      "packages/ui-components/src/components/ToggleButtonGroup/ToggleButtonGroup.tsx",
      "useToggleGroupBehavior",
    ],
    [
      "packages/ui-components/src/components/SegmentedControl/SegmentedControl.tsx",
      "useChoiceBehavior",
    ],
    [
      "packages/ui-components/src/components/Checkbox/Checkbox.tsx",
      "resolveToggleInputState",
    ],
    [
      "packages/ui-components/src/components/Switch/Switch.tsx",
      "resolveToggleInputState",
    ],
    [
      "packages/ui-components/src/components/RadioGroup/RadioGroup.tsx",
      "useChoiceBehavior",
    ],
    [
      "packages/ui-components/src/components/Slider/Slider.tsx",
      "useNumericBehavior",
    ],
    [
      "packages/ui-components/src/components/Rating/Rating.tsx",
      "useNumericBehavior",
    ],
    ["packages/ui-components/src/components/Tabs/Tabs.tsx", "useTabsBehavior"],
    [
      "packages/ui-components/src/components/Autocomplete/useAutocomplete.ts",
      "createAutocompleteController",
    ],
    [
      "packages/ui-components/src/components/MultiSelect/MultiSelect.tsx",
      "useMultiSelectBehavior",
    ],
    [
      "packages/ui-components/src/components/TransferList/useTransferList.ts",
      "createTransferListController",
    ],
  ];
  for (const [relativePath, marker] of migratedComponents) {
    const source = read(root, relativePath);
    requireIncludes(failures, source, relativePath, [marker]);
  }

  const parityTest = read(
    root,
    "packages/ui-components/src/components/__tests__/behavior-parity.test.tsx",
  );
  requireIncludes(
    failures,
    parityTest,
    "packages/ui-components/src/components/__tests__/behavior-parity.test.tsx",
    [
      "React adapters preserve shared behavior parity",
      "Tabs",
      "RadioGroup",
      "Autocomplete",
      "MultiSelect",
      "TransferList",
    ],
  );

  const rootPackage = readJson(root, "package.json");
  const scripts = rootPackage?.scripts ?? {};
  if (
    scripts["verify:behavior-foundations"] !==
    "node scripts/verify-behavior-foundations.mjs"
  ) {
    failures.push("verify:behavior-foundations script is missing or invalid");
  }
  if (
    scripts["test:behavior-foundations"] !==
    "node --test scripts/verify-behavior-foundations.test.mjs"
  ) {
    failures.push("test:behavior-foundations script is missing or invalid");
  }
  for (const aggregate of ["verify:metadata", "verify:ci"]) {
    if (!scripts[aggregate]?.includes("behavior-foundations")) {
      failures.push(`${aggregate} must include behavior-foundations`);
    }
  }

  const requiredCommands = new Set(metadata.requiredCommands ?? []);
  for (const command of [
    "npm run test:behavior-foundations",
    "npm run verify:behavior-foundations",
    "npm run test:coverage --workspace @vyrnforge/ui-behaviors",
    "npm run test:coverage --workspace @vyrnforge/ui-components",
    "npm run typecheck --workspace @vyrnforge/ui-components",
    "npm run verify:package-boundaries",
    "npm run quality",
  ]) {
    if (!requiredCommands.has(command)) {
      failures.push(`behavior foundation metadata is missing ${command}`);
    }
  }

  if ((metadata.remainingGmf2Tasks ?? []).length === 0) {
    failures.push("remainingGmf2Tasks must document unfinished GMF2 work");
  }

  return [...new Set(failures)].sort();
}

export function assertBehaviorFoundations(options) {
  const failures = verifyBehaviorFoundations(options);
  if (failures.length > 0) {
    throw new Error(
      `Behavior foundation verification failed:\n- ${failures.join("\n- ")}`,
    );
  }
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  assertBehaviorFoundations();
  console.log(
    "Behavior foundations passed: MF-5001 through MF-5010 contracts, React adapters, metadata, docs, and quality integration are complete.",
  );
}
