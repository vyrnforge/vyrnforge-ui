import documentationRegistryRaw from "../../../docs/generated/documentation-registry.json?raw";
import {
  resolveDocumentationPage,
  type DocumentationAvailability,
  type DocumentationLayer,
  type DocumentationResolutionContext,
} from "../../../docs/reference/documentationResolver";
import type { DocumentationReadinessStatus } from "../../../docs/reference/documentationAvailability";

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
  releaseLine: string;
  availability: DocumentationAvailability[];
  unavailableStatus?: DocumentationReadinessStatus;
  unavailableAlternatives?: DocumentationAvailability[];
};

export type PublicDocsSection = {
  id: string;
  label: string;
  routeIds: string[];
};

type RegistryPage = Omit<
  DocsRoute,
  "kind" | "content" | "unavailableStatus" | "unavailableAlternatives"
> & {
  renderer: DocsRouteKind;
  layers?: {
    frameworks?: Record<string, DocumentationLayer>;
    versions?: Record<string, DocumentationLayer>;
    frameworkVersions?: Record<string, DocumentationLayer>;
  };
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

function markdownContent(page: RegistryPage) {
  if (page.renderer !== "markdown") return undefined;

  const importKey = `../../../${page.sourcePath}`;
  const content = markdownSources[importKey];
  if (typeof content !== "string") {
    throw new Error(
      `Generated documentation page ${page.id} is missing markdown source ${page.sourcePath}.`,
    );
  }
  return content;
}

function routeFromPage(page: RegistryPage): DocsRoute {
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
    content: markdownContent(page),
    exampleId: page.exampleId,
    releaseLine: page.releaseLine,
    availability: page.availability,
  };
}

export const docsRoutes: DocsRoute[] = registry.pages.map(routeFromPage);

export const publicDocsSections: PublicDocsSection[] = registry.sections.map(
  (section) => ({
    id: section.id,
    label: section.label,
    routeIds: docsRoutes
      .filter((route) => route.section === section.id)
      .map((route) => route.id),
  }),
);

function getRegistryPageById(id: string) {
  return (
    registry.pages.find((page) => page.id === id) ??
    registry.pages.find((page) => page.id === "overview") ??
    registry.pages[0]
  );
}

export function getRouteById(id: string) {
  const page = getRegistryPageById(id);
  return page ? routeFromPage(page) : undefined;
}

export function getResolvedRouteById(
  id: string,
  context: DocumentationResolutionContext,
) {
  const page = getRegistryPageById(id);
  if (!page) return undefined;

  const resolution = resolveDocumentationPage(page, context);
  if (resolution.kind === "unavailable") {
    return {
      ...routeFromPage(page),
      unavailableStatus: resolution.status,
      unavailableAlternatives: resolution.alternatives,
    };
  }

  return routeFromPage(resolution.document as RegistryPage);
}
