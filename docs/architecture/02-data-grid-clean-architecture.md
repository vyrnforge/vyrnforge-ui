# Data Grid Clean Architecture

`@dravyn/ui-data-grid` is split by responsibility so future server mode, export generation, saved views, and advanced filters can be added without rewriting the grid.

## Layers

| Layer | Location | Responsibility |
| --- | --- | --- |
| Components | `src/components/` | Render table UI, wire event handlers, preserve accessibility |
| Hooks | `src/hooks/` | Coordinate React interaction state such as controlled state, resize, debounce, reorder |
| State | `src/state/` | Defaults, merge/reset logic, reducer actions, selectors |
| Core | `src/core/` | Pure grid algorithms such as filtering, sorting, pagination, grouping, selection, sizing |
| Adapters | `src/adapters/` | Integration contracts for persistence, server query, export requests |
| Styles | `src/styles/` | Visual design, density, themes, `udg-*` variables and classes |

## Rules

- Components render and coordinate interactions; they should not own heavy algorithms.
- Hooks may use React and DOM events, but should delegate pure calculation to state/core modules.
- State modules must not store row data.
- Core functions must be pure, unit-testable, and free of React, DOM, storage, or style imports.
- Adapters may touch external systems only at the boundary. Persistence can use storage; server/export builders only create contracts for now.
- Styles own visual design; TSX may pass dynamic CSS variables for runtime sizing.

## Compatibility

Existing public exports from `core/createGridState`, `core/columnManagement`, `core/gridPersistence`, and `core/exportRequestBuilder` are preserved. New canonical modules live under `state/` and `adapters/`.
