# VyrnForge UI Documentation

This is the canonical documentation entrypoint for VyrnForge UI. Choose the
section that matches what you are trying to do.

Do not create a competing source of truth when an existing canonical document
already owns a topic. Update the canonical source and link to it instead.

## Use VyrnForge

Start here when consuming VyrnForge from an application.

- Installation, package imports, CSS, and registration:
  [Import and Setup](api/import-and-setup.md).
- Public API: [API Reference](api/README.md).
- Generated component/framework reference:
  [Generated Component Reference](generated/component-reference.json).
- Framework selection and integration:
  [Multi-Framework Migration and Limitations](release/multi-framework-migration-and-limitations.md).
- Angular facade, Forms, refs, SSR, and migration:
  [Angular Package](packages/ui-angular.md).
- Vue facade, `v-model`, slots, refs, SSR, and migration:
  [Vue Package](packages/ui-vue.md).
- Themes and CSS:
  [Theming and Styling](architecture/03-theming-and-styling.md).
- CSS tokens: [CSS Token Reference](api/css-token-reference.md).
- Public CSS classes: [CSS Class Reference](api/css-class-reference.md).
- Current known limitations: [Known Limitations](quality/03-known-limitations.md).
- Commercial-use guidance:
  [Commercial Licensing](legal/commercial-licensing.md).

Package-specific guidance:

- [ui-core](packages/ui-core.md)
- [ui-behaviors](packages/ui-behaviors.md)
- [ui-components](packages/ui-components.md)
- [ui-elements](packages/ui-elements.md)
- [ui-angular](packages/ui-angular.md)
- [ui-vue](packages/ui-vue.md)
- [ui-data-grid](packages/ui-data-grid.md)

## Build VyrnForge

Start with [CONTRIBUTING.md](../CONTRIBUTING.md), then use the canonical
documents for the foundation you are changing.

- Project identity and durable scope:
  [Project Source of Truth](governance/01-project-source-of-truth.md).
- System architecture: [System Overview](architecture/00-system-overview.md).
- Package ownership and dependencies:
  [Package Boundaries](architecture/01-package-boundaries.md).
- State and adapters:
  [State and Adapter Ownership](architecture/02-state-and-adapter-ownership.md).
- Styling: [Theming and Styling](architecture/03-theming-and-styling.md).
- Implementation boundaries:
  [Clean Code Boundaries](architecture/04-clean-code-boundaries.md).
- Accessibility:
  [Accessibility Standards](architecture/05-accessibility-standards.md).
- CSS ownership: [CSS Architecture](architecture/06-css-architecture.md).
- Overlay and focus: [Overlay and Focus](architecture/07-overlay-and-focus.md).
- Semantic tokens:
  [Semantic Token Contract](architecture/08-semantic-token-contract.md).
- Component contracts and events:
  [Component Contracts and Events](architecture/09-component-contracts-and-events.md).
- Custom Elements and forms:
  [Custom Elements and Form Association](architecture/10-custom-elements-and-form-association.md).
- Multi-framework support:
  [ADR-005: Canonical Web Implementation](architecture/adr-005-canonical-web-implementation.md)
  and [ADR-006: Public Framework Package Strategy](architecture/adr-006-framework-package-strategy.md).
- AI consumption architecture:
  [ADR-010: AI Consumption Contract](architecture/adr-010-ai-consumption-contract.md).
- Optional advanced modules:
  [ADR-011: Optional Advanced Module Architecture](architecture/adr-011-optional-advanced-module-architecture.md).
- Framework extensibility:
  [ADR-012: Framework Extensibility Contract](architecture/adr-012-framework-extensibility-contract.md).
- Reusable patterns and templates:
  [ADR-013: Reusable Pattern and Template Contract](architecture/adr-013-pattern-template-contract.md).
- Browser testing: [Browser Testing](testing/browser-testing.md).
- Visual regression: [Visual Regression Testing](testing/visual-regression.md).
- Cross-framework consumer fixtures:
  [Consumer Fixture Strategy](testing/multi-framework-consumer-fixtures.md).

The canonical component catalog and maturity records live in
[`metadata/components.json`](metadata/components.json). Generated views derive
from canonical metadata rather than maintain another hand-written component
list.

## Maintain VyrnForge

Use these sources for repository operations, governance, CI, release, ownership,
and metadata.

- Documentation ownership:
  [Documentation Governance](governance/00-documentation-governance.md).
- Document lifecycle and archive policy:
  [Document Lifecycle](governance/02-document-lifecycle.md).
- Naming and terminology:
  [Naming and Terminology](governance/03-naming-and-terminology.md).
- Metadata maintenance:
  [Metadata Maintenance](governance/04-metadata-maintenance.md).
- Ownership and review:
  [Ownership and Review Model](governance/ownership-and-review-model.md).
- Repository hygiene:
  [Repository Hygiene](governance/repository-hygiene.md).
- Quality gates: [Quality Gates](quality/00-quality-gates.md).
- Generated repository inventory:
  [Repository Inventory](governance/repository-inventory.md).
- CI, merge gates, Pages, and workflow boundaries:
  [CI/CD Architecture](engineering/ci-cd-architecture.md).
- Release process: [Release Documentation](release/README.md).
- Release responsibilities:
  [Release Responsibility Matrix](release/release-responsibility-matrix.md).
- Publication procedure:
  [Publication Procedure](release/publication-procedure.md).
- Release readiness:
  [Release Readiness Checklist](release/release-readiness-checklist.md).

The full legal text remains the root
[VyrnForge Source License 1.0](../LICENSE). Documentation links to that text
rather than duplicating it.

## Execution and planning

The live Google Drive spreadsheet **VyrnForge Progress Tracker — Live Status** is
the authoritative source for active sprint, task status, dependencies,
acceptance criteria, validation requirements, execution sequencing, and gate
status.

The GitHub repository does not maintain a competing sprint roadmap. Durable
product scope and architecture are owned by the governance and architecture
sources above. Current component maturity is owned by
[`metadata/components.json`](metadata/components.json), and current limitations
are owned by [Known Limitations](quality/03-known-limitations.md).

## Historical evidence

Evidence-heavy material remains only when it has continuing audit, regression,
release, migration, or architectural value. Historical evidence does not override
current canonical guidance or the live execution tracker.

- `quality/` contains current quality gates, limitations, architecture evidence,
  accessibility evidence, and justified retained records.
- `testing/` contains browser, visual, compatibility, consumer, and framework
  verification contracts.
- `metadata/` contains structured contracts and current evidence state.
- `release/evidence/` contains release-specific evidence retained by policy.

Obsolete material with no continuing repository value is removed according to
[Document Lifecycle](governance/02-document-lifecycle.md); Git history is the
recovery path.

Repository coding-agent rules live in [AGENTS.md](../AGENTS.md). Generated AI
consumer context lives under
[`generated/ai-context/`](generated/ai-context/) and derives from canonical
metadata rather than a separately maintained AI documentation tree.

## AI consumer context

AI consumers should begin with
[`generated/ai-context/index.json`](generated/ai-context/index.json) and retrieve
the smallest relevant pattern, category, or component slice. The generated files
derive from canonical metadata and are also published by the docs application;
they are not a second source of truth.
