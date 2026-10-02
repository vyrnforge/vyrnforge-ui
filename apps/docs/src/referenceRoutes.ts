import documentationRegistryRaw from "../../../docs/generated/documentation-registry.json?raw";

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

export const docsRoutes: DocsRoute[] = registry.pages.map((page) => ({
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
}));

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
