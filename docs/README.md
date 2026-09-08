# VyrnForge UI Documentation

This is the canonical documentation entrypoint for VyrnForge UI. Choose the
source that owns the question instead of creating another copy of the same fact.

## Use VyrnForge

| Topic | Canonical documentation |
| --- | --- |
| Installation, package imports, CSS, and registration | [Import and Setup](api/import-and-setup.md) |
| Public API | [API Reference](api/README.md) |
| Generated component/framework reference | [Generated Component Reference](generated/component-reference.json) |
| Framework selection and integration | [Multi-Framework Migration and Limitations](release/multi-framework-migration-and-limitations.md) |
| Angular facade, Forms, refs, SSR, and migration | [Angular Package](packages/ui-angular.md) |
| Vue facade, v-model, slots, refs, SSR, and migration | [Vue Package](packages/ui-vue.md) |
| Themes and CSS | [Theming and Styling](architecture/03-theming-and-styling.md) |
| CSS tokens | [CSS Token Reference](api/css-token-reference.md) |
| Public CSS classes | [CSS Class Reference](api/css-class-reference.md) |
| Current known limitations | [Known Limitations](quality/03-known-limitations.md) |

Package-specific guidance:

- [ui-core](packages/ui-core.md)
- [ui-behaviors](packages/ui-behaviors.md)
- [ui-components](packages/ui-components.md)
- [ui-elements](packages/ui-elements.md)
- [ui-angular](packages/ui-angular.md)
- [ui-vue](packages/ui-vue.md)
- [ui-data-grid](packages/ui-data-grid.md)

## Build VyrnForge

Start with [CONTRIBUTING.md](../CONTRIBUTING.md), then use the canonical source
for the foundation you are changing.

| Topic | Canonical documentation |
| --- | --- |
| Project identity and durable scope | [Project Source of Truth](governance/01-project-source-of-truth.md) |
| System architecture | [System Overview](architecture/00-system-overview.md) |
| Package ownership and dependencies | [Package Boundaries](architecture/01-package-boundaries.md) |
| State and adapters | [State and Adapter Ownership](architecture/02-state-and-adapter-ownership.md) |
| Styling | [Theming and Styling](architecture/03-theming-and-styling.md) |
| Implementation boundaries | [Clean Code Boundaries](architecture/04-clean-code-boundaries.md) |
| Accessibility | [Accessibility Standards](architecture/05-accessibility-standards.md) |
| Component contracts and events | [Component Contracts and Events](architecture/09-component-contracts-and-events.md) |
| Custom Elements and forms | [Custom Elements and Form Association](architecture/10-custom-elements-and-form-association.md) |
| Framework exception policy | [ADR-008](architecture/adr-008-framework-exception-policy.md) |
| AI consumption architecture | [ADR-010](architecture/adr-010-ai-consumption-contract.md) |
| Optional advanced modules | [ADR-011](architecture/adr-011-optional-advanced-module-architecture.md) |
| Framework extensibility | [ADR-012](architecture/adr-012-framework-extensibility-contract.md) |
| Reusable patterns and templates | [ADR-013](architecture/adr-013-pattern-template-contract.md) |
| Browser testing | [Browser Testing](testing/browser-testing.md) |
| Visual regression | [Visual Regression Testing](testing/visual-regression.md) |
| Cross-framework consumer fixtures | [Consumer Fixture Strategy](testing/multi-framework-consumer-fixtures.md) |

The canonical component catalog and maturity records live in
[`metadata/components.json`](metadata/components.json). Generated views derive
from canonical metadata rather than maintain another component list.

## Maintain VyrnForge

| Topic | Canonical source |
| --- | --- |
| Documentation ownership | [Documentation Governance](governance/00-documentation-governance.md) |
| Document lifecycle | [Document Lifecycle](governance/02-document-lifecycle.md) |
| Naming and terminology | [Naming and Terminology](governance/03-naming-and-terminology.md) |
| Metadata maintenance | [Metadata Maintenance](governance/04-metadata-maintenance.md) |
| Repository hygiene | [Repository Hygiene](governance/repository-hygiene.md) |
| Quality gates | [Quality Gates](quality/00-quality-gates.md) |
| Generated repository inventory | [Repository Inventory](governance/repository-inventory.md) |
| CI and workflow boundaries | [CI/CD Architecture](engineering/ci-cd-architecture.md) |
| Release process | [Release Documentation](release/README.md) |
| Publication procedure | [Publication Procedure](release/publication-procedure.md) |
| Release readiness | [Release Readiness Checklist](release/release-readiness-checklist.md) |

Active sprint, task, dependency, and gate execution is owned by the Drive
spreadsheet **VyrnForge Progress Tracker — Live Status**. The repository does not
maintain a competing sprint roadmap. Current implementation truth comes from
manifests, public entrypoints, canonical metadata, implementation, and executable
evidence.

## Historical evidence

Retain historical material only when it has explicit continuing audit, migration,
regression, compatibility, release, or architectural value. It never overrides
current guidance. Obsolete sprint planning and superseded guidance are recovered
from Git history rather than copied into a documentation archive.

## AI consumer context

AI consumers begin with
[`generated/ai-context/index.json`](generated/ai-context/index.json) and retrieve
the smallest relevant pattern, category, or component slice. Generated AI context
and generated component/framework references derive from canonical metadata; they
are views, not independent sources of truth.
