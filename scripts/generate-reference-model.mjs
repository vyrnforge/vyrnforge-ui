import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

export const REFERENCE_MODEL_PATH = "docs/generated/reference-model.json";

const sourcePaths = {
  portal: "docs/metadata/reference-portal.json",
  consumerKnowledge: "docs/generated/consumer-knowledge.json",
  frameworkApi: "docs/generated/framework-api-reference.json",
  packages: "docs/metadata/packages.json",
  tokens: "docs/metadata/design-tokens.json",
  patterns: "docs/metadata/patterns.json",
  examples: "docs/metadata/executable-examples.json",
  consumerFixtures: "tests/consumers/manifest.json",
};

function readJson(root, relativePath) {
  return JSON.parse(readFileSync(path.join(root, relativePath), "utf8"));
}

function requireSource(root, relativePath) {
  if (!existsSync(path.join(root, relativePath))) {
    throw new Error(`Reference model source is missing: ${relativePath}`);
  }
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
      labelField: "name",
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
      labelField: "name",
      projection: "accessibility",
    },
  };
  return sources[domainId] ?? null;
}

export function buildReferenceModel({ root = repositoryRoot } = {}) {
  Object.values(sourcePaths).forEach((relativePath) =>
    requireSource(root, relativePath),
  );

  const portal = readJson(root, sourcePaths.portal);
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
    frameworks,
    frameworkContext: {
      default: portal.context.framework.default,
      queryParameter: portal.context.framework.queryParameter,
      preserveAcrossSurfaces: portal.context.framework.preserveAcrossSurfaces,
    },
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

export function writeReferenceModel({ root = repositoryRoot } = {}) {
  const model = buildReferenceModel({ root });
  const outputPath = path.join(root, REFERENCE_MODEL_PATH);
  mkdirSync(path.dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, serializeReferenceModel(model), "utf8");
  return model;
}

export function verifyReferenceModel({ root = repositoryRoot } = {}) {
  const model = buildReferenceModel({ root });
  const outputPath = path.join(root, REFERENCE_MODEL_PATH);
  if (!existsSync(outputPath)) {
    throw new Error(
      `${REFERENCE_MODEL_PATH} is missing; run node scripts/generate-reference-model.mjs.`,
    );
  }
  const actual = readFileSync(outputPath, "utf8").replace(/\r\n?/gu, "\n");
  const expected = serializeReferenceModel(model).replace(/\r\n?/gu, "\n");
  if (actual !== expected) {
    throw new Error(
      `${REFERENCE_MODEL_PATH} is stale; run node scripts/generate-reference-model.mjs.`,
    );
  }
  return model;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const checkOnly = process.argv.includes("--check");
  const model = checkOnly ? verifyReferenceModel() : writeReferenceModel();
  console.log(
    `${REFERENCE_MODEL_PATH} ${checkOnly ? "is current" : "generated"} with ${model.domains.length} domains, ${model.frameworks.length} frameworks, and ${model.navigation.length} navigation sections.`,
  );
}
