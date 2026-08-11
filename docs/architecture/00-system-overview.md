# VyrnForge UI System Overview

VyrnForge UI is a native-first, dependency-minimal enterprise UI foundation
with shared framework-neutral foundations, first-class React and native HTML
renderers, and a specialized React data grid.

## Package architecture

```text
                         @vyrnforge/ui-core
       tokens Â· themes Â· density Â· typography Â· motion Â· layers Â· utilities
                                  |
                         @vyrnforge/ui-behaviors
       framework-neutral controllers Â· collections Â· selection Â· events
                                  |
              +-------------------+-------------------+
              |                                       |
 @vyrnforge/ui-components                    @vyrnforge/ui-elements
 first-class React renderer                  native Custom Elements
              |                                       |
              +----------- consuming applications ----+
                          React Â· HTML Â· Angular Â· Vue

Separate release track:
@vyrnforge/ui-data-grid â€” specialized React data grid
```

`ui-components` and `ui-elements` also depend directly on `ui-core`.
`ui-data-grid` depends on `ui-core` and `ui-components`.

## Support model

| Surface       | Role                                                                  | Release scope             |
| ------------- | --------------------------------------------------------------------- | ------------------------- |
| React         | First-class renderer through `@vyrnforge/ui-components`.              | Non-grid beta             |
| Native HTML   | First-class Custom Element renderer through `@vyrnforge/ui-elements`. | Non-grid beta             |
| Angular       | Verified consumer of `@vyrnforge/ui-elements`.                        | Non-grid beta integration |
| Vue           | Verified consumer of `@vyrnforge/ui-elements`.                        | Non-grid beta integration |
| Data grid     | Specialized React package.                                            | Independent alpha         |
| Mobile-native | Separate future program.                                              | Excluded                  |

## Core principles

- One semantic token and CSS-variable foundation.
- One framework-neutral behavior contract where behavior is shared.
- Thin renderer and framework adapters.
- Light DOM by default for native elements.
- Store-agnostic public packages.
- Application business state, backend requests, authorization, and workflows
  remain outside VyrnForge.
- Data-grid specialization must not redefine the entire library.

## State and rendering separation

Shared controllers own portable decisions and transitions. DOM adapters own
browser execution. Renderers own framework lifecycle and output.

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

renderer
  React JSX or Custom Element Light DOM
  framework lifecycle
  children, templates, or slots
```

## Canonical sources

- [Package Boundaries](01-package-boundaries.md)
- [State and Adapter Ownership](02-state-and-adapter-ownership.md)
- [Component Contracts and Events](09-component-contracts-and-events.md)
- [Custom Elements and Form Association](10-custom-elements-and-form-association.md)
- [`../metadata/multi-framework.json`](../metadata/multi-framework.json)
- [`../metadata/component-contracts.json`](../metadata/component-contracts.json)
