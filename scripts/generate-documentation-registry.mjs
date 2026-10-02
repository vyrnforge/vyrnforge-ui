import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { buildReferenceModel } from "./generate-reference-model.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

export const DOCUMENTATION_PAGES_PATH =
  "docs/metadata/documentation-pages.json";
export const DOCUMENTATION_REGISTRY_PATH =
  "docs/generated/documentation-registry.json";

const allowedRenderers = new Set([
  "overview",
  "markdown",
  "component-reference",
  "package-reference",
  "discovery-reference",
  "example",
  "executable-examples",
]);

const domainDocumentTypes = {
  components: "component",
  packages: "package",
  tokens: "foundation",
  patterns: "pattern",
  examples: "example",
  accessibility: "component",
};

function readJson(root, relativePath) {
  return JSON.parse(readFileSync(path.join(root, relativePath), "utf8"));
}

function assertUnique(entries, field, label) {
  const seen = new Set();
  for (const entry of entries) {
    const value = entry[field];
    if (seen.has(value)) {
      throw new Error(`Duplicate ${label} ${field}: ${value}`);
    }
    seen.add(value);
  }
}

export function validateDocumentationPagesMetadata(
  metadata,
  { root = repositoryRoot } = {},
) {
  if (metadata.schemaVersion !== 1) {
    throw new Error("Unsupported documentation-pages schema version.");
  }
  if (!Array.isArray(metadata.sections) || metadata.sections.length === 0) {
    throw new Error("Documentation pages metadata requires sections.");
  }
  if (!Array.isArray(metadata.pages) || metadata.pages.length === 0) {
    throw new Error("Documentation pages metadata requires pages.");
  }

  assertUnique(metadata.sections, "id", "documentation section");
  assertUnique(metadata.pages, "id", "documentation page");

  const sectionIds = new Set(metadata.sections.map((section) => section.id));
  const orderKeys = new Set();

  for (const page of metadata.pages) {
    if (!sectionIds.has(page.section)) {
      throw new Error(
        `Documentation page ${page.id} references unknown section ${page.section}.`,
      );
    }
    if (!allowedRenderers.has(page.renderer)) {
      throw new Error(
        `Documentation page ${page.id} has unsupported renderer ${page.renderer}.`,
      );
    }
    if (!page.type || !page.sourcePath) {
      throw new Error(
        `Documentation page ${page.id} requires type and sourcePath.`,
      );
    }
    if (!existsSync(path.join(root, page.sourcePath))) {
      throw new Error(
        `Documentation page ${page.id} source is missing: ${page.sourcePath}`,
      );
    }
    if (page.renderer === "example" && !page.exampleId) {
      throw new Error(
        `Documentation example page ${page.id} requires exampleId.`,
      );
    }

    const orderKey = `${page.section}:${page.order}`;
    if (orderKeys.has(orderKey)) {
      throw new Error(
        `Duplicate documentation order ${page.order} in section ${page.section}.`,
      );
    }
    orderKeys.add(orderKey);
  }

  return metadata;
}

export function buildDocumentationRegistry({ root = repositoryRoot } = {}) {
  const metadata = validateDocumentationPagesMetadata(
    readJson(root, DOCUMENTATION_PAGES_PATH),
    { root },
  );
  const referenceModel = buildReferenceModel({ root });

  const sectionOrder = new Map(
    metadata.sections.map((section) => [section.id, section.order]),
  );
  const sections = [...metadata.sections].sort((a, b) => a.order - b.order);
  const pages = [...metadata.pages].sort((a, b) => {
    const sectionDelta =
      sectionOrder.get(a.section) - sectionOrder.get(b.section);
    return sectionDelta || a.order - b.order || a.id.localeCompare(b.id);
  });

  const recordDomains = referenceModel.domains
    .filter((domain) => domain.recordSource)
    .map((domain) => ({
      id: domain.id,
      type: domainDocumentTypes[domain.id] ?? "reference",
      routeTemplate: domain.routeTemplate,
      recordSource: domain.recordSource,
      sourceOwnership: {
        mode: domain.mode,
        canonicalSources: domain.canonicalSources,
        generatedSources: domain.generatedSources,
      },
    }));

  const documentTypes = [
    ...new Set([
      ...pages.map((page) => page.type),
      ...recordDomains.map((domain) => domain.type),
    ]),
  ].sort();

  return {
    schemaVersion: 1,
    generatedFrom: [
      DOCUMENTATION_PAGES_PATH,
      "docs/generated/reference-model.json",
    ],
    documentTypes,
    sections,
    pages: pages.map((page) => ({
      ...page,
      route: `/${page.id}`,
    })),
    recordDomains,
  };
}

export function serializeDocumentationRegistry(registry) {
  return `${JSON.stringify(registry, null, 2)}\n`;
}

export function writeDocumentationRegistry({ root = repositoryRoot } = {}) {
  const registry = buildDocumentationRegistry({ root });
  const outputPath = path.join(root, DOCUMENTATION_REGISTRY_PATH);
  mkdirSync(path.dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, serializeDocumentationRegistry(registry), "utf8");
  return registry;
}

export function verifyDocumentationRegistry({ root = repositoryRoot } = {}) {
  const registry = buildDocumentationRegistry({ root });
  const outputPath = path.join(root, DOCUMENTATION_REGISTRY_PATH);
  if (!existsSync(outputPath)) {
    throw new Error(
      `${DOCUMENTATION_REGISTRY_PATH} is missing; run node scripts/generate-documentation-registry.mjs.`,
    );
  }

  const actual = readFileSync(outputPath, "utf8").replace(/\r\n?/gu, "\n");
  const expected = serializeDocumentationRegistry(registry).replace(
    /\r\n?/gu,
    "\n",
  );
  if (actual !== expected) {
    throw new Error(
      `${DOCUMENTATION_REGISTRY_PATH} is stale; run node scripts/generate-documentation-registry.mjs.`,
    );
  }
  return registry;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const checkOnly = process.argv.includes("--check");
  const registry = checkOnly
    ? verifyDocumentationRegistry()
    : writeDocumentationRegistry();
  console.log(
    `${DOCUMENTATION_REGISTRY_PATH} ${checkOnly ? "is current" : "generated"} with ${registry.pages.length} pages, ${registry.recordDomains.length} record domains, and ${registry.sections.length} navigation sections.`,
  );
}
