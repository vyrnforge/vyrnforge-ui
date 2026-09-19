import overviewRaw from "../../../docs/README.md?raw";
import importAndSetupRaw from "../../../docs/api/import-and-setup.md?raw";
import themingRaw from "../../../docs/architecture/03-theming-and-styling.md?raw";
import accessibilityRaw from "../../../docs/architecture/05-accessibility-standards.md?raw";
import deprecationRaw from "../../../docs/release/deprecation-and-migration-policy.md?raw";
import migrationRaw from "../../../docs/release/multi-framework-migration-and-limitations.md?raw";
import { referenceModel } from "./docsContext";
import { slugFromSourcePath } from "./referenceRouteId";

export type DocsRouteKind =
  | "markdown"
  | "component-reference"
  | "package-reference";

export type DocsRoute = {
  id: string;
  title: string;
  group: string;
  description?: string;
  sourcePath: string;
  tags?: string[];
  canonical?: boolean;
  kind?: DocsRouteKind;
  content?: string;
};

type PublicGuide = {
  path: string;
  group: "Getting Started" | "Foundations" | "Guides";
  content: string;
  title?: string;
  description?: string;
};

const publicGuides: PublicGuide[] = [
  {
    path: "docs/README.md",
    group: "Getting Started",
    content: overviewRaw,
    title: "Overview",
    description:
      "Start with VyrnForge as one shared UI foundation for Native HTML, React, Angular, and Vue.",
  },
  {
    path: "docs/api/import-and-setup.md",
    group: "Getting Started",
    content: importAndSetupRaw,
    title: "Installation & setup",
    description:
      "Install the VyrnForge packages you need and wire the shared styles and framework surface into an application.",
  },
  {
    path: "docs/architecture/03-theming-and-styling.md",
    group: "Foundations",
    content: themingRaw,
    title: "Theming & styling",
    description:
      "Customize VyrnForge through shared design tokens and portable CSS foundations.",
  },
  {
    path: "docs/architecture/05-accessibility-standards.md",
    group: "Foundations",
    content: accessibilityRaw,
    title: "Accessibility",
    description:
      "Understand the shared semantic, keyboard, focus, and assistive-technology expectations.",
  },
  {
    path: "docs/release/multi-framework-migration-and-limitations.md",
    group: "Guides",
    content: migrationRaw,
    title: "Framework support & limitations",
    description:
      "Understand current Native HTML, React, Angular, and Vue support without relying on internal program evidence.",
  },
  {
    path: "docs/release/deprecation-and-migration-policy.md",
    group: "Guides",
    content: deprecationRaw,
    title: "Migration & deprecation",
    description:
      "Plan upgrades and API migrations using VyrnForge's compatibility and deprecation rules.",
  },
];

function markdownTitle(content: string, path: string) {
  const heading = content.match(/^#\s+(.+)$/mu)?.[1]?.trim();
  return heading || slugFromSourcePath(path);
}

function plainText(value: string) {
  return value
    .replace(/`([^`]+)`/gu, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/gu, "$1")
    .replace(/[*_>#]/gu, "")
    .replace(/\s+/gu, " ")
    .trim();
}

function markdownDescription(content: string) {
  const paragraphs = content
    .split(/\n\s*\n/gu)
    .map((paragraph) => paragraph.trim())
    .filter(
      (paragraph) =>
        paragraph &&
        !paragraph.startsWith("#") &&
        !paragraph.startsWith("```") &&
        !paragraph.startsWith("|") &&
        !paragraph.startsWith("- "),
    );
  return plainText(paragraphs[0] ?? "VyrnForge documentation.");
}

const authoredGuideRoutes: DocsRoute[] = publicGuides.map((guide) => ({
  id: slugFromSourcePath(guide.path),
  title: guide.title ?? markdownTitle(guide.content, guide.path),
  group: guide.group,
  description: guide.description ?? markdownDescription(guide.content),
  sourcePath: guide.path,
  kind: "markdown",
  content: guide.content,
}));

type GeneratedReaderPresentation = {
  id: string;
  title: string;
  group: "Getting Started" | "Components" | "Foundations" | "Guides" | "API";
  description: string;
  kind?: DocsRouteKind;
};

const generatedReaderPresentation: Record<string, GeneratedReaderPresentation> =
  {
    search: {
      id: "search",
      title: "Search",
      group: "Getting Started",
      description:
        "Search VyrnForge components, packages, tokens, and guidance.",
    },
    packages: {
      id: "package-reference",
      title: "Packages",
      group: "API",
      description:
        "Browse public package responsibilities, entry points, and framework surfaces.",
      kind: "package-reference",
    },
    components: {
      id: "component-reference",
      title: "Components",
      group: "Components",
      description:
        "Browse VyrnForge components with framework usage, behavior, accessibility, and API details.",
      kind: "component-reference",
    },
    accessibility: {
      id: "accessibility-reference",
      title: "Component accessibility",
      group: "Foundations",
      description:
        "Browse component-level accessibility and keyboard behavior.",
    },
    tokens: {
      id: "token-reference",
      title: "Design tokens",
      group: "Foundations",
      description:
        "Explore the shared tokens that drive color, typography, spacing, density, borders, elevation, and motion.",
    },
    patterns: {
      id: "pattern-reference",
      title: "Patterns",
      group: "Guides",
      description:
        "Explore reusable VyrnForge composition patterns for application UI.",
    },
  };

export const generatedReferenceRoutes: DocsRoute[] =
  referenceModel.domains.flatMap((domain) => {
    const presentation = generatedReaderPresentation[domain.id];
    if (!presentation) return [];
    return [
      {
        ...presentation,
        sourcePath:
          domain.recordSource?.path ??
          domain.generatedSources[0] ??
          domain.canonicalSources[0] ??
          "docs/generated/reference-model.json",
        tags: [domain.id],
      },
    ];
  });

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

const groupOrder = [
  "Getting Started",
  "Components",
  "Foundations",
  "Guides",
  "API",
] as const;

export const docsRoutes = uniqueRoutes([
  ...authoredGuideRoutes,
  ...generatedReferenceRoutes,
]).sort((left, right) => {
  if (left.id === "overview") return -1;
  if (right.id === "overview") return 1;

  const leftGroup = groupOrder.indexOf(
    left.group as (typeof groupOrder)[number],
  );
  const rightGroup = groupOrder.indexOf(
    right.group as (typeof groupOrder)[number],
  );

  if (leftGroup !== rightGroup) return leftGroup - rightGroup;
  return left.title.localeCompare(right.title);
});

export function getRouteById(id: string) {
  return (
    docsRoutes.find((route) => route.id === id) ??
    docsRoutes.find((route) => route.id === "overview") ??
    docsRoutes[0]
  );
}
