# @dravyn/ui-data-grid API

`@dravyn/ui-data-grid` provides `UniversalDataGrid`, specialized grid components, core helpers, state contracts, and adapter contracts for enterprise data-management interfaces.

The grid is not a backend client, global store, report engine, or export file generator.

## CSS Import

```ts
import "@dravyn/ui-core/styles/index.css";
import "@dravyn/ui-components/styles/index.css";
import "@dravyn/ui-data-grid/styles/index.css";
```

## Basic Usage

```tsx
import { UniversalDataGrid } from "@dravyn/ui-data-grid";
import type { DataGridColumnDef } from "@dravyn/ui-data-grid";

type Order = {
  id: string;
  customer: string;
  total: number;
};

const columns: DataGridColumnDef<Order>[] = [
  { id: "customer", header: "Customer", accessorKey: "customer" },
  { id: "total", header: "Total", accessorKey: "total", dataType: "number" }
];

export function OrdersGrid({ rows }: { rows: Order[] }) {
  return (
    <UniversalDataGrid
      rows={rows}
      columns={columns}
      getRowId={(row) => row.id}
    />
  );
}
```

## Column Definitions

Columns describe how rows become cells and how grid features apply to each column.

Common column concerns include:

- `id`
- header label/content
- accessor key or accessor function
- data type
- filtering and sorting support
- sizing constraints
- visibility
- grouping support
- aggregation support when configured

Use stable exported types such as `DataGridColumnDef`, `DataGridColumnDataType`, `DataGridColumnSizingState`, and `DataGridAggregationDef`.

## Rows And getRowId

Rows are owned by the consuming app. The grid renders the rows it receives.

Provide `getRowId` when row identity is not obvious or when selection/persistence depends on stable row IDs:

```tsx
<UniversalDataGrid rows={rows} columns={columns} getRowId={(row) => row.id} />
```

Stable row IDs are important for:

- selection
- bulk actions
- row expansion
- grouping
- persistence of view state

## Controlled And Uncontrolled State

The grid supports uncontrolled view state for local use and controlled state for app-owned coordination.

Controlled state is useful when an app needs to synchronize:

- search
- filters
- sorting
- pagination
- density
- column visibility
- column order
- column sizing
- grouping
- row selection

The app remains the source of truth when controlled props are used.

## Search, Filter, Sort, And Pagination

Public helpers include:

- `applySearch`
- `applyFilters`
- `applySorting`
- `applyPagination`
- `selectGridQueryState`

These helpers operate on data/query state. They do not fetch remote data.

## Column Visibility, Order, And Sizing

Public helpers include:

- `resolveVisibleColumns`
- `updateColumnVisibility`
- `showAllColumns`
- `hideOptionalColumns`
- `resolveOrderedColumns`
- `moveColumnOrder`
- `moveColumnBefore`
- `resolveColumnSizing`
- `setColumnSize`
- `resetColumnSize`
- `resetAllColumnSizes`

Use these helpers when building controlled grid state or adapters.

## Selection And Bulk Actions

Public selection helpers include:

- `selectRows`
- `deselectRows`
- `toggleRowSelection`
- `clearSelection`
- `resolveSelectedRows`
- `getSelectionStateForPage`
- `getSelectableRowIds`

Bulk actions are app actions. The grid can present selection and action context, but the consuming app owns mutations, permissions, and backend workflows.

## Grouping

Grouping helpers are exported for implemented grouping behavior:

- `applyGrouping`
- `buildGroupedRows`
- `flattenGroupedRows`
- `toggleGroupExpanded`
- `expandAllGroups`
- `collapseAllGroups`
- `normalizeGrouping`

Use grouping with columns that are intended to be groupable. Avoid treating grouping as a server reporting engine.

## Persistence Adapter

Persistence stores view preferences, not row data.

Public persistence APIs include:

- `createLocalStorageGridPersistence`
- `pickPersistableGridState`
- `defaultPersistKeys`

Persistable state may include column setup, density, page size, and similar preferences. Do not persist selected rows by default.

## Server Query Contract

`buildDataGridServerQuery` builds a serializable query contract from grid state.

The grid does not:

- fetch data
- own auth
- own retries
- own cache
- own API clients

The consuming app receives the query contract and performs API work.

## Export Request Contract

`buildDataGridExportRequest` builds an export request contract.

The grid does not generate files by default. The app or a future optional adapter owns file generation, background jobs, permissions, and delivery.

## Styling Overrides

Use shared `--dv-*` tokens for app-wide theme alignment and `--udg-*` variables for grid-specific overrides:

```css
.my-app {
  --dv-primary: #003b71;
}

.my-app .udg {
  --udg-row-height: 42px;
  --udg-header-bg: #f8fafc;
}
```

Do not copy grid internals into app CSS. Prefer documented tokens and props.

## Limitations

- The grid does not own backend rows.
- The grid does not require Redux.
- The grid does not fetch data by default.
- The grid does not generate export files by default.
- The grid does not own auth, tenant, permissions, mutations, retries, or cache.
- Advanced server mode, saved views, advanced filtering, and file generation are separate roadmap work unless already documented as implemented.
