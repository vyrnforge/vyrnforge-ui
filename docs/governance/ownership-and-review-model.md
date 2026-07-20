---
title: VyrnForge UI Ownership and Review Model
status: Stable
owner: Architecture
last_reviewed: 2026-07-20
canonical: true
---

# Ownership and Review Model

## Purpose

This document defines accountable ownership and review expectations for
VyrnForge UI. It applies to the shared UI foundation, components, data grid,
quality evidence, accessibility, documentation, and delivery infrastructure.

It does not create a CODEOWNERS configuration, change GitHub approval rules, or
replace the release-specific responsibilities in
`docs/release/release-responsibility-matrix.md`.

## Operating Principles

- An **accountable owner** owns the decision quality, documentation, and
  follow-up for a workstream. The accountable owner is not necessarily the
  implementation author.
- An **implementation author** may work in any area, but must obtain the
  required review before merging a change that crosses an ownership boundary.
- One person may temporarily hold multiple roles. In that case, the review
  record must identify the roles considered and seek an independent reviewer
  whenever one is available for public API, accessibility, release, or
  architecture decisions.
- Ownership is role-based, not person-based. Named maintainers, CODEOWNERS,
  approval counts, and environment reviewers remain external configuration and
  require a separate governance task.
- Package boundaries remain authoritative: `ui-core` is independent;
  `ui-components` may depend on `ui-core`; `ui-data-grid` may depend on both.

## Responsibility Matrix

| Workstream | Accountable owner | Owns | Required review partner | Escalation owner |
| --- | --- | --- | --- | --- |
| UI Platform | UI Platform | `@vyrnforge/ui-core`, tokens, themes, density, shared CSS utilities | Architecture for public token or boundary changes | Architecture |
| Components | Component Team | `@vyrnforge/ui-components`, reusable primitives, forms, overlays, navigation, feedback | Accessibility for interaction changes; Architecture for public API changes | Architecture |
| Data Grid | Data Grid Team | `@vyrnforge/ui-data-grid`, grid architecture, row/column models, selection, filtering, grouping, performance | Quality Engineering for test strategy; Accessibility for interaction changes | Architecture |
| Quality Engineering | Quality Engineering | Unit, DOM, browser, coverage, regression, and consumer-test strategy | Owning package team | Architecture for quality-gate policy |
| Accessibility | Accessibility | Keyboard contracts, screen-reader behavior, focus management, interaction accessibility review | Owning package team | Architecture for unresolved contract decisions |
| Documentation | Documentation | Component docs, API references, playground, AI context, and source-of-truth governance | Owning package team for technical accuracy | Architecture for canonical-document conflicts |
| DevOps / Release | DevOps / Release | GitHub Actions, npm publishing, trusted publishing, release environments, package verification | Package owner and Documentation for release-facing changes | Architecture for release policy; repository administrator for external settings |
| Architecture | Architecture | Package boundaries, public API decisions, ADR approval, maturity promotion, breaking-change approval | Accountable workstream owner | Repository maintainers when a decision exceeds documented policy |

## Required Review by Change Type

| Change type | Required accountable review | Additional review trigger |
| --- | --- | --- |
| `@vyrnforge/ui-core` tokens, themes, density, or shared utilities | UI Platform | Architecture when public token names, CSS utilities, package boundaries, or compatibility change |
| `@vyrnforge/ui-components` component behavior or public props | Component Team | Accessibility for interactive behavior; Architecture for public API or maturity changes |
| `@vyrnforge/ui-data-grid` rendering, state, algorithms, adapters, or performance | Data Grid Team | Quality Engineering for test strategy; Accessibility for interactive behavior; Architecture for public API changes |
| Tests, coverage, browser tooling, or regression infrastructure | Quality Engineering | Owning package team; Accessibility when tests encode accessibility contracts |
| Keyboard, ARIA, focus, dialogs, menus, popovers, drawers, composites, or form semantics | Accessibility | Owning package team and Quality Engineering when automated coverage changes |
| Markdown docs, metadata, playground examples, or AI context | Documentation | Owning package team when public usage or behavior is described |
| Package manifests, exports, packed artifacts, consumer fixture, publication, or release records | DevOps / Release | Owning package team; Architecture for public API/versioning decisions |
| Cross-package dependency, state ownership, adapter boundary, maturity, or ADR decision | Architecture | All directly affected accountable owners |

## Public API Approval Rules

The public API is the package root and documented CSS subpath exports, together
with the public contracts described in `docs/api/` and structured metadata.

1. A new, changed, deprecated, or removed public export requires approval from
   the owning package team and Architecture.
2. The change must update the relevant package README, API reference,
   `docs/metadata/`, `.ai/COMPONENT_MAP.json` when applicable, and playground
   or consumer evidence when the public usage changes.
3. Quality Engineering must confirm focused automated coverage is appropriate;
   `verify:packages` and `verify:consumer` remain release-boundary evidence.
4. During alpha, an API may remain experimental, but it must not be presented as
   stable without Architecture approval and documented evidence.
5. Breaking changes require Architecture approval, migration guidance, and
   release-policy review even before stable release. No compatibility alias is
   assumed by default.

## Token and CSS Approval Rules

- UI Platform approves shared `--vf-*` tokens and `vf-*` utility classes.
- Data Grid Team approves grid-specific `--udg-*` variables and `udg-*`
  classes.
- Component Team reviews component CSS that consumes shared tokens or changes
  reusable component styling.
- Architecture review is required when ownership moves between packages,
  compatibility changes, or a shared/grid-specific distinction becomes unclear.
- CSS-only changes still require documentation review when they change public
  customization guidance, token meaning, supported class usage, or import
  order.

## Accessibility Review Triggers

Accessibility review is required when a change affects any of the following:

- keyboard navigation, roving focus, focus restoration, focus trapping, or
  Escape/outside-dismiss behavior;
- roles, labels, descriptions, live regions, form semantics, validation, or
  screen-reader announcements;
- overlays, portals, dialogs, menus, popovers, drawers, tooltips,
  autocomplete, transfer lists, tabs, or data-grid interaction;
- pointer-only behavior, drag/resize/reorder behavior, disabled states, error
  states, contrast, reduced motion, or responsive overflow that affects focus.

The Accessibility owner records whether unit/static evidence is sufficient or a
manual browser/assistive-technology review is required. Quality Engineering
owns the related automation strategy; the component or grid team owns the
product correction.

## Release Approval Rules

- DevOps / Release owns workflow execution, package verification, npm trusted
  publishing, release environments, registry verification, and release-record
  process.
- The accountable package owner confirms package behavior, public surface, and
  release notes for its package.
- Architecture approves coordinated versioning, public API maturity promotion,
  deprecations, and breaking changes.
- Documentation confirms published usage, installation, migration, and
  maturity statements are accurate.
- Release approval does not replace the protected `npm-release` environment or
  external npm trusted-publisher configuration. Those controls are verified by
  the release process, not this document.

## Documentation Ownership

Documentation owns the quality and source-of-truth placement of Markdown,
metadata, playground content, and AI context. It does not unilaterally decide
runtime behavior or public API maturity.

- Package teams own technical correctness of their package documentation.
- Architecture resolves duplicate or conflicting canonical guidance.
- Documentation updates `docs/README.md` when a new canonical document is
  introduced and archives superseded documents rather than leaving competing
  direction.
- Playground examples must use public APIs and remain evidence of intended
  usage, not an alternate implementation surface.

## Escalation Path

1. The implementation author raises a cross-workstream concern with the
   accountable owner for the changed area.
2. The accountable owner involves the listed review partner when a trigger
   applies.
3. Architecture resolves package-boundary, public API, maturity, or conflicting
   source-of-truth decisions.
4. DevOps / Release and the repository administrator resolve external GitHub,
   npm, environment, registry, or permission configuration issues.
5. Unresolved high-risk accessibility concerns remain blocked from maturity
   promotion until Accessibility and Architecture record a disposition.

## Unresolved Ownership Questions

- Which named maintainers currently fill each role?
- Which roles require independent approval when one maintainer holds multiple
  roles?
- What approval counts and branch-protection rules should GitHub enforce?
- Who administers the `npm-release` environment, npm organization, trusted
  publisher bindings, and Pages settings?

These questions require repository and npm administration decisions. They are
not resolved by this documentation-only model.
