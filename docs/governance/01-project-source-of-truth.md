# Project Source Of Truth

## Canonical positioning

VyrnForge UI is a native-owned, dependency-minimal, general-purpose UI system
with enterprise-grade depth.

It is a first-class UI foundation for web applications ranging from public-facing
and SaaS products to internal tools, admin and customer portals, IAM systems,
workflow applications, reporting interfaces, dashboards, data-heavy products,
and sophisticated enterprise platforms.

Enterprise capability is a first-class strength, not the boundary of the
library's intended audience.

VyrnForge is not only a component library or data-grid package. It is one
contract-driven UI system spanning design, behavior, accessibility, components,
framework integration, tooling, and optional advanced UI capabilities.

## Vision

Provide one high-quality UI system that applications can adopt without making a
frontend framework, third-party UI runtime, or application state library the
owner of their design system, component semantics, accessibility model, or
interaction contracts.

## Mission

Build and maintain a portable, accessible, themeable, contract-driven UI system
that:

- owns its core UI implementation rather than wrapping another large UI library;
- remains lightweight and dependency-minimal for normal consumers;
- supports Native HTML, React, Angular, Vue, and future justified web frameworks
  through one shared VyrnForge model;
- provides idiomatic first-class framework experiences without creating
  unrelated framework-specific design systems;
- supports both common primitives and optional sophisticated UI capabilities;
- treats accessibility, keyboard/focus behavior, internationalization,
  responsive behavior, SSR safety, performance, compatibility, and migration as
  core product requirements;
- serves human developers and AI software-development systems through stable,
  machine-readable contracts and concise generated guidance.

## Meaning of native-owned

Native-owned means VyrnForge owns its UI foundation and implementation strategy.
It does not mean that only Native HTML is a supported consumption surface.

VyrnForge prefers browser standards, DOM/CSS/platform APIs, shared VyrnForge
contracts, and narrowly justified focused dependencies. It does not require MUI,
Ant Design, Tailwind, Radix, TanStack, Redux, Zustand, or another large UI/state
ecosystem as its implementation foundation.

Native HTML / Custom Elements is a first-class surface and the default canonical
non-grid browser implementation strategy where technically suitable. Framework
correctness and idiomatic developer experience remain product requirements;
evidence-backed framework-specific exceptions are allowed where a generic facade
cannot preserve them.

## Product promises

### First-class UI quality

Cross-framework portability must not excuse weaker visual quality, incomplete
interaction behavior, poor typing, or non-idiomatic framework APIs. VyrnForge
should be competitive as a UI system even when a consumer only needs one
framework.

### General-purpose with enterprise-grade depth

Common application UI and enterprise/data-heavy UI belong to the same design
system. Enterprise themes, density, advanced keyboard interaction, complex
forms, large data interfaces, and long-lived compatibility are first-class
capabilities rather than a separate product identity.

### Lightweight by default, deep when needed

Advanced capabilities must not make every consumer ship their runtime,
dependencies, CSS, or setup. Sophisticated modules such as tree/tree-grid,
visualization, advanced forms, workflow/diagram UI, rich editors, dashboards, or
spatial/3D UI may be added only through deliberate optional-module architecture.

Exact future package names and dependency topology require explicit architecture
decisions; this source of truth does not invent them in advance.

### One contract, multiple first-class experiences

Shared semantics are defined once through canonical tokens, behavior, component
contracts, accessibility obligations, form/model semantics, composition regions,
framework mappings, metadata, and verification.

Framework packages translate that system into idiomatic APIs. Support parity is
a consumer guarantee; it does not require identical source implementation.

### Human and AI developer experience

Canonical structured metadata should let human or AI consumers determine
component purpose, use/avoid guidance, legal properties, state models, events,
composition, accessibility obligations, framework mappings, related components,
limitations, and correct setup without reconstructing those rules from framework
implementation source.

AI-oriented context must be generated from canonical contracts rather than
becoming a separate hand-maintained product truth.

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

Exact current versions, dependency edges, public entrypoints, and release-group
membership are canonical in package manifests and
[`../metadata/release-groups.json`](../metadata/release-groups.json).

## Current framework architecture

React, Native HTML / Custom Elements, Angular, and Vue are first-class non-grid
surfaces. VyrnForge is not four independent component libraries.

- [ADR-005](../architecture/adr-005-canonical-web-implementation.md): the
  native/DOM implementation is the default canonical non-grid web implementation;
  generated or generic framework facades are preferred and dedicated renderers
  require explicit technical exceptions.
- [ADR-006](../architecture/adr-006-framework-package-strategy.md): React uses
  `@vyrnforge/ui-components`, Native HTML uses `@vyrnforge/ui-elements`, Angular
  uses `@vyrnforge/ui-angular`, and Vue uses `@vyrnforge/ui-vue`.
- [ADR-008](../architecture/adr-008-framework-exception-policy.md): framework
  exceptions are narrow, evidence-backed, owned, tested, and have explicit
  review/exit criteria.

Angular and Vue remain thin/generated facades over shared foundations. React
retains framework-specific implementation only where compatibility, developer
experience, SSR, accessibility, or performance evidence justifies it.

The data grid remains a separate React alpha track. Multi-framework grid support
and additional advanced modules require separate requirements, architecture, and
evidence; they are not implied by non-grid framework support.

## Framework extensibility

Native HTML, React, Angular, and Vue are the currently approved first-class web
surfaces, not a permanent architectural ceiling.

A future framework should be supportable through canonical contracts, a
framework integration/generation model, narrowly scoped exceptions, real
consumer verification, and package/release metadata rather than a complete
reimplementation of VyrnForge.

No additional framework is supported until an explicit requirement,
implementation, documentation, compatibility policy, and evidence approve it.

## Advanced UI scope

VyrnForge may own sophisticated reusable UI when the primary responsibility is
how users see, enter, manipulate, navigate, visualize, or interact with
application information.

Potential capability families include advanced data UI, tree/tree-grid,
visualization/charting UI, complex form composition, dashboard patterns,
workflow/diagram interfaces, rich editors, advanced drag/drop, and spatial/3D UI
controls. Such capabilities should remain optional when their dependency, size,
maturity, or release characteristics justify separation.

VyrnForge does not thereby become the application's business runtime. Business
workflow execution, backend services, database/query backends, authorization
policy, required application state management, BI calculation engines, CMS
runtime, routing, game/3D rendering engines, and product-specific business logic
remain outside the shared UI system.

## Principles

- Native-owned, browser-standards-oriented implementation.
- One shared semantic token and CSS-variable foundation.
- One canonical semantic and accessibility model where concepts are shared.
- Framework-neutral behavior where reuse provides value.
- Generated or thin framework facades rather than duplicated behavior by default.
- Framework-specific exceptions are narrow, explicit, traceable, tested, and
  justified by product correctness or framework constraints.
- Dependency-minimal and application-store agnostic.
- Controlled and uncontrolled state contracts where appropriate.
- Light DOM by default for native elements unless evidence requires otherwise.
- Accessibility, keyboard behavior, focus management, internationalization,
  responsive behavior, performance, SSR/server safety, reduced motion, and
  compatibility are core requirements.
- Enterprise density and advanced data-management use cases matter without
  limiting the library to enterprise-only applications.
- Optional advanced capabilities must not impose cost on consumers that do not
  use them.
- Human documentation and AI context derive from canonical sources rather than
  parallel hand-maintained truths.
- Business-specific logic remains in consuming applications.
- Documentation and metadata remain source-of-truth oriented.

## Non-goals

VyrnForge does not aim to be:

- a Material or Ant Design clone;
- a Tailwind, Radix, TanStack, or other large UI ecosystem wrapper;
- a required Redux, Zustand, Pinia, NgRx, or other application-store framework;
- unrelated framework-specific component libraries sharing only a brand;
- a mobile-native renderer in the current web support model;
- a spreadsheet product or BI calculation/pivot/report-generation engine;
- a workflow execution engine, application backend, router, CMS, or application
  business runtime;
- a 3D/game rendering engine.

Sophisticated charting, tree, workflow-editor, advanced-form, and spatial UI are
not excluded merely because they are complex; they require deliberate optional
architecture and explicit planning.

## Source authority

Use the sources according to the question being answered:

- **Product identity and durable scope:** this document.
- **Current implemented state:** package manifests, current release/package
  metadata, package-boundary metadata, implementation docs, and executable
  evidence.
- **Architecture:** accepted ADRs and canonical contract metadata.
- **Component maturity:** `docs/metadata/components.json`.
- **Current limitations:** `docs/quality/03-known-limitations.md`.
- **Program execution:** the Google Drive spreadsheet **VyrnForge Progress
  Tracker — Live Status**. Repository evidence proves implementation and
  validation; the repository does not maintain a second sprint tracker.
- **Historical evidence:** retained audit/release/regression records may prove
  what was true at a point in time but do not override later current sources.

## Canonical related sources

- [Documentation Index](../README.md)
- [System Overview](../architecture/00-system-overview.md)
- [Package Boundaries](../architecture/01-package-boundaries.md)
- [State and Adapter Ownership](../architecture/02-state-and-adapter-ownership.md)
- [Component Contracts and Events](../architecture/09-component-contracts-and-events.md)
- [Canonical Web Implementation](../architecture/adr-005-canonical-web-implementation.md)
- [Framework Package Strategy](../architecture/adr-006-framework-package-strategy.md)
- [Framework Exception Policy](../architecture/adr-008-framework-exception-policy.md)
- [Component Metadata](../metadata/components.json)
- [Release Groups](../metadata/release-groups.json)
- [Known Limitations](../quality/03-known-limitations.md)
