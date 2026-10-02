import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

export const REFERENCE_MODEL_PATH = "docs/generated/reference-model.json";
export const DOCUMENT_SOURCE_BINDINGS_PATH =
  "apps/docs/src/generatedDocumentSources.ts";

const sourcePaths = {
  portal: "docs/metadata/reference-portal.json",
  publicDocuments: "docs/metadata/public-documents.json",
  publicDocumentsSchema: "docs/metadata/public-documents.schema.json",
  consumerKnowledge: "docs/generated/consumer-knowledge.json",
  frameworkApi: "docs/generated/framework-api-reference.json",
  packages: "docs/metadata/packages.json",
  tokens: "docs/metadata/design-tokens.json",
  patterns: "docs/metadata/patterns.json",
  examples: "docs/metadata/executable-examples.json",
  consumerFixtures: "tests/consumers/manifest.json",
};

const publicDocumentTypes = new Set([
  "guide",
  "component",
  "foundation",
  "pattern",
  "advanced-module",
  "package",
  "migration",
  "example",
]);

const publicDocumentRenderers = new Set([
  "overview",
  "markdown",
  "component-reference",
  "token-reference",
  "pattern-reference",
  "package-reference",
  "example",
  "executable-examples",
]);

const recordDomains = new Set(["components", "packages", "tokens", "patterns"]);
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;

function readJson(root, relativePath) {
  return JSON.parse(readFileSync(path.join(root, relativePath), "utf8"));
}

function requireSource(root, relativePath) {
  if (!existsSync(path.join(root, relativePath))) {
    throw new Error(`Reference model source is missing: ${relativePath}`);
  }
}

function compareText(left, right) {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

function domainRegistry(domainId, ownership) {
  return {
    id: domainId,
    mode: ownership.mode,
    canonicalSources: ownership.canonicalSources ?? [],
    generatedSources: ownership.generatedSources ?? [],
    ownsFacts: ownership.ownsFacts ?? true,
  };
}

function routeTemplate(domainId) {
  const templates = {
    guides: "/guides/{id}",
    components: "/components/{id}",
    packages: "/packages/{id}",
    tokens: "/tokens/{id}",
    patterns: "/patterns/{id}",
    examples: "/examples/{id}",
    accessibility: "/accessibility/{id}",
    search: "/search",
  };
  return templates[domainId];
}

function generatedRecordSource(domainId) {
  const sources = {
    components: {
      path: sourcePaths.consumerKnowledge,
      collection: "components",
      identityField: "id",
      labelField: "displayName",
    },
    packages: {
      path: sourcePaths.consumerKnowledge,
      collection: "packages",
      identityField: "name",
      labelField: "name",
    },
    patterns: {
      path: sourcePaths.consumerKnowledge,
      collection: "patterns",
      identityField: "id",
      labelField: "displayName",
    },
    tokens: {
      path: sourcePaths.tokens,
      collection: "categories",
      identityField: "id",
      labelField: "id",
    },
    examples: {
      path: sourcePaths.examples,
      collection: "frameworks",
      identityField: "fixtureId",
      labelField: "fixtureId",
    },
    accessibility: {
      path: sourcePaths.consumerKnowledge,
      collection: "components",
      identityField: "id",
      labelField: "displayName",
      projection: "accessibility",
    },
  };
  return sources[domainId] ?? null;
}

function buildDocumentRegistry(root, portal, manifest) {
  const failures = [];

  if (portal.routing?.documentManifest !== sourcePaths.publicDocuments) {
    failures.push(
      `reference portal routing.documentManifest must be ${sourcePaths.publicDocuments}`,
    );
  }
  if (
    manifest?.$schema !== "./public-documents.schema.json" ||
    manifest?.schemaVersion !== 1 ||
    manifest?.sourceOfTruth?.canonical !== true
  ) {
    failures.push(
      "public document manifest must declare schemaVersion 1 and canonical source ownership",
    );
  }
  if (!Array.isArray(manifest?.categories) || manifest.categories.length === 0) {
    failures.push("public document manifest must declare categories");
  }
  if (!Array.isArray(manifest?.documents) || manifest.documents.length === 0) {
    failures.push("public document manifest must declare documents");
  }
  if (failures.length > 0) {
    throw new Error(
      `Public document manifest validation failed:\n- ${failures.join("\n- ")}`,
    );
  }

  const categoryIds = new Set();
  const categoryLabels = new Set();
  const categoryOrders = new Set();
  for (const category of manifest.categories) {
    if (!slugPattern.test(category.id ?? "")) {
      failures.push(`invalid public document category id: ${String(category.id)}`);
    }
    if (categoryIds.has(category.id)) {
      failures.push(`duplicate public document category id: ${category.id}`);
    }
    if (categoryLabels.has(category.label)) {
      failures.push(`duplicate public document category label: ${category.label}`);
    }
    if (categoryOrders.has(category.order)) {
      failures.push(`duplicate public document category order: ${category.order}`);
    }
    categoryIds.add(category.id);
    categoryLabels.add(category.label);
    categoryOrders.add(category.order);
  }

  const documentIds = new Set();
  const documentSlugs = new Set();
  const categoryOrdersByDocument = new Set();
  const documents = [];
  for (const document of manifest.documents) {
    if (!slugPattern.test(document.id ?? "")) {
      failures.push(`invalid public document id: ${String(document.id)}`);
    }
    if (!slugPattern.test(document.slug ?? "")) {
      failures.push(
        `invalid public document slug for ${String(document.id)}: ${String(document.slug)}`,
      );
    }
    if (documentIds.has(document.id)) {
      failures.push(`duplicate public document id: ${document.id}`);
    }
    if (documentSlugs.has(document.slug)) {
      failures.push(`duplicate public document slug: ${document.slug}`);
    }
    if (!categoryIds.has(document.category)) {
      failures.push(
        `${document.id}: unknown public document category ${String(document.category)}`,
      );
    }
    if (!Object.hasOwn(portal.contentOwnership ?? {}, document.domain)) {
      failures.push(
        `${document.id}: unknown Reference content domain ${String(document.domain)}`,
      );
    }
    if (!publicDocumentTypes.has(document.type)) {
      failures.push(
        `${document.id}: unsupported public document type ${String(document.type)}`,
      );
    }
    if (!publicDocumentRenderers.has(document.renderer)) {
      failures.push(
        `${document.id}: unsupported public document renderer ${String(document.renderer)}`,
      );
    }
    if (
      document.recordDomain !== undefined &&
      !recordDomains.has(document.recordDomain)
    ) {
      failures.push(
        `${document.id}: unsupported record domain ${String(document.recordDomain)}`,
      );
    }
    if (document.renderer === "example" && !document.exampleId) {
      failures.push(`${document.id}: example renderer requires exampleId`);
    }
    if (!existsSync(path.join(root, document.sourcePath ?? ""))) {
      failures.push(
        `${document.id}: public document source is missing: ${String(document.sourcePath)}`,
      );
    }
    const categoryOrderKey = `${document.category}:${document.order}`;
    if (categoryOrdersByDocument.has(categoryOrderKey)) {
      failures.push(
        `${document.id}: duplicate order ${document.order} in category ${document.category}`,
      );
    }

    documentIds.add(document.id);
    documentSlugs.add(document.slug);
    categoryOrdersByDocument.add(categoryOrderKey);
    documents.push({
      id: document.id,
      slug: document.slug,
      path: `/${document.slug}`,
      title: document.title,
      type: document.type,
      domain: document.domain,
      category: document.category,
      order: document.order,
      description: document.description,
      sourcePath: document.sourcePath,
      renderer: document.renderer,
      exampleId: document.exampleId ?? null,
      recordDomain: document.recordDomain ?? null,
      tags: [...(document.tags ?? [])],
    });
  }

  if (failures.length > 0) {
    throw new Error(
      `Public document manifest validation failed:\n- ${failures
        .sort()
        .join("\n- ")}`,
    );
  }

  const categories = [...manifest.categories]
    .map((category) => ({ ...category }))
    .sort(
      (left, right) =>
        left.order - right.order || compareText(left.id, right.id),
    );
  const categoryOrder = new Map(
    categories.map((category) => [category.id, category.order]),
  );
  documents.sort(
    (left, right) =>
      categoryOrder.get(left.category) - categoryOrder.get(right.category) ||
      left.order - right.order ||
      compareText(left.id, right.id),
  );

  return {
    schemaVersion: 1,
    source: sourcePaths.publicDocuments,
    categories,
    documents,
  };
}

export function buildReferenceModel({ root = repositoryRoot } = {}) {
  Object.values(sourcePaths).forEach((relativePath) =>
    requireSource(root, relativePath),
  );

  const portal = readJson(root, sourcePaths.portal);
  const publicDocuments = readJson(root, sourcePaths.publicDocuments);
  const knowledge = readJson(root, sourcePaths.consumerKnowledge);
  const frameworkApi = readJson(root, sourcePaths.frameworkApi);
  const examples = readJson(root, sourcePaths.examples);

  if (portal.product?.id !== "vyrnforge-reference") {
    throw new Error("Reference portal must identify vyrnforge-reference.");
  }
  if (knowledge.schemaVersion !== 1) {
    throw new Error(
      "Unsupported consumer knowledge schema for Reference model.",
    );
  }
  if (!frameworkApi.surfaces) {
    throw new Error("Framework API reference must expose framework surfaces.");
  }

  const frameworkOrder = Object.keys(portal.frameworks);
  const frameworkApiSurface = {
    "native-html": "native",
    react: "react",
    angular: "angular",
    vue: "vue",
  };
  const frameworks = frameworkOrder.map((id) => {
    const presentation = portal.frameworks[id];
    const apiSurface = frameworkApiSurface[id];
    return {
      id,
      label: presentation.label,
      language: presentation.language,
      apiSurface,
      apiSource: sourcePaths.frameworkApi,
      exampleFixture: examples.frameworks?.[id]?.fixtureId ?? null,
      exampleEntrypoint: examples.frameworks?.[id]?.entrypoint ?? null,
      contextParameter: portal.context.framework.queryParameter,
    };
  });

  const domains = Object.entries(portal.contentOwnership).map(
    ([id, ownership]) => ({
      ...domainRegistry(id, ownership),
      routeTemplate: routeTemplate(id),
      recordSource: generatedRecordSource(id),
    }),
  );

  const navigation = portal.navigation.sections.map((section, index) => ({
    id: section.id,
    label: section.label,
    order: index,
    contentDomains: section.contentDomains,
  }));
  const documentRegistry = buildDocumentRegistry(root, portal, publicDocuments);

  return {
    schemaVersion: 1,
    product: {
      id: portal.product.id,
      label: portal.product.label,
      semanticOwnership: portal.product.semanticOwnership,
      implementationHost: portal.product.implementationHost,
    },
    generatedFrom: [
      sourcePaths.portal,
      sourcePaths.publicDocuments,
      sourcePaths.publicDocumentsSchema,
      sourcePaths.consumerKnowledge,
      sourcePaths.frameworkApi,
      sourcePaths.packages,
      sourcePaths.tokens,
      sourcePaths.patterns,
      sourcePaths.examples,
      sourcePaths.consumerFixtures,
    ],
    navigation,
    domains,
    documentRegistry,
    frameworks,
    versionContext: {
      catalog: portal.versionCatalog,
      selection: portal.context.version.selection,
      preserveFrameworkContext: portal.context.version.preserveFrameworkContext,
    },
    apiFacts: {
      authority: sourcePaths.frameworkApi,
      canonicalAuthority: "docs/metadata/component-contracts.json",
      surfaces: frameworks.map(({ id, apiSurface }) => ({ id, apiSurface })),
    },
    tokenData: {
      authority: sourcePaths.tokens,
      runtimeStyles: portal.contentOwnership.tokens.canonicalSources.filter(
        (entry) => entry.startsWith("packages/"),
      ),
    },
    examples: frameworks.map((framework) => ({
      id: framework.exampleFixture,
      framework: framework.id,
      entrypoint: framework.exampleEntrypoint,
      registry: sourcePaths.examples,
      consumerManifest: sourcePaths.consumerFixtures,
    })),
    search: {
      ownsFacts: false,
      records: domains
        .filter((domain) => domain.id !== "search")
        .map((domain) => ({
          id: `domain:${domain.id}`,
          kind: "domain",
          domain: domain.id,
          label:
            portal.navigation.sections.find((section) =>
              section.contentDomains.includes(domain.id),
            )?.label ?? domain.id,
          routeTemplate: domain.routeTemplate,
          recordSource: domain.recordSource,
        })),
    },
    deepLinks: {
      transport: portal.routing.transport,
      identity: portal.routing.identity,
      stable: portal.routing.stableDeepLinks,
      preserveContext: portal.routing.preserveContext,
      templates: Object.fromEntries(
        domains.map((domain) => [domain.id, domain.routeTemplate]),
      ),
    },
    transitionalRegistries: portal.routing.transitionalRegistries,
  };
}

export function serializeReferenceModel(model) {
  return `${JSON.stringify(model, null, 2)}\n`;
}

export function serializeDocumentSourceBindings(model) {
  const markdownDocuments = model.documentRegistry.documents.filter(
    (document) => document.renderer === "markdown",
  );
  const imports = markdownDocuments.map(
    (document, index) =>
      `import document${index} from "../../../${document.sourcePath}?raw";`,
  );
  const entries = markdownDocuments.map(
    (document, index) => `    "${document.id}": document${index},`,
  );

  return [
    "// Generated by scripts/generate-reference-model.mjs. Do not edit.",
    ...imports,
    "",
    "export const publicDocumentMarkdownById: Readonly<Record<string, string>> =",
    "  Object.freeze({",
    ...entries,
    "  });",
    "",
  ].join("\n");
}

function writeGeneratedText(root, relativePath, content) {
  const outputPath = path.join(root, relativePath);
  mkdirSync(path.dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, content, "utf8");
}

function verifyGeneratedText(root, relativePath, expected) {
  const outputPath = path.join(root, relativePath);
  if (!existsSync(outputPath)) {
    throw new Error(
      `${relativePath} is missing; run node scripts/generate-reference-model.mjs.`,
    );
  }
  const actual = readFileSync(outputPath, "utf8").replace(/\r\n?/gu, "\n");
  if (actual !== expected.replace(/\r\n?/gu, "\n")) {
    throw new Error(
      `${relativePath} is stale; run node scripts/generate-reference-model.mjs.`,
    );
  }
}

export function writeReferenceModel({ root = repositoryRoot } = {}) {
  const model = buildReferenceModel({ root });
  writeGeneratedText(root, REFERENCE_MODEL_PATH, serializeReferenceModel(model));
  writeGeneratedText(
    root,
    DOCUMENT_SOURCE_BINDINGS_PATH,
    serializeDocumentSourceBindings(model),
  );
  return model;
}

export function verifyReferenceModel({ root = repositoryRoot } = {}) {
  const model = buildReferenceModel({ root });
  verifyGeneratedText(root, REFERENCE_MODEL_PATH, serializeReferenceModel(model));
  verifyGeneratedText(
    root,
    DOCUMENT_SOURCE_BINDINGS_PATH,
    serializeDocumentSourceBindings(model),
  );
  return model;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const checkOnly = process.argv.includes("--check");
  const model = checkOnly ? verifyReferenceModel() : writeReferenceModel();
  console.log(
    `${REFERENCE_MODEL_PATH} ${checkOnly ? "is current" : "generated"} with ${model.domains.length} domains, ${model.frameworks.length} frameworks, ${model.navigation.length} navigation sections, and ${model.documentRegistry.documents.length} public documents.`,
  );
}
