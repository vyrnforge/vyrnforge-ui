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
  "docs/metadata/gmf1-closure.json",
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
  if (architecture.program?.status !== "architecture-foundation-implemented") {
    addFailure(
      failures,
      "multi-framework program status must be architecture-foundation-implemented",
    );
  }
  if (architecture.program?.gate !== "GMF1") {
    addFailure(failures, "multi-framework program gate must be GMF1");
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
    if (framework.betaClaim !== "planned") {
      addFailure(
        failures,
        `${frameworkId} beta claim must remain planned until GMF4`,
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
    "architecture-fixture-only"
  ) {
    addFailure(
      failures,
      "S4 consumer fixtures must not claim runtime framework support",
    );
  }
}

function verifyComponentContracts(failures, contracts) {
  if (contracts.$schema !== "./component-contract.schema.json") {
    addFailure(
      failures,
      "component contracts must reference component-contract.schema.json",
    );
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
    if (!Array.isArray(event.detailFields) || event.detailFields.length === 0) {
      addFailure(failures, `${event.name} must define detailFields`);
    }
  }
  if (!sameMembers(eventNames, expectedEvents)) {
    addFailure(
      failures,
      "canonical event vocabulary is incomplete or contains extras",
    );
  }

  const slotNames = new Set();
  for (const slot of contracts.slotVocabulary ?? []) {
    if (slotNames.has(slot.name)) {
      addFailure(failures, `duplicate canonical slot ${String(slot.name)}`);
    }
    slotNames.add(slot.name);
  }
  if (!sameMembers(slotNames, expectedSlots)) {
    addFailure(
      failures,
      "canonical slot vocabulary is incomplete or contains extras",
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
    if (!contract.react?.package || contract.react.status !== "current") {
      addFailure(
        failures,
        `${contract.id} must record the current React renderer`,
      );
    }
    if (
      contract.native?.package !== "@vyrnforge/ui-elements" ||
      contract.native.status !== "planned" ||
      !/^vf-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(contract.native.tag ?? "")
    ) {
      addFailure(
        failures,
        `${contract.id} has an invalid planned native renderer`,
      );
    }
    for (const eventName of contract.events ?? []) {
      if (!eventNames.has(eventName)) {
        addFailure(
          failures,
          `${contract.id} references unknown event ${eventName}`,
        );
      }
    }
    for (const slotName of contract.slots ?? []) {
      if (!slotNames.has(slotName)) {
        addFailure(
          failures,
          `${contract.id} references unknown slot ${slotName}`,
        );
      }
    }
    if (!(formAssociation.modes ?? []).includes(contract.formAssociation)) {
      addFailure(
        failures,
        `${contract.id} has invalid form association ${String(contract.formAssociation)}`,
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
  if (manifest.supportClaim !== "architecture-fixture-only") {
    addFailure(
      failures,
      "consumer fixture manifest overstates support maturity",
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
    if (contract.supportClaim !== "architecture-fixture-only") {
      addFailure(failures, `${fixture.id} fixture overstates support maturity`);
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
      component.publicExport === true,
  );
  if (
    contracts.catalogCoverage?.publicNonGridComponents !== publicNonGrid.length
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
