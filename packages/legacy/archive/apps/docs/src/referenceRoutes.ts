import documentationRegistryRaw from "../../../docs/generated/documentation-registry.json?raw";
import {
  resolveDocumentationDocument,
  type DocumentationAlternative,
  type DocumentationAvailabilityEntry,
  type DocumentationContentLayers,
} from "../../../docs/reference/documentationResolver";
import type { ReferenceFrameworkId } from "../../../docs/reference/referenceRuntime";

export type DocsExampleCategory =
  "basic" | "appearance" | "state" | "composition" | "advanced";

export type DocsExampleImplementation = {
  framework: ReferenceFrameworkId;
  version: string;
  status: DocumentationAvailabilityEntry["status"];
  language: string;
  sourcePath: string;
  runnable: boolean;
  renderable: boolean;
  fixtureId?: string;
  verification: string[];
};

export type DocsExampleRecord = {
  id: string;
  documentId: string;
  title: string;
  category: DocsExampleCategory;
  order: number;
  implementations: DocsExampleImplementation[];
};

export type DocsExampleResolution =
  | {
      available: true;
      implementation: DocsExampleImplementation;
      alternatives: DocsExampleImplementation[];
    }
  | {
      available: false;
      implementation: null;
      alternatives: DocsExampleImplementation[];
    };

export type DocsTemplateId =
  | "component"
  | "foundation"
  | "guide"
  | "pattern"
  | "package"
  | "advanced-module"
  | "release"
  | "example";

export type DocsTemplateDefinition = {
  id: DocsTemplateId;
  label: string;
  documentTypes: string[];
  sections: string[];
};

export type DocsRouteKind =
  | "overview"
  | "markdown"
  | "component-reference"
  | "package-reference"
  | "discovery-reference"
  | "icon-reference"
  | "example"
  | "executable-examples";

export type DocsRoute = {
  id: string;
  route: string;
  title: string;
  section: string;
  group: string;
  order: number;
  type: string;
  template: DocsTemplateId;
  description?: string;
  sourcePath: string;
  tags?: string[];
  kind: DocsRouteKind;
  content?: string;
  exampleId?: string;
  recordDomain?: string;
  availability: DocumentationAvailabilityEntry[];
  contentLayers?: DocumentationContentLayers;
};

export type DocsRouteResolution =
  | {
      available: true;
      status: DocumentationAvailabilityEntry["status"];
      route: DocsRoute;
      alternatives: DocumentationAlternative[];
      context: {
        frameworkId: ReferenceFrameworkId;
        version: string;
      };
    }
  | {
      available: false;
      status: DocumentationAvailabilityEntry["status"];
      route: DocsRoute;
      alternatives: DocumentationAlternative[];
      context: {
        frameworkId: ReferenceFrameworkId;
        version: string;
      };
    };

export type PublicDocsSection = {
  id: string;
  label: string;
  routeIds: string[];
};

export type DocsSearchRecord =
  | {
      id: string;
      kind: "page";
      documentId: string;
      label: string;
      route: string;
      section: string;
      type: string;
      keywords: string[];
      availability: DocumentationAvailabilityEntry[];
    }
  | {
      id: string;
      kind: "api-member";
      documentId: string;
      label: string;
      route: string;
      member: string;
      framework: ReferenceFrameworkId;
      version: string;
      status: DocumentationAvailabilityEntry["status"];
      memberKind: "property" | "event" | "slot" | "method";
      keywords: string[];
    };

type RegistryPage = Omit<DocsRoute, "kind" | "content"> & {
  renderer: DocsRouteKind;
};

type DocumentationRegistry = {
  schemaVersion: 2;
  exampleCategories: DocsExampleCategory[];
  examples: DocsExampleRecord[];
  templates: DocsTemplateDefinition[];
  sections: Array<{
    id: string;
    label: string;
    order: number;
  }>;
  pages: RegistryPage[];
  searchRecords: DocsSearchRecord[];
  indexes: {
    bySection: Array<{ id: string; label: string; documentIds: string[] }>;
    byType: Array<{ type: string; documentIds: string[] }>;
  };
  sitemap: Array<Record<string, unknown>>;
  relatedContentInputs: Array<{
    documentId: string;
    type: string;
    section: string;
    tags: string[];
  }>;
  recordDomains: Array<{
    id: string;
    documentId: string | null;
  }>;
};

const registry = JSON.parse(documentationRegistryRaw) as DocumentationRegistry;

if (registry.schemaVersion !== 2) {
  throw new Error("Unsupported generated Documentation Registry version.");
}

const markdownSources = {
  ...import.meta.glob("../../../docs/**/*.md", {
    query: "?raw",
    import: "default",
    eager: true,
  }),
  ...import.meta.glob("../../../packages/*/README.md", {
    query: "?raw",
    import: "default",
    eager: true,
  }),
} as Record<string, string>;

function markdownContent(sourcePath: string, renderer: DocsRouteKind) {
  if (renderer !== "markdown") return undefined;

  const importKey = `../../../${sourcePath}`;
  const content = markdownSources[importKey];
  if (typeof content !== "string") {
    throw new Error(
      `Generated documentation source is missing markdown content: ${sourcePath}.`,
    );
  }
  return content;
}

function routeFromRegistryPage(page: RegistryPage): DocsRoute {
  return {
    id: page.id,
    route: page.route,
    title: page.title,
    section: page.section,
    group: page.group,
    order: page.order,
    type: page.type,
    template: page.template,
    description: page.description,
    sourcePath: page.sourcePath,
    tags: page.tags,
    kind: page.renderer,
    content: markdownContent(page.sourcePath, page.renderer),
    exampleId: page.exampleId,
    recordDomain: page.recordDomain,
    availability: page.availability,
    contentLayers: page.contentLayers,
  };
}

export const docsRoutes: DocsRoute[] = registry.pages.map(
  routeFromRegistryPage,
);

export const documentationExamples = registry.examples;
export const documentationExampleCategories = registry.exampleCategories;
export const documentationTemplates = registry.templates;
export const documentationSearchRecords = registry.searchRecords;
export const documentationIndexes = registry.indexes;
export const documentationSitemap = registry.sitemap;
export const documentationRelatedContentInputs = registry.relatedContentInputs;
export const documentationRecordRoutes = registry.recordDomains.flatMap(
  (domain) =>
    domain.documentId
      ? [{ domain: domain.id, routeId: domain.documentId }]
      : [],
);

function isExampleImplementationReady(
  implementation: DocsExampleImplementation,
) {
  return (
    implementation.status !== "unavailable" &&
    implementation.status !== "internal-not-ready"
  );
}

export function resolveDocumentationExample(
  exampleId: string,
  frameworkId: ReferenceFrameworkId,
  version: string,
): DocsExampleResolution {
  const example = documentationExamples.find(
    (candidate) => candidate.id === exampleId,
  );
  if (!example) {
    return {
      available: false,
      implementation: null,
      alternatives: [],
    };
  }

  const alternatives = example.implementations.filter(
    isExampleImplementationReady,
  );
  const implementation = example.implementations.find(
    (candidate) =>
      candidate.framework === frameworkId && candidate.version === version,
  );

  if (!implementation || !isExampleImplementationReady(implementation)) {
    return {
      available: false,
      implementation: null,
      alternatives,
    };
  }

  return {
    available: true,
    implementation,
    alternatives,
  };
}

export function getDocumentationTemplate(templateId: DocsTemplateId) {
  const template = documentationTemplates.find(
    (candidate) => candidate.id === templateId,
  );
  if (!template) {
    throw new Error(`Missing generated documentation template ${templateId}.`);
  }
  return template;
}

export const publicDocsSections: PublicDocsSection[] = registry.sections.map(
  (section) => ({
    id: section.id,
    label: section.label,
    routeIds: docsRoutes
      .filter((route) => route.section === section.id)
      .map((route) => route.id),
  }),
);

export function findRouteById(id: string) {
  return docsRoutes.find((route) => route.id === id);
}

export function getRouteById(id: string) {
  return (
    findRouteById(id) ??
    docsRoutes.find((route) => route.id === "overview") ??
    docsRoutes[0]
  );
}

export function resolveDocsRoute(
  route: DocsRoute,
  frameworkId: ReferenceFrameworkId,
  version: string,
): DocsRouteResolution {
  const resolution = resolveDocumentationDocument(
    {
      ...route,
      renderer: route.kind,
    },
    {
      frameworkId,
      version,
    },
  );

  if (!resolution.available) {
    return {
      available: false,
      status: resolution.status,
      route,
      alternatives: resolution.alternatives,
      context: {
        frameworkId,
        version,
      },
    };
  }

  const document = resolution.document;
  const kind = document.renderer as DocsRouteKind;
  return {
    available: true,
    status: resolution.status,
    alternatives: resolution.alternatives,
    context: {
      frameworkId,
      version,
    },
    route: {
      ...route,
      title: document.title,
      description: document.description,
      sourcePath: document.sourcePath,
      tags: document.tags,
      kind,
      content: markdownContent(document.sourcePath, kind),
      exampleId: document.exampleId,
      recordDomain: route.recordDomain,
    },
  };
}
