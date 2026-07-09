> Archived: This document is historical and no longer canonical.
> Replacement: ../../architecture/02-state-and-adapter-ownership.md

# State Distribution

Dravyn UI packages do not own application data or business state. They own reusable UI behavior and emit contracts that apps can connect to their own services.

## Ownership Levels

| Level | Owner | Examples | Dravyn Rule |
| --- | --- | --- | --- |
| Local transient UI state | Component or hook | open menus, hovered rows, active resize session | Keep local and disposable. Do not persist. |
| Component view state | Component or controlled parent | search, sort, pagination, density, grouping, column sizing | Support uncontrolled defaults and controlled props/callbacks. |
| Persisted preference state | Adapter selected by the app | page size, column order, density, column visibility | Store preferences only. Do not store row data by default. |
| Server query state | App/service boundary | search, filters, sort, grouping, pagination | Emit/build query contracts. Do not fetch by default. |
| Application/business state | Consuming app | backend rows, permissions, workflows, domain actions | Always owned by the app. |

## Rules

- Apps own backend data, permissions, workflows, and business state.
- Dravyn packages must not create a global store.
- Data grid may own local view state in uncontrolled mode.
- Controlled state must remain available through props and callbacks.
- Persistence must remain adapter-based and preference-only.
- Server mode must emit query state by default; it must not fetch directly.
- Export must produce request contracts by default; it must not force file generation.
- Selection is view interaction state and is not persisted by default.

## Current Implementation

- `packages/ui-data-grid/src/state/` is the canonical home for grid state defaults, merge/reset logic, reducer actions, and selectors.
- `packages/ui-data-grid/src/hooks/` coordinates React state and delegates pure work to state/core modules.
- `packages/ui-data-grid/src/adapters/` contains persistence, server query, and export request boundaries.