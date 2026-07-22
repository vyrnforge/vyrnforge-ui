# Package Boundaries

This document is the canonical package-ownership and dependency-direction
contract. `docs/metadata/packages.json` is the machine-readable form.

## Target dependency graph

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

Owns:

- primitive and semantic design tokens;
- themes and density;
- typography, motion, and layer roles;
- CSS utilities;
- framework-neutral theme objects and helpers.

Must not own:

- React, Vue, Angular, or Custom Element renderers;
- component behavior controllers;
- application state;
- data-grid behavior.

Allowed VyrnForge dependencies: none.

## `@vyrnforge/ui-behaviors` — planned

Owns:

- controlled and uncontrolled state transitions;
- collection registration and ordering;
- single, multiple, toggle, and range selection rules;
- keyboard decision models;
- validation state;
- canonical controller events and transition reasons.

Must not own:

- React hooks or JSX;
- Vue or Angular runtime objects;
- `HTMLElement`, `document`, or `window` execution;
- DOM focus, positioning, observers, or portals;
- CSS or rendering;
- application state and workflows.

Allowed VyrnForge dependencies:

- `@vyrnforge/ui-core`

## `@vyrnforge/ui-components`

Owns:

- the first-class React renderer;
- React props, refs, hooks, children, and render callbacks;
- React-specific DOM adapters where not yet shared;
- current public `vf-*` component CSS.

Allowed VyrnForge dependencies:

- `@vyrnforge/ui-core`
- `@vyrnforge/ui-behaviors` after S5 creates it

Must not depend on:

- `@vyrnforge/ui-elements`;
- `@vyrnforge/ui-data-grid`;
- required global-store or large UI-framework dependencies.

The React package remains the reference implementation and keeps the
`@vyrnforge/ui-components` name through beta.

## `@vyrnforge/ui-elements` — planned

Owns:

- browser-native `vf-*` Custom Elements;
- explicit and per-element registration entry points;
- property and attribute reflection;
- typed canonical DOM events;
- Light DOM rendering;
- form-associated element integration;
- native-element DOM adapters.

Allowed VyrnForge dependencies:

- `@vyrnforge/ui-core`
- `@vyrnforge/ui-behaviors`

Must not depend on:

- React or React DOM;
- Vue or Angular runtime packages;
- `@vyrnforge/ui-components`;
- `@vyrnforge/ui-data-grid`;
- a large required Web Component framework.

## `@vyrnforge/ui-data-grid`

Owns the current React UniversalDataGrid, grid-specific state contracts,
adapters, algorithms, and `udg-*` styling.

Allowed VyrnForge dependencies:

- `@vyrnforge/ui-core`
- `@vyrnforge/ui-components`

The package remains an independent React alpha. Grid decomposition,
performance, and multi-framework renderer work are deferred until after the
non-grid beta and must not become a dependency of shared packages.

## Forbidden dependency directions

```text
ui-core -> any other VyrnForge package
ui-behaviors -> ui-components
ui-behaviors -> ui-elements
ui-behaviors -> ui-data-grid
ui-components -> ui-elements
ui-components -> ui-data-grid
ui-elements -> ui-components
ui-elements -> ui-data-grid
shared non-grid packages -> ui-data-grid
```

Relative imports must never bypass package boundaries.

## Framework dependency policy

`ui-core`, `ui-behaviors`, and `ui-elements` must not declare or import React,
React DOM, Vue, or Angular runtime packages. Framework packages may appear in
consumer fixtures and optional integration adapters only.

## Verification

The repository package-boundary verifier reserves the planned package names and
checks them automatically when their directories are created:

```bash
npm run test:package-boundaries
npm run verify:package-boundaries
npm run verify:multi-framework
```
