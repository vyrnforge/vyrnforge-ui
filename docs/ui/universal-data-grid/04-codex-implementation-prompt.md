# Codex Implementation Prompt

Use this prompt to implement the Universal Data Grid.

---

## Prompt

Build a reusable enterprise-grade Universal Data Grid package for our React + Redux application.

This must be implemented as shared UI infrastructure, not as a one-off table inside a feature page.

## Context

We build enterprise applications such as IAM, ITAM, ITSM, asset management, data platforms, admin portals, and customer portals.

Many modules need consistent table behavior:

- Search
- Filtering
- Sorting
- Grouping
- Column customization
- Column resizing
- Lazy loading
- Skeleton rows
- Row selection
- Bulk actions
- Saved views later
- Export later

The table must become reusable across projects and easy to upgrade.

## Technical stack

Use:

- React
- TypeScript
- Redux Toolkit
- React Redux
- TanStack Table
- TanStack Virtual
- MUI Material components
- MUI Icons
- tsup for package build
- Vitest for tests

Do not depend on MUI X Pro/Premium-only grid features.

MUI should be used for visual shell and controls, not as the table engine.

## Package target

Create a reusable package at:

```text
packages/ui-data-grid
```

Package name:

```text
@your-org/ui-data-grid
```

If the repository is not a monorepo yet, create the implementation under:

```text
src/shared/data-grid
```

but keep the code structured so it can later be moved into `packages/ui-data-grid` without major rewrite.

## Required package structure

```text
packages/ui-data-grid/
  src/
    components/
      UniversalDataGrid.tsx
      DataGridToolbar.tsx
      DataGridSearchBox.tsx
      DataGridFilterBar.tsx
      DataGridFilterDrawer.tsx
      DataGridColumnPanel.tsx
      DataGridDensityMenu.tsx
      DataGridBulkActionBar.tsx
      DataGridEmptyState.tsx
      DataGridErrorState.tsx
      DataGridSkeletonRows.tsx
      DataGridFooter.tsx
    hooks/
      useUniversalDataGrid.ts
      useDataGridColumns.ts
      useDataGridQueryState.ts
      useDataGridPersistence.ts
      useDataGridServerMode.ts
    store/
      dataGridSlice.ts
      dataGridSelectors.ts
    types/
      dataGrid.types.ts
      dataGridColumn.types.ts
      dataGridFilter.types.ts
      dataGridExport.types.ts
    adapters/
      createClientDataSource.ts
      createServerDataSource.ts
    exporters/
      exportRequestBuilder.ts
      exporterRegistry.ts
    utils/
      filterOperators.ts
      columnFormatters.ts
      rowGrouping.ts
      gridPersistenceKeys.ts
    index.ts
  package.json
  tsconfig.json
  tsup.config.ts
  README.md
```

## Core component

Create:

```tsx
<UniversalDataGrid
  tableId="users"
  columns={columns}
  dataSource={dataSource}
/>
```

The component should support generic row data.

```ts
UniversalDataGrid<RowData extends Record<string, unknown>>
```

## Required features

### 1. Column model

Create a generic column definition supporting:

- id
- field
- header
- description
- dataType
- width
- minWidth
- maxWidth
- align
- resizable
- sortable
- filterable
- searchable
- groupable
- hideable
- required
- enumOptions
- accessor
- renderCell
- formatValue
- exportValue
- filterOperators
- meta

Supported data types:

```text
string, number, date, datetime, boolean, enum, status, currency, percent, custom
```

### 2. Data modes

Support two modes:

#### Client mode

The grid receives all rows directly.

```ts
{
  type: "client",
  rows: []
}
```

Client mode handles search, filters, sorting, grouping, and pagination locally.

#### Server mode

The grid receives a `loadRows` function.

```ts
{
  type: "server",
  loadRows: async (request) => result
}
```

Server mode emits query state and fetches rows from the data source.

Server mode must support:

- global search
- filters
- sorting
- grouping query
- page pagination
- cursor pagination
- loading state
- refresh state
- error retry
- request cancellation where possible

### 3. Redux state

Create `dataGridSlice`.

State must be scoped by `tableId`.

Store only table UI/query state, not huge row data.

Store:

- global search
- filters
- sort
- grouping
- pagination
- column visibility
- column order
- column sizing
- density
- selected rows
- expanded groups
- loading/fetching/error metadata
- last refreshed timestamp

Create actions:

- initializeGrid
- setGlobalSearch
- setFilters
- addFilter
- removeFilter
- clearFilters
- setSort
- setGrouping
- setPagination
- setColumnVisibility
- setColumnOrder
- setColumnSizing
- setDensity
- setSelection
- clearSelection
- setExpandedGroups
- setLoading
- setFetching
- setFetchingMore
- setError
- setLastRefreshedAt
- resetGridView
- applySavedView

Create selectors:

- selectDataGridState
- selectDataGridQuery
- selectDataGridView
- selectDataGridSelection
- selectDataGridStatus

### 4. Persistence

Create a persistence adapter.

Default implementation can use localStorage.

Persist per tableId:

- filters
- sort
- grouping
- visible columns
- column order
- column sizing
- density
- page size

Create persistence key helper:

```text
data-grid:{appId}:{tenantId}:{userId}:{tableId}
```

Do not require tenant/user/app context, but support it optionally.

### 5. UI layout

Build a professional compact enterprise UI using MUI.

Toolbar:

- optional title
- global search input
- filter button
- grouping menu
- columns button
- density button
- refresh button
- export button placeholder
- custom action slot

Active filter bar:

- active filter chips
- clear filters action

Table:

- sticky header
- virtualized body
- grouped rows
- skeleton rows
- placeholder rows
- empty state
- filtered-empty state
- error state

Footer:

- result count
- selected count
- pagination controls
- page size selector
- last refreshed timestamp

### 6. Search

Global search must:

- Be debounced.
- Search only searchable columns in client mode.
- Emit query change in server mode.
- Persist state per tableId.

### 7. Filtering

Implement:

- Basic column filters
- Active filter chips
- Clear filters
- Type-aware filter operators
- Advanced filter drawer skeleton/initial implementation

Filter operators:

- string: contains, equals, startsWith, endsWith, isEmpty, isNotEmpty
- number: equals, greaterThan, greaterThanOrEqual, lessThan, lessThanOrEqual, between
- date/datetime: on, before, after, between
- boolean: isTrue, isFalse
- enum/status: is, isAnyOf, isNot

### 8. Sorting

Implement single and multi-column sort support.

Sorting should be configurable per column.

### 9. Grouping

Implement grouping by groupable columns.

Support:

- group menu
- group by column
- multiple grouping columns if TanStack setup supports it cleanly
- group expand/collapse
- group count
- disable grouping for non-groupable columns

### 10. Column customization

Implement:

- show/hide columns
- required/non-hideable columns
- reorder columns
- resize columns
- reset columns

Persist these per tableId.

### 11. Loading states

Implement:

- initial loading skeleton
- blank placeholder rows
- fetching-more indicator
- refresh indicator
- empty state
- filtered-empty state
- error state with retry button

### 12. Selection and bulk actions

Implement:

- row selection
- select current page
- clear selection
- selected count
- bulk action bar
- bulk action contract

Add support for `allMatchingQuerySelected` as a future server-mode capability.

### 13. Export extension

Do not implement full Excel/PDF generation yet.

Implement:

- export button
- export scope selection
- export format selection
- export request builder
- `onExportRequest` callback

Export request must include:

- tableId
- format
- scope
- query state
- visible columns
- column order
- selected rows
- requestedAt timestamp

### 14. Accessibility

Add:

- aria-labels for toolbar buttons
- keyboard accessible menus
- visible focus states
- screen-reader friendly loading/error states
- text labels for status, not color only

### 15. Performance

Add:

- memoized columns
- memoized row models
- debounced search
- virtualization for large rows
- avoid large row arrays in Redux
- avoid unnecessary rerenders

## Package build

Add `tsup.config.ts`.

Build outputs:

- ESM
- CJS
- Type declarations
- Sourcemaps

Externalize:

- react
- react-dom
- react-redux
- @reduxjs/toolkit
- @tanstack/react-table
- @tanstack/react-virtual
- @mui/material
- @mui/icons-material
- @emotion/react
- @emotion/styled

## Deliverables

- Reusable package/module implementation
- TypeScript contracts
- Redux slice/selectors/actions
- UniversalDataGrid component
- Toolbar components
- Filter components
- Column panel
- Density menu
- Skeleton/empty/error states
- Client data source helper
- Server data source helper
- Export request builder
- Demo page with mock client data
- Demo page with mocked async server data
- Tests for core behavior
- README with usage instructions

## Acceptance criteria

- Package builds successfully.
- A consuming app can import `UniversalDataGrid`.
- A page can render a table with `tableId`, `columns`, and `dataSource`.
- Search works.
- Filtering works.
- Sorting works.
- Pagination works.
- Column hide/show works.
- Column resizing works.
- Column reorder works.
- Grouping works.
- Selection works.
- Skeleton rows appear during loading.
- Empty and error states are clear.
- Grid preferences persist per tableId.
- Server mode emits correct query request.
- Export button builds a correct export request.
- No domain-specific assumptions are included.
- Code is clean, maintainable, and easy to move into a shared package.
