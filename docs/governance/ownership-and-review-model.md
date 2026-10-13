---
title: VyrnForge UI Ownership and Review Model
status: Stable
owner: Architecture
last_reviewed: 2026-10-13
canonical: true
---

# Ownership and Review Model

## Purpose

This document defines accountable ownership and review expectations for VyrnForge UI. It applies to shared foundations, framework surfaces, common components, optional advanced modules, quality evidence, accessibility, documentation, and delivery infrastructure.

It does not create a CODEOWNERS configuration, set GitHub approval counts, or replace release-specific responsibilities in `docs/release/release-responsibility-matrix.md`.

## Operating principles

- An **accountable owner** owns decision quality, canonical documentation, and follow-up for a workstream. The accountable owner is not necessarily the implementation author.
- An **implementation author** may work in any area but must obtain required review when a change crosses an ownership boundary.
- Ownership is role-based, not person-based. Named maintainers, CODEOWNERS, approval counts, environment reviewers, and host settings remain external configuration.
- One person may temporarily hold multiple roles. For public API, accessibility, release, or architecture decisions, seek independent review when one is available and record the relevant roles.
- Native HTML / Custom Elements, React, Angular, and Vue are equal first-class product surfaces. Review ownership must not make one framework the semantic owner of shared VyrnForge behavior.
- Package dependency rules are owned by `docs/architecture/01-package-boundaries.md` and package manifests rather than duplicated as a partial graph here.
- Shared behavior, contracts, tokens, accessibility semantics, and generated mappings should be reviewed at their shared owner before framework-specific adapters are treated as independent sources of truth.

## Responsibility matrix

<!-- prettier-ignore -->
| Workstream | Accountable owner | Owns | Required review partner | Escalation owner |
| --- | --- | --- | --- | --- |
| Design Foundation | UI Platform | `@vyrnforge/ui-core`, semantic tokens, themes, density, typography, motion, layers, shared styling utilities | Architecture for public token/boundary changes; Accessibility for interaction-visible token semantics | Architecture |
| Shared Behaviors | UI Platform / Component Architecture | `@vyrnforge/ui-behaviors`, framework-neutral state transitions, collections, navigation, overlays, forms, reasoned events | Accessibility for interaction contracts; framework owners for adapter implications | Architecture |
| Native HTML / Custom Elements | Component Team | `@vyrnforge/ui-elements` public Native surface and browser implementation where appropriate | Accessibility for interaction changes; Architecture for public contract/boundary changes | Architecture |
| React | Component Team | `@vyrnforge/ui-components` React-facing API and React-specific integration | Shared-contract owner for semantic changes; Accessibility for interaction changes | Architecture |
| Angular | Component Team | `@vyrnforge/ui-angular` Angular-facing API, bindings, Forms integration, composition | Shared-contract owner for semantic changes; Accessibility for interaction changes | Architecture |
| Vue | Component Team | `@vyrnforge/ui-vue` Vue-facing API, props/emits, `v-model`, slots, refs, setup | Shared-contract owner for semantic changes; Accessibility for interaction changes | Architecture |
| Advanced Modules | Module owner | Optional advanced VyrnForge modules, including current Data Grid implementation and module-specific algorithms/state | Quality Engineering for test strategy; Accessibility for interaction changes; Architecture for shared/public boundaries | Architecture |
| Quality Engineering | Quality Engineering | Unit, DOM, browser, coverage, regression, packed-consumer, compatibility, and evidence strategy | Owning capability/package team | Architecture for validation-policy changes |
| Accessibility | Accessibility | Keyboard, focus, ARIA/semantics, assistive-technology evidence, interaction accessibility review | Owning capability/package team and Quality Engineering | Architecture for unresolved contract decisions |
| Documentation / Reference | Documentation | Documentation governance, Reference presentation, authored guidance, generated-reference quality, AI context, documentation metadata | Owning capability/package team for technical accuracy | Architecture for canonical-source conflicts |
| DevOps / Release | DevOps / Release | GitHub Actions, package/release automation, trusted publishing, environments, Pages delivery, registry verification | Package/capability owner; Documentation for release-facing changes | Architecture for release policy; repository administrator for host settings |
| Architecture | Architecture | Package boundaries, shared/public contracts, framework exception policy, maturity policy, ADR approval, breaking-change approval | All directly affected accountable owners | Repository maintainers when a decision exceeds documented policy |

## Required review by change type

<!-- prettier-ignore -->
| Change type | Required accountable review | Additional review trigger |
| --- | --- | --- |
| Shared tokens, themes, density, typography, motion, or styling utilities | Design Foundation | Architecture for public token/boundary compatibility; Accessibility when user-visible interaction semantics change |
| Shared behaviors, state transitions, collections, overlays, forms, or event semantics | Shared Behaviors | Accessibility for interaction semantics; affected framework-surface owners for adapter impact |
| Native/React/Angular/Vue public adapter behavior | Owning framework surface | Shared-contract owner when semantics change; Architecture for public API or framework-exception changes |
| New reusable component capability or canonical component contract | Component Team / Architecture | Accessibility, Quality Engineering, and all affected framework surfaces |
| Optional advanced-module rendering, state, algorithms, adapters, or performance | Module owner | Quality Engineering; Accessibility; Architecture for shared/public boundary changes |
| Tests, browser tooling, compatibility, packed consumers, or regression infrastructure | Quality Engineering | Owning capability/package team; Accessibility when tests encode accessibility contracts |
| Keyboard, ARIA, focus, overlays, composites, validation, drag/reorder, disabled/error, contrast, or reduced-motion behavior | Accessibility | Owning capability/package team and Quality Engineering |
| Documentation governance, canonical metadata, Reference generation/presentation, or AI context | Documentation | Owning capability/package team for semantic accuracy; Architecture when authority changes |
| Package manifests, exports, packed artifacts, publication, or release records | DevOps / Release | Owning package/capability team; Architecture for dependency/public API/versioning changes |
| Cross-package dependency, shared state ownership, adapter boundary, maturity, framework exception, or ADR decision | Architecture | All directly affected accountable owners |

## Public API approval rules

The public API consists of published package entrypoints and documented public CSS/contract surfaces, backed by canonical metadata and API documentation.

1. A new, changed, deprecated, or removed public export requires review from the owning capability/package team and Architecture.
2. Shared semantic changes must update the canonical framework-neutral contract first where such a contract exists; framework adapters must not silently become the only owner of the change.
3. Update package-owned guidance, canonical API/metadata, generated projections, migration guidance, and executable/consumer evidence as applicable. Do not update retired hand-maintained AI mirrors.
4. Quality Engineering confirms that automated, packed-consumer, browser, accessibility, or compatibility evidence is appropriate for the change.
5. Experimental or prerelease APIs must not be presented at a higher maturity than canonical metadata and evidence support.
6. Breaking changes require Architecture approval, migration guidance, compatibility/release review, and explicit versioning treatment. No compatibility alias is assumed by default.

## Framework review rules

Framework surfaces are peers, but implementation work does not need artificial four-way duplication.

- A framework-only fix may remain in one adapter when the issue is genuinely framework-specific.
- If the change alters shared semantics, state transitions, events, accessibility behavior, tokens, or framework-neutral contracts, review begins at the shared owner and then covers affected adapters.
- Framework-specific exceptions must be explicit, narrow, traceable, metadata-backed where required, and tested.
- Independent framework work may proceed in parallel after shared prerequisites are available. Review sequencing follows technical dependencies rather than React, Angular, Vue, or Native preference.

## Token and CSS approval rules

- UI Platform owns shared `--vf-*` semantic tokens and `vf-*` shared styling utilities.
- Advanced-module owners review module-specific token namespaces such as current Data Grid `--udg-*` and `udg-*` compatibility surfaces.
- Component/framework owners review component styling that consumes shared tokens or changes reusable surface behavior.
- Architecture review is required when token ownership moves between packages, compatibility changes, or a shared/module-specific distinction becomes unclear.
- CSS-only changes still require documentation review when public customization guidance, token meaning, supported class usage, or import behavior changes.

## Accessibility review triggers

Accessibility review is required when a change affects:

- keyboard navigation, roving focus, focus restoration/trapping, Escape or outside-dismiss behavior;
- roles, labels, descriptions, live regions, form semantics, validation, or assistive-technology announcements;
- overlays, dialogs, menus, popovers, drawers, tooltips, autocomplete, transfer lists, tabs, trees, grids, or other composite widgets;
- pointer-only behavior, drag/resize/reorder behavior, disabled/error states, contrast, reduced motion, or responsive overflow that affects focus or operability.

Accessibility determines whether automated evidence is sufficient or manual browser/assistive-technology evidence is required. Quality Engineering owns the related automation strategy; the capability owner owns the product correction.

## Documentation ownership

Documentation owns source-of-truth placement, editorial quality, Reference projection/presentation, documentation metadata, and AI-facing context. It does not unilaterally decide runtime behavior, package boundaries, framework support, or public API maturity.

- Capability/package owners own technical correctness of their guidance.
- Canonical component/package human guidance should follow the ownership model in `docs/engineering/documentation-ownership.md`.
- Architecture resolves duplicate or conflicting canonical guidance.
- Superseded documents follow `docs/governance/documentation.md`: merge unique current value first, then delete by default unless continuing audit/migration/regression/architectural value justifies archival.
- Interactive Reference examples must use public contracts and verified example identities; they are evidence/presentation, not an alternate API registry or separate product authority.
- Generated documentation and AI projections must derive from canonical inputs and fail verification on drift.

## Release approval rules

- DevOps / Release owns workflow execution, package verification, npm trusted publishing, release environments, registry verification, Pages delivery, and release-record process.
- The accountable package/capability owner confirms behavior, public surface, limitations, and release notes for its scope.
- Architecture approves coordinated versioning, maturity promotion, deprecations, dependency-boundary changes, and breaking changes.
- Documentation confirms installation, migration, framework/support, maturity, and usage statements are accurate.
- Release approval does not replace protected environments, external trusted-publisher bindings, branch protection, or required current-main evidence.

## Escalation path

1. The implementation author raises a cross-workstream concern with the accountable owner for the changed area.
2. The accountable owner involves required review partners when a trigger applies.
3. Architecture resolves shared-contract, package-boundary, public API, maturity, framework-exception, or canonical-source conflicts.
4. DevOps / Release and repository administrators resolve external GitHub, npm, environment, registry, Pages, or permission configuration issues.
5. Unresolved high-risk accessibility concerns remain blocked from maturity promotion or release claims until Accessibility and Architecture record a disposition.

## External configuration

This document intentionally does not name current individual maintainers or claim host-level settings that source control cannot verify. CODEOWNERS, approval counts, branch protection, environment reviewers, npm organization administration, trusted-publisher bindings, and Pages settings require separately verified repository/service configuration.
