# Project Source Of Truth

VyrnForge UI is a reusable, enterprise-grade, general-purpose UI library and UI
foundation for web applications. **VyrnForge itself is the product.** Native
HTML / Custom Elements, React, Angular, and Vue are four equal first-class
consumption surfaces over one shared VyrnForge design system, component model,
behavior model, accessibility model, styling foundation, terminology, and
developer concepts.

No framework surface owns VyrnForge's component semantics. Package names and
current implementation reuse must not be interpreted as product hierarchy.
Native HTML, React, Angular, and Vue have the same product-level support status;
first-class support does not require identical source code, identical rendering
internals, or framework benchmarking against one another.

VyrnForge is not a React library with secondary wrappers, not a Native-only
library, not four unrelated framework libraries, and not a data-grid library.

## Product model

VyrnForge owns the reusable UI system:

- semantic design tokens, themes, density, typography, motion, and styling;
- canonical component and interaction contracts;
- reusable framework-neutral behavior and state-transition logic;
- accessibility, keyboard, focus, internationalization, responsive, SSR, and
  compatibility requirements;
- framework mappings, generators, metadata, documentation, examples, and AI
  context;
- common UI components and optional advanced UI modules.

The supported framework surfaces are peers:

~~~text
                         VyrnForge UI
                             |
          +------------------+------------------+
          |                  |                  |
   design system       canonical UI       shared behavior
   + styling           contracts          + accessibility
          |                  |                  |
          +------------------+------------------+
                             |
                  first-class UI surfaces
          +-----------+-----------+-----------+-----------+
          |           |           |           |
        Native       React       Angular       Vue
~~~

The diagram is a product model, not an implementation graph. A framework
surface may reuse another package's browser implementation internally when that
reduces duplication and still preserves its idiomatic public contract. Such
reuse does not make the reused surface more important or make the consuming
surface secondary.

## Current implementation packages

Current package names describe technical/distribution boundaries, not product
ownership.

| Package                    | Current implementation role                                                                                                      | Release track |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| `@vyrnforge/ui-core`       | Framework-neutral tokens, themes, typography, density, motion, layers, utilities, and shared styling foundations.                 | Non-grid beta |
| `@vyrnforge/ui-behaviors`  | Framework-neutral reusable behavior, state transitions, collections, navigation, overlays, forms, and reasoned events.           | Non-grid beta |
| `@vyrnforge/ui-elements`   | Native HTML / Custom Elements surface and reusable browser implementation used where appropriate by other surfaces.               | Non-grid beta |
| `@vyrnforge/ui-components` | **Current React package name.** It owns the React-facing API; it does not own VyrnForge's canonical component system.              | Non-grid beta |
| `@vyrnforge/ui-angular`    | Angular-facing API, generated bindings, setup, Forms integration, composition, and references.                                   | Non-grid beta |
| `@vyrnforge/ui-vue`        | Vue-facing API, generated components, props/emits, `v-model`, slots, refs, and setup.                                            | Non-grid beta |
| `@vyrnforge/ui-data-grid`  | Current package for the optional Data Grid advanced module; the presently shipped implementation is React-alpha only.             | Independent alpha |

The `ui-components` package name is historical/current compatibility surface
naming. It must not be used as evidence that React is the main VyrnForge product
or that the canonical component model belongs to React.

Exact package versions, dependency edges, public entrypoints, and release-group
membership are owned by package manifests and
[`../metadata/release-groups.json`](../metadata/release-groups.json).

## Framework architecture

Native HTML / Custom Elements, React, Angular, and Vue are equal first-class
surfaces. Equal means VyrnForge owns and verifies the public integration,
compatibility, accessibility expectations, documentation, and release behavior
for each supported surface.

Equal does **not** mean:

- four independently duplicated renderers;
- identical framework syntax;
- mandatory benchmarking between frameworks;
- identical internal dependency graphs.

The current implementation reuses `@vyrnforge/ui-elements` as a browser-native
implementation foundation for many non-grid components. Angular and Vue use
facades over that implementation, and React increasingly reuses it where doing
so preserves React compatibility. This is an implementation strategy only. It
does not rank Native above React, Angular, or Vue.

Framework-specific exceptions must remain narrow, explicit, traceable, and
tested.

## UI component lifecycle

A reusable component should be designed from the VyrnForge product model
outward:

~~~text
reusable UI requirement
        |
reuse / extension check
        |
canonical framework-neutral contract
        |
shared tokens / behavior / accessibility
        |
implementation and framework mappings
        |
+-------+-------+-------+-------+
|       |       |       |       |
Native  React   Angular Vue
        |
cross-surface verification
        |
docs / examples / AI context
        |
release evidence
~~~

A component must not be defined first as a React component and later copied to
other frameworks unless an explicit framework-specific exception requires that
implementation.

## Advanced UI modules

Advanced capabilities are part of VyrnForge but sit **below the UI system**, not
beside framework surfaces.

Conceptually:

~~~text
VyrnForge UI
|
+-- Common UI component system
|   +-- Native
|   +-- React
|   +-- Angular
|   `-- Vue
|
`-- Optional advanced modules
    +-- Data Grid
    +-- Tree / Tree Grid
    +-- visualization
    +-- workflow / diagram UI
    +-- advanced form or editor systems
    `-- future reusable UI capabilities
~~~

Each advanced module should define shared, framework-neutral semantics first and
then expose the supported VyrnForge surfaces. A module may initially ship on a
narrower surface when that limitation is explicit.

### Data Grid

Data Grid is an optional advanced VyrnForge UI module for complex
data-table/data-management experiences. It is **not** a fifth framework surface
and does not define VyrnForge.

The current `@vyrnforge/ui-data-grid` release is React-only alpha. That is a
current implementation and release limitation, not the target product
hierarchy. Future grid evolution should separate reusable grid contracts,
algorithms, state, accessibility, styling, and framework adapters so supported
Native, React, Angular, and Vue surfaces can be added without creating unrelated
grid products.

## Application boundary

Consuming applications own business logic, backend integration, routing,
authorization, persistence, product workflows, and application state
management. VyrnForge must not require Redux, Zustand, Pinia, NgRx, or another
application store.

## Dependency and styling policy

VyrnForge remains dependency-minimal and portable. It does not use MUI, Ant
Design, Tailwind, Radix, TanStack, Redux, Zustand, Pinia, NgRx, or similar
ecosystems as required foundations.

Shared visual behavior is token-driven through VyrnForge CSS custom properties
and semantic design roles. Framework surfaces and advanced modules extend the
same design system rather than introducing independent styling systems.

## Source authority

Use one source for each type of truth:

| Question                                               | Canonical source                                                                                             |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| Product identity and durable scope                     | This document                                                                                                |
| Documentation navigation                               | [`../README.md`](../README.md)                                                                               |
| Implementation/package dependency rules                | [`../architecture/01-package-boundaries.md`](../architecture/01-package-boundaries.md) and package manifests |
| Component catalog and maturity                         | [`../metadata/components.json`](../metadata/components.json)                                                 |
| Canonical component semantics                          | [`../metadata/component-contracts.json`](../metadata/component-contracts.json)                               |
| Package/release classification                         | [`../metadata/release-groups.json`](../metadata/release-groups.json)                                         |
| Current limitations                                    | [`../quality/03-known-limitations.md`](../quality/03-known-limitations.md)                                   |
| Active execution, task status, dependencies, and gates | Google Drive spreadsheet **VyrnForge Progress Tracker — Live Status**                                        |
| Agent repository rules                                 | [`../../AGENTS.md`](../../AGENTS.md)                                                                         |

Generated references and AI context must derive from canonical metadata.
Historical task narratives or audit reports do not override current sources.

## Non-goals

VyrnForge is not:

- a wrapper around another large UI framework;
- a React-first, Native-first, Angular-first, or Vue-first product;
- a required application-state framework;
- four framework-specific libraries that merely share branding;
- a data-grid product with a component library attached;
- a backend, router, authorization system, workflow execution engine, CMS, BI
  engine, spreadsheet product, or game/3D renderer.

The goal is one cohesive UI library that can serve lightweight applications and
deep enterprise interfaces across its supported first-class surfaces.
