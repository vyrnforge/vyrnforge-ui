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
export const RELEASE_GROUPS_PATH = "docs/metadata/release-groups.json";
export const MULTI_FRAMEWORK_PATH = "docs/metadata/multi-framework.json";

const documentationReadinessStates = new Set([
  "stable",
  "preview",
  "maintenance",
  "deprecated",
  "unavailable",
  "internal-not-ready",
]);

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

function buildDocumentationTemplateByType(metadata) {
  if (!Array.isArray(metadata.templates) || metadata.templates.length === 0) {
    throw new Error("Documentation pages metadata requires templates.");
  }

  assertUnique(metadata.templates, "id", "documentation template");

  const templateByType = new Map();
  for (const template of metadata.templates) {
    if (
      !Array.isArray(template.documentTypes) ||
      template.documentTypes.length === 0 ||
      !Array.isArray(template.sections) ||
      template.sections.length === 0
    ) {
      throw new Error(
        `Documentation template ${template.id} requires documentTypes and sections.`,
      );
    }

    if (new Set(template.sections).size !== template.sections.length) {
      throw new Error(
        `Documentation template ${template.id} has duplicate section identities.`,
      );
    }

    for (const documentType of template.documentTypes) {
      const existing = templateByType.get(documentType);
      if (existing) {
        throw new Error(
          `Documentation type ${documentType} is assigned to both ${existing.id} and ${template.id} templates.`,
        );
      }
      templateByType.set(documentType, template);
    }
  }

  return templateByType;
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
  const templateByType = buildDocumentationTemplateByType(metadata);

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
    if (!page.type || !page.sourcePath || !page.releaseLine) {
      throw new Error(
        `Documentation page ${page.id} requires type, sourcePath, and releaseLine.`,
      );
    }
    if (!templateByType.has(page.type)) {
      throw new Error(
        `Documentation page ${page.id} has no template for type ${page.type}.`,
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
  const templateByType = buildDocumentationTemplateByType(metadata);
  const referenceModel = buildReferenceModel({ root });
  const releaseGroups = readJson(root, RELEASE_GROUPS_PATH);
  const multiFramework = readJson(root, MULTI_FRAMEWORK_PATH);
  const frameworkIds = (multiFramework.frameworks ?? []).map(
    (framework) => framework.id,
  );
  const releaseLines = Object.entries(releaseGroups.releaseLines ?? {}).map(
    ([id, releaseLine]) => {
      const readiness = releaseLine.documentation?.readiness ?? {};
      for (const frameworkId of frameworkIds) {
        if (!documentationReadinessStates.has(readiness[frameworkId])) {
          throw new Error(
            `Release line ${id} requires valid documentation readiness for ${frameworkId}.`,
          );
        }
      }
      for (const frameworkId of Object.keys(readiness)) {
        if (!frameworkIds.includes(frameworkId)) {
          throw new Error(
            `Release line ${id} declares documentation readiness for unknown framework ${frameworkId}.`,
          );
        }
      }

      return {
        id,
        version: releaseLine.version,
        channel: releaseLine.channel,
        versioningMode: releaseLine.versioning?.mode,
        readiness,
      };
    },
  );
  const releaseLineById = new Map(
    releaseLines.map((releaseLine) => [releaseLine.id, releaseLine]),
  );

  const sectionOrder = new Map(
    metadata.sections.map((section) => [section.id, section.order]),
  );
  const sections = [...metadata.sections].sort((a, b) => a.order - b.order);
  for (const page of metadata.pages) {
    if (!releaseLineById.has(page.releaseLine)) {
      throw new Error(
        `Documentation page ${page.id} references unknown release line ${page.releaseLine}.`,
      );
    }
  }

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
    schemaVersion: 2,
    generatedFrom: [
      DOCUMENTATION_PAGES_PATH,
      RELEASE_GROUPS_PATH,
      MULTI_FRAMEWORK_PATH,
      "docs/generated/reference-model.json",
    ],
    documentationReadinessStates: [...documentationReadinessStates],
    releaseLines,
    documentTypes,
    templates: metadata.templates,
    sections,
    pages: pages.map((page) => {
      const releaseLine = releaseLineById.get(page.releaseLine);
      return {
        ...page,
        template: templateByType.get(page.type).id,
        route: `/${page.id}`,
        availability: frameworkIds.map((framework) => ({
          framework,
          releaseLine: releaseLine.id,
          version: releaseLine.version,
          status: releaseLine.readiness[framework],
        })),
      };
    }),
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
