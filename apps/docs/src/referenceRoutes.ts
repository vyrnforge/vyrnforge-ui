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
  | "example"
  | "executable-examples";

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
  id:
    | "start"
    | "components"
    | "foundations"
    | "patterns"
    | "data-grid"
    | "api"
    | "releases";
  label: string;
  routeIds: string[];
};

const docs: DocsRoute[] = [
  {
    id: "overview",
    title: "Overview",
    group: "Getting Started",
    description: "What VyrnForge is and how to navigate the documentation.",
    sourcePath: "docs/README.md",
    content: overviewRaw,
    tags: ["overview", "start"],
    kind: "markdown",
  },
  {
    id: "getting-started",
    title: "Getting Started",
    group: "Getting Started",
    description:
      "Install VyrnForge and choose the Native HTML, React, Angular, or Vue surface.",
    sourcePath: "docs/api/import-and-setup.md",
    content: setupRaw,
    tags: ["install", "setup", "frameworks"],
    kind: "markdown",
  },
  {
    id: "executable-examples",
    title: "Framework Examples",
    group: "Getting Started",
    description:
      "Inspect the verified packed-consumer example for the selected framework.",
    sourcePath: "tests/consumers/manifest.json",
    tags: ["examples", "native", "react", "angular", "vue"],
    kind: "executable-examples",
  },
  {
    id: "component-reference",
    title: "Components",
    group: "Components",
    description:
      "Browse component usage, framework variants, API, accessibility, styling, and related guidance.",
    sourcePath: "docs/generated/consumer-knowledge.json",
    tags: ["components", "api"],
    kind: "component-reference",
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
    kind: "markdown",
  },
  {
    id: "token-reference",
    title: "Design Tokens",
    group: "Foundations",
    description: "Browse shared VyrnForge token categories and styling roles.",
    sourcePath: "docs/metadata/design-tokens.json",
    tags: ["tokens", "design-system"],
  },
  {
    id: "theme-modes",
    title: "Theme Modes",
    group: "Foundations",
    description:
      "Interactive light, dark, enterprise, and system theme behavior.",
    sourcePath: "apps/docs/src/examples/pages/core/ThemeModesPage.tsx",
    kind: "example",
    exampleId: "theme-modes",
  },
  {
    id: "density",
    title: "Density",
    group: "Foundations",
    description:
      "Interactive compact, standard, and comfortable density examples.",
    sourcePath: "apps/docs/src/examples/pages/core/DensityPage.tsx",
    kind: "example",
    exampleId: "density",
  },
  {
    id: "css-overrides",
    title: "CSS Overrides",
    group: "Foundations",
    description:
      "Global VyrnForge overrides, local scopes, and grid-specific overrides.",
    sourcePath: "apps/docs/src/examples/pages/core/CssOverridePage.tsx",
    kind: "example",
    exampleId: "css-overrides",
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
    kind: "markdown",
  },
  {
    id: "pattern-reference",
    title: "Pattern Catalog",
    group: "Patterns",
    description: "Browse reusable VyrnForge composition patterns.",
    sourcePath: "docs/metadata/patterns.json",
    tags: ["patterns", "composition"],
  },
  ...[
    [
      "pattern-resource-list",
      "Resource List",
      "Compact resource lists with metadata and actions.",
    ],
    ["pattern-detail", "Detail Page", "Entity detail composition."],
    ["pattern-settings", "Settings", "Sectioned settings composition."],
    ["pattern-form", "Form", "General application form composition."],
    ["pattern-filter-form", "Filter Form", "Operational filter composition."],
    ["pattern-assignments", "Assignment Patterns", "Bounded assignment flows."],
    [
      "pattern-feedback-states",
      "Empty, Error & Loading",
      "Route-level feedback states.",
    ],
    ["pattern-admin-shell", "Admin Shell", "Admin workspace composition."],
    [
      "pattern-customer-portal",
      "Customer Portal Shell",
      "Customer portal composition.",
    ],
  ].map(([id, title, description]) => ({
    id,
    title,
    group: "Patterns",
    description,
    sourcePath: "apps/docs/src/examples/pages/patterns",
    kind: "example" as const,
    exampleId: id,
  })),
  {
    id: "data-grid",
    title: "Data Grid Guide",
    group: "Data & Grid",
    description:
      "Use the specialized React data-grid package without treating it as the whole VyrnForge library.",
    sourcePath: "docs/packages/ui-data-grid.md",
    content: dataGridRaw,
    tags: ["data", "grid", "react"],
    kind: "markdown",
  },
  ...[
    [
      "grid-basic",
      "Basic Grid",
      "Rows, columns, search, sort, and pagination.",
    ],
    [
      "grid-columns",
      "Column Management",
      "Visibility, order, density, and reset behavior.",
    ],
    ["grid-filtering", "Filtering", "Search and filter state examples."],
    [
      "grid-selection",
      "Selection",
      "Selectable rows, disabled rows, and bulk actions.",
    ],
    ["grid-grouping", "Grouping", "Client-side grouping examples."],
    [
      "grid-resizing",
      "Column Resizing",
      "Resizable columns and horizontal overflow.",
    ],
    ["grid-themes", "Grid Themes", "Theme and shared-token alignment."],
    ["grid-states", "Grid States", "Empty, error, and loading states."],
    [
      "grid-stress",
      "Stress Grid",
      "Many rows and columns without virtualization.",
    ],
  ].map(([id, title, description]) => ({
    id,
    title,
    group: "Data & Grid",
    description,
    sourcePath: "apps/docs/src/examples/pages/data-grid",
    kind: "example" as const,
    exampleId: id,
  })),
  {
    id: "package-reference",
    title: "Packages & API",
    group: "API / Packages",
    description:
      "Understand package responsibilities, public entrypoints, and release tracks.",
    sourcePath: "docs/metadata/packages.json",
    tags: ["packages", "api"],
    kind: "package-reference",
  },
  {
    id: "releases",
    title: "Releases & Migration",
    group: "Releases / Migration",
    description:
      "Understand release channels, framework support, limitations, and upgrade guidance.",
    sourcePath: "docs/release/multi-framework-migration-and-limitations.md",
    content: migrationRaw,
    tags: ["release", "migration", "compatibility"],
    kind: "markdown",
  },
];

export const publicDocsSections: PublicDocsSection[] = [
  {
    id: "start",
    label: "Getting Started",
    routeIds: ["overview", "getting-started", "executable-examples"],
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
    id: "patterns",
    label: "Patterns",
    routeIds: docs
      .filter((route) => route.group === "Patterns")
      .map((route) => route.id),
  },
  {
    id: "data-grid",
    label: "Data & Grid",
    routeIds: docs
      .filter((route) => route.group === "Data & Grid")
      .map((route) => route.id),
  },
  {
    id: "api",
    label: "API / Packages",
    routeIds: ["package-reference"],
  },
  {
    id: "releases",
    label: "Releases / Migration",
    routeIds: ["releases"],
  },
];

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

export const docsRoutes = uniqueRoutes(docs);

export function getRouteById(id: string) {
  return (
    docsRoutes.find((route) => route.id === id) ??
    docsRoutes.find((route) => route.id === "overview") ??
    docsRoutes[0]
  );
}
