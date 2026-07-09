> Archived: This document is historical and no longer canonical.
> Replacement: ../../governance/02-document-lifecycle.md and ../../README.md

# Public API Stability

Dravyn UI should evolve without breaking consuming apps unnecessarily.

## Stability Rules

- Preserve component props unless a breaking change is explicitly planned.
- Preserve existing package exports where practical.
- Add new canonical modules incrementally, then keep compatibility shims for old import paths.
- Avoid exporting internal implementation details unless they are useful for controlled integrations or tests.
- Do not change data-grid state shape unless required for backward-compatible cleanup.

## Current Compatibility Paths

The new canonical organization is:

- `@dravyn/ui-data-grid/state`
- `@dravyn/ui-data-grid/adapters`
- `@dravyn/ui-data-grid/hooks`

Because package subpath exports are not published yet, public access is through the root package export. Existing root exports remain available:

- `createGridState`
- `defaultPersistKeys`
- `pickPersistableGridState`
- `resetGridViewState`
- `createLocalStorageGridPersistence`
- `buildDataGridExportRequest`
- `useDataGridState`
- `useControlledState`
- `useColumnResize`

New root exports include:

- `defaultDataGridState`
- `gridStateActions`
- `gridStateReducer`
- `mergeGridState`
- `selectGridQueryState`
- `buildDataGridServerQuery`

## Future Changes

Future server mode, export generation, saved views, and advanced filters should add adapters/contracts first and only then add optional UI behavior.