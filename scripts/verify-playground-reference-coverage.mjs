import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const frameworkIds = ["native-html", "react", "angular", "vue"];
const apiSurfaceIds = ["native", "react", "angular", "vue"];
const retiredReferenceFiles = [
  "examples/basic-playground/src/app/referenceCatalogRoutes.ts",
  "examples/basic-playground/src/pages/reference/PriorityComponentPages.tsx",
  "examples/basic-playground/src/pages/reference/FormComponentPages.tsx",
  "examples/basic-playground/src/pages/reference/ControlComponentPages.tsx",
  "examples/basic-playground/src/pages/reference/OverlayComponentPages.tsx",
  "examples/basic-playground/src/pages/reference/AutocompletePage.tsx",
  "examples/basic-playground/src/pages/reference/TransferListPage.tsx",
  "examples/basic-playground/src/pages/reference/ToastPage.tsx",
  "examples/basic-playground/src/pages/reference/MetadataCatalogPages.tsx",
  "examples/basic-playground/src/pages/reference/MetadataDetailPages.tsx",
  "examples/basic-playground/src/components/PropsTable.tsx",
];

function read(root, relativePath) {
  return readFileSync(path.join(root, relativePath), "utf8");
}

function json(root, relativePath) {
  return JSON.parse(read(root, relativePath));
}

function duplicates(values) {
  const seen = new Set();
  const repeated = new Set();
  for (const value of values) {
    if (seen.has(value)) repeated.add(value);
    seen.add(value);
  }
  return [...repeated].sort();
}

export function verifyPlaygroundReferenceCoverage({
  root = repositoryRoot,
} = {}) {
  const failures = [];
  const model = json(root, "docs/generated/reference-model.json");
  const knowledge = json(root, "docs/generated/consumer-knowledge.json");
  const contracts = json(root, "docs/metadata/component-contracts.json");
  const catalog = json(root, "docs/metadata/components.json");
  const frameworkApi = json(
    root,
    "docs/generated/framework-api-reference.json",
  );

  const components = knowledge.components ?? [];
  const componentIds = components.map((component) => component.id);
  const componentIdSet = new Set(componentIds);
  for (const id of duplicates(componentIds)) {
    failures.push(`consumer knowledge has duplicate component id: ${id}`);
  }
  for (const component of components) {
    for (const frameworkId of frameworkIds) {
      if (!component.frameworks?.[frameworkId]) {
        failures.push(
          `${component.id}: reference detail usage is missing ${frameworkId}`,
        );
      }
    }
  }

  const publicCatalogIds = new Set(
    (catalog.components ?? [])
      .filter((component) => component.publicExport === true)
      .map((component) => component.id),
  );
  const canonicalIds = (contracts.componentContracts ?? [])
    .filter((component) => publicCatalogIds.has(component.id))
    .map((component) => component.id);
  for (const id of duplicates(canonicalIds)) {
    failures.push(`canonical component contracts have duplicate id: ${id}`);
  }
  for (const componentId of canonicalIds) {
    if (!componentIdSet.has(componentId)) {
      failures.push(
        `${componentId}: canonical component is missing consumer knowledge`,
      );
    }
    for (const surfaceId of apiSurfaceIds) {
      const apiIds = new Set(
        (frameworkApi.surfaces?.[surfaceId]?.components ?? []).map(
          (component) => component.id,
        ),
      );
      if (!apiIds.has(componentId)) {
        failures.push(
          `${componentId}: canonical component is missing ${surfaceId} generated API coverage`,
        );
      }
    }
  }

  const componentDomain = model.domains?.find(
    (domain) => domain.id === "components",
  );
  if (componentDomain?.routeTemplate !== "/components/{id}") {
    failures.push("generated component route template is not /components/{id}");
  }

  const routeSource = read(root, "examples/basic-playground/src/app/routes.ts");
  for (const marker of [
    "referenceComponents",
    "getReferenceRecordRoute",
    'getReferenceRecordRoute(referenceModel, "components", id)',
    "createGeneratedComponentPage",
    "componentDemoIds.map",
  ]) {
    if (!routeSource.includes(marker)) {
      failures.push(
        `generated component route composition is missing ${marker}`,
      );
    }
  }
  for (const marker of [
    "PriorityComponentPages",
    "FormComponentPages",
    "ControlComponentPages",
    "OverlayComponentPages",
  ]) {
    if (routeSource.includes(marker)) {
      failures.push(
        `playground routes still import retired authority ${marker}`,
      );
    }
  }

  const referenceMetadataSource = read(
    root,
    "examples/basic-playground/src/data/referenceMetadata.ts",
  );
  if (!referenceMetadataSource.includes("...canonicalNativeElementEntries,")) {
    failures.push(
      "reference metadata projection is missing canonical native API tags",
    );
  }

  const demoSource = read(
    root,
    "examples/basic-playground/src/components/ComponentDemoPage.tsx",
  );
  for (const marker of [
    "getReferenceFrameworkComponent",
    "Generated API reference",
    "API facts are generated",
    "canonical.guidance.relatedComponents",
  ]) {
    if (!demoSource.includes(marker)) {
      failures.push(
        `component reader is missing generated authority marker ${marker}`,
      );
    }
  }
  if (demoSource.includes("props?: PropsTableRow")) {
    failures.push(
      "component reader still accepts manual props-table authority",
    );
  }

  const appSource = read(root, "examples/basic-playground/src/app/App.tsx");
  for (const marker of [
    "executableExamplesCatalogRoute",
    "...executableExampleDetailRoutes",
    "routes={navigationRoutes}",
  ]) {
    if (!appSource.includes(marker)) {
      failures.push(`playground route separation is missing ${marker}`);
    }
  }
  for (const marker of ["referenceCatalogRoutes", "referenceDetailRoutes"]) {
    if (appSource.includes(marker)) {
      failures.push(`playground app still consumes retired ${marker}`);
    }
  }

  for (const relativePath of retiredReferenceFiles) {
    if (existsSync(path.join(root, relativePath))) {
      failures.push(
        `retired manual reference file still exists: ${relativePath}`,
      );
    }
  }

  return failures.sort();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const failures = verifyPlaygroundReferenceCoverage();
  if (failures.length > 0) {
    console.error("Playground reference coverage verification failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exitCode = 1;
  } else {
    console.log("Playground reference coverage verification passed.");
  }
}
