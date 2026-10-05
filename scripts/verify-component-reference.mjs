import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildAiContextArtifacts,
  buildComponentReference,
  buildConsumerKnowledge,
} from "./generate-component-reference.mjs";
import { verifyPlaygroundReferenceCoverage } from "./verify-playground-reference-coverage.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const generatedPath = "docs/generated/component-reference.json";
const knowledgePath = "docs/generated/consumer-knowledge.json";
const aiRoot = "docs/generated/ai-context";
const configMetadataPath = "docs/metadata/component-reference-config.json";
const componentDocumentationPath = "docs/metadata/component-documentation.json";

function read(root, relativePath) {
  return readFileSync(path.join(root, relativePath), "utf8");
}

function json(root, relativePath) {
  return JSON.parse(read(root, relativePath));
}

function compareJson(root, relativePath, expected, failures, label) {
  if (!existsSync(path.join(root, relativePath))) {
    failures.push(`${label} is missing: ${relativePath}`);
    return;
  }
  const actual = json(root, relativePath);
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    failures.push(`${label} is stale; run npm run generate:consumer-knowledge`);
  }
}

function filesRecursively(root, relativeDir) {
  const absolute = path.join(root, relativeDir);
  if (!existsSync(absolute)) return [];
  return readdirSync(absolute, { withFileTypes: true }).flatMap((entry) => {
    const relative = path.join(relativeDir, entry.name);
    return entry.isDirectory() ? filesRecursively(root, relative) : [relative];
  });
}

function verifyDocumentationCapabilities(
  root,
  expectedReference,
  failures,
) {
  if (!existsSync(path.join(root, componentDocumentationPath))) {
    failures.push(
      `component documentation capabilities are missing: ${componentDocumentationPath}`,
    );
    return;
  }
  const metadata = json(root, componentDocumentationPath);
  if (metadata.schemaVersion !== 1) {
    failures.push("component documentation schemaVersion must be 1");
  }
  if (metadata.sourceOfTruth?.canonical !== true) {
    failures.push("component documentation capabilities must declare canonical ownership");
  }
  if (metadata.policy?.publicContractValuesWin !== true) {
    failures.push("component documentation controls must defer to public contract values");
  }

  const components = new Map(
    (expectedReference.components ?? []).map((component) => [
      component.id,
      component,
    ]),
  );
  const seen = new Set();
  for (const documentation of metadata.components ?? []) {
    if (seen.has(documentation.id)) {
      failures.push(`${documentation.id}: duplicate component documentation record`);
      continue;
    }
    seen.add(documentation.id);
    const component = components.get(documentation.id);
    if (!component) {
      failures.push(
        `${documentation.id}: documentation metadata references a component outside the public Reference scope`,
      );
      continue;
    }
    if (
      documentation.specimen?.kind === "standalone" &&
      !documentation.specimen?.renderer
    ) {
      failures.push(
        `${documentation.id}: standalone specimen requires a renderer identifier`,
      );
    }
    const publicProperties = new Set(
      (component.contract?.properties ?? []).map((property) => property.name),
    );
    for (const control of documentation.controls ?? []) {
      if (!publicProperties.has(control.property)) {
        failures.push(
          `${documentation.id}: documentation control ${control.property} is not present in the canonical public contract`,
        );
      }
      if (!["select", "boolean"].includes(control.kind)) {
        failures.push(
          `${documentation.id}: unsupported documentation control kind ${control.kind}`,
        );
      }
    }
  }

  for (const representative of [
    "button",
    "text-input",
    "select",
    "tabs",
    "dialog",
    "inline-message",
    "panel",
  ]) {
    if (!seen.has(representative)) {
      failures.push(
        `representative documentation capability coverage is missing ${representative}`,
      );
    }
  }
}

export function verifyComponentReference({ root = repositoryRoot } = {}) {
  const failures = [];
  if (!existsSync(path.join(root, configMetadataPath))) {
    return [
      `component reference configuration is missing: ${configMetadataPath}`,
    ];
  }
  failures.push(...verifyPlaygroundReferenceCoverage({ root }));
  const config = json(root, configMetadataPath);
  if (config.status !== "current") {
    failures.push("component reference configuration status must be current");
  }
  for (const command of [
    "npm run generate:reference",
    "npm run verify:reference",
    "npm run verify:docs-quality",
    "npm run build:docs",
  ]) {
    if (!(config.requiredCommands ?? []).includes(command)) {
      failures.push(
        `component reference configuration is missing required command ${command}`,
      );
    }
  }
  if (config.policy?.playgroundStatusIsGenerated !== undefined) {
    failures.push(
      "component reference configuration retains retired Playground policy",
    );
  }
  for (const evidencePath of config.evidence ?? []) {
    if (!existsSync(path.join(root, evidencePath))) {
      failures.push(
        `component reference configuration points at missing evidence: ${evidencePath}`,
      );
    }
  }
  for (const requiredSource of [
    "docs/metadata/components.json",
    "docs/metadata/component-contracts.json",
    "docs/metadata/component-documentation.json",
    "docs/metadata/patterns.json",
    "docs/metadata/packages.json",
    "docs/metadata/multi-framework.json",
  ]) {
    if (!(config.sourceOfTruth ?? []).includes(requiredSource)) {
      failures.push(
        `consumer knowledge metadata is missing source ${requiredSource}`,
      );
    }
  }

  const expectedKnowledge = buildConsumerKnowledge({ root });
  const expectedReference = buildComponentReference({ root });
  const expectedAi = buildAiContextArtifacts({ root });
  verifyDocumentationCapabilities(root, expectedReference, failures);
  compareJson(
    root,
    knowledgePath,
    expectedKnowledge,
    failures,
    "consumer knowledge",
  );
  compareJson(
    root,
    generatedPath,
    expectedReference,
    failures,
    "component reference",
  );
  compareJson(
    root,
    `${aiRoot}/index.json`,
    expectedAi.index,
    failures,
    "AI context index",
  );
  for (const [category, value] of Object.entries(expectedAi.categories)) {
    compareJson(
      root,
      `${aiRoot}/categories/${category}.json`,
      value,
      failures,
      `${category} AI category context`,
    );
  }
  for (const [id, value] of Object.entries(expectedAi.components)) {
    compareJson(
      root,
      `${aiRoot}/components/${id}.json`,
      value,
      failures,
      `${id} AI component context`,
    );
  }
  for (const [id, value] of Object.entries(expectedAi.patterns)) {
    compareJson(
      root,
      `${aiRoot}/patterns/${id}.json`,
      value,
      failures,
      `${id} AI pattern context`,
    );
  }

  const expectedAiFiles = new Set([
    `${aiRoot}/index.json`,
    ...Object.keys(expectedAi.categories).map(
      (id) => `${aiRoot}/categories/${id}.json`,
    ),
    ...Object.keys(expectedAi.components).map(
      (id) => `${aiRoot}/components/${id}.json`,
    ),
    ...Object.keys(expectedAi.patterns).map(
      (id) => `${aiRoot}/patterns/${id}.json`,
    ),
  ]);
  for (const file of filesRecursively(root, aiRoot).filter((entry) =>
    entry.endsWith(".json"),
  )) {
    if (!expectedAiFiles.has(file)) {
      failures.push(`unexpected stale AI context artifact: ${file}`);
    }
  }

  const catalog = json(root, "docs/metadata/components.json");
  const included = (catalog.components ?? []).filter(
    (component) =>
      component.publicExport &&
      component.frameworkParity?.betaScope === "included" &&
      component.maturity !== "internal",
  );
  if (expectedReference.scope?.componentCount !== included.length) {
    failures.push(
      "component reference must cover every public beta-scope component",
    );
  }
  const frameworkIds = ["react", "native-html", "angular", "vue"];
  for (const component of expectedReference.components ?? []) {
    const source = included.find((entry) => entry.id === component.id);
    for (const frameworkId of frameworkIds) {
      if (!component.frameworks?.[frameworkId]) {
        failures.push(
          `${component.id}: generated framework usage is missing ${frameworkId}`,
        );
      }
    }
    if (
      source?.frameworkParity?.angular?.status &&
      component.frameworks.angular.status !==
        source.frameworkParity.angular.status
    ) {
      failures.push(
        `${component.id}: Angular status must remain sourced from canonical component parity metadata`,
      );
    }
    if (
      source?.frameworkParity?.vue?.status &&
      component.frameworks.vue.status !== source.frameworkParity.vue.status
    ) {
      failures.push(
        `${component.id}: Vue status must remain sourced from canonical component parity metadata`,
      );
    }
  }

  const docsPage = read(root, "apps/docs/src/ComponentReferencePage.tsx");
  for (const marker of [
    "framework-api-reference.json",
    "componentReferenceRecords",
    "getReferenceRecordRoute",
    "component-usage",
    "component-capabilities",
    "component-framework-usage",
    "component-framework-api",
    "component-accessibility-styling",
    "component-theming",
    "component-related",
    "Accessibility guidance",
    "Generated API reference",
  ]) {
    if (!docsPage.includes(marker))
      failures.push(`consumer knowledge viewer is missing ${marker}`);
  }
  const orderedSections = [
    'id="component-specimen"',
    'id="component-usage"',
    'id="component-accessibility-styling"',
    'id="component-framework-usage"',
    'id="component-theming"',
    'id="component-related"',
    'id="component-framework-api"',
  ];
  let previousIndex = -1;
  for (const marker of orderedSections) {
    const index = docsPage.indexOf(marker);
    if (index < 0 || index <= previousIndex) {
      failures.push(
        `component documentation section order is invalid at ${marker}`,
      );
      break;
    }
    previousIndex = index;
  }
  for (const retiredReaderMarker of [
    "AI context slice",
    "AI usage notes",
    "Framework-neutral contract",
    "Model, form, and ref contracts",
  ]) {
    if (docsPage.includes(retiredReaderMarker)) {
      failures.push(
        `consumer knowledge viewer still exposes internal reader chrome: ${retiredReaderMarker}`,
      );
    }
  }
  if (docsPage.includes("component: componentId")) {
    failures.push(
      "component reference must use generated stable record routes instead of the retired component query parameter",
    );
  }
  if (
    !docsPage.includes(
      'getReferenceRecordRoute(referenceModel, "components", componentId)',
    )
  ) {
    failures.push("generated component route composition is missing");
  }
  for (const marker of [
    "framework?.apiSurface",
    "contextualApi",
    "version: string",
  ]) {
    if (!docsPage.includes(marker)) {
      failures.push(`component API context binding is missing ${marker}`);
    }
  }
  if (docsPage.includes("frameworkTabs") || docsPage.includes("<Tabs")) {
    failures.push(
      "component API must render only the selected framework context instead of a parallel framework tab set",
    );
  }

  const referenceData = read(root, "apps/docs/src/referenceData.ts");
  for (const marker of [
    "consumer-knowledge.json?raw",
    "component-documentation.json?raw",
    "metadata/packages.json?raw",
    "getComponentDocumentation",
    "getContractEnumValues",
    "packageReferenceRecords",
    "packageMetadata.packages.length",
  ]) {
    if (!referenceData.includes(marker)) {
      failures.push(`reference data adapter is missing ${marker}`);
    }
  }

  const specimen = read(root, "apps/docs/src/ReferenceComponentSpecimen.tsx");
  for (const marker of [
    "getComponentDocumentation",
    "getContractEnumValues",
    'case "dialog"',
    "SpecimenControls",
  ]) {
    if (!specimen.includes(marker)) {
      failures.push(`component specimen is missing ${marker}`);
    }
  }

  const packagePage = read(root, "apps/docs/src/PackageReferencePage.tsx");
  for (const marker of [
    "packageReferenceRecords",
    "packageDependencyRules",
    "getReferenceRecordRoute",
    "Public entry points",
  ]) {
    if (!packagePage.includes(marker)) {
      failures.push(`package reference viewer is missing ${marker}`);
    }
  }
  for (const forbidden of [
    "const packages = [",
    "const dependencyRules = [",
    'name: "@vyrnforge/ui-core"',
    'status: "Planned"',
  ]) {
    if (packagePage.includes(forbidden)) {
      failures.push(
        `package reference viewer contains duplicated package authority: ${forbidden}`,
      );
    }
  }

  const rolloutResidueFiles = [
    "docs/metadata/component-reference-config.json",
    "docs/testing/generated-component-reference.md",
    "scripts/generate-component-reference.mjs",
    "scripts/verify-component-reference.test.mjs",
  ];
  const rolloutPattern = /GMF4|CF-7011|CF-7012|npm run quality/;
  for (const file of rolloutResidueFiles) {
    if (rolloutPattern.test(read(root, file))) {
      failures.push(
        `${file}: retired rollout/task language remains in the current component reference pipeline`,
      );
    }
  }
  return failures.sort();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const failures = verifyComponentReference();
  if (failures.length > 0) {
    console.error("Consumer knowledge verification failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exitCode = 1;
  } else {
    console.log("Consumer knowledge verification passed.");
  }
}
