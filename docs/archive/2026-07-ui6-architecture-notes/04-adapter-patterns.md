> Archived: This document is historical and no longer canonical.
> Replacement: ../../architecture/02-state-and-adapter-ownership.md

# Adapter Patterns

Adapters isolate optional external integration points from rendering, state, and pure core logic.

## Persistence Adapter

Location: `packages/ui-data-grid/src/adapters/persistence/`

Rules:

- Store preferences only.
- Do not store row data.
- Do not persist selected rows by default.
- Storage failures must not break the grid.

Current adapter:

- `createLocalStorageGridPersistence`

## Server Query Adapter

Location: `packages/ui-data-grid/src/adapters/server/`

Rules:

- Build query contracts only.
- Do not fetch directly.
- Apps own API clients, authentication, retries, caching, and backend data state.

Current adapter:

- `buildDataGridServerQuery`

## Export Adapter

Location: `packages/ui-data-grid/src/adapters/export/`

Rules:

- Build export request contracts only.
- Do not generate files by default.
- Apps or future optional adapters may decide how to generate or download files.

Current adapter:

- `buildDataGridExportRequest`
