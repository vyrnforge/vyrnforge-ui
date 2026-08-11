# ADR-007: Framework Facade Package Boundaries

- Status: Accepted target architecture
- Task: MFD-1004
- Scope: Public non-grid facade ownership and dependency directions
- Depends on: MFD-1002, MFD-1003
- Related: [ADR-005](adr-005-canonical-web-implementation.md), [ADR-006](adr-006-framework-package-strategy.md)

## Context

VyrnForge has selected a canonical native/DOM implementation for non-grid web
components and one public package identity per supported web surface. The next
architecture requirement is to make dependency direction explicit before any
new framework package implementation begins.

The target must preserve framework-neutral shared foundations, prevent framework
runtimes from leaking into the canonical implementation, and allow React,
Angular, and Vue packages to expose framework-native developer experience
without becoming independent component libraries.

## Decision

The target non-grid dependency model is:

```text
@vyrnforge/ui-core
        |
@vyrnforge/ui-behaviors
        |
@vyrnforge/ui-elements
 canonical native/DOM implementation
        |
   +----+-------------------+------------------+
   |                        |                  |
@vyrnforge/ui-components  @vyrnforge/ui-angular  @vyrnforge/ui-vue
React facade              Angular facade        Vue facade
```

Arrows point from dependency to consumer. Direct edges may be omitted when a
package only needs a transitive dependency, but no package may reverse these
ownership directions.

`@vyrnforge/ui-data-grid` remains outside this target graph except for its
existing React-facing dependency relationships. This ADR does not make the grid
multi-framework.

## Shared foundation boundary

### `@vyrnforge/ui-core`

Owns framework-neutral tokens, themes, density, typography, motion, layers,
utilities, and theme helpers.

Allowed VyrnForge dependencies: none.

Must not depend on or import:

- React or React DOM;
- Angular runtime packages;
- Vue runtime packages;
- `@vyrnforge/ui-elements`;
- any framework facade package.

### `@vyrnforge/ui-behaviors`

Owns framework-neutral component state transitions, controllers, collections,
selection, validation state, reasoned events, and reusable interaction decisions.

Allowed VyrnForge dependencies:

- `@vyrnforge/ui-core`.

Must remain DOM-neutral and framework-runtime-neutral. It must not own browser
execution, component rendering, framework lifecycle objects, framework refs,
framework templates, or application state.

## Canonical implementation boundary

### `@vyrnforge/ui-elements`

Remains the first-class native HTML package and owns the canonical non-grid
browser implementation selected by ADR-005.

Allowed VyrnForge dependencies:

- `@vyrnforge/ui-core`;
- `@vyrnforge/ui-behaviors`.

It owns:

- `vf-*` Custom Elements and registration;
- canonical DOM structure and native semantics;
- property/attribute reflection;
- canonical `vf-*` DOM events;
- Light DOM composition and canonical slots;
- ElementInternals/form-associated behavior where applicable;
- DOM-level focus, overlay, observer, and browser lifecycle execution;
- canonical component styling built on VyrnForge tokens;
- typed native methods and the Custom Elements Manifest.

It must not depend on React, React DOM, Angular, Vue, or framework facade
packages. Framework-specific conveniences must not be implemented here.

## React facade boundary

### `@vyrnforge/ui-components`

Remains the canonical React public package identity. Its target role is a React
facade over the canonical implementation, with migration occurring incrementally
under S14 rather than as a flag-day rewrite.

Allowed target VyrnForge dependencies:

- `@vyrnforge/ui-elements`;
- `@vyrnforge/ui-core` and/or `@vyrnforge/ui-behaviors` only when a documented
  facade responsibility requires a direct dependency.

React and React DOM belong here as peer/runtime-facing framework dependencies.

The facade owns React-specific API translation such as props, callbacks, refs,
children/render conventions, controlled/uncontrolled ergonomics, and React
lifecycle integration. It must not duplicate canonical DOM behavior merely to
avoid using the canonical implementation.

Existing React implementations may temporarily retain direct behavior/core
usage while S14 migrates components in validated batches. Such temporary edges
are migration state, not the target default.

## Angular facade boundary

### `@vyrnforge/ui-angular`

Is the target first-class Angular distribution package.

Allowed VyrnForge dependencies:

- `@vyrnforge/ui-elements`;
- direct `@vyrnforge/ui-core` or `@vyrnforge/ui-behaviors` only for a documented
  framework-facing need that cannot be obtained through the canonical package.

Angular runtime/forms dependencies belong only here as peer or package
requirements where needed.

The facade owns Angular-specific inputs/outputs, content projection/template
mapping, Forms/CVA integration, registration/setup, framework-native typing,
and Angular lifecycle/ref translation.

It must not reimplement component rendering, accessibility, styling, or shared
state machines already owned by the canonical implementation or shared
foundations.

## Vue facade boundary

### `@vyrnforge/ui-vue`

Is the target first-class Vue distribution package.

Allowed VyrnForge dependencies:

- `@vyrnforge/ui-elements`;
- direct `@vyrnforge/ui-core` or `@vyrnforge/ui-behaviors` only for a documented
  framework-facing need that cannot be obtained through the canonical package.

Vue runtime dependencies belong only here as peer or package requirements where
needed.

The facade owns Vue-specific props/emits, slots, refs, `v-model` translation,
plugin/component registration, framework-native typing, and lifecycle
integration.

It must not duplicate canonical DOM rendering, accessibility, styling, or
portable state machines.

## Native public surface

Native HTML is not a facade hidden behind framework packages. Consumers retain
a direct supported `@vyrnforge/ui-elements` path with explicit registration,
typed element contracts, DOM events, methods, slots, CSS, and manifest metadata.

## Framework runtime isolation

Framework runtimes are permitted only in their applicable facade packages and
consumer fixtures:

| Runtime | Permitted public package |
| --- | --- |
| React / React DOM | `@vyrnforge/ui-components` |
| Angular | `@vyrnforge/ui-angular` |
| Vue | `@vyrnforge/ui-vue` |

`ui-core`, `ui-behaviors`, and `ui-elements` remain free of those runtimes.
A facade must not require another framework facade or another framework runtime.

## Forbidden target directions

The following dependency directions are forbidden:

```text
ui-core -> any higher VyrnForge package
ui-behaviors -> ui-elements or any framework facade
ui-elements -> ui-components / ui-angular / ui-vue
ui-components -> ui-angular / ui-vue
ui-angular -> ui-components / ui-vue
ui-vue -> ui-components / ui-angular
shared non-grid packages -> ui-data-grid
```

Relative imports across package directories remain forbidden. Public package
entrypoints or generated internal package entrypoints must be used deliberately.

## Generated code boundary

Generated framework code belongs to the framework facade that consumes it.
Generated output must not copy canonical browser implementation logic into each
facade. Metadata and generator ownership are defined by later S10/S11 tasks.

Framework-specific handwritten code is permitted only for framework integration
or an explicit exception under MFD-1009. Application-specific wrappers, stores,
forms, authorization, data fetching, and business workflows remain outside
VyrnForge packages.

## Verification design

`verify:package-boundaries` must evolve from its current fixed five-package model
to metadata-driven target validation. The verifier should eventually derive:

- known packages and package directories;
- allowed VyrnForge dependency edges;
- permitted framework runtime specifiers per facade;
- framework-neutral package restrictions;
- DOM-neutral restrictions where applicable;
- relative-import boundary checks;
- package-role status such as current, target, generated, or deferred.

The verifier must not encode a permanent assumption that exactly five packages
exist. Until MFD-1004 package metadata changes and later package creation are
implemented, the current verifier continues to describe the implemented
repository rather than this target topology.

## Migration rule

Do not rewrite existing React package dependencies merely to make the repository
look like the target graph. React convergence occurs under the dedicated S14
migration plan with API, accessibility, SSR, performance, and rollback evidence.

Angular and Vue package directories are not created by this ADR. Their
implementation begins only after the applicable architecture and generation
gates.

## Acceptance mapping

MFD-1004 requires allowed dependencies and responsibilities for React, Angular,
Vue, and Native public facades, while isolating framework runtimes from
core/behaviors/canonical rendering foundations.

This ADR defines those responsibilities, the target dependency graph, forbidden
directions, runtime isolation rules, migration constraints, and the required
metadata-driven evolution of `verify:package-boundaries`.
