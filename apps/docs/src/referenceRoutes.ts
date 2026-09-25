import accessibilityRaw from "../../../docs/architecture/05-accessibility-standards.md?raw";
import themingRaw from "../../../docs/architecture/03-theming-and-styling.md?raw";
import dataGridRaw from "../../../docs/packages/ui-data-grid.md?raw";
import setupRaw from "../../../docs/api/import-and-setup.md?raw";
import overviewRaw from "../../../docs/README.md?raw";
import migrationRaw from "../../../docs/release/multi-framework-migration-and-limitations.md?raw";

export type DocsRouteKind =
  | "markdown"
  | "component-reference"
  | "package-reference"
  | "unified-example"
  | "framework-examples";

export type DocsRoute = {
  id: string;
  title: string;
  group: string;
  description?: string;
  sourcePath: string;
  tags?: string[];
  kind?: DocsRouteKind;
  content?: string;
  exampleId?: string;
};

export type PublicDocsSection = {
  id: "start" | "components" | "foundations" | "guides" | "data" | "reference";
  label: string;
  routeIds: string[];
};

type PublicGuide = {
  id: string;
  title: string;
  group: string;
  description: string;
  sourcePath: string;
  content: string;
  tags: string[];
};

const publicGuides: PublicGuide[] = [
  {
    id: "overview",
    title: "Overview",
    group: "Start",
    description: "What VyrnForge is and how to navigate the documentation.",
    sourcePath: "docs/README.md",
    content: overviewRaw,
    tags: ["overview", "start"],
  },
  {
    id: "getting-started",
    title: "Getting Started",
    group: "Start",
    description:
      "Install VyrnForge and choose the Native HTML, React, Angular, or Vue surface.",
    sourcePath: "docs/api/import-and-setup.md",
    content: setupRaw,
    tags: ["install", "setup", "frameworks"],
  },
  {
    id: "theming",
    title: "Theming & Styling",
    group: "Foundations",
    description:
      "Customize VyrnForge with shared semantic tokens, themes, density, and CSS.",
    sourcePath: "docs/architecture/03-theming-and-styling.md",
    content: themingRaw,
    tags: ["theming", "tokens", "css"],
  },
  {
    id: "accessibility",
    title: "Accessibility",
    group: "Foundations",
    description:
      "Understand the shared accessibility, keyboard, focus, and assistive-technology baseline.",
    sourcePath: "docs/architecture/05-accessibility-standards.md",
    content: accessibilityRaw,
    tags: ["accessibility", "keyboard", "focus"],
  },
  {
    id: "data-grid",
    title: "Data Grid Guide",
    group: "Data & Grid",
    description:
      "Use the specialized React data-grid package without treating it as the whole VyrnForge library.",
    sourcePath: "docs/packages/ui-data-grid.md",
    content: dataGridRaw,
    tags: ["data", "grid", "react"],
  },
  {
    id: "releases",
    title: "Releases & Migration",
    group: "Reference",
    description:
      "Understand release channels, framework support, limitations, and upgrade guidance.",
    sourcePath: "docs/release/multi-framework-migration-and-limitations.md",
    content: migrationRaw,
    tags: ["release", "migration", "compatibility"],
  },
];

const generatedRoutes: DocsRoute[] = [
  {
    id: "framework-examples",
    title: "Framework Examples",
    group: "Start",
    description:
      "Inspect CI-verified Native HTML, React, Angular, and Vue packed-consumer examples.",
    sourcePath: "docs/metadata/executable-examples.json",
    tags: ["examples", "native", "react", "angular", "vue"],
    kind: "framework-examples",
  },
  {
    id: "component-reference",
    title: "Components",
    group: "Components",
    description:
      "Browse component usage, framework variants, API, accessibility, styling, and live examples.",
    sourcePath: "docs/generated/consumer-knowledge.json",
    tags: ["components", "api", "examples"],
    kind: "component-reference",
  },
  {
    id: "token-reference",
    title: "Design Tokens",
    group: "Foundations",
    description: "Browse shared VyrnForge token categories and styling roles.",
    sourcePath: "docs/metadata/design-tokens.json",
    tags: ["tokens", "design-system"],
  },
  ...[
    ["theme-modes", "Theme Modes"],
    ["density", "Density"],
    ["css-overrides", "CSS Overrides"],
  ].map(([id, title]) => ({
    id,
    title,
    group: "Foundations",
    description: `Interactive ${title.toLowerCase()} examples rendered directly inside Docs.`,
    sourcePath: `apps/docs/src/examples/foundations/${title.split(" ").join("")}Example.tsx`,
    tags: ["foundations", "examples"],
    kind: "unified-example" as const,
    exampleId: id,
  })),
  {
    id: "pattern-reference",
    title: "Patterns",
    group: "Guides",
    description:
      "Browse reusable VyrnForge composition patterns with live Docs examples.",
    sourcePath: "docs/metadata/patterns.json",
    tags: ["patterns", "composition", "examples"],
  },
  ...[
    ["grid-basic", "Basic Grid"],
    ["grid-columns", "Columns"],
    ["grid-filtering", "Filtering"],
    ["grid-grouping", "Grouping"],
    ["grid-resizing", "Resizing"],
    ["grid-selection", "Selection"],
    ["grid-states", "States"],
    ["grid-themes", "Themes"],
  ].map(([id, title]) => ({
    id,
    title,
    group: "Data & Grid",
    description: `Interactive ${title.toLowerCase()} example for UniversalDataGrid.`,
    sourcePath: "apps/docs/src/examples/data-grid/",
    tags: ["data", "grid", "examples"],
    kind: "unified-example" as const,
    exampleId: id,
  })),
  {
    id: "package-reference",
    title: "Packages",
    group: "Reference",
    description:
      "Understand package responsibilities, public entrypoints, and release tracks.",
    sourcePath: "docs/metadata/packages.json",
    tags: ["packages", "api"],
    kind: "package-reference",
  },
];

export const publicDocsSections: PublicDocsSection[] = [
  {
    id: "start",
    label: "Start",
    routeIds: ["overview", "getting-started", "framework-examples"],
  },
  {
    id: "components",
    label: "Components",
    routeIds: ["component-reference"],
  },
  {
    id: "foundations",
    label: "Foundations",
    routeIds: [
      "theming",
      "token-reference",
      "theme-modes",
      "density",
      "css-overrides",
      "accessibility",
    ],
  },
  {
    id: "guides",
    label: "Guides & Patterns",
    routeIds: ["pattern-reference"],
  },
  {
    id: "data",
    label: "Data & Grid",
    routeIds: [
      "data-grid",
      "grid-basic",
      "grid-columns",
      "grid-filtering",
      "grid-grouping",
      "grid-resizing",
      "grid-selection",
      "grid-states",
      "grid-themes",
    ],
  },
  {
    id: "reference",
    label: "API & Releases",
    routeIds: ["package-reference", "releases"],
  },
];

function guideRoute(guide: PublicGuide): DocsRoute {
  return { ...guide, kind: "markdown" };
}

function uniqueRoutes(routes: DocsRoute[]) {
  const byId = new Map<string, DocsRoute>();
  for (const route of routes) {
    if (byId.has(route.id)) {
      throw new Error(`Duplicate VyrnForge Docs route id: ${route.id}`);
    }
    byId.set(route.id, route);
  }
  return [...byId.values()];
}

export const docsRoutes = uniqueRoutes([
  ...publicGuides.map(guideRoute),
  ...generatedRoutes,
]);

export function getRouteById(id: string) {
  return (
    docsRoutes.find((route) => route.id === id) ??
    docsRoutes.find((route) => route.id === "overview") ??
    docsRoutes[0]
  );
}
