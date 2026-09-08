# VyrnForge UI System Overview

VyrnForge UI is a native-owned, dependency-minimal, general-purpose UI system
with enterprise-grade depth. React, Native HTML / Custom Elements, Angular, and
Vue are first-class non-grid web surfaces over one shared VyrnForge component
model. First-class support describes the product, package, compatibility,
accessibility, documentation, and release commitment; it does not require four
independent component implementations.

Current package manifests, canonical metadata, generated references, and
validated consumer evidence remain authoritative for shipped behavior.

## Implemented multi-framework model

```text
canonical component contracts + metadata
                |
       +--------+--------+
       |                 |
    ui-core         ui-behaviors
 tokens/themes      portable decisions
       |                 |
       +--------+--------+
                |
       ui-elements / native DOM
 canonical default browser implementation
                |
   +------------+------------+------------+
   |                         |            |
Native HTML               Angular        Vue
public surface             facade         facade

React public surface
@vyrnforge/ui-components
  |-- canonical-backed integration where converged
  `-- narrow framework-specific implementation only where an explicit,
      evidence-backed exception preserves React compatibility or semantics

Separate release track:
@vyrnforge/ui-data-grid — specialized React data grid
```

The diagram expresses implementation strategy, not support rank. Native HTML,
React, Angular, and Vue are equally first-class supported non-grid surfaces.
The native DOM / Custom Element implementation is the default canonical browser
implementation because it lets rendering, accessibility projection, form
association, events, styling, and browser behavior be solved once where that
model satisfies each framework's public contract.

## One canonical component model

The canonical model defines shared VyrnForge semantics independently of any one
framework. It owns the cross-framework source of truth for:

- component identity, maturity, categories, and terminology;
- properties, models, defaults, constraints, and public methods;
- canonical events, details, reasons, and interaction semantics;
- slots/composition regions and native form semantics;
- accessibility roles, states, relationships, keyboard behavior, and focus
  obligations;
- token and styling contracts;
- framework mappings for React, Angular, Vue, and Native HTML;
- generation metadata and explicit framework exceptions;
- documentation, testing, release, and AI-facing derived references.

Framework packages consume or adapt these contracts; they do not maintain an
independent component catalog or semantic model.

## Default implementation strategy

For non-grid web components, `@vyrnforge/ui-elements` is the canonical default
browser implementation. It owns the reusable DOM/Custom Element layer,
including Light DOM structure, canonical `vf-*` events, property/attribute
reflection, form association, public imperative methods, package-owned styling,
and browser-specific behavior not already owned by `ui-behaviors`.

`@vyrnforge/ui-core` remains framework-neutral and owns tokens, themes, density,
typography, motion, layers, utilities, and shared style foundations.

`@vyrnforge/ui-behaviors` remains framework-neutral and owns portable decisions
and state transitions such as collections, selection, keyboard decisions,
validation state, overlays, and reasoned controller events.

The default implementation is not a requirement that framework consumers use
raw Custom Elements or raw DOM event names. Framework facades translate the
canonical model into idiomatic framework APIs.

## First-class framework surfaces

| Surface                        | Public package                   | Support status           | Implementation strategy                                                                                                                |
| ------------------------------ | -------------------------------- | ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| React                          | `@vyrnforge/ui-components`       | First-class, non-grid beta | React API preserved; canonical-backed implementation is the default convergence direction, with explicit exceptions where required.   |
| Native HTML / Custom Elements  | `@vyrnforge/ui-elements`         | First-class, non-grid beta | Direct canonical native implementation.                                                                                                |
| Angular                        | `@vyrnforge/ui-angular`          | First-class, non-grid beta | Angular facade over canonical Custom Elements, including setup, typed bindings, Forms integration, composition, and refs.              |
| Vue                            | `@vyrnforge/ui-vue`              | First-class, non-grid beta | Vue facade over canonical Custom Elements, including plugin setup, props/emits, `v-model`, slots, and refs.                            |
| Data grid                      | `@vyrnforge/ui-data-grid`        | Specialized React alpha  | Independent optional advanced module; not part of the non-grid framework convergence claim.                                            |

A surface can be first-class even when it is implemented through a facade over
the canonical native layer. Product support level and internal renderer strategy
are separate concepts.

## Framework facade model

Framework facades may own framework-specific translation and lifecycle concerns,
including:

- React props/callbacks/refs/children and compatibility behavior;
- Angular inputs/outputs, content projection, Forms/CVA integration, setup, and
  typed references;
- Vue props/emits, slots, `v-model`, plugin setup, and typed refs;
- Native HTML registration and direct DOM consumption.

They must not duplicate shared design tokens, canonical product semantics,
portable controller decisions, accessibility obligations, or application
business state merely to make a framework package feel independent.

Generated or generic canonical-backed integration is preferred. Handwritten
framework code is narrow integration code, not a second component library.

## Explicit framework exception policy

A framework-specific implementation exception is valid only when the canonical
implementation plus facade cannot satisfy a required public contract with
acceptable correctness. Examples include evidence-backed SSR/hydration,
performance, composition, accessibility/focus, forms, or imperative-ref
constraints.

Preference, naming symmetry, framework familiarity, or avoiding generator work
are not valid exceptions.

Every exception must be explicit, scoped, traceable to canonical metadata,
carry validation evidence, and define review or exit criteria. An exception does
not create a second canonical model; the shared component contract remains the
source of product semantics.

See [ADR-008: Framework Exception Policy](adr-008-framework-exception-policy.md).

## Package layers

### Shared foundations

`@vyrnforge/ui-core` and `@vyrnforge/ui-behaviors` stay framework-independent.
They must not require React, Angular, Vue, application state management, or
optional advanced modules.

### Canonical native implementation

`@vyrnforge/ui-elements` owns the browser-native implementation and remains a
first-class public surface in its own right. It is not merely a hidden backing
package for framework adapters.

### Framework packages

`@vyrnforge/ui-components`, `@vyrnforge/ui-angular`, and
`@vyrnforge/ui-vue` expose idiomatic framework-facing APIs while reusing the
canonical model and shared foundations. Framework runtime peers stay isolated to
the framework package that needs them.

### Optional advanced modules

Advanced capabilities such as data grids, trees/tree-grids, visualization,
complex editors, workflow/diagram UI, rich form composition, and spatial UI are
valid VyrnForge scope when justified. They remain optional and dependency
isolated so unrelated consumers do not pay their runtime, bundle, CSS, or engine
cost.

## State and rendering separation

```text
canonical contract
  product semantics
  public properties/events/models/methods
  accessibility obligations
  framework mappings

shared controller
  portable state transitions
  collection and selection rules
  keyboard decisions
  validation state
  reasoned events

canonical DOM implementation
  browser execution
  DOM structure and Light DOM composition
  focus/observer/overlay execution
  form association
  canonical DOM events

framework facade
  idiomatic framework API
  framework lifecycle
  forms/models
  children/templates/slots
  refs and imperative integration
```

Application business state, backend requests, authorization, persistence,
routing, and workflow execution remain outside VyrnForge.

## Human and AI consumers

The canonical contract system is shared by human documentation, framework
generation, verification, and AI-facing context. Generated references must
derive from canonical metadata instead of becoming another handwritten
architecture source.

## Core principles

- One canonical non-grid component model across all first-class web surfaces.
- One semantic token and CSS-variable foundation.
- One framework-neutral behavior contract where behavior is shared.
- Native DOM / Custom Elements are the default canonical browser implementation,
  not a higher-ranked product surface.
- Framework facades remain thin where practical and idiomatic where required.
- Framework-specific implementation exceptions are narrow, explicit, and
  evidence-backed.
- Light DOM remains the default native-element styling/interoperability model.
- Public packages remain application-store agnostic.
- Optional advanced capability depth must not make the common foundation
  heavyweight.
- First-class support claims require package, compatibility, accessibility,
  packed-consumer, release, and documentation evidence.

## Canonical sources

- [Project Source of Truth](../governance/01-project-source-of-truth.md)
- [Package Boundaries](01-package-boundaries.md)
- [State and Adapter Ownership](02-state-and-adapter-ownership.md)
- [Component Contracts and Events](09-component-contracts-and-events.md)
- [Custom Elements and Form Association](10-custom-elements-and-form-association.md)
- [ADR-005: Canonical Web Implementation](adr-005-canonical-web-implementation.md)
- [ADR-006: Public Framework Package Strategy](adr-006-framework-package-strategy.md)
- [ADR-007: Framework Facade Package Boundaries](adr-007-framework-facade-package-boundaries.md)
- [ADR-008: Framework Exception Policy](adr-008-framework-exception-policy.md)
- [ADR-010: AI Consumption Contract](adr-010-ai-consumption-contract.md)
- [ADR-011: Optional Advanced Module Architecture](adr-011-optional-advanced-module-architecture.md)
- [ADR-012: Framework Extensibility Contract](adr-012-framework-extensibility-contract.md)
- [ADR-013: Reusable Pattern and Template Contract](adr-013-pattern-template-contract.md)
- [`../metadata/component-contracts.json`](../metadata/component-contracts.json)
- [`../metadata/multi-framework.json`](../metadata/multi-framework.json)
