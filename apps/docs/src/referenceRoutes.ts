import agentsRaw from "../../../AGENTS.md?raw";
import { referenceModel } from "./docsContext";

export type DocsRouteKind =
  | "markdown"
  | "ai"
  | "json"
  | "metadata"
  | "component-reference"
  | "package-reference"
  | "ai-context-index";

export type DocsRoute = {
  id: string;
  title: string;
  group: string;
  description?: string;
  sourcePath: string;
  aiPurpose?: string;
  tags?: string[];
  canonical?: boolean;
  kind?: DocsRouteKind;
  content?: string;
};

type RawModules = Record<string, string>;

const markdownModules = import.meta.glob("../../../docs/**/*.md", {
  eager: true,
  import: "default",
  query: "?raw",
}) as RawModules;
const metadataModules = import.meta.glob("../../../docs/metadata/*.json", {
  eager: true,
  import: "default",
  query: "?raw",
}) as RawModules;
const aiContextModules = import.meta.glob(
  "../../../docs/generated/ai-context/**/*.json",
  {
    eager: true,
    import: "default",
    query: "?raw",
  },
) as RawModules;

function sourcePath(modulePath: string) {
  return modulePath.replace(/^\.\.\/\.\.\/\.\.\//u, "");
}

function stripNumericPrefix(value: string) {
  return value.replace(/^\d+-/u, "").replace(/^adr-\d+-/u, "");
}

function slugFromSourcePath(path: string) {
  if (path === "docs/README.md") return "overview";
  if (path === "docs/api/README.md") return "api-overview";
  if (path === "docs/release/README.md") return "release-docs";
  if (path === "docs/generated/ai-context/index.json") {
    return "ai-consumer-context";
  }
  if (path === "AGENTS.md") return "agent-rules";

  const withoutExtension = path.replace(/\.(?:md|json)$/u, "");
  if (withoutExtension.startsWith("docs/metadata/")) {
    return `metadata-${withoutExtension.slice("docs/metadata/".length)}`;
  }
  if (withoutExtension.startsWith("docs/generated/ai-context/")) {
    return `ai-context-${withoutExtension
      .slice("docs/generated/ai-context/".length)
      .replace(/\//gu, "-")}`;
  }

  const basename = withoutExtension.slice(
    withoutExtension.lastIndexOf("/") + 1,
  );
  return stripNumericPrefix(basename);
}

function groupForSourcePath(path: string) {
  if (path === "AGENTS.md") return "AI";
  if (
    path === "docs/README.md" ||
    path.startsWith("docs/governance/") ||
    path.startsWith("docs/engineering/")
  ) {
    return "Start Here";
  }
  if (path.startsWith("docs/architecture/")) return "Architecture";
  if (path.startsWith("docs/testing/")) return "Testing";
  if (path.startsWith("docs/quality/")) return "Quality";
  if (path.startsWith("docs/release/")) return "Release";
  if (path.startsWith("docs/packages/")) return "Packages";
  if (path.startsWith("docs/api/")) return "API Reference";
  if (path.startsWith("docs/metadata/")) return "Metadata";
  if (path.startsWith("docs/generated/ai-context/")) return "AI";
  return "Start Here";
}

function fallbackTitle(path: string) {
  const id = slugFromSourcePath(path).replace(/^(?:metadata|ai-context)-/u, "");
  const title = id
    .split("-")
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
  return path.startsWith("docs/metadata/") ? `Metadata / ${title}` : title;
}

function markdownTitle(content: string, path: string) {
  const heading = content.match(/^#\s+(.+)$/mu)?.[1]?.trim();
  return heading || fallbackTitle(path);
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
  return plainText(paragraphs[0] ?? "Canonical VyrnForge guidance.");
}

function tagsForSourcePath(path: string) {
  return path
    .replace(/^docs\//u, "")
    .replace(/\.(?:md|json)$/u, "")
    .split(/[/-]/u)
    .map((tag) => tag.trim().toLowerCase())
    .filter((tag) => tag && !/^\d+$/u.test(tag) && tag !== "readme")
    .slice(0, 8);
}

function contentRoute(
  path: string,
  content: string,
  kind: DocsRouteKind,
): DocsRoute {
  return {
    id: slugFromSourcePath(path),
    title:
      kind === "markdown" ? markdownTitle(content, path) : fallbackTitle(path),
    group: groupForSourcePath(path),
    description:
      kind === "markdown"
        ? markdownDescription(content)
        : "Machine-readable VyrnForge source owned outside the Reference application.",
    sourcePath: path,
    tags: tagsForSourcePath(path),
    kind,
    content,
  };
}

const authoredGuideRoutes = Object.entries(markdownModules).map(
  ([modulePath, content]) =>
    contentRoute(sourcePath(modulePath), content, "markdown"),
);
const metadataRoutes = Object.entries(metadataModules).map(
  ([modulePath, content]) =>
    contentRoute(sourcePath(modulePath), content, "metadata"),
);
const aiContextRoutes = Object.entries(aiContextModules).map(
  ([modulePath, content]) => {
    const path = sourcePath(modulePath);
    return contentRoute(
      path,
      content,
      path.endsWith("/index.json") ? "ai-context-index" : "json",
    );
  },
);
const agentRoute = contentRoute("AGENTS.md", agentsRaw, "ai");

type GeneratedReaderPresentation = {
  id: string;
  title: string;
  group: string;
  description: string;
  kind?: DocsRouteKind;
};

const generatedReaderPresentation: Record<string, GeneratedReaderPresentation> =
  {
    search: {
      id: "search",
      title: "Reference Search",
      group: "Start Here",
      description:
        "Search VyrnForge reference records while preserving each record's owning source.",
    },
    packages: {
      id: "package-reference",
      title: "Package Reference",
      group: "Start Here",
      description:
        "Browse package responsibilities from canonical package metadata.",
      kind: "package-reference",
    },
    components: {
      id: "component-reference",
      title: "Component Reference",
      group: "Components",
      description:
        "Browse generated multi-framework component contracts and usage guidance.",
      kind: "component-reference",
    },
    accessibility: {
      id: "accessibility-reference",
      title: "Accessibility & Keyboard",
      group: "Accessibility",
      description:
        "Browse component accessibility contracts and keyboard guidance from canonical evidence.",
    },
    tokens: {
      id: "token-reference",
      title: "Design Tokens",
      group: "Foundations",
      description: "Explore canonical VyrnForge semantic token categories.",
    },
    patterns: {
      id: "pattern-reference",
      title: "Patterns",
      group: "Foundations",
      description: "Explore reusable VyrnForge composition patterns.",
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
        tags: [domain.id, "reference", "generated-reader"],
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

export const docsRoutes = uniqueRoutes([
  ...generatedReferenceRoutes,
  ...authoredGuideRoutes,
  ...metadataRoutes,
  ...aiContextRoutes,
  agentRoute,
]).sort((left, right) => {
  if (left.id === "overview") return -1;
  if (right.id === "overview") return 1;
  return `${left.group}:${left.sourcePath}`.localeCompare(
    `${right.group}:${right.sourcePath}`,
  );
});

export function getRouteById(id: string) {
  return (
    docsRoutes.find((route) => route.id === id) ??
    docsRoutes.find((route) => route.id === "overview") ??
    docsRoutes[0]
  );
}
