# Project Source Of Truth

## Canonical positioning

VyrnForge UI is a native-owned, dependency-minimal, general-purpose UI system
with enterprise-grade depth. It supports applications ranging from public-facing
and SaaS products to internal tools, admin and customer portals, IAM systems,
workflow applications, reporting interfaces, dashboards, and data-heavy
products.

VyrnForge is not only a component library or data-grid package. It is one
contract-driven UI foundation spanning design, behavior, accessibility,
components, framework integration, tooling, and optional advanced UI
capabilities.

## Vision and mission

Provide one high-quality UI system that applications can adopt without making a
frontend framework, third-party UI runtime, or application state library the
owner of their design system, component semantics, accessibility model, or
interaction contracts.

VyrnForge therefore:

- owns its core UI implementation rather than wrapping another large UI library;
- remains lightweight and dependency-minimal for normal consumers;
- supports Native HTML / Custom Elements, React, Angular, and Vue as first-class
  non-grid surfaces through one shared VyrnForge model;
- keeps shared tokens, contracts, behaviors, accessibility rules, terminology,
  styling, and metadata framework-neutral where practical;
- provides idiomatic framework experiences without creating unrelated
  framework-specific design systems;
- treats accessibility, keyboard/focus behavior, internationalization,
  responsive behavior, SSR safety, performance, compatibility, and migration as
  core requirements;
- serves human and AI developers from the same canonical contracts and generated
  views.

## Native-owned implementation

Native-owned means VyrnForge owns its UI foundation and implementation strategy.
It does not mean Native HTML is the only first-class surface.

VyrnForge prefers browser standards, DOM/CSS/platform APIs, shared VyrnForge
contracts, and narrowly justified focused dependencies. It does not require MUI,
Ant Design, Tailwind, Radix, TanStack, Redux, Zustand, or another large UI/state
ecosystem as its implementation foundation.

Native HTML / Custom Elements is a first-class surface and the default canonical
non-grid browser implementation strategy where technically suitable. Framework
correctness and idiomatic developer experience remain product requirements;
evidence-backed framework-specific exceptions are allowed where a generic facade
cannot preserve them.

## Current implemented package roles

| Package | Current role | Release track |
| --- | --- | --- |
| `@vyrnforge/ui-core` | Framework-neutral tokens, themes, density, typography, motion, layers, and utilities. | Non-grid beta |
| `@vyrnforge/ui-behaviors` | Framework-neutral component controllers, state rules, and reasoned events. | Non-grid beta |
| `@vyrnforge/ui-components` | First-class React package. | Non-grid beta |
| `@vyrnforge/ui-elements` | First-class Native HTML / Custom Elements package. | Non-grid beta |
| `@vyrnforge/ui-angular` | First-class Angular facade over canonical Custom Elements. | Non-grid beta |
| `@vyrnforge/ui-vue` | First-class Vue facade over canonical Custom Elements. | Non-grid beta |
| `@vyrnforge/ui-data-grid` | Specialized React data-grid package. | Independent alpha |

Exact versions, dependencies, release-group membership, and tags are canonical in
[`../metadata/release-groups.json`](../metadata/release-groups.json) and package
manifests.

## Multi-framework architecture

React, Native HTML / Custom Elements, Angular, and Vue are first-class non-grid
surfaces. They share one design system, behavior model, accessibility model,
styling foundation, terminology, component contracts, metadata, and verification
model.

Accepted architecture decisions include:

- [ADR-005](../architecture/adr-005-canonical-web-implementation.md): native/DOM
  implementation is the default canonical non-grid web implementation; generated
  or generic facades are preferred and dedicated renderers require evidence.
- [ADR-006](../architecture/adr-006-framework-package-strategy.md): React keeps
  `@vyrnforge/ui-components`, Native HTML keeps `@vyrnforge/ui-elements`, and
  Angular/Vue use `@vyrnforge/ui-angular` and `@vyrnforge/ui-vue`.
- [ADR-008](../architecture/adr-008-framework-exception-policy.md): framework
  exceptions are narrow, evidence-backed, owned, tested, and reviewable.

Angular and Vue remain thin/generated facades over shared foundations with only
narrow handwritten integration where framework semantics require it. React keeps
framework-specific implementation only when compatibility, developer
experience, SSR, accessibility, or performance evidence justifies the exception.

The data grid remains a separate React alpha track. Multi-framework grid
renderers require a separate product/architecture decision and evidence program.

## State, styling, and dependency boundaries

Application state management remains outside VyrnForge. Consuming applications
may use Redux, Zustand, Pinia, NgRx, or other stores, but VyrnForge does not
require them.

Shared styling is token-driven through VyrnForge design tokens and CSS custom
properties. Light DOM remains the default native-element strategy unless a
specific evidence-backed exception requires otherwise.

Large UI frameworks, styling ecosystems, and state-management libraries are not
required implementation dependencies. A dependency is introduced only when its
value outweighs portability, maintenance, accessibility, and bundle costs.

## Advanced UI scope and non-goals

Sophisticated reusable UI can belong to VyrnForge when its primary
responsibility is how users see, enter, manipulate, navigate, visualize, or
interact with application information. Potential future families include tree
and tree-grid UI, visualization, advanced forms, workflow/diagram interfaces,
dashboards, rich editors, advanced drag/drop, and spatial UI controls.

Those capabilities require deliberate optional-module boundaries and evidence;
S16 does not start them. Exact future package names or topology are not invented
in advance.

VyrnForge does not thereby become:

- an application state, authentication, authorization, backend, routing, CMS, or
  workflow-execution runtime;
- a spreadsheet or BI calculation/pivot engine;
- a required mobile-native renderer;
- a 3D/game rendering engine;
- a wrapper around a large third-party UI ecosystem;
- four unrelated framework-specific component libraries sharing only a brand.

Renaming current packages solely for symmetry, universal Shadow DOM, a large
required Custom Element runtime, or broad data-grid decomposition require
concrete product/technical evidence rather than aesthetic cleanup.

## Public and generated truth

Shared component semantics are defined once through canonical tokens, behavior
contracts, accessibility obligations, form/model semantics, composition regions,
framework mappings, metadata, and verification.

Human documentation and AI context derive from those canonical sources.
Generated component references, repository inventories, framework API views, and
AI retrieval context are views, not independent facts to edit by hand.

## Source authority

Use the source that owns the question:

- **Product identity, durable scope, and non-goals:** this document.
- **Exact current package state:** package manifests, public entrypoints,
  `docs/metadata/packages.json`, and `docs/metadata/release-groups.json`.
- **Architecture decisions:** accepted ADRs and architecture contracts.
- **Component contracts and maturity:** canonical component metadata plus
  executable evidence.
- **Active sprint, task, dependency, and gate execution:** Drive spreadsheet
  `VyrnForge Progress Tracker — Live Status`.
- **Historical evidence:** retained evidence records with explicit continuing
  audit, migration, regression, compatibility, or architectural value.

Repository history is the recovery mechanism for superseded sprint prose; the
repository does not maintain a competing execution roadmap.

## Canonical related sources

- [Documentation Index](../README.md)
- [System Overview](../architecture/00-system-overview.md)
- [Package Boundaries](../architecture/01-package-boundaries.md)
- [State and Adapter Ownership](../architecture/02-state-and-adapter-ownership.md)
- [Component Contracts and Events](../architecture/09-component-contracts-and-events.md)
- [Canonical Web Implementation](../architecture/adr-005-canonical-web-implementation.md)
- [Framework Package Strategy](../architecture/adr-006-framework-package-strategy.md)
- [Framework Exception Policy](../architecture/adr-008-framework-exception-policy.md)
