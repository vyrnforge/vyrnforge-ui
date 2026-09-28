import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const frameworkIds = ["native-html", "react", "angular", "vue"];
const apiSurfaceIds = ["native", "react", "angular", "vue"];

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

  const docsRoutes = read(root, "apps/docs/src/referenceRoutes.ts");
  for (const marker of [
    'kind: "example"',
    'kind: "executable-examples"',
    'label: "Foundations"',
    'label: "Patterns"',
    'label: "Data & Grid"',
  ]) {
    if (!docsRoutes.includes(marker)) {
      failures.push(`unified Docs routes are missing ${marker}`);
    }
  }

  const migratedExamples = read(
    root,
    "apps/docs/src/examples/MigratedExamplePage.tsx",
  );
  for (const marker of [
    "ThemeModesPage",
    "DensityPage",
    "BasicGridPage",
    "SettingsPage",
    "vf-docs-example-stage",
  ]) {
    if (!migratedExamples.includes(marker)) {
      failures.push(`migrated Docs examples are missing ${marker}`);
    }
  }

  const executableExamples = read(
    root,
    "apps/docs/src/examples/ExecutableExamplesPage.tsx",
  );
  if (!executableExamples.includes("getExecutableExampleRecord")) {
    failures.push(
      "Docs executable examples are not backed by the packed-consumer contract",
    );
  }

  if (existsSync(path.join(root, "examples/basic-playground"))) {
    failures.push(
      "standalone public Playground package still exists after Docs migration",
    );
  }

  return failures.sort();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const failures = verifyPlaygroundReferenceCoverage();
  if (failures.length > 0) {
    console.error("Unified Docs reference coverage verification failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exitCode = 1;
  } else {
    console.log("Unified Docs reference coverage verification passed.");
  }
}
