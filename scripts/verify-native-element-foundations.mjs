import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const taskIds = Array.from({ length: 18 }, (_, index) => `EL-${6001 + index}`);
const completedTaskIds = new Set(
  Array.from({ length: 11 }, (_, index) => `EL-${6001 + index}`),
);
const requiredFiles = [
  "packages/ui-elements/src/base/VyrnForgeElement.ts",
  "packages/ui-elements/src/base/VyrnForgeElement.test.ts",
  "packages/ui-elements/src/base/VyrnForgeFormAssociatedElement.ts",
  "packages/ui-elements/src/base/VyrnForgeFormAssociatedElement.test.ts",
  "packages/ui-elements/src/events.ts",
  "packages/ui-elements/src/events.test.ts",
  "packages/ui-elements/src/registry.ts",
  "packages/ui-elements/src/registry.test.ts",
  "packages/ui-elements/src/register.ts",
  "packages/ui-elements/src/index.ts",
  "apps/regression-fixtures/src/nativeFormFoundation.ts",
  "apps/regression-fixtures/src/nativeCoreElements.tsx",
  "apps/regression-fixtures/src/FixtureApp.tsx",
  "tests/browser/native-form-foundation.spec.ts",
  "tests/browser/native-core-elements.spec.ts",
  "docs/metadata/native-core-elements.json",
  "docs/testing/native-core-element-contracts.md",
  "tests/consumers/native-html/architecture-probe.ts",
  "tests/consumers/native-html/fixture.json",
  "packages/ui-elements/README.md",
  "docs/api/ui-elements-api.md",
  "docs/packages/ui-elements.md",
  "docs/architecture/10-custom-elements-and-form-association.md",
  "docs/testing/native-element-foundation-contracts.md",
  "docs/metadata/native-element-foundations.json",
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

export function verifyNativeElementFoundations({ root = repositoryRoot } = {}) {
  const failures = [];

  for (const relativePath of requiredFiles) {
    if (!existsSync(path.join(root, relativePath))) {
      failures.push(`missing native element foundation file ${relativePath}`);
    }
  }

  const metadata = readJson(
    root,
    "docs/metadata/native-element-foundations.json",
  );
  if (!metadata) return [...new Set(failures)].sort();

  if (metadata.schemaVersion !== 1) {
    failures.push("native element foundation schemaVersion must be 1");
  }
  if (metadata.program?.sprint !== "S6") {
    failures.push("native element foundation sprint must be S6");
  }
  if (metadata.program?.batch !== "EL-6005-EL-6011") {
    failures.push("native element foundation batch must be EL-6005-EL-6011");
  }
  if (metadata.program?.status !== "in-progress") {
    failures.push("native element foundation status must be in-progress");
  }
  if (metadata.program?.gate !== "GMF3") {
    failures.push("native element foundation gate must be GMF3");
  }

  const tasks = new Map(
    (metadata.tasks ?? []).map((task) => [task.id, task.status]),
  );
  for (const taskId of taskIds) {
    const expected = completedTaskIds.has(taskId) ? "done" : "planned";
    if (tasks.get(taskId) !== expected) {
      failures.push(`${taskId} must be ${expected}`);
    }
  }
  if (tasks.size !== taskIds.length) {
    failures.push(
      "native element foundation task inventory must contain exactly EL-6001 through EL-6018",
    );
  }

  const registration = metadata.registration ?? {};
  for (const [field, expected] of [
    ["registerAll", "registerVyrnForgeElements"],
    ["registerDefinitions", "registerVyrnForgeElementDefinitions"],
    ["registerOne", "registerVyrnForgeElement"],
    ["registrationFactory", "createVyrnForgeElementRegistration"],
    ["definitionCatalog", "vyrnForgeElementDefinitions"],
  ]) {
    if (registration[field] !== expected) {
      failures.push(`registration ${field} must be ${expected}`);
    }
  }
  if (registration.tagPrefix !== "vf-") {
    failures.push("native element tagPrefix must be vf-");
  }
  if (registration.duplicatePolicy !== "idempotent-no-op") {
    failures.push("native element duplicatePolicy must be idempotent-no-op");
  }

  const baseElement = metadata.baseElement ?? {};
  if (baseElement.class !== "VyrnForgeElement") {
    failures.push("native base element class must be VyrnForgeElement");
  }
  if (baseElement.domMode !== "light-dom") {
    failures.push("native base element domMode must be light-dom");
  }
  for (const feature of [
    "pre-definition-upgrade",
    "primitive-attribute-parsing",
    "optional-property-reflection",
    "property-only-object-values",
  ]) {
    if (!(baseElement.propertyFeatures ?? []).includes(feature)) {
      failures.push(`native base element must include ${feature}`);
    }
  }
  for (const feature of [
    "microtask-batching",
    "changed-property-map",
    "disconnect-deferral",
    "updateComplete",
  ]) {
    if (!(baseElement.updateFeatures ?? []).includes(feature)) {
      failures.push(`native update foundation must include ${feature}`);
    }
  }

  const eventMetadata = metadata.events ?? {};
  if (eventMetadata.namePattern !== "vf-*") {
    failures.push("native event namePattern must be vf-*");
  }
  if (eventMetadata.dispatcherFactory !== "createVyrnForgeEventDispatcher") {
    failures.push(
      "native event dispatcherFactory must be createVyrnForgeEventDispatcher",
    );
  }
  if (eventMetadata.defaults?.bubbles !== true) {
    failures.push("native events must bubble by default");
  }
  if (eventMetadata.defaults?.composed !== true) {
    failures.push("native events must be composed by default");
  }
  for (const name of [
    "vf-value-change",
    "vf-open-change",
    "vf-selection-change",
    "vf-invalid",
    "vf-reset",
  ]) {
    if (!(eventMetadata.canonicalNames ?? []).includes(name)) {
      failures.push(`native canonical event names must include ${name}`);
    }
  }

  const formMetadata = metadata.formAssociation ?? {};
  if (formMetadata.class !== "VyrnForgeFormAssociatedElement") {
    failures.push(
      "native form association class must be VyrnForgeFormAssociatedElement",
    );
  }
  if (formMetadata.implementation !== "ElementInternals") {
    failures.push("native form association must use ElementInternals");
  }
  if (formMetadata.formAssociated !== true) {
    failures.push("native form base must declare formAssociated true");
  }
  for (const callback of [
    "formAssociatedCallback",
    "formDisabledCallback",
    "formResetCallback",
    "formStateRestoreCallback",
  ]) {
    if (!(formMetadata.callbacks ?? []).includes(callback)) {
      failures.push(`native form callbacks must include ${callback}`);
    }
  }
  if (
    formMetadata.browserEvidence !==
    "tests/browser/native-form-foundation.spec.ts"
  ) {
    failures.push("native form association must record real browser evidence");
  }

  const packageJson = readJson(root, "packages/ui-elements/package.json");
  if (packageJson?.name !== "@vyrnforge/ui-elements") {
    failures.push("ui-elements package name is invalid");
  }
  const dependencies = Object.keys(packageJson?.dependencies ?? {}).sort();
  if (
    JSON.stringify(dependencies) !==
    JSON.stringify(["@vyrnforge/ui-behaviors", "@vyrnforge/ui-core"])
  ) {
    failures.push(
      "ui-elements runtime dependencies must remain ui-core and ui-behaviors only",
    );
  }

  const baseSource = read(
    root,
    "packages/ui-elements/src/base/VyrnForgeElement.ts",
  );
  requireIncludes(
    failures,
    baseSource,
    "packages/ui-elements/src/base/VyrnForgeElement.ts",
    [
      "static get observedAttributes",
      "connectedCallback",
      "disconnectedCallback",
      "attributeChangedCallback",
      "get updateComplete",
      "setPropertyValue",
      "requestUpdate",
      "queueMicrotask",
    ],
  );

  const eventSource = read(root, "packages/ui-elements/src/events.ts");
  requireIncludes(failures, eventSource, "packages/ui-elements/src/events.ts", [
    "assertVyrnForgeEventName",
    "createVyrnForgeEventDispatcher",
    "vyrnForgeEventDispatcher",
    "bubbles: options.bubbles ?? true",
    "composed: options.composed ?? true",
    "VyrnForgeCanonicalEventDetailMap",
  ]);

  const formSource = read(
    root,
    "packages/ui-elements/src/base/VyrnForgeFormAssociatedElement.ts",
  );
  requireIncludes(
    failures,
    formSource,
    "packages/ui-elements/src/base/VyrnForgeFormAssociatedElement.ts",
    [
      "static readonly formAssociated = true",
      "ElementInternals",
      "setFormValue",
      "setValidity",
      "formAssociatedCallback",
      "formDisabledCallback",
      "formResetCallback",
      "formStateRestoreCallback",
      'this.dispatchFormEvent("vf-reset"',
      'this.dispatchFormEvent("vf-invalid"',
    ],
  );

  const registrySource = read(root, "packages/ui-elements/src/registry.ts");
  requireIncludes(
    failures,
    registrySource,
    "packages/ui-elements/src/registry.ts",
    [
      "assertVyrnForgeElementTagName",
      "createVyrnForgeElementRegistration",
      "registerVyrnForgeElement",
      "registerVyrnForgeElementDefinitions",
      "registerVyrnForgeElements",
      "vyrnForgeElementDefinitions",
    ],
  );

  const indexSource = read(root, "packages/ui-elements/src/index.ts");
  requireIncludes(failures, indexSource, "packages/ui-elements/src/index.ts", [
    "VyrnForgeFormAssociatedElement",
    "VyrnForgeCanonicalEventDetailMap",
    "createVyrnForgeEventDispatcher",
    "VyrnForgePropertyDeclaration",
    "VyrnForgeElementDefinition",
    "createVyrnForgeElementRegistration",
  ]);

  const nativeProbe = read(
    root,
    "tests/consumers/native-html/architecture-probe.ts",
  );
  requireIncludes(
    failures,
    nativeProbe,
    "tests/consumers/native-html/architecture-probe.ts",
    [
      "createVyrnForgeElementRegistration",
      "VyrnForgePropertyDeclarations",
      "protected override connected",
      "protected override update",
    ],
  );

  const fixtureSource = read(
    root,
    "apps/regression-fixtures/src/FixtureApp.tsx",
  );
  requireIncludes(
    failures,
    fixtureSource,
    "apps/regression-fixtures/src/FixtureApp.tsx",
    ["new FormData", "registerNativeFormProbeElement"],
  );

  const browserEvidence = read(
    root,
    "tests/browser/native-form-foundation.spec.ts",
  );
  requireIncludes(
    failures,
    browserEvidence,
    "tests/browser/native-form-foundation.spec.ts",
    ["reportValidity", "native-toggle-disabled", "native-reset"],
  );

  const coreMetadata = readJson(
    root,
    "docs/metadata/native-core-elements.json",
  );
  if (coreMetadata?.program?.batch !== "EL-6005-EL-6011") {
    failures.push("native core element batch must be EL-6005-EL-6011");
  }
  if (coreMetadata?.registration?.count !== 40) {
    failures.push("native core element registration count must be 40");
  }
  const coreTags = coreMetadata?.registration?.tags ?? [];
  if (
    new Set(coreTags).size !== 40 ||
    coreTags.some((tag) => !/^vf-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(tag))
  ) {
    failures.push(
      "native core element tags must contain 40 unique lowercase vf-* names",
    );
  }

  const coreFixture = read(
    root,
    "apps/regression-fixtures/src/nativeCoreElements.tsx",
  );
  requireIncludes(
    failures,
    coreFixture,
    "apps/regression-fixtures/src/nativeCoreElements.tsx",
    ["registerVyrnForgeElements", "new FormData", "vf-tabs", "vf-side-nav"],
  );

  const coreBrowserEvidence = read(
    root,
    "tests/browser/native-core-elements.spec.ts",
  );
  requireIncludes(
    failures,
    coreBrowserEvidence,
    "tests/browser/native-core-elements.spec.ts",
    [
      "registers the deterministic 40-element public catalog",
      "native-core-submission",
      "ArrowRight",
      "ArrowDown",
    ],
  );

  const packageRoot = read(root, "package.json");
  requireIncludes(failures, packageRoot, "package.json", [
    "test:native-element-foundations",
    "verify:native-element-foundations",
  ]);

  const multiFramework = readJson(root, "docs/metadata/multi-framework.json");
  if (multiFramework?.program?.currentSprint !== "S6") {
    failures.push("multi-framework currentSprint must be S6");
  }
  if (
    multiFramework?.nativeElementFoundation?.currentBatch !== "EL-6005-EL-6011"
  ) {
    failures.push(
      "multi-framework nativeElementFoundation currentBatch must be EL-6005-EL-6011",
    );
  }
  if (multiFramework?.nativeElementFoundation?.status !== "in-progress") {
    failures.push(
      "multi-framework nativeElementFoundation status must be in-progress",
    );
  }

  const remaining = new Set(metadata.remainingGmf3Tasks ?? []);
  for (const taskId of taskIds.slice(11)) {
    if (!remaining.has(taskId)) {
      failures.push(`remainingGmf3Tasks must include ${taskId}`);
    }
  }
  if (remaining.size !== 7) {
    failures.push("remainingGmf3Tasks must contain EL-6012 through EL-6018");
  }

  return [...new Set(failures)].sort();
}

export function assertNativeElementFoundations(options) {
  const failures = verifyNativeElementFoundations(options);
  if (failures.length) {
    throw new Error(
      `Native element foundation verification failed:\n- ${failures.join("\n- ")}`,
    );
  }
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  assertNativeElementFoundations();
  console.log(
    "Native element foundations passed: EL-6001 through EL-6011 foundations and native core renderer contracts are complete.",
  );
}
