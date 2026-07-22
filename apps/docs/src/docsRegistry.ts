import docsIndex from "../../../docs/README.md?raw";
import sourceOfTruth from "../../../docs/governance/01-project-source-of-truth.md?raw";
import aiUsageGuide from "../../../.ai/DOC_USAGE_GUIDE.md?raw";
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
import semanticTokenAudit from "../../../docs/quality/s3-semantic-token-audit.md?raw";
import multiFrameworkArchitectureEvidence from "../../../docs/quality/s4-multi-framework-architecture.md?raw";
import masterRoadmap from "../../../docs/roadmap/00-master-roadmap.md?raw";
import componentInventory from "../../../docs/roadmap/01-component-inventory.md?raw";
import gapAnalysis from "../../../docs/roadmap/02-gap-analysis.md?raw";
import doNotBuildYet from "../../../docs/roadmap/03-do-not-build-yet.md?raw";
import releaseDocsIndex from "../../../docs/release/README.md?raw";
import releasePolicy from "../../../docs/release/release-policy.md?raw";
import versioningPolicy from "../../../docs/release/versioning-policy.md?raw";
import publicationProcedure from "../../../docs/release/publication-procedure.md?raw";
import deprecationPolicy from "../../../docs/release/deprecation-and-migration-policy.md?raw";
import releaseReadinessChecklist from "../../../docs/release/release-readiness-checklist.md?raw";
import uiCoreDoc from "../../../docs/packages/ui-core.md?raw";
import uiBehaviorsDoc from "../../../docs/packages/ui-behaviors.md?raw";
import uiComponentsDoc from "../../../docs/packages/ui-components.md?raw";
import uiElementsDoc from "../../../docs/packages/ui-elements.md?raw";
import uiDataGridDoc from "../../../docs/packages/ui-data-grid.md?raw";
import apiOverview from "../../../docs/api/README.md?raw";
import apiImportSetup from "../../../docs/api/import-and-setup.md?raw";
import apiUiCore from "../../../docs/api/ui-core-api.md?raw";
import apiUiComponents from "../../../docs/api/ui-components-api.md?raw";
import apiUiDataGrid from "../../../docs/api/ui-data-grid-api.md?raw";
import apiCssTokens from "../../../docs/api/css-token-reference.md?raw";
import apiCssClasses from "../../../docs/api/css-class-reference.md?raw";
import apiPublicVsInternal from "../../../docs/api/public-vs-internal-api.md?raw";
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
import metadataDesignTokens from "../../../docs/metadata/design-tokens.json?raw";
import metadataMultiFramework from "../../../docs/metadata/multi-framework.json?raw";
import metadataComponentContracts from "../../../docs/metadata/component-contracts.json?raw";
import metadataComponentContractSchema from "../../../docs/metadata/component-contract.schema.json?raw";
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
    content: docsIndex,
  },
  {
    id: "source-of-truth",
    title: "Source of Truth",
    group: "Start Here",
    description: "Canonical VyrnForge UI identity and non-goals.",
    sourcePath: "docs/governance/01-project-source-of-truth.md",
    aiPurpose: "Use this to understand what VyrnForge UI is and is not.",
    tags: ["canonical", "governance", "identity"],
    canonical: true,
    content: sourceOfTruth,
  },
  {
    id: "ai-usage-guide",
    title: "AI Usage Guide",
    group: "Start Here",
    description: "Rules for AI agents reading and updating docs.",
    sourcePath: ".ai/DOC_USAGE_GUIDE.md",
    aiPurpose: "Use this before changing documentation.",
    tags: ["ai", "docs"],
    content: aiUsageGuide,
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
    content: systemOverview,
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
    content: packageBoundaries,
  },
  {
    id: "state-and-adapters",
    title: "State and Adapters",
    group: "Architecture",
    description: "State ownership, Redux policy, and adapter boundaries.",
    sourcePath: "docs/architecture/02-state-and-adapter-ownership.md",
    aiPurpose:
      "Use this before adding state, persistence, server, or export behavior.",
    tags: ["canonical", "architecture", "state", "adapters"],
    canonical: true,
    content: stateAndAdapters,
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
    content: themingAndStyling,
  },
  {
    id: "clean-code-boundaries",
    title: "Clean Code Boundaries",
    group: "Architecture",
    description: "Components vs hooks vs core vs adapters.",
    sourcePath: "docs/architecture/04-clean-code-boundaries.md",
    aiPurpose: "Use this to place implementation code in the right layer.",
    tags: ["architecture", "clean-code"],
    content: cleanCodeBoundaries,
  },
  {
    id: "accessibility-standards",
    title: "Accessibility Standards",
    group: "Architecture",
    description: "Accessibility baseline for VyrnForge UI.",
    sourcePath: "docs/architecture/05-accessibility-standards.md",
    aiPurpose: "Use this before changing interactive UI.",
    tags: ["architecture", "accessibility"],
    content: accessibilityStandards,
  },
  {
    id: "semantic-token-contract",
    title: "Semantic Token Contract",
    group: "Architecture",
    description:
      "Canonical surfaces, text, interaction, status, density, typography, motion, and layer roles.",
    sourcePath: "docs/architecture/08-semantic-token-contract.md",
    aiPurpose:
      "Use this before introducing or migrating shared visual decisions.",
    tags: ["canonical", "architecture", "tokens", "theme"],
    canonical: true,
    content: semanticTokenContract,
  },
  {
    id: "multi-framework-decision",
    title: "Multi-Framework Web Support",
    group: "Architecture",
    description:
      "Accepted React/native-first web support decision and deferred data-grid scope.",
    sourcePath: "docs/architecture/adr-004-multi-framework-web-support.md",
    aiPurpose:
      "Use this before changing renderer scope, package identity, or framework support claims.",
    tags: ["canonical", "architecture", "multi-framework", "adr"],
    canonical: true,
    content: multiFrameworkDecision,
  },
  {
    id: "component-contracts-events",
    title: "Component Contracts And Events",
    group: "Architecture",
    description:
      "Canonical properties, events, slots, methods, accessibility, and renderer mappings.",
    sourcePath: "docs/architecture/09-component-contracts-and-events.md",
    aiPurpose:
      "Use this before adding or changing cross-framework component contracts.",
    tags: ["canonical", "architecture", "contracts", "events", "slots"],
    canonical: true,
    content: componentContracts,
  },
  {
    id: "custom-elements-forms",
    title: "Custom Elements And Forms",
    group: "Architecture",
    description:
      "Light DOM, Custom Element lifecycle, and native form-association policy.",
    sourcePath: "docs/architecture/10-custom-elements-and-form-association.md",
    aiPurpose:
      "Use this before implementing native elements, reflection, or form integration.",
    tags: ["canonical", "architecture", "custom-elements", "forms"],
    canonical: true,
    content: customElementsAndForms,
  },
  {
    id: "multi-framework-fixtures",
    title: "Multi-Framework Consumer Fixtures",
    group: "Testing",
    description:
      "React, native HTML, Angular, and Vue fixture ownership and GMF4 evidence rules.",
    sourcePath: "docs/testing/multi-framework-consumer-fixtures.md",
    aiPurpose:
      "Use this before changing consumer fixtures or making framework support claims.",
    tags: ["testing", "multi-framework", "consumer"],
    content: multiFrameworkFixtures,
  },
  {
    id: "s3-semantic-token-audit",
    title: "S3 Semantic Token Audit",
    group: "Quality",
    description:
      "VF-3001 inventory of shared token gaps, hard-coded decisions, and deferred migration debt.",
    sourcePath: "docs/quality/s3-semantic-token-audit.md",
    aiPurpose:
      "Use this to distinguish completed token foundation work from VF-3009 and VF-3010 migration debt.",
    tags: ["quality", "tokens", "audit", "s3"],
    content: semanticTokenAudit,
  },
  {
    id: "s4-multi-framework-architecture",
    title: "S4 Multi-Framework Architecture Evidence",
    group: "Quality",
    description:
      "MF-4001 through MF-4008 evidence and the explicit GMF1 support-claim boundary.",
    sourcePath: "docs/quality/s4-multi-framework-architecture.md",
    aiPurpose:
      "Use this to review what S4 proves and what remains deferred to later gates.",
    tags: ["quality", "multi-framework", "s4", "evidence"],
    content: multiFrameworkArchitectureEvidence,
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
    content: masterRoadmap,
  },
  {
    id: "component-inventory",
    title: "Component Inventory",
    group: "Roadmap",
    description: "Current and planned component maturity.",
    sourcePath: "docs/roadmap/01-component-inventory.md",
    aiPurpose:
      "Use this to know whether a component is current, planned, or later.",
    tags: ["canonical", "components", "roadmap"],
    canonical: true,
    content: componentInventory,
  },
  {
    id: "gap-analysis",
    title: "Gap Analysis",
    group: "Roadmap",
    description: "Missing areas and priorities.",
    sourcePath: "docs/roadmap/02-gap-analysis.md",
    aiPurpose:
      "Use this to understand priority gaps without inventing a new roadmap.",
    tags: ["roadmap", "gaps"],
    content: gapAnalysis,
  },
  {
    id: "do-not-build-yet",
    title: "Do Not Build Yet",
    group: "Roadmap",
    description: "Explicit non-goals and deferred work.",
    sourcePath: "docs/roadmap/03-do-not-build-yet.md",
    aiPurpose: "Use this to avoid premature features.",
    tags: ["roadmap", "non-goals"],
    content: doNotBuildYet,
  },
  {
    id: "release-docs",
    title: "Release Docs",
    group: "Release",
    description: "Release governance index.",
    sourcePath: "docs/release/README.md",
    aiPurpose:
      "Use this before planning publication, versioning, or release readiness work.",
    tags: ["release", "index"],
    canonical: true,
    content: releaseDocsIndex,
  },
  {
    id: "release-policy",
    title: "Release Policy",
    group: "Release",
    description: "Maturity stages and release expectations.",
    sourcePath: "docs/release/release-policy.md",
    aiPurpose:
      "Use this to understand pre-alpha, alpha, beta, 0.x, and 1.x expectations.",
    tags: ["release", "policy"],
    content: releasePolicy,
  },
  {
    id: "versioning-policy",
    title: "Versioning Policy",
    group: "Release",
    description: "Package versioning, prerelease, and compatibility rules.",
    sourcePath: "docs/release/versioning-policy.md",
    aiPurpose:
      "Use this before changing package versions or public compatibility contracts.",
    tags: ["release", "versioning"],
    content: versioningPolicy,
  },
  {
    id: "publication-procedure",
    title: "Publication Procedure",
    group: "Release",
    description: "Manual publication and future trusted-publishing procedure.",
    sourcePath: "docs/release/publication-procedure.md",
    aiPurpose: "Use this before package publication planning.",
    tags: ["release", "publication"],
    content: publicationProcedure,
  },
  {
    id: "deprecation-policy",
    title: "Deprecation Policy",
    group: "Release",
    description: "Deprecation, compatibility, migration, and removal rules.",
    sourcePath: "docs/release/deprecation-and-migration-policy.md",
    aiPurpose:
      "Use this before breaking public APIs, CSS contracts, or behavior.",
    tags: ["release", "migration"],
    content: deprecationPolicy,
  },
  {
    id: "release-readiness",
    title: "Release Readiness",
    group: "Release",
    description: "Reusable release checklist.",
    sourcePath: "docs/release/release-readiness-checklist.md",
    aiPurpose:
      "Use this to validate alpha, beta, and stable release readiness.",
    tags: ["release", "checklist"],
    content: releaseReadinessChecklist,
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
    content: uiCoreDoc,
  },
  {
    id: "ui-behaviors",
    title: "ui-behaviors",
    group: "Packages",
    description: "Planned framework-neutral controller and state boundary.",
    sourcePath: "docs/packages/ui-behaviors.md",
    aiPurpose:
      "Use this before extracting portable component behavior from React.",
    tags: ["package", "ui-behaviors", "planned"],
    canonical: true,
    content: uiBehaviorsDoc,
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
    content: uiComponentsDoc,
  },
  {
    id: "ui-elements",
    title: "ui-elements",
    group: "Packages",
    description: "Planned native Custom Element renderer boundary.",
    sourcePath: "docs/packages/ui-elements.md",
    aiPurpose:
      "Use this before implementing native elements or framework consumer adapters.",
    tags: ["package", "ui-elements", "custom-elements", "planned"],
    canonical: true,
    content: uiElementsDoc,
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
    content: uiDataGridDoc,
  },
  {
    id: "metadata-packages",
    title: "Metadata / Packages",
    group: "Metadata",
    description:
      "Machine-readable package ownership, dependencies, CSS imports, and entry points.",
    sourcePath: "docs/metadata/packages.json",
    aiPurpose:
      "Use this for package ownership and dependency direction lookup.",
    tags: ["metadata", "packages", "json"],
    kind: "metadata",
    content: metadataPackages,
  },
  {
    id: "metadata-multi-framework",
    title: "Metadata / Multi-Framework",
    group: "Metadata",
    description:
      "Machine-readable renderer support, package topology, release groups, and fixture policy.",
    sourcePath: "docs/metadata/multi-framework.json",
    aiPurpose:
      "Use this for approved framework support and package topology lookup.",
    tags: ["metadata", "multi-framework", "packages", "json"],
    kind: "metadata",
    content: metadataMultiFramework,
  },
  {
    id: "metadata-component-contracts",
    title: "Metadata / Component Contracts",
    group: "Metadata",
    description:
      "Machine-readable events, slots, form association, and representative component contracts.",
    sourcePath: "docs/metadata/component-contracts.json",
    aiPurpose:
      "Use this before adding renderer-specific component APIs or event names.",
    tags: ["metadata", "contracts", "events", "slots", "json"],
    kind: "metadata",
    content: metadataComponentContracts,
  },
  {
    id: "metadata-component-contract-schema",
    title: "Metadata / Component Contract Schema",
    group: "Metadata",
    description:
      "JSON Schema for the cross-framework component contract catalog.",
    sourcePath: "docs/metadata/component-contract.schema.json",
    aiPurpose: "Use this to validate new canonical component-contract records.",
    tags: ["metadata", "schema", "contracts", "json"],
    kind: "metadata",
    content: metadataComponentContractSchema,
  },
  {
    id: "metadata-design-tokens",
    title: "Metadata / Design Tokens",
    group: "Metadata",
    description:
      "Machine-readable semantic token categories, themes, density, motion, layers, and compatibility bridges.",
    sourcePath: "docs/metadata/design-tokens.json",
    aiPurpose:
      "Use this before changing shared token names, roles, aliases, or ownership.",
    tags: ["metadata", "tokens", "theme", "json"],
    kind: "metadata",
    content: metadataDesignTokens,
  },
  {
    id: "api-overview",
    title: "API Overview",
    group: "API Reference",
    description: "Public API overview and reference index.",
    sourcePath: "docs/api/README.md",
    aiPurpose: "Use this before consuming VyrnForge public APIs.",
    tags: ["api", "canonical"],
    canonical: true,
    content: apiOverview,
  },
  {
    id: "api-import-and-setup",
    title: "Import and Setup",
    group: "API Reference",
    description: "Package import and CSS setup order.",
    sourcePath: "docs/api/import-and-setup.md",
    aiPurpose: "Use this before importing package CSS or components.",
    tags: ["api", "imports", "css"],
    content: apiImportSetup,
  },
  {
    id: "api-ui-core",
    title: "ui-core API",
    group: "API Reference",
    description: "Public token, theme, density, utility, and helper API.",
    sourcePath: "docs/api/ui-core-api.md",
    aiPurpose: "Use this before consuming ui-core tokens or theme helpers.",
    tags: ["api", "ui-core"],
    content: apiUiCore,
  },
  {
    id: "api-ui-components",
    title: "ui-components API",
    group: "API Reference",
    description: "Public React component API overview.",
    sourcePath: "docs/api/ui-components-api.md",
    aiPurpose: "Use this before using VyrnForge components.",
    tags: ["api", "ui-components"],
    content: apiUiComponents,
  },
  {
    id: "api-ui-data-grid",
    title: "ui-data-grid API",
    group: "API Reference",
    description: "Public data-grid component, state, adapter, and styling API.",
    sourcePath: "docs/api/ui-data-grid-api.md",
    aiPurpose: "Use this before consuming grid components, state, or adapters.",
    tags: ["api", "ui-data-grid"],
    content: apiUiDataGrid,
  },
  {
    id: "api-css-tokens",
    title: "CSS Tokens",
    group: "API Reference",
    description: "Stable public CSS variables.",
    sourcePath: "docs/api/css-token-reference.md",
    aiPurpose: "Use this before overriding VyrnForge CSS variables.",
    tags: ["api", "css", "tokens"],
    content: apiCssTokens,
  },
  {
    id: "api-css-classes",
    title: "CSS Classes",
    group: "API Reference",
    description: "Public class prefixes and extension rules.",
    sourcePath: "docs/api/css-class-reference.md",
    aiPurpose: "Use this before relying on VyrnForge class names.",
    tags: ["api", "css", "classes"],
    content: apiCssClasses,
  },
  {
    id: "api-public-vs-internal",
    title: "Public vs Internal API",
    group: "API Reference",
    description:
      "Defines stable public API and private implementation details.",
    sourcePath: "docs/api/public-vs-internal-api.md",
    aiPurpose: "Use this before importing non-obvious APIs or deep paths.",
    tags: ["api", "boundaries"],
    content: apiPublicVsInternal,
  },
  {
    id: "metadata-components",
    title: "Metadata / Components",
    group: "Metadata",
    description: "Machine-readable component and public contract catalog.",
    sourcePath: "docs/metadata/components.json",
    aiPurpose:
      "Use this to understand components, status, usage rules, classes, and imports.",
    tags: ["metadata", "components", "json"],
    kind: "metadata",
    content: metadataComponents,
  },
  {
    id: "metadata-css-imports",
    title: "Metadata / CSS Imports",
    group: "Metadata",
    description: "CSS import order and styling ownership metadata.",
    sourcePath: "docs/metadata/css-imports.json",
    aiPurpose: "Use this before changing or consuming VyrnForge styles.",
    tags: ["metadata", "css", "json"],
    kind: "metadata",
    content: metadataCssImports,
  },
  {
    id: "metadata-state-contracts",
    title: "Metadata / State Contracts",
    group: "Metadata",
    description: "State ownership and adapter policy metadata.",
    sourcePath: "docs/metadata/state-contracts.json",
    aiPurpose:
      "Use this before adding state, persistence, server, or export behavior.",
    tags: ["metadata", "state", "adapters", "json"],
    kind: "metadata",
    content: metadataStateContracts,
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
    content: metadataAiUsageRules,
  },
  {
    id: "docs-app-spec",
    title: "Docs App Spec",
    group: "React Docs",
    description: "Specification for the human-facing docs app.",
    sourcePath: "docs/react-docs/00-react-docs-app-spec.md",
    aiPurpose: "Use this before changing the docs app.",
    tags: ["react-docs"],
    content: docsAppSpec,
  },
  {
    id: "route-map",
    title: "Route Map",
    group: "React Docs",
    description: "Required route structure.",
    sourcePath: "docs/react-docs/01-route-map.md",
    aiPurpose: "Use this to align docs navigation.",
    tags: ["react-docs", "routes"],
    content: routeMap,
  },
  {
    id: "example-standards",
    title: "Example Standards",
    group: "React Docs",
    description: "Rules for examples, snippets, and use-case pages.",
    sourcePath: "docs/react-docs/02-example-standards.md",
    aiPurpose: "Use this before adding docs examples.",
    tags: ["react-docs", "examples"],
    content: exampleStandards,
  },
  {
    id: "ai-readable-docs",
    title: "AI-Readable Docs",
    group: "React Docs",
    description: "How docs expose machine-readable context.",
    sourcePath: "docs/react-docs/03-ai-readable-docs.md",
    aiPurpose: "Use this before adding AI-facing docs metadata.",
    tags: ["react-docs", "ai"],
    content: aiReadableDocs,
  },
  {
    id: "ai-documentation-strategy",
    title: "AI Documentation Strategy",
    group: "AI",
    description: "Strategy for AI-readable VyrnForge UI docs.",
    sourcePath: "docs/ai/00-ai-documentation-strategy.md",
    aiPurpose: "Use this to keep AI docs useful and non-duplicative.",
    tags: ["ai", "docs"],
    content: aiDocumentationStrategy,
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
    content: agents,
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
    content: repoMap,
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
    content: codingRules,
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
    content: componentMapJson,
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
    content: aiContext,
  },
  {
    id: "component-reference",
    title: "Component Reference",
    group: "Start Here",
    description: "Generated viewer summary of current and planned components.",
    sourcePath: "docs/roadmap/01-component-inventory.md",
    aiPurpose:
      "Use this as a navigable summary. The markdown inventory remains source of truth.",
    tags: ["components", "reference"],
    kind: "component-reference",
  },
  {
    id: "package-reference",
    title: "Package Reference",
    group: "Start Here",
    description: "Generated viewer summary of package responsibilities.",
    sourcePath: "docs/architecture/01-package-boundaries.md",
    aiPurpose:
      "Use this as a navigable summary. Architecture docs remain source of truth.",
    tags: ["packages", "reference"],
    kind: "package-reference",
  },
];

export const docsGroups = [
  "Start Here",
  "Architecture",
  "Roadmap",
  "Release",
  "Packages",
  "API Reference",
  "Metadata",
  "React Docs",
  "AI",
];

export function getRouteById(id: string) {
  return docsRoutes.find((route) => route.id === id) ?? docsRoutes[0];
}
