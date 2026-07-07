# 07 — Data Grid State and API Contract

## DataGridState

Recommended state shape:

```ts
export type DataGridState = {
  search: string;
  filters: DataGridFilter[];
  sort: DataGridSort[];
  pagination: DataGridPaginationState;
  columnVisibility: Record<string, boolean>;
  columnOrder: string[];
  columnSizing: Record<string, number>;
  grouping: string[];
  expandedGroupIds: string[];
  selectedRowIds: DataGridRowId[];
  density: DataGridDensity;
};
```

## Column definition

```ts
export type DataGridColumnDef<T> = {
  id: string;
  header: string;
  accessorKey?: keyof T;
  accessorFn?: (row: T) => unknown;
  cell?: (value: unknown, row: T, index: number) => React.ReactNode;

  width?: number;
  minWidth?: number;
  maxWidth?: number;
  resizable?: boolean;

  sortable?: boolean;
  searchable?: boolean;
  filterable?: boolean;
  groupable?: boolean;
  hideable?: boolean;
  hidden?: boolean;

  align?: "left" | "center" | "right";
  dataType?: "string" | "number" | "date" | "datetime" | "boolean" | "enum" | "status" | "custom";

  groupValue?: (row: T) => unknown;
  groupLabel?: (value: unknown) => React.ReactNode;
  aggregation?: DataGridAggregationDef<T>;
};
```

## Filters

```ts
export type DataGridFilter = {
  columnId: string;
  operator: DataGridFilterOperator;
  value: unknown;
};
```

Recommended operators:

```txt
contains
equals
startsWith
endsWith
gt
gte
lt
lte
isEmpty
isNotEmpty
```

## Sorting

```ts
export type DataGridSort = {
  columnId: string;
  direction: "asc" | "desc";
};
```

## Pagination

```ts
export type DataGridPaginationState = {
  pageIndex: number;
  pageSize: number;
};
```

## Selection

```ts
export type DataGridSelectionMode = "none" | "single" | "multiple";
export type DataGridSelectionScope = "page" | "filtered" | "allMatchingQuery";
```

## Bulk actions

```ts
export type DataGridBulkAction<T> = {
  id: string;
  label: string;
  variant?: "default" | "primary" | "danger";
  disabled?: boolean | ((context: DataGridBulkActionContext<T>) => boolean);
  hidden?: boolean | ((context: DataGridBulkActionContext<T>) => boolean);
  onClick: (context: DataGridBulkActionContext<T>) => void;
};
```

## Grouping

```ts
export type DataGridGroupRow<T> = {
  type: "group";
  id: string;
  depth: number;
  columnId: string;
  value: unknown;
  label: React.ReactNode;
  rowCount: number;
  leafRowIds: DataGridRowId[];
  children: DataGridDisplayRow<T>[];
  isExpanded: boolean;
};
```

```ts
export type DataGridLeafRow<T> = {
  type: "row";
  id: DataGridRowId;
  row: T;
  index: number;
  depth: number;
};
```

## Persistence adapter

```ts
export type DataGridPersistenceAdapter = {
  load: (tableId: string) => Partial<DataGridState> | null | Promise<Partial<DataGridState> | null>;
  save: (tableId: string, state: Partial<DataGridState>) => void | Promise<void>;
  clear?: (tableId: string) => void | Promise<void>;
};
```

Persist by default:

* search
* filters
* sort
* pagination.pageSize
* columnVisibility
* columnOrder
* columnSizing
* grouping
* density

Do not persist by default:

* rows
* loading state
* error state
* selected rows

## Server query state

For future server mode:

```ts
export type DataGridQueryState = {
  tableId: string;
  search: string;
  filters: DataGridFilter[];
  sort: DataGridSort[];
  grouping: string[];
  pagination: DataGridPaginationState;
  visibleColumnIds: string[];
};
```

## Export request

```ts
export type DataGridExportRequest = {
  tableId: string;
  scope: "current_page" | "selected_rows" | "filtered_result" | "all_matching_query";
  format: "csv" | "xlsx" | "pdf" | "json";
  columns: DataGridExportColumn[];
  query: DataGridQueryState;
  selectedRowIds: DataGridRowId[];
};
```
