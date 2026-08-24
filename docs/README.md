# VyrnForge UI Documentation

This is the canonical documentation entrypoint for VyrnForge UI. Choose the
section that matches what you are trying to do.

Do not create a competing source of truth when an existing canonical document
already owns a topic. Update the canonical document and link to it instead.

## Use VyrnForge

Start here when consuming VyrnForge from an application.

| Topic                                                | Canonical documentation                                                                           |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Installation, package imports, CSS, and registration | [Import and Setup](api/import-and-setup.md)                                                       |
| Public API                                           | [API Reference](api/README.md)                                                                    |
| Generated component/framework reference              | [Generated Component Reference](generated/component-reference.json)                               |
| Framework selection and integration                  | [Multi-Framework Migration and Limitations](release/multi-framework-migration-and-limitations.md) |
| Themes and CSS                                       | [Theming and Styling](architecture/03-theming-and-styling.md)                                     |
| CSS tokens                                           | [CSS Token Reference](api/css-token-reference.md)                                                 |
| Public CSS classes                                   | [CSS Class Reference](api/css-class-reference.md)                                                 |
| Current known limitations                            | [Known Limitations](quality/03-known-limitations.md)                                              |
| Commercial-use guidance                              | [Commercial Licensing](legal/commercial-licensing.md)                                             |

Package-specific guidance:

- [ui-core](packages/ui-core.md)
- [ui-behaviors](packages/ui-behaviors.md)
- [ui-components](packages/ui-components.md)
- [ui-elements](packages/ui-elements.md)
- [ui-data-grid](packages/ui-data-grid.md)

## Build VyrnForge

Start with [CONTRIBUTING.md](../CONTRIBUTING.md), then use the canonical
documents for the part of the foundation you are changing.

| Topic                              | Canonical documentation                                                                                         |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Project identity                   | [Project Source of Truth](governance/01-project-source-of-truth.md)                                             |
| System architecture                | [System Overview](architecture/00-system-overview.md)                                                           |
| Package ownership and dependencies | [Package Boundaries](architecture/01-package-boundaries.md)                                                     |
| State and adapters                 | [State and Adapter Ownership](architecture/02-state-and-adapter-ownership.md)                                   |
| Styling                            | [Theming and Styling](architecture/03-theming-and-styling.md)                                                   |
| Implementation boundaries          | [Clean Code Boundaries](architecture/04-clean-code-boundaries.md)                                               |
| Accessibility                      | [Accessibility Standards](architecture/05-accessibility-standards.md)                                           |
| CSS ownership                      | [CSS Architecture](architecture/06-css-architecture.md)                                                         |
| Overlay and focus                  | [Overlay and Focus](architecture/07-overlay-and-focus.md)                                                       |
| Semantic tokens                    | [Semantic Token Contract](architecture/08-semantic-token-contract.md)                                           |
| Component contracts and events     | [Component Contracts and Events](architecture/09-component-contracts-and-events.md)                             |
| Custom Elements and forms          | [Custom Elements and Form Association](architecture/10-custom-elements-and-form-association.md)                 |
| AI consumption architecture        | [ADR-010: AI Consumption Contract](architecture/adr-010-ai-consumption-contract.md)                             |
| Optional advanced modules          | [ADR-011: Optional Advanced Module Architecture](architecture/adr-011-optional-advanced-module-architecture.md) |
| Framework extensibility            | [ADR-012: Framework Extensibility Contract](architecture/adr-012-framework-extensibility-contract.md)           |
| Reusable patterns and templates    | [ADR-013: Reusable Pattern and Template Contract](architecture/adr-013-pattern-template-contract.md)            |
| Browser testing                    | [Browser Testing](testing/browser-testing.md)                                                                   |
| Visual regression                  | [Visual Regression Testing](testing/visual-regression.md)                                                       |
| Cross-framework consumer fixtures  | [Consumer Fixture Strategy](testing/multi-framework-consumer-fixtures.md)                                       |

The canonical component catalog and maturity records live in
[`metadata/components.json`](metadata/components.json). Generated views must
derive from canonical metadata rather than maintain another hand-written
component list.

## Maintain VyrnForge

Use these sources for repository operations, governance, CI, release, ownership,
and metadata.

| Topic                                           | Canonical documentation                                                   |
| ----------------------------------------------- | ------------------------------------------------------------------------- |
| Documentation ownership                         | [Documentation Governance](governance/00-documentation-governance.md)     |
| Document lifecycle and archive policy           | [Document Lifecycle](governance/02-document-lifecycle.md)                 |
| Naming and terminology                          | [Naming and Terminology](governance/03-naming-and-terminology.md)         |
| Metadata maintenance                            | [Metadata Maintenance](governance/04-metadata-maintenance.md)             |
| Ownership and review                            | [Ownership and Review Model](governance/ownership-and-review-model.md)    |
| Repository hygiene                              | [Repository Hygiene](governance/repository-hygiene.md)                    |
| Quality gates                                   | [Quality Gates](quality/00-quality-gates.md)                              |
| Generated repository inventory                  | [Repository Inventory](governance/repository-inventory.md)                |
| CI, merge gates, Pages, and workflow boundaries | [CI/CD Architecture](engineering/ci-cd-architecture.md)                   |
| Release process                                 | [Release Documentation](release/README.md)                                |
| Release responsibilities                        | [Release Responsibility Matrix](release/release-responsibility-matrix.md) |
| Publication procedure                           | [Publication Procedure](release/publication-procedure.md)                 |
| Release readiness                               | [Release Readiness Checklist](release/release-readiness-checklist.md)     |

The full legal text remains the root
[VyrnForge Source License 1.0](../LICENSE). Documentation should link to that
text rather than duplicate it.

## Project planning

Planning documents describe current direction and intentional future work. They
do not override accepted architecture, current package manifests, or canonical
public API contracts.

| Topic                                         | Canonical documentation                                                                         |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Current roadmap                               | [Master Roadmap](roadmap/00-master-roadmap.md)                                                  |
| Component catalog pointer and planning rules  | [Component Inventory](roadmap/01-component-inventory.md)                                        |
| Current gaps                                  | [Gap Analysis](roadmap/02-gap-analysis.md)                                                      |
| Explicitly deferred work                      | [Do Not Build Yet](roadmap/03-do-not-build-yet.md)                                              |
| Proposed vision, mission, and scope alignment | [Vision, Mission & Scope Alignment Review](roadmap/04-vision-mission-scope-alignment-review.md) |
| Component lifecycle and promotion             | [Component Maturity Model](governance/component-maturity-model.md)                              |

Current planning may use active task identifiers where they are useful for
execution. Normal usage guidance should not require readers to understand
historical sprint or gate identifiers.

## Historical evidence

Historical and evidence-heavy material that meets the document-retention policy
remains available for audits, regressions, release review, and architectural
context, but it does not override current canonical guidance.

| Area                                   | Purpose                                                                                                                |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| [quality/](quality/)                   | Current quality gates, limitations, architecture evidence, accessibility evidence, and retained stabilization records. |
| [testing/](testing/)                   | Detailed browser, visual, compatibility, consumer, and framework verification contracts.                               |
| [metadata/](metadata/)                 | Structured contracts, generated evidence state, release groups, and closure records.                                   |
| [release/evidence/](release/evidence/) | Release-specific evidence retained by policy.                                                                          |

Retained historical evidence never overrides active documentation. Obsolete
material with no continuing repository value is removed according to
[Document Lifecycle](governance/02-document-lifecycle.md); Git history remains
the recovery path.

AI and automation context lives in [AGENTS.md](../AGENTS.md) and the
[.ai/](../.ai/) directory. Those files point back to the same canonical
documentation rather than defining a separate architecture.

## AI consumer context

AI consumers should begin with [`generated/ai-context/index.json`](generated/ai-context/index.json) and retrieve the smallest relevant pattern, category, or component slice. The generated files derive from canonical metadata and are also published by the docs application; they are not a second source of truth.
