# Project Source Of Truth

## Canonical positioning

VyrnForge UI is a native-owned, dependency-minimal, general-purpose UI system
with enterprise-grade depth.

It is designed to be a first-class UI foundation for web applications ranging
from public-facing and SaaS products to internal tools, admin and customer
portals, IAM systems, workflow applications, reporting interfaces, dashboards,
data-heavy products, and other sophisticated enterprise platforms.

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
- serves both human developers and AI software-development systems through
  stable, machine-readable contracts and concise generated guidance.

## Meaning of native-owned

Native-owned means VyrnForge owns its UI foundation and implementation strategy.
It does not mean that only Native HTML is a supported consumption surface.

VyrnForge should prefer browser standards, DOM/CSS/platform APIs, shared
VyrnForge contracts, and narrowly justified focused dependencies. It should not
require MUI, Ant Design, Tailwind, Radix, TanStack, Redux, Zustand, or another
large UI/state ecosystem as the implementation foundation.

Native HTML / Custom Elements remains a first-class surface and the default
canonical non-grid browser implementation strategy where technically suitable.
Framework correctness and idiomatic developer experience remain product
requirements; evidence-backed framework-specific exceptions are allowed where a
generic facade cannot preserve them.

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
dependencies, CSS, or setup. Future sophisticated modules such as tree/tree-grid,
visualization, advanced forms, workflow/diagram UI, rich editors, dashboards,
or spatial/3D UI should be independently consumable and reuse shared VyrnForge
foundations.

Exact future package names and dependency topology require explicit architecture
decisions; this source of truth does not invent them in advance.

### One contract, multiple first-class experiences

Shared semantics should be defined once through canonical tokens, behavior,
component contracts, accessibility obligations, form/model semantics,
composition regions, framework mappings, metadata, and verification.

Framework packages translate that system into idiomatic APIs. Support parity is
a consumer guarantee; it does not require identical source implementation.

### Human and AI developer experience

VyrnForge is designed for human developers and AI systems that generate,
analyze, migrate, or maintain UI code.

Canonical structured metadata should let either consumer determine component
purpose, use/avoid guidance, legal properties, state models, events,
composition, accessibility obligations, framework mappings, related components,
limitations, and correct setup without reconstructing those rules from
framework implementation source.

AI-oriented context must be generated from canonical contracts rather than
becoming a separate hand-maintained product truth.

## Current implemented package roles

The following table describes the currently implemented package topology. It
must not be read as the complete long-term distribution topology.

| Package                    | Current role                                                                          | Release track     |
| -------------------------- | ------------------------------------------------------------------------------------- | ----------------- |
| `@vyrnforge/ui-core`       | Framework-neutral tokens, themes, density, typography, motion, layers, and utilities. | Non-grid beta     |
| `@vyrnforge/ui-behaviors`  | Framework-neutral component controllers, state rules, and reasoned events.            | Non-grid beta     |
| `@vyrnforge/ui-components` | First-class React package.                                                            | Non-grid beta     |
| `@vyrnforge/ui-elements`   | First-class native HTML Custom Element package.                                       | Non-grid beta     |
| `@vyrnforge/ui-data-grid`  | Specialized React data-grid package.                                                  | Independent alpha |

Exact current repository release versions and dependencies are canonical in
[`../metadata/release-groups.json`](../metadata/release-groups.json).

## Current implemented framework state

Current package manifests and release metadata are authoritative for what ships.
React and native HTML are implemented first-class packages. Angular and Vue are
in the approved first-class distribution program and must not be described as
shipped public packages until their implementation and release gates pass.

Current and historical framework evidence is documented by the applicable ADRs,
metadata, consumer fixtures, and package manifests.

## Approved S10-S15 target architecture

The approved product support target is four equally first-class supported web
surfaces: React, native HTML, Angular, and Vue. VyrnForge is not creating four
independent component libraries.

Accepted target decisions include:

- [ADR-005](../architecture/adr-005-canonical-web-implementation.md): the
  native/DOM implementation is the default canonical non-grid web
  implementation; generated or generic framework facades are preferred and
  dedicated renderers require explicit technical exceptions.
- [ADR-006](../architecture/adr-006-framework-package-strategy.md): React keeps
  `@vyrnforge/ui-components`, native HTML keeps `@vyrnforge/ui-elements`, and
  the target Angular/Vue packages are `@vyrnforge/ui-angular` and
  `@vyrnforge/ui-vue`.
- [ADR-008](../architecture/adr-008-framework-exception-policy.md): framework
  exceptions must be narrow, evidence-backed, owned, tested, and have explicit
  exit/review criteria.

Target decisions define intended architecture even when corresponding packages
or dependency edges have not yet shipped. Current manifests and release metadata
remain authoritative for implemented distribution state.

The data grid remains React-only on its independent alpha track during S10-S15.
Multi-framework grid implementation and additional advanced modules require
separate planning and evidence; they are not permanently excluded from the
long-term product scope.

## Framework extensibility

Native HTML, React, Angular, and Vue are the currently approved first-class web
surfaces. They are not a permanent architectural ceiling.

A future framework should be supportable through canonical contracts, a
framework integration/generation model, narrowly scoped exceptions, real
consumer verification, and package/release metadata rather than a complete
reimplementation of VyrnForge.

No additional framework is considered supported until an explicit requirement,
implementation, documentation, compatibility policy, and evidence gate approve
it.

## Advanced UI scope

VyrnForge may own sophisticated reusable UI when the primary responsibility is
how users see, enter, manipulate, navigate, visualize, or interact with
application information.

Potential future capability families include advanced data UI, tree/tree-grid,
visualization/charting UI, complex form composition, dashboard patterns,
workflow/diagram interfaces, rich editors, advanced drag/drop, and spatial/3D
UI controls.

These capabilities should live behind optional, explicit package/module
boundaries when their dependency, size, maturity, or release characteristics
justify separation.

VyrnForge does not thereby become the application's business runtime. Business
workflow execution, backend services, database/query backends, authorization
policy, required application state management, BI calculation engines, CMS
runtime, routing, game/3D rendering engines, and product-specific business logic
remain outside the shared UI system.

## Principles

- Native-owned, native-first, and browser-standards-oriented.
- One shared semantic token and CSS-variable foundation.
- One canonical semantic and accessibility model where concepts are shared.
- Framework-neutral behavior where reuse provides value.
- Generated or thin framework facades rather than duplicated behavior by default.
- Framework-specific exceptions are narrow, explicit, traceable, tested, and
  justified by product correctness or framework constraints.
- Dependency-minimal and application-store agnostic.
- Controlled and uncontrolled state contracts where appropriate.
- Light DOM by default for native elements unless an evidence-backed exception
  requires otherwise.
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
- a mobile-native renderer in the current web program;
- a spreadsheet product or BI calculation/pivot/report-generation engine;
- a workflow execution engine, application backend, router, CMS, or application
  business runtime;
- a 3D/game rendering engine.

Charting/visualization UI, tree UI, workflow-editor UI, advanced forms, and
spatial UI controls are not excluded merely because they are sophisticated;
they require deliberate optional-module architecture and roadmap approval.

## Source authority

Use the sources according to the question being answered:

- **Product identity and long-term scope:** this document.
- **Current implemented state:** package manifests, release metadata, current
  package-boundary metadata, implementation docs, and executable evidence.
- **Approved target architecture:** accepted ADRs and canonical contract metadata.
- **Program execution:** the approved active program tracker plus repository
  evidence; stale tracker status must not override merged implementation.
- **Detailed strategic review:**
  [Vision, Mission & Scope Alignment Review](../roadmap/04-vision-mission-scope-alignment-review.md).
- **Historical evidence:** retained closure/evidence records prove what was
  implemented or verified at that time but do not override later accepted
  decisions.

## Canonical related sources

- [Documentation Index](../README.md)
- [System Overview](../architecture/00-system-overview.md)
- [Package Boundaries](../architecture/01-package-boundaries.md)
- [State and Adapter Ownership](../architecture/02-state-and-adapter-ownership.md)
- [Component Contracts and Events](../architecture/09-component-contracts-and-events.md)
- [Canonical Web Implementation Target](../architecture/adr-005-canonical-web-implementation.md)
- [Framework Package Strategy Target](../architecture/adr-006-framework-package-strategy.md)
- [Framework Exception Policy](../architecture/adr-008-framework-exception-policy.md)
- [Current Roadmap](../roadmap/00-master-roadmap.md)
- [Vision, Mission & Scope Alignment Review](../roadmap/04-vision-mission-scope-alignment-review.md)
