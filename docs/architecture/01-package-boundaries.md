# Package Boundaries

This document is the canonical package-ownership and dependency-direction
contract. `docs/metadata/packages.json` is its machine-readable companion.

## Dependency graph

```text
ui-core
  |
  +--> ui-behaviors
  |       |
  |       +--> ui-components
  |       +--> ui-elements
  |
  +----------> ui-components
  +----------> ui-elements
  +----------> ui-data-grid

ui-components --> ui-data-grid
```

Arrows point from a dependency to a consumer.

## `@vyrnforge/ui-core`

Owns tokens, themes, density, typography, motion, layers, shared utilities, and
framework-neutral theme helpers.

Allowed VyrnForge dependencies: none.

Must not own renderer behavior, application state, or grid behavior.

## `@vyrnforge/ui-behaviors`

Owns portable state transitions, collections, selection, navigation, overlay
decisions, validation-related controller state, feedback behavior, and reasoned
controller events.

Allowed VyrnForge dependencies:

- `@vyrnforge/ui-core`

Must not own framework runtime objects, DOM execution, CSS, rendering,
application persistence, or business workflows.

## `@vyrnforge/ui-components`

Owns the first-class React renderer: props, callbacks, refs, hooks, JSX
composition, React-specific DOM integration, and package component styles.

Allowed VyrnForge dependencies:

- `@vyrnforge/ui-core`
- `@vyrnforge/ui-behaviors`

Must not depend on `@vyrnforge/ui-elements`, `@vyrnforge/ui-data-grid`, a
required application store, or a large third-party UI runtime.

## `@vyrnforge/ui-elements`

Owns browser-native `vf-*` Custom Elements, registration, property/attribute
reflection, typed DOM events, Light DOM rendering, form association, and native
DOM adapters.

Allowed VyrnForge dependencies:

- `@vyrnforge/ui-core`
- `@vyrnforge/ui-behaviors`

Must not depend on React, Vue, Angular, `@vyrnforge/ui-components`,
`@vyrnforge/ui-data-grid`, or a large required Web Component runtime.

## `@vyrnforge/ui-data-grid`

Owns the specialized React data grid, grid state/contracts, grid algorithms,
adapters, and `udg-*` styling.

Allowed VyrnForge dependencies:

- `@vyrnforge/ui-core`
- `@vyrnforge/ui-components`

The grid remains independently versioned on its React alpha track.

## Forbidden directions

```text
ui-core -> any VyrnForge package
ui-behaviors -> renderer packages
ui-components -> ui-elements
ui-components -> ui-data-grid
ui-elements -> ui-components
ui-elements -> ui-data-grid
shared non-grid packages -> ui-data-grid
```

Relative imports must never bypass package boundaries.

## Framework dependency policy

`ui-core`, `ui-behaviors`, and `ui-elements` must not require React, React DOM,
Vue, or Angular runtime packages. Framework runtimes belong in renderer
packages or consumer fixtures where appropriate.

## Verification

```bash
npm run test:package-boundaries
npm run verify:package-boundaries
npm run verify:multi-framework
```
