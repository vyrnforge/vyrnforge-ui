import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const expectedPackages = new Map([
  [
    "@vyrnforge/ui-core",
    { status: "current", betaIncluded: true, dependsOn: [] },
  ],
  [
    "@vyrnforge/ui-behaviors",
    {
      status: "current",
      betaIncluded: true,
      dependsOn: ["@vyrnforge/ui-core"],
    },
  ],
  [
    "@vyrnforge/ui-components",
    {
      status: "current",
      betaIncluded: true,
      dependsOn: ["@vyrnforge/ui-core", "@vyrnforge/ui-behaviors"],
    },
  ],
  [
    "@vyrnforge/ui-elements",
    {
      status: "current",
      betaIncluded: true,
      dependsOn: ["@vyrnforge/ui-core", "@vyrnforge/ui-behaviors"],
    },
  ],
  [
    "@vyrnforge/ui-data-grid",
    {
      status: "react-alpha-deferred",
      betaIncluded: false,
      dependsOn: ["@vyrnforge/ui-core", "@vyrnforge/ui-components"],
    },
  ],
]);

const expectedFrameworks = new Map([
  ["react", "first-class"],
  ["native-html", "first-class"],
  ["angular", "verified-consumer"],
  ["vue", "verified-consumer"],
]);

const expectedBetaClaims = new Map([
  ["react", "custom-elements-consumer-verified"],
  ["native-html", "packed-consumer-verified"],
  ["angular", "packed-consumer-verified"],
  ["vue", "packed-consumer-verified"],
]);

const expectedFixtureClaims = new Map([
  ["react", "packed-custom-elements-runtime-verified"],
  ["native-html", "packed-runtime-verified"],
  ["angular", "packed-angular-runtime-verified"],
  ["vue", "packed-vue-runtime-verified"],
]);

const expectedEvents = new Set([
  "vf-value-change",
  "vf-open-change",
  "vf-selection-change",
  "vf-checked-change",
  "vf-pressed-change",
  "vf-action",
  "vf-dismiss",
  "vf-invalid",
  "vf-reset",
]);

const expectedSlots = new Set([
  "default",
  "label",
  "description",
  "prefix",
  "suffix",
  "trigger",
  "content",
  "header",
  "footer",
  "actions",
  "item",
  "empty",
  "loading",
]);

const requiredDocuments = [
  "docs/architecture/adr-004-multi-framework-web-support.md",
  "docs/architecture/09-component-contracts-and-events.md",
  "docs/architecture/10-custom-elements-and-form-association.md",
  "docs/testing/multi-framework-consumer-fixtures.md",
  "docs/metadata/multi-framework.json",
  "docs/metadata/component-contracts.json",
  "docs/metadata/component-contract.schema.json",
  "docs/metadata/gmf3-closure.json",
  "docs/metadata/gmf4-closure.json",
  "docs/metadata/consumer-foundations.json",
  "docs/metadata/angular-consumer.json",
  "docs/metadata/angular-forms-adapter.json",
  "docs/metadata/vue-consumer.json",
  "docs/testing/vue-consumer-contract.md",
  "docs/api/ui-behaviors-api.md",
  "docs/api/ui-elements-api.md",
  "tests/consumers/manifest.json",
];

function readJson(root, relativePath) {
  return JSON.parse(readFileSync(path.join(root, relativePath), "utf8"));
}

function normalizeSet(values) {
  return new Set(Array.isArray(values) ? values : []);
}

function sameMembers(actual, expected) {
  return (
    actual.size === expected.size &&
    [...expected].every((value) => actual.has(value))
  );
}

function addFailure(failures, message) {
  failures.push(message);
}

function verifyPackageTopology(root, failures, architecture) {
  const packages = new Map(
    (architecture.packages ?? []).map((packageInfo) => [
      packageInfo.name,
      packageInfo,
    ]),
  );

  for (const [packageName, expected] of expectedPackages) {
    const actual = packages.get(packageName);
    if (!actual) {
      addFailure(
        failures,
        `multi-framework package topology is missing ${packageName}`,
      );
      continue;
    }

    if (actual.status !== expected.status) {
      addFailure(
        failures,
        `${packageName} must have status ${expected.status}, received ${String(actual.status)}`,
      );
    }
    if (actual.betaIncluded !== expected.betaIncluded) {
      addFailure(
        failures,
        `${packageName} betaIncluded must be ${String(expected.betaIncluded)}`,
      );
    }
    if (
      !sameMembers(normalizeSet(actual.dependsOn), new Set(expected.dependsOn))
    ) {
      addFailure(
        failures,
        `${packageName} dependency topology must be ${expected.dependsOn.join(", ") || "empty"}`,
      );
    }
  }

  if (packages.size !== expectedPackages.size) {
    addFailure(
      failures,
      `multi-framework package topology must contain exactly ${expectedPackages.size} packages`,
    );
  }

  const packageMetadata = readJson(root, "docs/metadata/packages.json");
  const packageMetadataByName = new Map(
    (packageMetadata.packages ?? []).map((packageInfo) => [
      packageInfo.name,
      packageInfo,
    ]),
  );

  for (const [packageName, expected] of expectedPackages) {
    const actual = packageMetadataByName.get(packageName);
    if (!actual) {
      addFailure(failures, `packages.json is missing ${packageName}`);
      continue;
    }
    if (actual.status !== expected.status) {
      addFailure(
        failures,
        `packages.json ${packageName} status must be ${expected.status}`,
      );
    }
    if (
      !sameMembers(normalizeSet(actual.dependsOn), new Set(expected.dependsOn))
    ) {
      addFailure(
        failures,
        `packages.json ${packageName} dependsOn does not match the approved topology`,
      );
    }
  }

  const releaseGroups = packageMetadata.releaseGroups ?? {};
  if (
    !sameMembers(
      normalizeSet(releaseGroups.nonGridBeta),
      new Set([
        "@vyrnforge/ui-core",
        "@vyrnforge/ui-behaviors",
        "@vyrnforge/ui-components",
        "@vyrnforge/ui-elements",
      ]),
    )
  ) {
    addFailure(failures, "packages.json nonGridBeta release group is invalid");
  }
  if (
    !sameMembers(
      normalizeSet(releaseGroups.dataGridAlpha),
      new Set(["@vyrnforge/ui-data-grid"]),
    )
  ) {
    addFailure(
      failures,
      "packages.json dataGridAlpha release group is invalid",
    );
  }
}

function verifyFrameworkSupport(failures, architecture) {
  if (architecture.program?.status !== "gmf4-evidence-complete") {
    addFailure(
      failures,
      "multi-framework program status must be gmf4-evidence-complete",
    );
  }
  if (architecture.program?.gate !== "GMF4") {
    addFailure(failures, "multi-framework program gate must be GMF4");
  }
  if (architecture.program?.currentSprint !== "S8") {
    addFailure(failures, "multi-framework currentSprint must be S8");
  }

  const frameworks = new Map(
    (architecture.frameworks ?? []).map((framework) => [
      framework.id,
      framework,
    ]),
  );
  for (const [frameworkId, supportLevel] of expectedFrameworks) {
    const framework = frameworks.get(frameworkId);
    if (!framework) {
      addFailure(failures, `framework support is missing ${frameworkId}`);
      continue;
    }
    if (framework.supportLevel !== supportLevel) {
      addFailure(
        failures,
        `${frameworkId} support level must be ${supportLevel}`,
      );
    }

    const expectedClaim = expectedBetaClaims.get(frameworkId);
    if (framework.betaClaim !== expectedClaim) {
      addFailure(
        failures,
        `${frameworkId} beta claim must be ${expectedClaim}`,
      );
    }
  }

  if (architecture.styling?.defaultDomMode !== "light-dom") {
    addFailure(
      failures,
      "Light DOM must remain the default native element mode",
    );
  }
  if (
    architecture.styling?.shadowDomPolicy !== "component-level-exception-only"
  ) {
    addFailure(
      failures,
      "Shadow DOM policy must require a component-level exception",
    );
  }
  if (
    architecture.consumerFixturePolicy?.currentClaim !==
    "native-html-react-angular-vue-consumer-foundation-complete"
  ) {
    addFailure(
      failures,
      "consumer fixture policy must record native-html-react-angular-vue-consumer-foundation-complete",
    );
  }
  if (
    architecture.consumerFixturePolicy?.evidence !==
    "docs/metadata/consumer-foundations.json"
  ) {
    addFailure(
      failures,
      "consumer fixture policy must reference consumer-foundations.json",
    );
  }
  if (
    architecture.consumerFixturePolicy?.angularEvidence !==
    "docs/metadata/angular-consumer.json"
  ) {
    addFailure(
      failures,
      "consumer fixture policy must reference angular-consumer.json",
    );
  }
  if (
    architecture.consumerFixturePolicy?.angularFormsEvidence !==
    "docs/metadata/angular-forms-adapter.json"
  ) {
    addFailure(
      failures,
      "consumer fixture policy must reference angular-forms-adapter.json",
    );
  }
  if (architecture.consumerFixturePolicy?.runtimeBuildGate !== "GMF4") {
    addFailure(failures, "consumer runtime build gate must remain GMF4");
  }
}

function verifyComponentContracts(failures, contracts) {
  if (contracts.$schema !== "./component-contract.schema.json") {
    addFailure(
      failures,
      "component contracts must reference component-contract.schema.json",
    );
  }

  if (contracts.schemaVersion !== 2) {
    addFailure(failures, "component contracts must use schema version 2");
  }

  const eventNames = new Set();
  for (const event of contracts.eventVocabulary ?? []) {
    if (!/^vf-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(event.name ?? "")) {
      addFailure(
        failures,
        `invalid canonical event name ${String(event.name)}`,
      );
      continue;
    }
    if (eventNames.has(event.name)) {
      addFailure(failures, `duplicate canonical event ${event.name}`);
    }
    eventNames.add(event.name);
    if (event.bubbles !== true || event.composed !== true) {
      addFailure(
        failures,
        `${event.name} must bubble and cross composition boundaries`,
      );
    }
    if (!Array.isArray(event.detail)) {
      addFailure(failures, `${event.name} must define detail`);
    }
  }
  if ([...expectedEvents].some((eventName) => !eventNames.has(eventName))) {
    addFailure(
      failures,
      "canonical event vocabulary is missing required baseline events",
    );
  }

  const slotNames = new Set();
  for (const slot of contracts.slotVocabulary ?? []) {
    if (slotNames.has(slot.name)) {
      addFailure(failures, `duplicate canonical slot ${String(slot.name)}`);
    }
    slotNames.add(slot.name);
  }
  if ([...expectedSlots].some((slotName) => !slotNames.has(slotName))) {
    addFailure(
      failures,
      "canonical slot vocabulary is missing required baseline slots",
    );
  }

  const formAssociation = contracts.formAssociation ?? {};
  if (formAssociation.implementation !== "ElementInternals") {
    addFailure(failures, "form association must use ElementInternals");
  }
  if (
    !sameMembers(
      normalizeSet(formAssociation.modes),
      new Set(["none", "value", "submitter"]),
    )
  ) {
    addFailure(failures, "form association modes are invalid");
  }
  for (const method of ["checkValidity", "reportValidity"]) {
    if (!(formAssociation.requiredMethods ?? []).includes(method)) {
      addFailure(failures, `form association is missing ${method}`);
    }
  }

  const representativeIds = new Set();
  for (const contract of contracts.componentContracts ?? []) {
    if (representativeIds.has(contract.id)) {
      addFailure(
        failures,
        `duplicate representative contract ${String(contract.id)}`,
      );
    }
    if (contract.representative === true) representativeIds.add(contract.id);
    const mappings = contract.frameworkMappings ?? {};

    const react = mappings.react;
    if (
      react?.package !== "@vyrnforge/ui-components" ||
      !["current", "migration"].includes(react?.status) ||
      typeof react?.export !== "string" ||
      react.export.length === 0
    ) {
      addFailure(
        failures,
        `${contract.id} has an invalid React framework mapping`,
      );
    }

    const native = mappings.native;
    if (
      native?.package !== "@vyrnforge/ui-elements" ||
      native?.status !== "current" ||
      !/^vf-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(native?.tag ?? "")
    ) {
      addFailure(
        failures,
        `${contract.id} has an invalid current native renderer`,
      );
    }

    for (const event of contract.events ?? []) {
      const eventName = event?.name;
      if (!eventNames.has(eventName)) {
        addFailure(
          failures,
          `${contract.id} references unknown event ${String(eventName)}`,
        );
      }
    }

    for (const slot of contract.slots ?? []) {
      const slotName = slot?.name;
      if (!slotNames.has(slotName)) {
        addFailure(
          failures,
          `${contract.id} references unknown slot ${String(slotName)}`,
        );
      }
    }

    if (!(formAssociation.modes ?? []).includes(contract.form?.association)) {
      addFailure(
        failures,
        `${contract.id} has invalid form association ${String(contract.form?.association)}`,
      );
    }
  }
  if (
    !sameMembers(
      representativeIds,
      new Set(["button", "tabs", "autocomplete", "dialog"]),
    )
  ) {
    addFailure(
      failures,
      "representative contracts must cover button, tabs, autocomplete, and dialog",
    );
  }
}

function verifyConsumerFixtures(root, failures, architecture) {
  const manifestPath = architecture.consumerFixturePolicy?.manifest;
  if (manifestPath !== "tests/consumers/manifest.json") {
    addFailure(failures, "consumer fixture manifest path is invalid");
    return;
  }

  const manifest = readJson(root, manifestPath);
  if (manifest.supportClaim !== "gmf4-runtime-evidence-complete") {
    addFailure(
      failures,
      "consumer fixture manifest must record gmf4-runtime-evidence-complete",
    );
  }
  if (manifest.runtimeBuildGate !== "GMF4") {
    addFailure(failures, "consumer runtime build gate must be GMF4");
  }

  const fixtureIds = new Set();
  for (const fixture of manifest.fixtures ?? []) {
    fixtureIds.add(fixture.id);
    const fixtureDirectory = path.join(root, fixture.directory ?? "");
    const contractPath = path.join(
      fixtureDirectory,
      fixture.contractFile ?? "fixture.json",
    );
    if (!existsSync(contractPath)) {
      addFailure(failures, `${fixture.id} fixture contract is missing`);
      continue;
    }
    const contract = JSON.parse(readFileSync(contractPath, "utf8"));
    if (contract.id !== fixture.id) {
      addFailure(
        failures,
        `${fixture.id} fixture id does not match its contract`,
      );
    }
    const expectedFixtureClaim = expectedFixtureClaims.get(fixture.id);
    if (fixture.supportClaim !== expectedFixtureClaim) {
      addFailure(
        failures,
        `${fixture.id} manifest support claim must be ${expectedFixtureClaim}`,
      );
    }
    if (contract.supportClaim !== expectedFixtureClaim) {
      addFailure(
        failures,
        `${fixture.id} fixture support claim must be ${expectedFixtureClaim}`,
      );
    }
    const exampleText = (fixture.exampleFiles ?? [])
      .map((file) => path.join(fixtureDirectory, file))
      .map((file) => {
        if (!existsSync(file)) {
          addFailure(
            failures,
            `${fixture.id} fixture example ${path.basename(file)} is missing`,
          );
          return "";
        }
        return readFileSync(file, "utf8");
      })
      .join("\n");
    for (const pattern of contract.requiredPatterns ?? []) {
      if (!exampleText.includes(pattern)) {
        addFailure(
          failures,
          `${fixture.id} fixture examples are missing required pattern ${pattern}`,
        );
      }
    }
  }
  if (!sameMembers(fixtureIds, new Set(expectedFrameworks.keys()))) {
    addFailure(
      failures,
      "consumer fixture manifest must contain React, native HTML, Angular, and Vue",
    );
  }
}

export function verifyMultiFrameworkArchitecture({
  root = repositoryRoot,
} = {}) {
  const failures = [];

  for (const document of requiredDocuments) {
    if (!existsSync(path.join(root, document))) {
      addFailure(
        failures,
        `required multi-framework document is missing: ${document}`,
      );
    }
  }
  if (failures.length > 0) return failures.sort();

  const architecture = readJson(root, "docs/metadata/multi-framework.json");
  const contracts = readJson(root, "docs/metadata/component-contracts.json");

  verifyPackageTopology(root, failures, architecture);
  verifyFrameworkSupport(failures, architecture);
  verifyComponentContracts(failures, contracts);
  const componentCatalog = readJson(root, "docs/metadata/components.json");
  const publicNonGrid = (componentCatalog.components ?? []).filter(
    (component) =>
      component.package === "@vyrnforge/ui-components" &&
      component.publicExport === true &&
      component.frameworkParity?.betaScope === "included" &&
      component.category !== "data-grid" &&
      component.category !== "grid-feature",
  );

  if (
    contracts.catalogCoverage?.scopedComponentCount !== publicNonGrid.length
  ) {
    addFailure(failures, "component-contract catalog coverage count is stale");
  }
  for (const component of publicNonGrid) {
    if (!component.frameworkParity)
      addFailure(
        failures,
        `${component.id} is missing frameworkParity metadata`,
      );
  }
  verifyConsumerFixtures(root, failures, architecture);

  return failures.sort();
}

export function assertMultiFrameworkArchitecture(options) {
  const failures = verifyMultiFrameworkArchitecture(options);
  if (failures.length > 0) {
    throw new Error(
      `Multi-framework architecture verification failed:\n- ${failures.join("\n- ")}`,
    );
  }
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  assertMultiFrameworkArchitecture();
  console.log(
    "Multi-framework architecture passed: package topology, contracts, events, slots, forms, and consumer fixtures are aligned.",
  );
}
