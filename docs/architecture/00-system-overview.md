# VyrnForge UI System Overview

VyrnForge UI is a native-owned, dependency-minimal, general-purpose UI system
with enterprise-grade depth. Its architecture separates shared design,
behavior, accessibility, metadata, and component contracts from framework
integration so supported framework surfaces remain one VyrnForge system rather
than independent component libraries.

This document distinguishes **current implemented architecture** from the
**approved target architecture**. Current package manifests and release metadata
remain authoritative for what is shipped today.

## Current implemented architecture

```text
                         @vyrnforge/ui-core
       tokens · themes · density · typography · motion · layers · utilities
                                  |
                         @vyrnforge/ui-behaviors
       framework-neutral controllers · collections · selection · events
                                  |
              +-------------------+-------------------+
              |                                       |
 @vyrnforge/ui-components                    @vyrnforge/ui-elements
 current React package                       native Custom Elements
              |                                       |
              +----------- consuming applications ----+
                          React · HTML · Angular · Vue

Separate release track:
@vyrnforge/ui-data-grid — specialized React data grid
```

`ui-components` and `ui-elements` also depend directly on `ui-core`.
`ui-data-grid` depends on `ui-core` and `ui-components`.

The current repository does not yet contain the approved Angular and Vue public
facade package workspaces. Angular and Vue currently consume the canonical
native foundation through verified integration fixtures while S12 and S13
complete their first-class distribution packages.

## Approved multi-framework target

Native HTML, React, Angular, and Vue are the currently approved first-class web
surfaces. They share one canonical VyrnForge model for:

- design tokens, themes, density, and CSS custom properties;
- component semantics and public terminology;
- framework-neutral behavior and state contracts;
- canonical properties, models, events, reasons, and methods;
- composition regions and form semantics;
- accessibility and keyboard/focus obligations;
- framework mappings, generated integration, and explicit exceptions;
- documentation, testing, release metadata, and AI-facing context.

Framework packages should remain adapters/facades over those shared foundations
rather than become separate design systems. Generated or generic canonical-backed
integration is the default; a framework-specific implementation requires the
narrow exception process defined by ADR-008.

The architecture is framework-extensible. A future framework is not supported
merely because it can render Custom Elements; first-class admission requires an
approved framework descriptor, package/integration decision, compatibility and
accessibility evidence, packed consumer verification, documentation, release
coverage, and provenance according to ADR-012.

## Current support model

| Surface       | Current role                                            | Current release scope | Approved target                      |
| ------------- | ------------------------------------------------------- | --------------------- | ------------------------------------ |
| React         | First-class package through `@vyrnforge/ui-components`. | Non-grid beta         | First-class canonical-backed facade  |
| Native HTML   | First-class package through `@vyrnforge/ui-elements`.   | Non-grid beta         | First-class canonical native surface |
| Angular       | Verified consumer of `@vyrnforge/ui-elements`.          | Integration evidence  | Official first-class facade package  |
| Vue           | Verified consumer of `@vyrnforge/ui-elements`.          | Integration evidence  | Official first-class facade package  |
| Data grid     | Specialized React package.                              | Independent alpha     | Optional advanced capability         |
| Mobile-native | Not part of the current web framework program.          | Excluded              | Separate future product decision     |

Do not use the approved target column as evidence that an unshipped package is
already available. Current support claims must follow package/release metadata
and the applicable framework gate.

## Architectural layers

### Shared foundations

`@vyrnforge/ui-core` owns framework-neutral design foundations such as tokens,
themes, density, typography, motion, layers, utilities, and shared styling
contracts.

`@vyrnforge/ui-behaviors` owns reusable framework-neutral behavioral decisions
such as collections, selection, navigation, validation state, overlays,
reasoned events, and other portable interaction logic.

Shared foundations must not depend on React, Angular, Vue, application state
management, or optional advanced modules.

### Canonical web implementation

The native DOM / Custom Element foundation is the canonical default web
implementation strategy where it preserves required API, accessibility,
performance, SSR, composition, and framework semantics.

Canonical does not mean that every public framework component must be a trivial
wrapper around one fixed Custom Element. Framework correctness and public API
compatibility take precedence; ADR-008 governs narrow exceptions when generic
integration cannot satisfy the contract.

### Framework facades

Framework packages translate canonical VyrnForge semantics into idiomatic
framework APIs. They may own framework-specific typing, lifecycle integration,
forms/model adapters, slots/templates/content projection, refs, and setup, but
they must not duplicate shared design, behavior, accessibility, or product
semantics without an explicit exception.

### Optional advanced modules

Advanced capabilities such as data grids, trees/tree-grids, visualization,
complex editors, workflow/diagram UI, rich form composition, and spatial UI are
valid VyrnForge UI scope when justified. ADR-011 requires them to remain
optional and dependency-isolated so unrelated consumers do not pay their
runtime, bundle, CSS, or engine cost.

External rendering/calculation/workflow engines may be integrated through
adapters where appropriate; VyrnForge does not automatically own those engines
or the consuming application's business/runtime semantics.

### Reusable patterns and templates

ADR-013 defines a semantic pattern/template layer above individual components.
Patterns may describe reusable regions, compositions, responsive/density rules,
accessibility obligations, and framework recipes while continuing to reference
canonical component contracts rather than copying them.

Templates/scaffolds are derived consumer starting points, not a second source of
component or application business logic.

## Human and AI consumers

The contract system is a shared technical foundation for human developers,
framework generation, documentation, verification, and AI systems. ADR-010
requires AI-facing context to be deterministic, bounded, task/framework scoped,
and derived from canonical metadata instead of becoming another handwritten
architecture.

## Core principles

- One semantic token and CSS-variable foundation.
- One framework-neutral behavior contract where behavior is shared.
- One canonical component semantics and accessibility model.
- Framework adapters/facades remain thin where practical and idiomatic where
  required.
- Light DOM remains the default native-element styling/interoperability model.
- Public packages remain application-store agnostic.
- Application business state, backend requests, authorization, persistence, and
  workflow execution remain outside VyrnForge.
- Optional advanced capability depth must not make the common foundation
  heavyweight.
- First-class support claims require package, compatibility, accessibility,
  packed-consumer, release, and documentation evidence.
- Data-grid specialization and future advanced modules must not redefine the
  whole library.

## State and rendering separation

Shared controllers own portable decisions and transitions. DOM adapters own
browser execution. Framework facades/renderers own framework lifecycle and
output.

```text
shared controller
  state transitions
  collection and selection rules
  keyboard decisions
  validation state
  reasoned events

DOM adapter
  focus execution
  browser events
  positioning and observers
  ARIA relationship application

canonical/native implementation
  DOM and Custom Element behavior
  Light DOM composition
  form association where applicable

framework facade/renderer
  idiomatic framework API
  framework lifecycle
  models/forms
  children/templates/slots
  refs and imperative integration
```

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
- [`../metadata/multi-framework.json`](../metadata/multi-framework.json)
- [`../metadata/component-contracts.json`](../metadata/component-contracts.json)
