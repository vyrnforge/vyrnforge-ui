import documentationRegistryRaw from "../../../docs/generated/documentation-registry.json?raw";
import {
  resolveDocumentationDocument,
  type DocumentationAlternative,
  type DocumentationAvailabilityEntry,
  type DocumentationContentLayers,
} from "../../../docs/reference/documentationResolver";
import type {
  ReferenceFrameworkId,
} from "../../../docs/reference/referenceRuntime";

export type DocsRouteKind =
  | "overview"
  | "markdown"
  | "component-reference"
  | "package-reference"
  | "discovery-reference"
  | "example"
  | "executable-examples";

export type DocsRoute = {
  id: string;
  title: string;
  section: string;
  group: string;
  order: number;
  type: string;
  description?: string;
  sourcePath: string;
  tags?: string[];
  kind: DocsRouteKind;
  content?: string;
  exampleId?: string;
  availability: DocumentationAvailabilityEntry[];
  contentLayers?: DocumentationContentLayers;
};

export type DocsRouteResolution =
  | {
      available: true;
      status: DocumentationAvailabilityEntry["status"];
      route: DocsRoute;
      alternatives: DocumentationAlternative[];
    }
  | {
      available: false;
      status: DocumentationAvailabilityEntry["status"];
      route: DocsRoute;
      alternatives: DocumentationAlternative[];
    };

export type PublicDocsSection = {
  id: string;
  label: string;
  routeIds: string[];
};

type RegistryPage = Omit<DocsRoute, "kind" | "content"> & {
  renderer: DocsRouteKind;
};

type DocumentationRegistry = {
  schemaVersion: 2;
  sections: Array<{
    id: string;
    label: string;
    order: number;
  }>;
  pages: RegistryPage[];
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
    title: page.title,
    section: page.section,
    group: page.group,
    order: page.order,
    type: page.type,
    description: page.description,
    sourcePath: page.sourcePath,
    tags: page.tags,
    kind: page.renderer,
    content: markdownContent(page.sourcePath, page.renderer),
    exampleId: page.exampleId,
    availability: page.availability,
    contentLayers: page.contentLayers,
  };
}

export const docsRoutes: DocsRoute[] =
  registry.pages.map(routeFromRegistryPage);

export const publicDocsSections: PublicDocsSection[] = registry.sections.map(
  (section) => ({
    id: section.id,
    label: section.label,
    routeIds: docsRoutes
      .filter((route) => route.section === section.id)
      .map((route) => route.id),
  }),
);

export function getRouteById(id: string) {
  return (
    docsRoutes.find((route) => route.id === id) ??
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
    };
  }

  const document = resolution.document;
  const kind = document.renderer as DocsRouteKind;
  return {
    available: true,
    status: resolution.status,
    alternatives: resolution.alternatives,
    route: {
      ...route,
      title: document.title,
      description: document.description,
      sourcePath: document.sourcePath,
      tags: document.tags,
      kind,
      content: markdownContent(document.sourcePath, kind),
      exampleId: document.exampleId,
    },
  };
}
