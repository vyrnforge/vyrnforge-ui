# ADR-011: Optional Advanced Module Architecture

- Status: Accepted architecture standard
- Origin: Vision/mission standardization after the S10-S15 distribution architecture
- Applies to: future advanced VyrnForge UI capabilities whose weight, dependencies, runtime model, or specialization justify isolation from the common UI foundation

## Context

VyrnForge's long-term scope includes sophisticated UI capabilities in addition to common primitives and components. Examples may include advanced data grids, tree and tree-grid surfaces, charting and visualization, complex form composition, workflow or diagram editors, dashboard composition, rich editors, and spatial/3D UI controls.

Capability depth must not turn the common VyrnForge foundation into a mandatory heavyweight bundle. A consumer using ordinary buttons, forms, navigation, or overlays should not pay the installation, dependency, JavaScript, CSS, initialization, or compatibility cost of an unrelated advanced capability.

At the same time, advanced capabilities must remain part of one VyrnForge system rather than becoming unrelated component products with separate design, accessibility, terminology, and framework semantics.

This ADR defines the architectural rules that future optional advanced modules must satisfy before package topology or implementation is approved.

## Decision

Advanced VyrnForge capabilities will be **optional, explicitly bounded modules over shared VyrnForge foundations**.

This ADR does not create or name any new package. Exact package names, workspace paths, dependency edges, release groups, and framework distribution details must be decided from repository evidence when a concrete capability is approved.

Conceptually:

```text
VyrnForge shared foundations
  design tokens / themes / density
  accessibility standards
  behavior and state contracts
  component/event/composition contracts
  metadata / generation / testing
            |
            +------------------------------+
            |                              |
      common UI surfaces            optional advanced capability
            |                              |
      framework facades              shared capability contract
                                           |
                                  framework integration/facades
                                           |
                                  optional engine adapters
```

Shared foundations may support advanced modules. Shared foundations must not become dependent on advanced modules.

## What qualifies as an advanced module

A capability should be considered for optional-module treatment when one or more of the following are true:

- it has a substantial implementation or bundle footprint;
- it requires specialized algorithms, rendering, virtualization, layout, editing, or interaction infrastructure;
- it may require optional third-party engines;
- it has a distinct performance or browser-capability profile;
- it has specialized release/maturity requirements;
- many VyrnForge consumers reasonably do not need it;
- its API forms a coherent reusable capability boundary rather than a single ordinary component.

Complexity alone does not push a capability outside VyrnForge. The responsibility boundary determines product scope; optional-module architecture determines distribution cost.

## UI responsibility boundary

An advanced module may own reusable UI semantics for how users see, enter, manipulate, navigate, edit, or visualize application information.

It should not own the consuming application's business/runtime engine.

Examples:

| VyrnForge UI scope | External/application responsibility |
| --- | --- |
| chart rendering, axes, legends, selection, tooltips, accessible visualization interaction | BI calculation engine, business metrics pipeline, data warehouse |
| workflow/diagram editing surface, nodes, ports, selection, keyboard interaction | workflow execution engine, orchestration runtime |
| tree/tree-grid navigation, expansion, selection, editing UI | application data service and business hierarchy rules |
| complex form composition and validation presentation | business workflow and domain validation policy |
| spatial/3D controls, panels, interaction affordances | full game/scene/rendering engine unless separately justified |
| data-grid interaction and presentation | backend query service, authorization, application persistence |

Integration with external runtimes should happen through controlled adapters, data interfaces, events, methods, or extension points.

## Dependency isolation

### Foundation rule

Current and future shared foundation packages must not depend on an advanced module.

Adding an advanced capability must not force its dependencies into unrelated VyrnForge consumers.

### Module dependency rule

A concrete advanced module may consume the smallest appropriate shared VyrnForge foundations. Exact allowed edges must be added to canonical package-boundary metadata when the module is introduced.

Do not assume every advanced module needs every common renderer or framework package.

### Third-party dependencies

An advanced module may use a focused third-party engine only when repository evidence shows that implementing the capability independently is not a better fit and the dependency satisfies the approved boundary.

A third-party engine must not become a hidden dependency of the VyrnForge common foundation.

Before adoption, document:

- why the dependency is needed;
- whether it is runtime, peer, optional, development-only, or adapter-owned;
- bundle/size effect;
- tree-shaking behavior;
- browser and SSR implications;
- accessibility implications;
- security/maintenance risk;
- license and redistribution compatibility;
- replacement or adapter boundary where practical.

Large generic UI frameworks are not acceptable substitutes for implementing a VyrnForge advanced module.

## Shared contract ownership

Every advanced capability should reuse the existing VyrnForge contract language where it applies:

- semantic tokens;
- canonical state/model concepts;
- canonical event/reason vocabulary;
- composition regions;
- accessibility obligations;
- refs/methods;
- framework mappings;
- maturity/status metadata;
- generated documentation and AI context.

Capability-specific concepts belong in a shared capability contract or an approved extension to existing contracts, not independently duplicated React/Angular/Vue implementations.

A framework package should not become the semantic source of truth for an advanced capability.

## Framework distribution

React, Native HTML, Angular, and Vue remain the currently approved first-class framework tracks. Advanced capabilities should follow the same principle as common UI: define reusable semantics once and expose idiomatic framework experiences.

A concrete advanced module must define before first-class release:

- which approved framework surfaces it supports;
- how its shared contract maps to each supported surface;
- whether generation/generic integration is sufficient;
- any ADR-008 framework exceptions;
- packed consumer evidence for every claimed first-class surface.

First-class support does not require identical rendering implementation when a capability has legitimate framework or engine constraints.

A module may initially support a narrower surface only when that support state is explicit in metadata, documentation, maturity, and release claims. It must not imply cross-framework parity merely because the common VyrnForge library supports multiple frameworks.

## External engine adapter boundary

When an advanced capability uses an external rendering, layout, editing, graph, spatial, or calculation engine, VyrnForge should own the **UI contract and adapter boundary**, not leak the entire engine as the canonical public API by default.

The adapter boundary should isolate:

- engine-specific object models;
- lifecycle/setup;
- optional loading;
- event normalization;
- platform capability checks;
- SSR/server-safe behavior;
- fallback behavior;
- engine upgrades or replacement.

Escape hatches may expose engine-native capability when genuinely required, but they must be explicit and must not make the external engine the semantic definition of VyrnForge behavior.

## Styling and theming

Advanced modules use shared VyrnForge semantic tokens and CSS custom properties for common design roles.

Capability-specific styling roles may introduce module-local tokens/classes when shared roles are insufficient. Their exact namespace and public status must be defined when the module architecture is approved; this ADR does not invent a namespace.

Rules:

- do not redeclare shared semantic concepts under module-specific names;
- respect VyrnForge theme and density behavior;
- avoid hard-coded visual values when a shared or approved capability token exists;
- keep module CSS independently consumable where practical;
- loading a common VyrnForge package must not automatically load all advanced-module CSS.

## Accessibility standard

Advanced modules receive no accessibility exemption because they are complex.

Before implementation reaches a first-class maturity claim, the capability must define the applicable accessibility model, including as relevant:

- semantics and relationships;
- accessible names/descriptions;
- keyboard interaction;
- focus movement/restoration;
- selection and editing semantics;
- virtualized/offscreen content behavior;
- screen-reader representation;
- reduced motion;
- high-density readability;
- nonvisual alternatives for visualization/spatial information where applicable.

If a platform or external engine cannot satisfy the required outcome, that limitation must be explicit and may block first-class status.

## Performance and scale

Advanced modules must define workload-specific performance evidence instead of relying on common component benchmarks.

Depending on the capability, measurements may include:

- initial bundle and lazy-loaded size;
- startup cost;
- render/update latency;
- large collection or scene scale;
- interaction latency;
- virtualization thresholds;
- memory behavior;
- resize/layout cost;
- worker/off-main-thread behavior where justified.

Optimization mechanisms such as virtualization, workers, canvas, WebGL/WebGPU, or incremental layout should be selected from measurement and capability requirements, not adopted as universal architecture defaults.

## Loading, tree shaking, and side effects

An advanced module must be independently consumable.

A module architecture should document:

- public entrypoints;
- side-effect boundaries;
- CSS loading behavior;
- lazy/dynamic import support where appropriate;
- registration behavior;
- optional engine loading;
- whether unused sub-capabilities tree-shake;
- SSR-safe module evaluation.

A normal application that does not import the module should not execute its runtime or load its assets as an indirect effect of the common UI packages.

## Server and platform safety

Advanced modules must be safe to import in their documented server/build environments.

Browser globals, DOM, Canvas, WebGL/WebGPU, ResizeObserver, workers, or other browser capabilities must not be accessed at module evaluation when that breaks supported SSR/build use.

Capabilities unavailable on the server should use explicit client/runtime boundaries and documented fallback behavior.

## Release and maturity

Advanced modules may use an independent release line when their maturity, dependency surface, or compatibility risk justifies it.

A concrete release strategy must define:

- maturity status;
- version/release group ownership;
- compatibility policy;
- supported framework surfaces;
- package/dependency verification;
- provenance/publication behavior;
- size budgets;
- browser/SSR evidence;
- accessibility evidence;
- migration policy.

The existence of an advanced module does not automatically promote it to the maturity level of the common VyrnForge packages.

## Packed-package verification

Source-workspace tests are insufficient for first-class module claims.

Where a module is distributed as a package, release evidence must verify the packed artifact through intended public entrypoints in representative consumers.

The verifier should cover as applicable:

- installation and peer/optional dependency behavior;
- types and exports;
- production build;
- CSS/assets;
- runtime smoke;
- framework integration;
- server-safe imports;
- external-engine adapter behavior;
- size budget.

## AI consumption

Advanced modules participate in ADR-010.

Their canonical metadata should provide enough information for AI consumers to determine:

- when the capability is appropriate;
- when a common component is sufficient instead;
- package/support/maturity status;
- core configuration and data contract;
- composition and extension points;
- accessibility obligations;
- performance/scale considerations;
- engine or adapter requirements;
- framework-specific setup;
- important limitations.

AI metadata is derived from canonical module contracts rather than maintaining a second advanced-module API catalog.

## Admission criteria for a new advanced module

Before implementation creates a new package boundary, the proposal must demonstrate:

1. **Reusable product need** — repeated UI need rather than one consuming application's feature.
2. **Existing-foundation review** — why current VyrnForge components, primitives, behaviors, contracts, or packages cannot be extended sufficiently.
3. **Responsibility boundary** — clear UI ownership versus application/runtime ownership.
4. **Contract model** — shared framework-neutral semantic model.
5. **Dependency plan** — VyrnForge and external dependency edges with isolation rationale.
6. **Styling plan** — shared tokens and any genuinely capability-specific styling contract.
7. **Accessibility plan** — semantic, keyboard, focus, and nonvisual requirements.
8. **Performance plan** — representative workloads and measurements.
9. **Framework plan** — supported surfaces, generation/facade approach, and expected exceptions.
10. **SSR/platform plan** — server-safe imports and browser capability boundaries.
11. **Distribution/release plan** — package/release/maturity/size/packed verification.
12. **AI/documentation plan** — metadata and generated consumption guidance.

The proposal should become a dedicated architecture decision for the concrete capability when these details materially affect public architecture.

## Current data-grid relationship

`@vyrnforge/ui-data-grid` is the repository's existing specialized advanced capability and currently has its own React alpha track and package boundaries.

This ADR does not retroactively rewrite that package or declare its current architecture to be the template for every future module. It provides the standard against which future grid evolution and other advanced capabilities should be evaluated when they are explicitly reprioritized.

## S10-S15 relationship

This ADR does not add charting, trees, workflow editors, spatial UI, or a multi-framework data grid to the active S10-S15 critical path.

The active distribution program remains focused on completing the approved first-class framework surfaces and release convergence. Advanced capability implementation begins only through explicitly prioritized follow-up work with the admission criteria above.

## Rejected approaches

### Put every advanced capability in the common component bundle

Rejected because it makes unrelated consumers pay dependency, size, CSS, and runtime cost.

### Separate design systems per advanced module

Rejected because advanced modules are VyrnForge capabilities and must share design, accessibility, terminology, contracts, and developer concepts.

### One independent implementation per framework

Rejected as the default because reusable capability semantics should be solved once and adapted/generated across framework surfaces.

### Make an external engine the VyrnForge contract

Rejected because it couples public semantics to a replaceable implementation dependency and weakens portability.

### Exclude sophisticated UI merely because it is complex

Rejected. The product boundary is responsibility, not complexity.

### Create package names before a concrete architecture review

Rejected because package topology must follow actual capability, dependency, release, and repository evidence.

## Relationship to existing architecture

This ADR extends rather than replaces:

- package-boundary rules for current packages;
- canonical component/event/model/composition contracts;
- semantic token and CSS architecture;
- accessibility standards;
- ADR-008 framework exception policy;
- multi-framework generation/distribution architecture;
- release and packed-package verification practices;
- ADR-010 AI Consumption Contract.

It establishes a consistent admission and isolation model so VyrnForge can grow from common UI into sophisticated optional capabilities without sacrificing dependency minimalism or becoming multiple unrelated framework libraries.
