---
title: VyrnForge UI Ownership and Review Model
status: Stable
owner: Architecture
last_reviewed: 2026-10-13
canonical: true
---

# Ownership and Review Model

## Purpose

This document defines accountable ownership and review expectations for
VyrnForge. Ownership follows product capabilities and architectural boundaries,
not historical package names or framework rank.

Native HTML / Custom Elements, React, Angular, and Vue are equal first-class
surfaces. A framework package owns its idiomatic integration contract; no
framework package owns VyrnForge's shared component semantics merely because it
contains a current implementation.

This document does not create CODEOWNERS rules, name individual maintainers,
change GitHub approval counts, or replace release-specific responsibilities.

## Operating principles

- Ownership is role-based rather than person-based. One person may temporarily
  hold several roles.
- Shared semantic decisions belong to shared VyrnForge owners before framework
  adapters.
- Framework integration owners review idiomatic framework behavior without
  creating independent component semantics.
- Review requirements follow the kind of change and its impact, not the number
  of packages touched.
- Cross-framework work may proceed in parallel after real shared prerequisites
  are satisfied.
- Public API, accessibility, package boundary, release, and breaking-change
  decisions require review from the role that owns that contract.
- Current package topology is owned by package manifests and
  `docs/architecture/01-package-boundaries.md`, not duplicated here.

## Responsibility model

| Workstream | Accountable role | Owns | Required review partners |
| --- | --- | --- | --- |
| Product architecture | Architecture | package boundaries, canonical component model, cross-framework contracts, ADRs, compatibility and breaking-change decisions | directly affected capability and framework owners |
| Design foundation | Design Foundation | semantic tokens, themes, density, typography, motion, layers, shared styling contracts | Architecture for public token/boundary changes; Accessibility for accessibility-sensitive visuals |
| Shared behavior | Behavior Foundation | reusable state transitions, collections, overlays, forms, interaction reasons, keyboard/focus foundations | Accessibility and affected surface owners |
| Common component system | Component System | framework-neutral component semantics, composition, public capability contracts, maturity evidence | Design Foundation, Behavior Foundation, Accessibility, affected surface owners |
| Native HTML / Custom Elements | Native Integration | native/custom-element registration, DOM-facing attributes/events/methods/slots, browser integration | Component System and Architecture when shared semantics change |
| React | React Integration | idiomatic React props, refs, composition, React compatibility, React-specific exceptions | Component System and Architecture when shared semantics change |
| Angular | Angular Integration | Angular inputs/outputs, templates, Forms integration, Angular compatibility and exceptions | Component System and Architecture when shared semantics change |
| Vue | Vue Integration | Vue props/emits, `v-model`, slots, refs, Vue compatibility and exceptions | Component System and Architecture when shared semantics change |
| Advanced modules | Module owner | module-specific contracts, algorithms, performance, state, styling and supported surface integrations | Architecture, Accessibility, Quality, and affected framework owners |
| Quality engineering | Quality Engineering | unit, contract, DOM, browser, coverage, regression, packed-consumer and evidence strategy | owner of the changed capability |
| Accessibility | Accessibility | keyboard, focus, semantics, assistive-technology expectations and accessibility evidence policy | capability owner and Quality Engineering |
| Documentation / Reference | Documentation | documentation placement, editorial quality, Reference presentation, generated documentation projections and source-of-truth consistency | canonical technical owner of the described capability |
| DevOps / Release | DevOps / Release | CI/CD, repository automation, package verification, publication, release environments and deployment mechanics | affected package/capability owner and Architecture for release-policy changes |

The roles above are conceptual ownership domains. They do not require separate
teams or one maintainer per row.

## Review triggers

### Shared semantics

Changes to canonical component behavior, state, events, accessibility semantics,
shared tokens, or cross-framework terminology require review from the relevant
shared foundation owner and every integration surface whose public contract is
affected.

A framework-only fix does not require unrelated framework code changes when the
problem is genuinely local. If the fix introduces a reusable concept, move that
concept to the shared owner first.

### Public API and compatibility

A new, changed, deprecated, or removed public export requires:

1. review from the owner of the public surface;
2. Architecture review when compatibility, package boundaries, or shared
   semantics change;
3. migration or deprecation guidance when applicable;
4. canonical metadata and generated reference updates where required;
5. packed-package or real-consumer verification for consumer-facing changes.

Breaking changes require an explicit migration path and release-policy review.
No compatibility alias or deprecation period is assumed automatically.

### Framework integrations

Native, React, Angular, and Vue integration owners review changes specific to
their framework surface. Framework-specific exceptions must remain narrow,
explicit, traceable, and represented by the canonical exception mechanism.

Do not use an implementation dependency on another VyrnForge package as proof
that the reused package owns the consuming framework's product semantics.

### Accessibility

Accessibility review is required when a change affects keyboard navigation,
focus movement/restoration/trapping, ARIA or native semantics, labeling,
announcements, form validation, overlays, composite widgets, drag/resize/reorder
behavior, disabled/error states, contrast, reduced motion, or responsive behavior
that changes interaction.

Accessibility decides whether automated evidence is sufficient or manual
browser/assistive-technology review remains required. Quality Engineering owns
the automation strategy; the capability owner owns the product correction.

### Tokens and styling

Design Foundation owns shared `--vf-*` tokens and shared styling contracts.
Component or module owners may define scoped extension tokens when the semantic
foundation does not already provide the needed role.

Architecture review is required when token ownership moves between packages,
compatibility changes, or a supposedly local token represents a reusable shared
semantic role.

### Documentation and Reference

Documentation owns placement, editorial quality, generated projection rules, and
Reference presentation. Technical owners remain accountable for the accuracy of
behavior, APIs, package integration, accessibility claims, and limitations.

The Docs application is a presentation layer and must not become a second owner
of component semantics, package facts, framework support, or API inventories.
Executable examples use canonical capability identities and verified framework
implementations rather than a separate Playground authority.

### Release and repository automation

DevOps / Release owns workflow execution, artifact verification, publication,
deployment, and external release controls. Package and capability owners confirm
the behavior and public surface being released.

Architecture reviews coordinated versioning, maturity promotion, deprecations,
and breaking changes. Documentation reviews release-facing installation,
migration, and support claims.

## Review evidence

Required evidence is proportional to the changed contract. Depending on impact,
it may include:

- unit or contract tests;
- browser and accessibility tests;
- packed package or external-consumer verification;
- generated-artifact currentness;
- framework-specific runtime evidence;
- visual/performance evidence;
- migration guidance;
- manual assistive-technology evidence;
- release or registry evidence.

A green check that does not exercise the changed contract is not sufficient
evidence merely because it exists.

## Branch and dependency ownership

Branch topology and PR dependency rules are owned by
[`05-trunk-delivery.md`](05-trunk-delivery.md). Reviewers should reject
framework-preference sequencing when independent tracks could run in parallel.

Stacked PRs must expose their real prerequisite and retarget path. Temporary
integration branches must remain bounded to one initiative and must not become
permanent ownership lanes.

## Escalation

1. Raise a concern with the accountable owner of the changed contract.
2. Involve required review partners for cross-boundary impact.
3. Architecture resolves package-boundary, shared-semantics, compatibility,
   maturity, and source-of-truth conflicts.
4. DevOps / Release and repository administrators resolve GitHub, npm,
   environment, registry, and permission configuration that cannot be committed
   in source control.
5. Unresolved high-risk accessibility or compatibility concerns remain blocked
   until the accountable roles record a disposition.

## External configuration

Named maintainers, CODEOWNERS patterns, approval counts, branch protections,
release-environment reviewers, npm organization administrators, trusted publisher
bindings, and Pages settings are external configuration. They should be aligned
with this model but must not be invented in repository documentation when the
actual configuration is unknown.

## Related canonical sources

- [Project Source of Truth](01-project-source-of-truth.md)
- [Trunk Delivery](05-trunk-delivery.md)
- [Documentation Governance](documentation.md)
- [Component Maturity Model](component-maturity-model.md)
- [Package Boundaries](../architecture/01-package-boundaries.md)
- [State and Adapter Ownership](../architecture/02-state-and-adapter-ownership.md)
- [CI/CD Architecture](../engineering/ci-cd-architecture.md)
- [Release Responsibility Matrix](../release/release-responsibility-matrix.md)
