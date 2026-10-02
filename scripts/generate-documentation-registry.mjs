import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { buildFrameworkApiReference } from "./generate-framework-api-reference.mjs";
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
export const EXECUTABLE_EXAMPLES_PATH =
  "docs/metadata/executable-examples.json";

const documentationExampleCategories = new Set([
  "basic",
  "appearance",
  "state",
  "composition",
  "advanced",
]);

const documentationExampleLanguage = {
  "native-html": "html-typescript",
  react: "tsx",
  angular: "angular-typescript-template",
  vue: "vue-sfc-typescript",
};

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

function memberAnchor(kind, name) {
  return `api-${kind}-${name
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-|-$/gu, "")}`;
}

function apiSearchRecords(referenceModel, frameworkApiReference, componentPage) {
  if (!componentPage) return [];

  const releaseAvailability = new Map(
    componentPage.availability.map((entry) => [entry.framework, entry]),
  );

  return referenceModel.frameworks.flatMap((framework) => {
    const surface = frameworkApiReference.surfaces[framework.apiSurface];
    if (!surface) return [];
    const availability = releaseAvailability.get(framework.id);
    if (!availability) return [];

    return surface.components.flatMap((component) => {
      const members = [
        ...component.properties.map((member) => ({
          kind: "property",
          name: member.public,
          keywords: [member.binding, member.type, "input"],
        })),
        ...component.events.map((member) => ({
          kind: "event",
          name: member.public,
          keywords: [member.mode, member.detail, "output", "emit"],
        })),
        ...component.slots.map((member) => ({
          kind: "slot",
          name: member.public,
          keywords: [member.mode, member.content, "template"],
        })),
        ...component.methods.map((member) => ({
          kind: "method",
          name: member.name,
          keywords: [
            member.returns,
            ...member.parameters.flatMap((parameter) => [
              parameter.name,
              parameter.type,
            ]),
          ],
        })),
      ];

      return members.map((member) => ({
        id: `api:${framework.id}:${component.id}:${member.kind}:${member.name}`,
        kind: "api-member",
        documentId: componentPage.id,
        label: `${component.id}.${member.name}`,
        route: `/components/${encodeURIComponent(component.id)}`,
        member: memberAnchor(member.kind, member.name),
        framework: framework.id,
        version: availability.version,
        status: availability.status,
        memberKind: member.kind,
        keywords: [
          component.id,
          framework.id,
          framework.label,
          member.kind,
          member.name,
          ...member.keywords,
        ].map((keyword) => keyword.toLowerCase()),
      }));
    });
  });
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
    if (
      (page.renderer === "example" ||
        page.renderer === "executable-examples") &&
      (!page.exampleId ||
        !documentationExampleCategories.has(page.exampleCategory))
    ) {
      throw new Error(
        `Documentation example page ${page.id} requires exampleId and a valid exampleCategory.`,
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
  const executableExamples = readJson(root, EXECUTABLE_EXAMPLES_PATH);
  const frameworkApiReference = buildFrameworkApiReference({ root });
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

  const documentationExamples = pages
    .filter((page) => page.exampleId)
    .map((page) => {
      const releaseLine = releaseLineById.get(page.releaseLine);
      const implementations =
        page.renderer === "executable-examples"
          ? frameworkIds.map((framework) => {
              const evidence = executableExamples.frameworks?.[framework];
              if (!evidence) {
                throw new Error(
                  `Executable documentation example ${page.exampleId} is missing ${framework} evidence.`,
                );
              }
              const sourcePath = `${evidence.directory}/${evidence.entrypoint}`;
              if (!existsSync(path.join(root, sourcePath))) {
                throw new Error(
                  `Executable documentation example ${page.exampleId} source is missing: ${sourcePath}`,
                );
              }
              return {
                framework,
                version: releaseLine.version,
                status: releaseLine.readiness[framework],
                language: documentationExampleLanguage[framework],
                sourcePath,
                runnable: true,
                renderable: true,
                fixtureId: evidence.fixtureId,
                verification: evidence.verification,
              };
            })
          : [
              {
                framework: "react",
                version: releaseLine.version,
                status: releaseLine.readiness.react,
                language: documentationExampleLanguage.react,
                sourcePath: page.sourcePath,
                runnable: true,
                renderable: true,
                verification: ["docs-host"],
              },
            ];

      return {
        id: page.exampleId,
        documentId: page.id,
        title: page.title,
        category: page.exampleCategory,
        order: page.order,
        implementations,
      };
    });

  assertUnique(documentationExamples, "id", "documentation example");

  const documentTypes = [
    ...new Set([
      ...pages.map((page) => page.type),
      ...recordDomains.map((domain) => domain.type),
    ]),
  ].sort();

  const generatedPages = pages.map((page) => {
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
  });
  const componentPage = generatedPages.find(
    (page) => page.id === "component-reference",
  );
  const searchRecords = [
    ...generatedPages.map((page) => ({
      id: `page:${page.id}`,
      kind: "page",
      documentId: page.id,
      label: page.title,
      route: page.route,
      section: page.section,
      type: page.type,
      keywords: [
        page.title,
        page.description ?? "",
        page.group,
        ...(page.tags ?? []),
      ]
        .filter(Boolean)
        .map((keyword) => keyword.toLowerCase()),
      availability: page.availability,
    })),
    ...apiSearchRecords(referenceModel, frameworkApiReference, componentPage),
  ];
  const indexes = {
    bySection: sections.map((section) => ({
      id: section.id,
      label: section.label,
      documentIds: generatedPages
        .filter((page) => page.section === section.id)
        .map((page) => page.id),
    })),
    byType: documentTypes.map((type) => ({
      type,
      documentIds: generatedPages
        .filter((page) => page.type === type)
        .map((page) => page.id),
    })),
  };
  const sitemap = [
    ...generatedPages.flatMap((page) =>
      page.availability.map((availability) => ({
        id: `page:${availability.framework}:${availability.version}:${page.id}`,
        documentId: page.id,
        route: page.route,
        framework: availability.framework,
        version: availability.version,
        status: availability.status,
      })),
    ),
    ...searchRecords
      .filter((record) => record.kind === "api-member")
      .map((record) => ({
        id: record.id,
        documentId: record.documentId,
        route: record.route,
        member: record.member,
        framework: record.framework,
        version: record.version,
        status: record.status,
      })),
  ];
  const relatedContentInputs = generatedPages.map((page) => ({
    documentId: page.id,
    type: page.type,
    section: page.section,
    tags: page.tags ?? [],
  }));

  return {
    schemaVersion: 2,
    generatedFrom: [
      DOCUMENTATION_PAGES_PATH,
      RELEASE_GROUPS_PATH,
      MULTI_FRAMEWORK_PATH,
      EXECUTABLE_EXAMPLES_PATH,
      "docs/generated/reference-model.json",
      "docs/metadata/component-contracts.json",
      "docs/metadata/framework-exceptions.json",
    ],
    documentationReadinessStates: [...documentationReadinessStates],
    exampleCategories: [...documentationExampleCategories],
    releaseLines,
    documentTypes,
    templates: metadata.templates,
    sections,
    examples: documentationExamples,
    pages: generatedPages,
    recordDomains,
    searchRecords,
    indexes,
    sitemap,
    relatedContentInputs,
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
