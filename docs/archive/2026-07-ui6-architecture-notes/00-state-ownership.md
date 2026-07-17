> Archived: This document is historical and no longer canonical.
> Replacement: ../../architecture/02-state-and-adapter-ownership.md

# State Ownership

VyrnForge UI packages do not own application data or business state. They own reusable UI behavior, controlled/uncontrolled view state contracts, pure helpers, and adapter contracts that apps connect to their own services.

## Ownership Levels

| Level | Owner | Examples | VyrnForge Rule |
| --- | --- | --- | --- |
| Local transient UI state | Component internally | menu open/close, popover open/close, hover/focus, drag state, resize state, active header menu | Keep local and disposable. Do not persist. |
| Component view state | VyrnForge component in uncontrolled mode or consuming app in controlled mode | search, filters, sorting, pagination, column visibility, column order, column sizing, density, grouping, expanded groups, selected rows | Support uncontrolled defaults and controlled props/callbacks. |
| Persisted preference state | Adapter contract and consuming app storage decision | column setup, density, page size, saved filters, saved views later | Store preferences only. Do not store row data or selected rows by default. |
| Server query state | Grid emitted query contract and consuming app fetch behavior | search/filter/sort/page/group emitted for API query | Emit/build query contracts. Do not fetch by default. |
| Business/application state | Consuming application | API rows, auth, tenant, permissions, backend actions, export jobs | Always owned by the app. |

## Rules

- Apps own backend data, permissions, workflows, and business state.
- VyrnForge packages must not create a global store.
- VyrnForge packages must not depend on Redux, Zustand, TanStack, or app state libraries.
- Data grid may own local view state in uncontrolled mode.
- Controlled state must remain available through props and callbacks.
- Persistence must remain adapter-based and preference-only.
- Server mode must emit query state by default; it must not fetch directly.
- Export must produce request contracts by default; it must not force file generation.
- Selection is view interaction state and is not persisted by default.

## Current Implementation

- `packages/ui-data-grid/src/state/` is the canonical home for grid state defaults, merge/reset logic, reducer actions, and selectors.
- `packages/ui-data-grid/src/core/` owns pure grid logic grouped by responsibility.
- `packages/ui-data-grid/src/hooks/` coordinates React state and delegates pure work to state/core modules.
- `packages/ui-data-grid/src/adapters/` contains persistence, server query, and export request boundaries.
