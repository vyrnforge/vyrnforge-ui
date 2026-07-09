import docsIndex from "../../../docs/README.md?raw";
import sourceOfTruth from "../../../docs/governance/01-project-source-of-truth.md?raw";
import aiUsageGuide from "../../../.ai/DOC_USAGE_GUIDE.md?raw";
import systemOverview from "../../../docs/architecture/00-system-overview.md?raw";
import packageBoundaries from "../../../docs/architecture/01-package-boundaries.md?raw";
import stateAndAdapters from "../../../docs/architecture/02-state-and-adapter-ownership.md?raw";
import themingAndStyling from "../../../docs/architecture/03-theming-and-styling.md?raw";
import cleanCodeBoundaries from "../../../docs/architecture/04-clean-code-boundaries.md?raw";
import accessibilityStandards from "../../../docs/architecture/05-accessibility-standards.md?raw";
import masterRoadmap from "../../../docs/roadmap/00-master-roadmap.md?raw";
import componentInventory from "../../../docs/roadmap/01-component-inventory.md?raw";
import gapAnalysis from "../../../docs/roadmap/02-gap-analysis.md?raw";
import doNotBuildYet from "../../../docs/roadmap/03-do-not-build-yet.md?raw";
import uiCoreDoc from "../../../docs/packages/ui-core.md?raw";
import uiComponentsDoc from "../../../docs/packages/ui-components.md?raw";
import uiDataGridDoc from "../../../docs/packages/ui-data-grid.md?raw";
import docsAppSpec from "../../../docs/react-docs/00-react-docs-app-spec.md?raw";
import routeMap from "../../../docs/react-docs/01-route-map.md?raw";
import exampleStandards from "../../../docs/react-docs/02-example-standards.md?raw";
import aiReadableDocs from "../../../docs/react-docs/03-ai-readable-docs.md?raw";
import aiDocumentationStrategy from "../../../docs/ai/00-ai-documentation-strategy.md?raw";
import aiContext from "../../../.ai/AI_CONTEXT.md?raw";
import agents from "../../../AGENTS.md?raw";
import repoMap from "../../../.ai/REPO_MAP.md?raw";
import codingRules from "../../../.ai/CODING_RULES.md?raw";
import componentMapJson from "../../../.ai/COMPONENT_MAP.json?raw";
import metadataPackages from "../../../docs/metadata/packages.json?raw";
import metadataComponents from "../../../docs/metadata/components.json?raw";
import metadataCssImports from "../../../docs/metadata/css-imports.json?raw";
import metadataStateContracts from "../../../docs/metadata/state-contracts.json?raw";
import metadataAiUsageRules from "../../../docs/metadata/ai-usage-rules.json?raw";

export type DocsRouteKind =
  | "markdown"
  | "ai"
  | "json"
  | "metadata"
  | "component-reference"
  | "package-reference";

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

export const docsRoutes: DocsRoute[] = [
  {
    id: "overview",
    title: "Overview",
    group: "Start Here",
    description: "Canonical documentation index and navigation map.",
    sourcePath: "docs/README.md",
    aiPurpose: "Start here to locate canonical docs by topic.",
    tags: ["canonical", "index"],
    canonical: true,
    content: docsIndex
  },
  {
    id: "source-of-truth",
    title: "Source of Truth",
    group: "Start Here",
    description: "Canonical Dravyn UI identity and non-goals.",
    sourcePath: "docs/governance/01-project-source-of-truth.md",
    aiPurpose: "Use this to understand what Dravyn UI is and is not.",
    tags: ["canonical", "governance", "identity"],
    canonical: true,
    content: sourceOfTruth
  },
  {
    id: "ai-usage-guide",
    title: "AI Usage Guide",
    group: "Start Here",
    description: "Rules for AI agents reading and updating docs.",
    sourcePath: ".ai/DOC_USAGE_GUIDE.md",
    aiPurpose: "Use this before changing documentation.",
    tags: ["ai", "docs"],
    content: aiUsageGuide
  },
  {
    id: "system-overview",
    title: "System Overview",
    group: "Architecture",
    description: "High-level package architecture.",
    sourcePath: "docs/architecture/00-system-overview.md",
    aiPurpose: "Use this before changing package relationships.",
    tags: ["architecture", "packages"],
    canonical: true,
    content: systemOverview
  },
  {
    id: "package-boundaries",
    title: "Package Boundaries",
    group: "Architecture",
    description: "What each package owns and must not own.",
    sourcePath: "docs/architecture/01-package-boundaries.md",
    aiPurpose: "Use this to prevent package dependency leaks.",
    tags: ["canonical", "architecture", "packages"],
    canonical: true,
    content: packageBoundaries
  },
  {
    id: "state-and-adapters",
    title: "State and Adapters",
    group: "Architecture",
    description: "State ownership, Redux policy, and adapter boundaries.",
    sourcePath: "docs/architecture/02-state-and-adapter-ownership.md",
    aiPurpose: "Use this before adding state, persistence, server, or export behavior.",
    tags: ["canonical", "architecture", "state", "adapters"],
    canonical: true,
    content: stateAndAdapters
  },
  {
    id: "theming-and-styling",
    title: "Theming and Styling",
    group: "Architecture",
    description: "CSS variable, token, and styling rules.",
    sourcePath: "docs/architecture/03-theming-and-styling.md",
    aiPurpose: "Use this before changing CSS or token behavior.",
    tags: ["canonical", "architecture", "styling", "theme"],
    canonical: true,
    content: themingAndStyling
  },
  {
    id: "clean-code-boundaries",
    title: "Clean Code Boundaries",
    group: "Architecture",
    description: "Components vs hooks vs core vs adapters.",
    sourcePath: "docs/architecture/04-clean-code-boundaries.md",
    aiPurpose: "Use this to place implementation code in the right layer.",
    tags: ["architecture", "clean-code"],
    content: cleanCodeBoundaries
  },
  {
    id: "accessibility-standards",
    title: "Accessibility Standards",
    group: "Architecture",
    description: "Accessibility baseline for Dravyn UI.",
    sourcePath: "docs/architecture/05-accessibility-standards.md",
    aiPurpose: "Use this before changing interactive UI.",
    tags: ["architecture", "accessibility"],
    content: accessibilityStandards
  },
  {
    id: "master-roadmap",
    title: "Master Roadmap",
    group: "Roadmap",
    description: "Canonical sprint-level execution plan.",
    sourcePath: "docs/roadmap/00-master-roadmap.md",
    aiPurpose: "Use this for roadmap sequencing.",
    tags: ["canonical", "roadmap"],
    canonical: true,
    content: masterRoadmap
  },
  {
    id: "component-inventory",
    title: "Component Inventory",
    group: "Roadmap",
    description: "Current and planned component maturity.",
    sourcePath: "docs/roadmap/01-component-inventory.md",
    aiPurpose: "Use this to know whether a component is current, planned, or later.",
    tags: ["canonical", "components", "roadmap"],
    canonical: true,
    content: componentInventory
  },
  {
    id: "gap-analysis",
    title: "Gap Analysis",
    group: "Roadmap",
    description: "Missing areas and priorities.",
    sourcePath: "docs/roadmap/02-gap-analysis.md",
    aiPurpose: "Use this to understand priority gaps without inventing a new roadmap.",
    tags: ["roadmap", "gaps"],
    content: gapAnalysis
  },
  {
    id: "do-not-build-yet",
    title: "Do Not Build Yet",
    group: "Roadmap",
    description: "Explicit non-goals and deferred work.",
    sourcePath: "docs/roadmap/03-do-not-build-yet.md",
    aiPurpose: "Use this to avoid premature features.",
    tags: ["roadmap", "non-goals"],
    content: doNotBuildYet
  },
  {
    id: "ui-core",
    title: "ui-core",
    group: "Packages",
    description: "Tokens, themes, density, and utilities.",
    sourcePath: "docs/packages/ui-core.md",
    aiPurpose: "Use this before changing shared token/theme behavior.",
    tags: ["package", "ui-core"],
    canonical: true,
    content: uiCoreDoc
  },
  {
    id: "ui-components",
    title: "ui-components",
    group: "Packages",
    description: "Reusable primitives and application components.",
    sourcePath: "docs/packages/ui-components.md",
    aiPurpose: "Use this before changing shared components.",
    tags: ["package", "ui-components"],
    canonical: true,
    content: uiComponentsDoc
  },
  {
    id: "ui-data-grid",
    title: "ui-data-grid",
    group: "Packages",
    description: "UniversalDataGrid package scope and API direction.",
    sourcePath: "docs/packages/ui-data-grid.md",
    aiPurpose: "Use this before changing grid behavior.",
    tags: ["package", "ui-data-grid"],
    canonical: true,
    content: uiDataGridDoc
  },
  {
    id: "metadata-packages",
    title: "Metadata / Packages",
    group: "Metadata",
    description: "Machine-readable package ownership, dependencies, CSS imports, and entry points.",
    sourcePath: "docs/metadata/packages.json",
    aiPurpose: "Use this for package ownership and dependency direction lookup.",
    tags: ["metadata", "packages", "json"],
    kind: "metadata",
    content: metadataPackages
  },
  {
    id: "metadata-components",
    title: "Metadata / Components",
    group: "Metadata",
    description: "Machine-readable component and public contract catalog.",
    sourcePath: "docs/metadata/components.json",
    aiPurpose: "Use this to understand components, status, usage rules, classes, and imports.",
    tags: ["metadata", "components", "json"],
    kind: "metadata",
    content: metadataComponents
  },
  {
    id: "metadata-css-imports",
    title: "Metadata / CSS Imports",
    group: "Metadata",
    description: "CSS import order and styling ownership metadata.",
    sourcePath: "docs/metadata/css-imports.json",
    aiPurpose: "Use this before changing or consuming Dravyn styles.",
    tags: ["metadata", "css", "json"],
    kind: "metadata",
    content: metadataCssImports
  },
  {
    id: "metadata-state-contracts",
    title: "Metadata / State Contracts",
    group: "Metadata",
    description: "State ownership and adapter policy metadata.",
    sourcePath: "docs/metadata/state-contracts.json",
    aiPurpose: "Use this before adding state, persistence, server, or export behavior.",
    tags: ["metadata", "state", "adapters", "json"],
    kind: "metadata",
    content: metadataStateContracts
  },
  {
    id: "metadata-ai-usage-rules",
    title: "Metadata / AI Usage Rules",
    group: "Metadata",
    description: "AI-specific usage rules and dependency constraints.",
    sourcePath: "docs/metadata/ai-usage-rules.json",
    aiPurpose: "Use this for quick AI implementation guardrails.",
    tags: ["metadata", "ai", "json"],
    kind: "metadata",
    content: metadataAiUsageRules
  },
  {
    id: "docs-app-spec",
    title: "Docs App Spec",
    group: "React Docs",
    description: "Specification for the human-facing docs app.",
    sourcePath: "docs/react-docs/00-react-docs-app-spec.md",
    aiPurpose: "Use this before changing the docs app.",
    tags: ["react-docs"],
    content: docsAppSpec
  },
  {
    id: "route-map",
    title: "Route Map",
    group: "React Docs",
    description: "Required route structure.",
    sourcePath: "docs/react-docs/01-route-map.md",
    aiPurpose: "Use this to align docs navigation.",
    tags: ["react-docs", "routes"],
    content: routeMap
  },
  {
    id: "example-standards",
    title: "Example Standards",
    group: "React Docs",
    description: "Rules for examples, snippets, and use-case pages.",
    sourcePath: "docs/react-docs/02-example-standards.md",
    aiPurpose: "Use this before adding docs examples.",
    tags: ["react-docs", "examples"],
    content: exampleStandards
  },
  {
    id: "ai-readable-docs",
    title: "AI-Readable Docs",
    group: "React Docs",
    description: "How docs expose machine-readable context.",
    sourcePath: "docs/react-docs/03-ai-readable-docs.md",
    aiPurpose: "Use this before adding AI-facing docs metadata.",
    tags: ["react-docs", "ai"],
    content: aiReadableDocs
  },
  {
    id: "ai-documentation-strategy",
    title: "AI Documentation Strategy",
    group: "AI",
    description: "Strategy for AI-readable Dravyn UI docs.",
    sourcePath: "docs/ai/00-ai-documentation-strategy.md",
    aiPurpose: "Use this to keep AI docs useful and non-duplicative.",
    tags: ["ai", "docs"],
    content: aiDocumentationStrategy
  },
  {
    id: "agent-rules",
    title: "Agent Rules",
    group: "AI",
    description: "Root rules for Codex and agents.",
    sourcePath: "AGENTS.md",
    aiPurpose: "Use this before all agent work.",
    tags: ["ai", "agent"],
    kind: "ai",
    content: agents
  },
  {
    id: "repo-map",
    title: "Repo Map",
    group: "AI",
    description: "AI-readable repository structure.",
    sourcePath: ".ai/REPO_MAP.md",
    aiPurpose: "Use this to locate code and docs.",
    tags: ["ai", "repo"],
    kind: "ai",
    content: repoMap
  },
  {
    id: "coding-rules",
    title: "Coding Rules",
    group: "AI",
    description: "Implementation rules for agents.",
    sourcePath: ".ai/CODING_RULES.md",
    aiPurpose: "Use this before changing code.",
    tags: ["ai", "implementation"],
    kind: "ai",
    content: codingRules
  },
  {
    id: "component-map",
    title: "Component Map",
    group: "AI",
    description: "Machine-readable component map.",
    sourcePath: ".ai/COMPONENT_MAP.json",
    aiPurpose: "Use this as structured component metadata.",
    tags: ["ai", "json", "components"],
    kind: "json",
    content: componentMapJson
  },
  {
    id: "ai-context",
    title: "AI Context",
    group: "AI",
    description: "Primary AI context file.",
    sourcePath: ".ai/AI_CONTEXT.md",
    aiPurpose: "Use this as the first AI context read.",
    tags: ["ai", "canonical"],
    kind: "ai",
    canonical: true,
    content: aiContext
  },
  {
    id: "component-reference",
    title: "Component Reference",
    group: "Start Here",
    description: "Generated viewer summary of current and planned components.",
    sourcePath: "docs/roadmap/01-component-inventory.md",
    aiPurpose: "Use this as a navigable summary. The markdown inventory remains source of truth.",
    tags: ["components", "reference"],
    kind: "component-reference"
  },
  {
    id: "package-reference",
    title: "Package Reference",
    group: "Start Here",
    description: "Generated viewer summary of package responsibilities.",
    sourcePath: "docs/architecture/01-package-boundaries.md",
    aiPurpose: "Use this as a navigable summary. Architecture docs remain source of truth.",
    tags: ["packages", "reference"],
    kind: "package-reference"
  }
];

export const docsGroups = [
  "Start Here",
  "Architecture",
  "Roadmap",
  "Packages",
  "Metadata",
  "React Docs",
  "AI"
];

export function getRouteById(id: string) {
  return docsRoutes.find((route) => route.id === id) ?? docsRoutes[0];
}
