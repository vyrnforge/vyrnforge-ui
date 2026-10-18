# Package Boundaries

This document is the canonical human-readable contract for the repository's **current implementation package boundaries and dependency directions**. Package ownership is not product ownership: VyrnForge's canonical component semantics remain framework-neutral, and Native, React, Angular, and Vue are equal first-class product surfaces. Package manifests and repository boundary verification are authoritative for concrete dependency edges; metadata and generated inventory must agree with them.

## Current dependency graph

Arrows point from a dependency to a consumer.

```text
ui-core
  |
  +--> ui-behaviors
  |       |
  |       +--> ui-elements
  |       +--> ui-components
  |
  +----------> ui-elements
  +----------> ui-components
  +----------> ui-data-grid

ui-elements
  +--> ui-components
  +--> ui-angular
  +--> ui-vue

ui-components
  +--> ui-data-grid
```

The `ui-components -> ui-elements` dependency is implementation reuse. It does not make Native the higher-ranked product surface, does not make React secondary, and does not turn the React public API into a raw Custom Element API.

## `@vyrnforge/ui-core`

Owns tokens, themes, density, typography, motion, layers, shared utilities, and framework-neutral theme helpers.

Allowed VyrnForge dependencies: none.

Must not own renderer behavior, application state, framework runtime integration, or grid behavior.

## `@vyrnforge/ui-behaviors`

Owns portable state transitions, collections, selection, navigation, overlay decisions, validation-related controller state, feedback behavior, and reasoned controller events.

Allowed VyrnForge dependencies:

- `@vyrnforge/ui-core`

Must not own framework runtime objects, DOM execution, CSS rendering, application persistence, or business workflows.

## `@vyrnforge/ui-elements`

Owns the current reusable browser-native implementation and first-class Native HTML surface: `vf-*` Custom Elements, registration, property/attribute reflection, typed DOM events, Light DOM rendering, form association, package styling, and native DOM adapters.

Allowed VyrnForge dependencies:

- `@vyrnforge/ui-core`
- `@vyrnforge/ui-behaviors`

Must not depend on React, Vue, Angular, `@vyrnforge/ui-components`, `@vyrnforge/ui-angular`, `@vyrnforge/ui-vue`, `@vyrnforge/ui-data-grid`, or a large required Web Component runtime.

## `@vyrnforge/ui-components`

Owns the first-class React public surface: props, callbacks, refs, hooks, JSX composition, React lifecycle integration, React compatibility behavior, and package component styling.

Allowed VyrnForge dependencies:

- `@vyrnforge/ui-core`
- `@vyrnforge/ui-behaviors`
- `@vyrnforge/ui-elements`

The native dependency supports shared browser-implementation reuse. React-specific code remains responsible for idiomatic React API compatibility and any explicit framework exceptions. The package must not become an independent source of canonical component semantics merely because a narrow React-specific implementation remains necessary.

Must not depend on `@vyrnforge/ui-angular`, `@vyrnforge/ui-vue`, `@vyrnforge/ui-data-grid`, a required application store, or a large third-party UI runtime.

## `@vyrnforge/ui-angular`

Owns the first-class Angular facade: package setup, generated Angular bindings, typed inputs/outputs, content projection metadata, typed element references, imperative method proxies, and optional Angular Forms integration.

Allowed VyrnForge dependencies:

- `@vyrnforge/ui-elements`

Angular framework packages and RxJS may be peer dependencies as required by the supported Angular line. Framework runtime dependencies remain isolated to the Angular package and consumer application.

Must not duplicate canonical rendering, shared design tokens, framework-neutral behavior, application state, or grid implementation.

## `@vyrnforge/ui-vue`

Owns the first-class Vue facade: plugin/setup integration, generated Vue components, props/emits, `v-model` translation, slot projection, typed refs, and Vue-specific typing.

Allowed VyrnForge dependencies:

- `@vyrnforge/ui-elements`

Vue remains a peer supplied by the consuming application. The package must not duplicate canonical rendering, shared design tokens, framework-neutral behavior, application state, or grid implementation.

## `@vyrnforge/ui-data-grid`

Owns the currently shipped React-alpha Data Grid implementation, grid state/contracts, grid algorithms, adapters, and `udg-*` styling. Data Grid is an optional advanced VyrnForge module, not a peer framework surface.

Allowed VyrnForge dependencies:

- `@vyrnforge/ui-core`
- `@vyrnforge/ui-components`

The current grid package remains independently versioned on its React alpha track. This is a current implementation/release limitation, not the target product hierarchy; future multi-surface grid work requires an explicit advanced-module architecture change.

## Dependency-direction rules

```text
ui-core -> no VyrnForge dependencies
ui-behaviors -> ui-core only
ui-elements -> ui-core + ui-behaviors only
ui-angular -> ui-elements only among VyrnForge packages
ui-vue -> ui-elements only among VyrnForge packages
ui-components -> ui-core + ui-behaviors + ui-elements only
ui-data-grid -> ui-core + ui-components only
```

Framework facade packages must not depend on one another. Shared non-grid foundations and framework facades must not depend on `ui-data-grid`. Relative imports must never bypass package boundaries.

## Canonical model versus package ownership

Package ownership does not create separate component models. Canonical component contracts and metadata define product semantics shared across all first-class surfaces. Packages own implementation and framework translation responsibilities only.

React, Native HTML, Angular, and Vue are equal first-class product surfaces. The repository currently reuses the Native/Custom Element package as a shared browser implementation for other surfaces where practical. That implementation strategy is distinct from product support status and may evolve without changing the equal-surface model.

## Framework exception boundary

A framework-specific implementation may diverge from the default canonical-backed path only through the explicit exception policy. Exceptions must be narrow, metadata-backed, evidence-backed, and reviewed; they must not create an untracked dependency direction or duplicate shared product semantics.

See [ADR-008: Framework Exception Policy](adr-008-framework-exception-policy.md).

## Framework dependency policy

`ui-core`, `ui-behaviors`, and `ui-elements` must not require React, React DOM, Vue, or Angular runtime packages. Framework runtimes belong in the applicable framework package or consuming application. VyrnForge must not require Redux, Zustand, Pinia, NgRx, or another application state manager.

## Verification

```bash
npm run test:package-boundaries
npm run verify:package-boundaries
npm run verify:multi-framework
```

Repository verification must stay synchronized with actual package manifests. Generated or hand-maintained metadata that disagrees with the validated dependency graph is drift and must be corrected rather than used to override the manifests.
