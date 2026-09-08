import docsIndex from "../../../docs/README.md?raw";
import sourceOfTruth from "../../../docs/governance/01-project-source-of-truth.md?raw";
import documentationSystem from "../../../docs/engineering/documentation-system.md?raw";
import systemOverview from "../../../docs/architecture/00-system-overview.md?raw";
import packageBoundaries from "../../../docs/architecture/01-package-boundaries.md?raw";
import stateAndAdapters from "../../../docs/architecture/02-state-and-adapter-ownership.md?raw";
import themingAndStyling from "../../../docs/architecture/03-theming-and-styling.md?raw";
import cleanCodeBoundaries from "../../../docs/architecture/04-clean-code-boundaries.md?raw";
import accessibilityStandards from "../../../docs/architecture/05-accessibility-standards.md?raw";
import semanticTokenContract from "../../../docs/architecture/08-semantic-token-contract.md?raw";
import multiFrameworkDecision from "../../../docs/architecture/adr-004-multi-framework-web-support.md?raw";
import componentContracts from "../../../docs/architecture/09-component-contracts-and-events.md?raw";
import customElementsAndForms from "../../../docs/architecture/10-custom-elements-and-form-association.md?raw";
import multiFrameworkFixtures from "../../../docs/testing/multi-framework-consumer-fixtures.md?raw";
import visualRegression from "../../../docs/testing/visual-regression.md?raw";
import qualityGates from "../../../docs/quality/00-quality-gates.md?raw";
import knownLimitations from "../../../docs/quality/03-known-limitations.md?raw";
import releaseDocsIndex from "../../../docs/release/README.md?raw";
import publicationProcedure from "../../../docs/release/publication-procedure.md?raw";
import multiFrameworkMigrationGuide from "../../../docs/release/multi-framework-migration-and-limitations.md?raw";
import releaseReadinessChecklist from "../../../docs/release/release-readiness-checklist.md?raw";
import uiCoreDoc from "../../../docs/packages/ui-core.md?raw";
import uiBehaviorsDoc from "../../../docs/packages/ui-behaviors.md?raw";
import uiComponentsDoc from "../../../docs/packages/ui-components.md?raw";
import uiElementsDoc from "../../../docs/packages/ui-elements.md?raw";
import uiAngularDoc from "../../../docs/packages/ui-angular.md?raw";
import uiVueDoc from "../../../docs/packages/ui-vue.md?raw";
import uiDataGridDoc from "../../../docs/packages/ui-data-grid.md?raw";
import apiOverview from "../../../docs/api/README.md?raw";
import apiImportSetup from "../../../docs/api/import-and-setup.md?raw";
import apiPublicVsInternal from "../../../docs/api/public-vs-internal-api.md?raw";
import agents from "../../../AGENTS.md?raw";
import metadataPackages from "../../../docs/metadata/packages.json?raw";
import metadataComponents from "../../../docs/metadata/components.json?raw";
import metadataMultiFramework from "../../../docs/metadata/multi-framework.json?raw";
import metadataComponentContracts from "../../../docs/metadata/component-contracts.json?raw";
import metadataCrossFrameworkBrowserMatrix from "../../../docs/metadata/cross-framework-browser-matrix.json?raw";
import metadataCrossFrameworkAccessibility from "../../../docs/metadata/cross-framework-accessibility-review.json?raw";
import metadataAiUsageRules from "../../../docs/metadata/ai-usage-rules.json?raw";

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

export const docsRoutes: DocsRoute[] = [
  {
    id: "ai-consumer-context",
    title: "AI Consumer Context",
    group: "Start Here",
    description: "Generated task-scoped retrieval index for AI consumers.",
    sourcePath: "docs/generated/ai-context/index.json",
    aiPurpose: "Start here for minimal generated context.",
    tags: ["ai", "generated", "consumer-context"],
    kind: "ai-context-index",
  },
  {
    id: "overview",
    title: "Overview",
    group: "Start Here",
    description: "Canonical documentation index and navigation map.",
    sourcePath: "docs/README.md",
    tags: ["canonical", "index"],
    canonical: true,
    content: docsIndex,
  },
  {
    id: "source-of-truth",
    title: "Source of Truth",
    group: "Start Here",
    description: "Canonical VyrnForge identity, scope, and durable boundaries.",
    sourcePath: "docs/governance/01-project-source-of-truth.md",
    tags: ["canonical", "governance", "identity"],
    canonical: true,
    content: sourceOfTruth,
  },
  {
    id: "documentation-system",
    title: "Documentation System",
    group: "Start Here",
    description: "Canonical documentation ownership and lifecycle rules.",
    sourcePath: "docs/engineering/documentation-system.md",
    tags: ["canonical", "documentation", "governance"],
    canonical: true,
    content: documentationSystem,
  },
  {
    id: "system-overview",
    title: "System Overview",
    group: "Architecture",
    description: "High-level package architecture.",
    sourcePath: "docs/architecture/00-system-overview.md",
    tags: ["canonical", "architecture", "packages"],
    canonical: true,
    content: systemOverview,
  },
  {
    id: "package-boundaries",
    title: "Package Boundaries",
    group: "Architecture",
    description: "What each package owns and must not own.",
    sourcePath: "docs/architecture/01-package-boundaries.md",
    tags: ["canonical", "architecture", "packages"],
    canonical: true,
    content: packageBoundaries,
  },
  {
    id: "state-and-adapters",
    title: "State and Adapters",
    group: "Architecture",
    sourcePath: "docs/architecture/02-state-and-adapter-ownership.md",
    tags: ["canonical", "architecture", "state"],
    canonical: true,
    content: stateAndAdapters,
  },
  {
    id: "theming-and-styling",
    title: "Theming and Styling",
    group: "Architecture",
    sourcePath: "docs/architecture/03-theming-and-styling.md",
    tags: ["canonical", "architecture", "styling"],
    canonical: true,
    content: themingAndStyling,
  },
  {
    id: "clean-code-boundaries",
    title: "Clean Code Boundaries",
    group: "Architecture",
    sourcePath: "docs/architecture/04-clean-code-boundaries.md",
    tags: ["architecture", "boundaries"],
    content: cleanCodeBoundaries,
  },
  {
    id: "accessibility-standards",
    title: "Accessibility Standards",
    group: "Architecture",
    sourcePath: "docs/architecture/05-accessibility-standards.md",
    tags: ["architecture", "accessibility"],
    content: accessibilityStandards,
  },
  {
    id: "semantic-token-contract",
    title: "Semantic Token Contract",
    group: "Architecture",
    sourcePath: "docs/architecture/08-semantic-token-contract.md",
    tags: ["canonical", "architecture", "tokens"],
    canonical: true,
    content: semanticTokenContract,
  },
  {
    id: "multi-framework-decision",
    title: "Multi-Framework Web Support",
    group: "Architecture",
    sourcePath: "docs/architecture/adr-004-multi-framework-web-support.md",
    tags: ["canonical", "architecture", "multi-framework", "adr"],
    canonical: true,
    content: multiFrameworkDecision,
  },
  {
    id: "component-contracts-events",
    title: "Component Contracts And Events",
    group: "Architecture",
    sourcePath: "docs/architecture/09-component-contracts-and-events.md",
    tags: ["canonical", "architecture", "contracts"],
    canonical: true,
    content: componentContracts,
  },
  {
    id: "custom-elements-forms",
    title: "Custom Elements And Forms",
    group: "Architecture",
    sourcePath: "docs/architecture/10-custom-elements-and-form-association.md",
    tags: ["canonical", "architecture", "custom-elements", "forms"],
    canonical: true,
    content: customElementsAndForms,
  },
  {
    id: "multi-framework-fixtures",
    title: "Multi-Framework Consumer Fixtures",
    group: "Testing",
    sourcePath: "docs/testing/multi-framework-consumer-fixtures.md",
    tags: ["testing", "multi-framework", "consumer"],
    content: multiFrameworkFixtures,
  },
  {
    id: "visual-regression",
    title: "Visual Regression Testing",
    group: "Testing",
    sourcePath: "docs/testing/visual-regression.md",
    tags: ["testing", "visual", "evidence"],
    content: visualRegression,
  },
  {
    id: "quality-gates",
    title: "Quality Gates",
    group: "Quality",
    sourcePath: "docs/quality/00-quality-gates.md",
    tags: ["canonical", "quality", "testing", "ci"],
    canonical: true,
    content: qualityGates,
  },
  {
    id: "known-limitations",
    title: "Known Limitations",
    group: "Quality",
    sourcePath: "docs/quality/03-known-limitations.md",
    tags: ["canonical", "quality", "limitations"],
    canonical: true,
    content: knownLimitations,
  },
  {
    id: "release-docs",
    title: "Release Docs",
    group: "Release",
    sourcePath: "docs/release/README.md",
    tags: ["canonical", "release", "index"],
    canonical: true,
    content: releaseDocsIndex,
  },
  {
    id: "publication-procedure",
    title: "Publication Procedure",
    group: "Release",
    sourcePath: "docs/release/publication-procedure.md",
    tags: ["release", "publication"],
    content: publicationProcedure,
  },
  {
    id: "multi-framework-migration-guide",
    title: "Multi-Framework Migration and Limitations",
    group: "Release",
    sourcePath: "docs/release/multi-framework-migration-and-limitations.md",
    tags: ["release", "migration", "multi-framework"],
    canonical: true,
    content: multiFrameworkMigrationGuide,
  },
  {
    id: "release-readiness",
    title: "Release Readiness",
    group: "Release",
    sourcePath: "docs/release/release-readiness-checklist.md",
    tags: ["release", "checklist"],
    content: releaseReadinessChecklist,
  },
  ...[
    ["ui-core", "ui-core", uiCoreDoc],
    ["ui-behaviors", "ui-behaviors", uiBehaviorsDoc],
    ["ui-components", "ui-components", uiComponentsDoc],
    ["ui-elements", "ui-elements", uiElementsDoc],
    ["ui-angular", "ui-angular", uiAngularDoc],
    ["ui-vue", "ui-vue", uiVueDoc],
    ["ui-data-grid", "ui-data-grid", uiDataGridDoc],
  ].map(([id, title, content]) => ({
    id: id as string,
    title: title as string,
    group: "Packages",
    sourcePath: `docs/packages/${id}.md`,
    tags: ["package", id as string],
    canonical: true,
    content: content as string,
  })),
  {
    id: "api-overview",
    title: "API Overview",
    group: "API Reference",
    sourcePath: "docs/api/README.md",
    tags: ["api", "canonical"],
    canonical: true,
    content: apiOverview,
  },
  {
    id: "api-import-and-setup",
    title: "Import and Setup",
    group: "API Reference",
    sourcePath: "docs/api/import-and-setup.md",
    tags: ["api", "imports", "css"],
    content: apiImportSetup,
  },
  {
    id: "api-public-vs-internal",
    title: "Public vs Internal API",
    group: "API Reference",
    sourcePath: "docs/api/public-vs-internal-api.md",
    tags: ["api", "boundaries"],
    content: apiPublicVsInternal,
  },
  {
    id: "metadata-packages",
    title: "Metadata / Packages",
    group: "Metadata",
    sourcePath: "docs/metadata/packages.json",
    tags: ["metadata", "packages", "json"],
    kind: "metadata",
    content: metadataPackages,
  },
  {
    id: "metadata-components",
    title: "Metadata / Components",
    group: "Metadata",
    sourcePath: "docs/metadata/components.json",
    tags: ["metadata", "components", "json"],
    kind: "metadata",
    content: metadataComponents,
  },
  {
    id: "metadata-multi-framework",
    title: "Metadata / Multi-Framework",
    group: "Metadata",
    sourcePath: "docs/metadata/multi-framework.json",
    tags: ["metadata", "multi-framework", "json"],
    kind: "metadata",
    content: metadataMultiFramework,
  },
  {
    id: "metadata-component-contracts",
    title: "Metadata / Component Contracts",
    group: "Metadata",
    sourcePath: "docs/metadata/component-contracts.json",
    tags: ["metadata", "contracts", "json"],
    kind: "metadata",
    content: metadataComponentContracts,
  },
  {
    id: "metadata-cross-framework-browser-matrix",
    title: "Metadata / Cross-Framework Browser Matrix",
    group: "Metadata",
    sourcePath: "docs/metadata/cross-framework-browser-matrix.json",
    tags: ["metadata", "browser", "multi-framework", "json"],
    kind: "metadata",
    content: metadataCrossFrameworkBrowserMatrix,
  },
  {
    id: "metadata-cross-framework-accessibility",
    title: "Metadata / Cross-Framework Accessibility",
    group: "Metadata",
    sourcePath: "docs/metadata/cross-framework-accessibility-review.json",
    tags: ["metadata", "accessibility", "multi-framework", "json"],
    kind: "metadata",
    content: metadataCrossFrameworkAccessibility,
  },
  {
    id: "metadata-ai-usage-rules",
    title: "Metadata / AI Usage Rules",
    group: "Metadata",
    sourcePath: "docs/metadata/ai-usage-rules.json",
    tags: ["metadata", "ai", "json"],
    kind: "metadata",
    content: metadataAiUsageRules,
  },
  {
    id: "agent-rules",
    title: "Agent Rules",
    group: "AI",
    sourcePath: "AGENTS.md",
    tags: ["ai", "agent"],
    kind: "ai",
    content: agents,
  },
  {
    id: "component-reference",
    title: "Component Reference",
    group: "Start Here",
    description: "Generated multi-framework usage and contract reference.",
    sourcePath: "docs/generated/component-reference.json",
    tags: ["components", "reference", "multi-framework", "generated"],
    kind: "component-reference",
  },
  {
    id: "package-reference",
    title: "Package Reference",
    group: "Start Here",
    description: "Generated viewer summary of package responsibilities.",
    sourcePath: "docs/architecture/01-package-boundaries.md",
    tags: ["packages", "reference"],
    kind: "package-reference",
  },
];

export const docsGroups = [
  "Start Here",
  "Architecture",
  "Testing",
  "Quality",
  "Release",
  "Packages",
  "API Reference",
  "Metadata",
  "AI",
];

export function getRouteById(id: string) {
  return docsRoutes.find((route) => route.id === id) ?? docsRoutes[0];
}
