# VyrnForge UI System Overview

VyrnForge UI is a dependency-minimal, general-purpose, enterprise-grade UI
library and UI foundation. The product is VyrnForge itself, not any individual
framework package.

Native HTML / Custom Elements, React, Angular, and Vue are equal first-class
surfaces over one shared VyrnForge component, behavior, accessibility, styling,
and documentation model. First-class support describes the product commitment;
it does not require four independent implementations or identical framework
syntax.

Current package manifests, canonical metadata, generated references, and
validated consumer evidence remain authoritative for shipped behavior.

## Product architecture

~~~text
                         VyrnForge UI
                             |
          +------------------+------------------+
          |                  |                  |
      design system     canonical UI       shared behavior
      + styling         contracts          + accessibility
          |                  |                  |
          +------------------+------------------+
                             |
                  first-class UI surfaces
          +-----------+-----------+-----------+-----------+
          |           |           |           |
        Native       React       Angular       Vue
~~~

This is the product model. The four surfaces are peers.

## Current implementation strategy

The current non-grid implementation reuses browser-native Custom Elements where
that reduces duplicated DOM, form, accessibility, focus, styling, and event
logic while preserving idiomatic framework APIs.

~~~text
canonical contracts + metadata
            |
     shared foundations
   ui-core + ui-behaviors
            |
   reusable browser implementation
        ui-elements
            |
   +--------+--------+--------+--------+
   |        |        |        |        |
 Native   React    Angular    Vue
 surface  surface   surface   surface
~~~

This graph explains code reuse only. It does **not** rank Native above React,
Angular, or Vue. A future implementation may change the internal renderer
strategy without changing the product-level support model.

React currently ships through `@vyrnforge/ui-components`; that package name is
historical/current compatibility surface naming and is not the owner of the
canonical VyrnForge component system.

## Canonical component model

The canonical model is framework-neutral and owns:

- component identity, maturity, categories, and terminology;
- properties, models, defaults, constraints, and public methods;
- canonical events, details, reasons, and interaction semantics;
- composition regions and form semantics;
- accessibility roles, states, relationships, keyboard behavior, and focus
  obligations;
- token and styling contracts;
- framework mappings for Native, React, Angular, and Vue;
- generation metadata and explicit framework exceptions;
- documentation, testing, release, and AI-facing derived references.

Framework packages adapt these contracts; they do not maintain independent
component catalogs or semantic models.

## Framework surfaces

### Native HTML / Custom Elements

`@vyrnforge/ui-elements` is the first-class Native surface. It also provides a
reusable browser implementation used by other framework surfaces where
appropriate.

### React

`@vyrnforge/ui-components` is the current first-class React package. It owns
React props, callbacks, refs, children/composition, lifecycle integration, and
React compatibility behavior. It does not own canonical component semantics.

### Angular

`@vyrnforge/ui-angular` is the first-class Angular surface. It maps canonical
contracts into Angular inputs/outputs, composition, Forms integration, setup,
typing, and refs.

### Vue

`@vyrnforge/ui-vue` is the first-class Vue surface. It maps canonical
contracts into Vue props/emits, slots, `v-model`, setup, typing, and refs.

No surface needs to benchmark itself against another to be first-class.
Performance evidence is workload- and compatibility-driven where technically
needed, not a framework-ranking mechanism.

## Advanced UI modules

Advanced capabilities are optional VyrnForge modules beneath the common UI
system:

~~~text
VyrnForge UI
|
+-- Common UI
|   +-- Native
|   +-- React
|   +-- Angular
|   `-- Vue
|
`-- Advanced modules
    +-- Data Grid
    +-- Tree / Tree Grid
    +-- visualization
    +-- workflow / diagram UI
    `-- other reusable complex UI
~~~

Advanced modules reuse VyrnForge design, accessibility, terminology, metadata,
and contract concepts while remaining dependency-isolated.

### Current Data Grid

`@vyrnforge/ui-data-grid` is the current advanced Data Grid package. Its shipped
implementation is React-only alpha. That is a current implementation/release
limitation, not a product-level declaration that Data Grid belongs to React.

Future grid evolution should move reusable grid semantics, algorithms, state,
accessibility, styling, and framework mappings into a shared grid capability
model before claiming additional framework surfaces.

## Framework exceptions

Framework-specific implementation may diverge only when a concrete technical
constraint requires it. Exceptions must be narrow, explicit, metadata-backed,
traceable, and tested. They do not create a second product model.

See [ADR-008: Framework Exception Policy](adr-008-framework-exception-policy.md).

## State and ownership separation

~~~text
VyrnForge contract
  product semantics
  accessibility obligations
  state/event/form model
  framework mappings

shared foundations
  tokens and styling
  portable behavior decisions

surface implementation
  Native / React / Angular / Vue
  idiomatic framework API and lifecycle

consuming application
  business state
  backend requests
  routing
  authorization
  persistence
~~~

## Core principles

- VyrnForge is the UI library; frameworks are consumption surfaces.
- Native, React, Angular, and Vue are equal first-class surfaces.
- Shared concepts are solved once in framework-neutral contracts/foundations.
- Implementation reuse does not create product hierarchy.
- Framework APIs remain idiomatic even when browser implementation is shared.
- Advanced modules are capabilities beneath the UI system, not peer frameworks.
- Public packages remain application-store agnostic.
- Accessibility, compatibility, SSR safety, documentation, and testing are core
  requirements for every claimed first-class surface.

## Canonical sources

- [Project Source of Truth](../governance/01-project-source-of-truth.md)
- [Package Boundaries](01-package-boundaries.md)
- [State and Adapter Ownership](02-state-and-adapter-ownership.md)
- [Component Contracts and Events](09-component-contracts-and-events.md)
- [ADR-005: Canonical Web Implementation](adr-005-canonical-web-implementation.md)
- [ADR-006: Public Framework Package Strategy](adr-006-framework-package-strategy.md)
- [ADR-008: Framework Exception Policy](adr-008-framework-exception-policy.md)
- [ADR-011: Optional Advanced Module Architecture](adr-011-optional-advanced-module-architecture.md)
- [`../metadata/component-contracts.json`](../metadata/component-contracts.json)
- [`../metadata/multi-framework.json`](../metadata/multi-framework.json)
