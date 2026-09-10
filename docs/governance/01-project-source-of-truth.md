# Project Source Of Truth

VyrnForge UI is a dependency-minimal, enterprise-grade, general-purpose UI foundation for web applications. It provides one shared design, behavior, accessibility, styling, and developer model across first-class Native HTML / Custom Elements, React, Angular, and Vue surfaces.

VyrnForge is not a React-first library, a data-grid library, or four unrelated framework component libraries. The data grid is one optional specialized capability on its own release track.

## Product model

VyrnForge owns the reusable UI contract and implementation foundations while consuming applications own business logic, backend integration, routing, authorization, persistence, and application state management.

The system is designed around these durable rules:

- shared tokens, styles, contracts, schemas, metadata, generators, and reusable logic stay framework-independent where practical;
- framework packages adapt the same VyrnForge model into idiomatic APIs rather than creating independent design systems;
- Native HTML / Custom Elements, React, Angular, and Vue are equal first-class supported surfaces;
- accessibility, keyboard and focus behavior, internationalization, responsive behavior, SSR safety, compatibility, migration, and performance are product requirements;
- large UI frameworks, styling systems, or application-state libraries are not required foundations;
- sophisticated capabilities may exist as optional modules without imposing their runtime or dependencies on consumers that do not use them;
- business-specific behavior remains in consuming applications.

## Current packages

| Package | Role | Release track |
| --- | --- | --- |
| `@vyrnforge/ui-core` | Framework-neutral tokens, themes, typography, density, motion, layers, utilities, and shared styling foundations. | Non-grid beta |
| `@vyrnforge/ui-behaviors` | Framework-neutral reusable component behavior, state rules, collections, navigation, overlays, forms, and reasoned events. | Non-grid beta |
| `@vyrnforge/ui-components` | First-class React surface. | Non-grid beta |
| `@vyrnforge/ui-elements` | First-class Native HTML / Custom Elements surface and canonical non-grid browser implementation where suitable. | Non-grid beta |
| `@vyrnforge/ui-angular` | First-class Angular facade over canonical VyrnForge elements and contracts. | Non-grid beta |
| `@vyrnforge/ui-vue` | First-class Vue facade over canonical VyrnForge elements and contracts. | Non-grid beta |
| `@vyrnforge/ui-data-grid` | Optional specialized React data-management grid. | Independent alpha |

Exact package versions, dependency edges, public entrypoints, and release-group membership are owned by package manifests and [`../metadata/release-groups.json`](../metadata/release-groups.json).

## Framework architecture

The four supported surfaces share one semantic and accessibility model. Support parity is a consumer guarantee, not a requirement for identical source code.

Native HTML / Custom Elements is the canonical non-grid browser implementation where that preserves correctness. Angular and Vue are thin/generated facades over that shared implementation. React uses shared VyrnForge foundations and may keep narrow framework-specific implementation where compatibility, developer experience, SSR, accessibility, or performance evidence requires it.

Framework-specific exceptions must remain explicit, narrow, traceable, and tested. A future framework requires an explicit requirement, implementation strategy, compatibility policy, documentation, and real consumer evidence; current support does not imply automatic support for additional frameworks.

Canonical architecture details live in:

- [System Overview](../architecture/00-system-overview.md)
- [Package Boundaries](../architecture/01-package-boundaries.md)
- [State and Adapter Ownership](../architecture/02-state-and-adapter-ownership.md)
- [Canonical Web Implementation](../architecture/adr-005-canonical-web-implementation.md)
- [Framework Package Strategy](../architecture/adr-006-framework-package-strategy.md)
- [Framework Exception Policy](../architecture/adr-008-framework-exception-policy.md)

## UI scope

VyrnForge may include both common application UI and sophisticated reusable UI such as advanced forms, trees, data-management surfaces, dashboards, visualization, workflow or diagram editors, rich editors, drag/drop systems, and spatial UI controls when those capabilities belong to the shared UI layer.

Those capabilities do not make VyrnForge the application's business runtime. Workflow execution, databases and query engines, authorization policy, routing, CMS behavior, BI calculation engines, application stores, and product-specific business logic remain outside the library.

## Dependency and styling policy

VyrnForge should remain portable and dependency-minimal. It does not use MUI, Ant Design, Tailwind, Radix, TanStack, Redux, Zustand, Pinia, NgRx, or similar ecosystems as required foundations.

Shared visual behavior is token-driven through VyrnForge CSS custom properties and semantic design roles. Themes, density, spacing, typography, colors, elevation, borders, motion, interaction states, and accessibility states should extend the shared token system rather than create framework-specific styling systems.

## Source authority

Use one source for each type of truth:

| Question | Canonical source |
| --- | --- |
| Product identity and durable scope | This document |
| Documentation navigation | [`../README.md`](../README.md) |
| Package dependency rules | [`../architecture/01-package-boundaries.md`](../architecture/01-package-boundaries.md) and package manifests |
| Component catalog and maturity | [`../metadata/components.json`](../metadata/components.json) |
| Package/release classification | [`../metadata/release-groups.json`](../metadata/release-groups.json) |
| Current limitations | [`../quality/03-known-limitations.md`](../quality/03-known-limitations.md) |
| Active execution, task status, dependencies, and gates | Google Drive spreadsheet **VyrnForge Progress Tracker — Live Status** |
| Agent repository rules | [`../../AGENTS.md`](../../AGENTS.md) |

Generated references and AI context must derive from canonical metadata. Historical task narratives or audit reports do not override current sources; retain them only when they have durable release, migration, regression, security, or architectural value.

## Non-goals

VyrnForge is not:

- a wrapper around another large UI framework;
- a required application-state framework;
- four framework-specific libraries that only share branding;
- a backend, router, authorization system, workflow execution engine, CMS, BI engine, spreadsheet product, or game/3D renderer;
- limited to enterprise applications or to the data grid.

The goal is one cohesive, reusable UI foundation that can serve simple applications and deep enterprise interfaces without duplicating the system for each framework.
