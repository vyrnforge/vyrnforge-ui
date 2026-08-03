import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const expectedTasks = Array.from(
  { length: 16 },
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
  "packages/ui-behaviors/src/navigation.ts",
  "packages/ui-behaviors/src/overlay.ts",
  "packages/ui-behaviors/src/overlay-components.ts",
  "packages/ui-behaviors/src/toast.ts",
  "packages/ui-behaviors/src/confirm-dialog.ts",
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
  "docs/metadata/react-behavior-adoption.json",
  "docs/metadata/gmf2-closure.json",
  "docs/testing/react-behavior-adoption-audit.md",
  "docs/testing/gmf2-behavior-parity-gate.md",
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
  if (metadata.program?.batch !== "MF-5001-MF-5016") {
    failures.push("behavior foundation batch must be MF-5001-MF-5016");
  }
  if (metadata.program?.status !== "complete") {
    failures.push("behavior foundation status must be complete");
  }
  if (metadata.program?.gate !== "GMF2") {
    failures.push("behavior foundation gate must be GMF2");
  }
  if (metadata.program?.gateStatus !== "passed") {
    failures.push("GMF2 must be passed after the closure batch");
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
    ["navigation", "createNavigationController"],
    ["toast", "createToastController"],
    ["confirmDialog", "createConfirmDialogController"],
  ];
  for (const [contractName, factory] of expectedFactories) {
    if (metadata.contracts?.[contractName]?.factory !== factory) {
      failures.push(`${contractName} factory must be ${factory}`);
    }
  }
  if (
    metadata.contracts?.overlay?.lifecycleFactory !==
    "createOverlayLifecycleController"
  ) {
    failures.push(
      "overlay lifecycleFactory must be createOverlayLifecycleController",
    );
  }
  if (
    metadata.contracts?.overlay?.layerRegistryFactory !==
    "createOverlayLayerRegistry"
  ) {
    failures.push(
      "overlay layerRegistryFactory must be createOverlayLayerRegistry",
    );
  }
  if (
    metadata.contracts?.overlay?.positionResolver !== "resolveOverlayPosition"
  ) {
    failures.push("overlay positionResolver must be resolveOverlayPosition");
  }

  const overlayComponentFactories = new Set(
    metadata.contracts?.overlayComponents?.factories ?? [],
  );
  for (const factory of [
    "createDialogController",
    "createDrawerController",
    "createPopoverController",
    "createTooltipController",
  ]) {
    if (!overlayComponentFactories.has(factory)) {
      failures.push(`overlay component contracts must include ${factory}`);
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
    "createNavigationController",
    "createOverlayLifecycleController",
    "createOverlayLayerRegistry",
    "resolveOverlayPosition",
    "createDialogController",
    "createDrawerController",
    "createPopoverController",
    "createTooltipController",
    "createToastController",
    "createConfirmDialogController",
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
    "Navigation",
    "Overlay lifecycle",
    "Component overlay controllers",
    "Toast",
    "ConfirmDialog",
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
    "0.2.0-beta.1"
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
      "packages/ui-components/src/components/IconButton/IconButton.tsx",
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
    [
      "packages/ui-components/src/components/Menu/Menu.tsx",
      "useNavigationBehavior",
    ],
    [
      "packages/ui-components/src/components/SideNav/SideNav.tsx",
      "useNavigationBehavior",
    ],
    [
      "packages/ui-components/src/components/Popover/Popover.tsx",
      "usePopoverBehavior",
    ],
    [
      "packages/ui-components/src/components/Dialog/Dialog.tsx",
      "useDialogBehavior",
    ],
    [
      "packages/ui-components/src/components/Drawer/Drawer.tsx",
      "useDrawerBehavior",
    ],
    [
      "packages/ui-components/src/components/Tooltip/Tooltip.tsx",
      "useTooltipBehavior",
    ],
    [
      "packages/ui-components/src/components/Toast/ToastProvider.tsx",
      "useToastBehavior",
    ],
    [
      "packages/ui-components/src/components/ConfirmDialog/ConfirmDialog.tsx",
      "useConfirmDialogBehavior",
    ],
    [
      "packages/ui-components/src/internal/overlay/overlayStack.ts",
      "createOverlayLayerRegistry",
    ],
    [
      "packages/ui-components/src/internal/overlay/useAnchoredPosition.ts",
      "resolveOverlayPosition",
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
      "IconButton",
      "RadioGroup",
      "Autocomplete",
      "MultiSelect",
      "TransferList",
      "Menu",
      "SideNav",
      "Dialog",
    ],
  );

  const overlayFeedbackParityTest = read(
    root,
    "packages/ui-components/src/components/__tests__/overlay-feedback-parity.test.tsx",
  );
  requireIncludes(
    failures,
    overlayFeedbackParityTest,
    "packages/ui-components/src/components/__tests__/overlay-feedback-parity.test.tsx",
    [
      "React overlay and feedback adapters preserve shared behavior parity",
      "Dialog",
      "Drawer",
      "Popover",
      "Tooltip",
      "ToastProvider",
      "ConfirmDialog",
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
    "npm run test:react-behavior-adoption",
    "npm run verify:react-behavior-adoption",
    "npm run test:gmf2-closure",
    "npm run verify:gmf2-closure",
    "npm run quality",
  ]) {
    if (!requiredCommands.has(command)) {
      failures.push(`behavior foundation metadata is missing ${command}`);
    }
  }

  if ((metadata.remainingGmf2Tasks ?? []).length !== 0) {
    failures.push("remainingGmf2Tasks must be empty after GMF2 closure");
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
    "Behavior foundations passed: MF-5001 through MF-5016 contracts, React adoption, GMF2 closure metadata, docs, and quality integration are complete.",
  );
}
