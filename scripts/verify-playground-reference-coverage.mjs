import { readFileSync } from "node:fs";
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
  const knowledge = json(root, "docs/generated/consumer-knowledge.json");
  const contracts = json(root, "docs/metadata/component-contracts.json");
  const frameworkApi = json(
    root,
    "docs/generated/framework-api-reference.json",
  );
  const nativeCore = json(root, "docs/metadata/native-core-elements.json");
  const nativeAdvanced = json(
    root,
    "docs/metadata/native-advanced-elements.json",
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

  const canonicalIds = (contracts.componentContracts ?? []).map(
    (component) => component.id,
  );
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

  const phaseTags = [
    ...(nativeCore.registration?.tags ?? []),
    ...(nativeAdvanced.registration?.addedTags ?? []),
  ];
  for (const tag of duplicates(phaseTags)) {
    failures.push(`native element phase metadata has duplicate tag: ${tag}`);
  }

  const canonicalNativeTags = [
    ...new Set(
      (frameworkApi.surfaces?.native?.components ?? [])
        .filter((component) => component.status === "current" && component.tag)
        .map((component) => component.tag),
    ),
  ];
  const referenceElementTags = [...new Set([...phaseTags, ...canonicalNativeTags])];

  const componentPaths = componentIds.map(
    (id) => `/reference/components/${id}`,
  );
  const elementPaths = referenceElementTags.map(
    (tag) => `/reference/elements/${tag}`,
  );
  for (const referencePath of duplicates([
    ...componentPaths,
    ...elementPaths,
  ])) {
    failures.push(`generated reference path is not unique: ${referencePath}`);
  }

  const metadataSource = read(
    root,
    "examples/basic-playground/src/data/referenceMetadata.ts",
  );
  for (const marker of [
    "phaseElementEntries",
    "phaseElementTags",
    "canonicalNativeElementEntries",
    "...canonicalNativeElementEntries",
  ]) {
    if (!metadataSource.includes(marker)) {
      failures.push(`reference metadata projection is missing ${marker}`);
    }
  }

  const routeSource = read(
    root,
    "examples/basic-playground/src/app/referenceCatalogRoutes.ts",
  );
  for (const marker of [
    "referenceComponents.map",
    "referenceElements.map",
    "referenceDetailRoutes",
    "`/reference/components/${component.id}`",
    "`/reference/elements/${element.tag}`",
  ]) {
    if (!routeSource.includes(marker)) {
      failures.push(`generated reference routes are missing ${marker}`);
    }
  }

  const catalogSource = read(
    root,
    "examples/basic-playground/src/pages/reference/MetadataCatalogPages.tsx",
  );
  for (const marker of [
    "`#/reference/components/${component.id}`",
    "`#/reference/elements/${element.tag}`",
  ]) {
    if (!catalogSource.includes(marker)) {
      failures.push(`reference catalog links are missing ${marker}`);
    }
  }

  const appSource = read(root, "examples/basic-playground/src/app/App.tsx");
  for (const marker of [
    "const navigationRoutes = [",
    "const routes = [...navigationRoutes, ...referenceDetailRoutes]",
    "routes={navigationRoutes}",
  ]) {
    if (!appSource.includes(marker)) {
      failures.push(`playground route separation is missing ${marker}`);
    }
  }

  const detailSource = read(
    root,
    "examples/basic-playground/src/pages/reference/MetadataDetailPages.tsx",
  );
  for (const marker of [
    "getReferenceFrameworkComponent",
    "usePlaygroundFramework",
    "findDemoRoute",
    "createComponentReferenceDetailPage",
    "createElementReferenceDetailPage",
  ]) {
    if (!detailSource.includes(marker)) {
      failures.push(`reference detail renderer is missing ${marker}`);
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
