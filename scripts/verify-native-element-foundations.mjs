import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
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
  "packages/ui-elements/src/components/parity.ts",
  "apps/regression-fixtures/src/nativeFormFoundation.ts",
  "apps/regression-fixtures/src/nativeCoreElements.tsx",
  "apps/regression-fixtures/src/nativeAdvancedElements.tsx",
  "apps/regression-fixtures/src/nativeParityElements.tsx",
  "apps/regression-fixtures/src/FixtureApp.tsx",
  "tests/browser/native-form-foundation.spec.ts",
  "tests/browser/native-core-elements.spec.ts",
  "tests/browser/native-advanced-elements.spec.ts",
  "tests/browser/native-parity.spec.ts",
  "docs/metadata/native-core-elements.json",
  "docs/metadata/native-advanced-elements.json",
  "docs/testing/native-core-element-contracts.md",
  "docs/testing/native-advanced-element-contracts.md",
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
  if (metadata.sourceOfTruth?.canonical !== true) {
    failures.push("native element foundation metadata must be canonical");
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
  if (
    baseElement.class !== "VyrnForgeElement" ||
    baseElement.domMode !== "light-dom"
  ) {
    failures.push("native base element must be VyrnForgeElement in Light DOM");
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
  if (
    eventMetadata.namePattern !== "vf-*" ||
    eventMetadata.dispatcherFactory !== "createVyrnForgeEventDispatcher"
  ) {
    failures.push("native typed event metadata is invalid");
  }
  if (
    eventMetadata.defaults?.bubbles !== true ||
    eventMetadata.defaults?.composed !== true
  ) {
    failures.push("native events must bubble and compose by default");
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
  if (
    formMetadata.class !== "VyrnForgeFormAssociatedElement" ||
    formMetadata.implementation !== "ElementInternals" ||
    formMetadata.formAssociated !== true
  ) {
    failures.push("native form association metadata is invalid");
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
  const dependencies = Object.keys(packageJson?.dependencies ?? {}).sort();
  if (
    packageJson?.name !== "@vyrnforge/ui-elements" ||
    JSON.stringify(dependencies) !==
      JSON.stringify(["@vyrnforge/ui-behaviors", "@vyrnforge/ui-core"])
  ) {
    failures.push(
      "ui-elements runtime dependencies must remain ui-core and ui-behaviors only",
    );
  }

  requireIncludes(
    failures,
    read(root, "packages/ui-elements/src/base/VyrnForgeElement.ts"),
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
  requireIncludes(
    failures,
    read(root, "packages/ui-elements/src/events.ts"),
    "packages/ui-elements/src/events.ts",
    [
      "assertVyrnForgeEventName",
      "createVyrnForgeEventDispatcher",
      "vyrnForgeEventDispatcher",
      "bubbles: options.bubbles ?? true",
      "composed: options.composed ?? true",
      "VyrnForgeCanonicalEventDetailMap",
    ],
  );
  requireIncludes(
    failures,
    read(
      root,
      "packages/ui-elements/src/base/VyrnForgeFormAssociatedElement.ts",
    ),
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
      "vf-icon",
      "vf-inline-message",
      "vf-skeleton",
      "vf-top-nav",
    ],
  );
  const registryTags = [
    ...(registrySource?.matchAll(/tagName:\s*"(vf-[a-z0-9-]+)"/g) ?? []),
  ].map((match) => match[1]);
  if (registryTags.length !== 58 || new Set(registryTags).size !== 58) {
    failures.push("native registry must contain 58 unique public tags");
  }

  const componentMetadata = readJson(root, "docs/metadata/components.json");
  const publicComponents = (componentMetadata?.components ?? []).filter(
    (component) =>
      component.package === "@vyrnforge/ui-components" &&
      component.publicExport === true,
  );
  const strategyCounts = new Map();
  for (const component of publicComponents) {
    const native = component.frameworkParity?.native;
    if (native?.status !== "current") {
      failures.push(`${component.id} native parity status must be current`);
      continue;
    }
    if (native.evidence !== "docs/metadata/native-element-foundations.json") {
      failures.push(
        `${component.id} must reference current native foundation evidence`,
      );
    }
    strategyCounts.set(
      native.strategy,
      (strategyCounts.get(native.strategy) ?? 0) + 1,
    );
  }
  for (const [strategy, expectedCount] of [
    ["direct-element", 57],
    ["renderer-mapping", 8],
    ["renderer-composition", 1],
    ["renderer-service", 1],
  ]) {
    if (strategyCounts.get(strategy) !== expectedCount) {
      failures.push(
        `native renderer strategy ${strategy} must contain ${expectedCount} records`,
      );
    }
  }

  requireIncludes(
    failures,
    read(root, "packages/ui-elements/src/components/parity.ts"),
    "packages/ui-elements/src/components/parity.ts",
    [
      "VyrnForgeIconElement",
      "VyrnForgeInlineMessageElement",
      "VyrnForgeSkeletonElement",
      "VyrnForgeTopNavElement",
    ],
  );

  requireIncludes(
    failures,
    read(root, "packages/ui-elements/src/index.ts"),
    "packages/ui-elements/src/index.ts",
    [
      "VyrnForgeFormAssociatedElement",
      "VyrnForgeCanonicalEventDetailMap",
      "createVyrnForgeEventDispatcher",
      "VyrnForgePropertyDeclaration",
      "VyrnForgeElementDefinition",
      "createVyrnForgeElementRegistration",
      'export * from "./components"',
    ],
  );
  requireIncludes(
    failures,
    read(root, "packages/ui-elements/src/components/index.ts"),
    "packages/ui-elements/src/components/index.ts",
    ["VyrnForgeTopNavElement", 'from "./parity"'],
  );

  requireIncludes(
    failures,
    read(root, "tests/consumers/native-html/architecture-probe.ts"),
    "tests/consumers/native-html/architecture-probe.ts",
    [
      "createVyrnForgeElementRegistration",
      "VyrnForgePropertyDeclarations",
      "protected override connected",
      "protected override update",
      "vyrnForgeElementDefinitions",
      "registeredNativeTagCount",
    ],
  );

  requireIncludes(
    failures,
    read(root, "apps/regression-fixtures/src/FixtureApp.tsx"),
    "apps/regression-fixtures/src/FixtureApp.tsx",
    [
      "new FormData",
      "registerNativeFormProbeElement",
      "NativeParityElementsFixture",
    ],
  );
  requireIncludes(
    failures,
    read(root, "tests/browser/native-form-foundation.spec.ts"),
    "tests/browser/native-form-foundation.spec.ts",
    ["reportValidity", "native-toggle-disabled", "native-reset"],
  );
  requireIncludes(
    failures,
    read(root, "tests/browser/native-parity.spec.ts"),
    "tests/browser/native-parity.spec.ts",
    ["deterministic 58-tag catalog", "native toast service mappings"],
  );

  const coreMetadata = readJson(
    root,
    "docs/metadata/native-core-elements.json",
  );
  if (
    coreMetadata?.program?.batch !== "EL-6005-EL-6011" ||
    coreMetadata?.registration?.count !== 40
  ) {
    failures.push("native core metadata must retain the canonical 40-tag wave");
  }

  const advancedMetadata = readJson(
    root,
    "docs/metadata/native-advanced-elements.json",
  );
  if (
    advancedMetadata?.program?.batch !== "EL-6012-EL-6017" ||
    advancedMetadata?.registration?.totalCount !== 54 ||
    advancedMetadata?.program?.gateStatus !== "passed"
  ) {
    failures.push(
      "native advanced metadata must retain the canonical 54-tag wave and passed status",
    );
  }

  const packageRoot = read(root, "package.json");
  requireIncludes(failures, packageRoot, "package.json", [
    "test:native-element-foundations",
    "verify:native-element-foundations",
  ]);

  const multiFramework = readJson(root, "docs/metadata/multi-framework.json");
  const multiFrameworkFoundation =
    multiFramework?.nativeElementFoundation ?? {};
  if (
    multiFrameworkFoundation.status !== "complete" ||
    multiFrameworkFoundation.metadata !==
      "docs/metadata/native-element-foundations.json" ||
    multiFrameworkFoundation.registeredPublicTags !== 58 ||
    multiFrameworkFoundation.foundationStage !== "native-parity-current"
  ) {
    failures.push(
      "multi-framework nativeElementFoundation must record current native parity evidence",
    );
  }

  const nativeParity = metadata.nativeParity ?? {};
  if (
    nativeParity.registeredPublicTags !== 58 ||
    nativeParity.browserEvidence !== "tests/browser/native-parity.spec.ts" ||
    nativeParity.fixture !==
      "apps/regression-fixtures/src/nativeParityElements.tsx" ||
    nativeParity.publicReactRecords !== publicComponents.length ||
    nativeParity.directElements !== strategyCounts.get("direct-element") ||
    nativeParity.rendererMappings !== strategyCounts.get("renderer-mapping") ||
    nativeParity.rendererCompositions !==
      strategyCounts.get("renderer-composition") ||
    nativeParity.rendererServices !== strategyCounts.get("renderer-service")
  ) {
    failures.push("nativeParity metadata must match current renderer evidence");
  }

  return [...new Set(failures)].sort();
}

export function assertNativeElementFoundations(options) {
  const failures = verifyNativeElementFoundations(options);
  if (failures.length > 0) {
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
    "Native element foundations passed: EL-6001 through EL-6018 and the 58-tag GMF3 native renderer contracts are complete.",
  );
}
