# API Contract and State Model

## 1. Purpose

This document defines the TypeScript contracts for the Universal Data Grid.

The contract must remain generic and reusable across products.

---

## 2. Core Props

```ts
export type UniversalDataGridProps<RowData extends Record<string, unknown> = Record<string, unknown>> = {
  tableId: string;
  columns: DataGridColumnDef<RowData>[];
  dataSource: DataGridDataSource<RowData>;

  title?: string;
  description?: string;

  mode?: "client" | "server";
  density?: DataGridDensity;

  getRowId?: (row: RowData, index: number) => string;

  features?: DataGridFeatureFlags;
  initialState?: Partial<DataGridInitialState>;

  toolbarActions?: React.ReactNode;
  bulkActions?: DataGridBulkAction<RowData>[];

  onRowClick?: (row: RowData) => void;
  onQueryChange?: (query: DataGridQueryState) => void;
  onExportRequest?: (request: DataGridExportRequest) => void;
};
```

---

## 3. Column Definition

```ts
export type DataGridColumnDataType =
  | "string"
  | "number"
  | "date"
  | "datetime"
  | "boolean"
  | "enum"
  | "status"
  | "currency"
  | "percent"
  | "custom";

export type DataGridColumnDef<RowData extends Record<string, unknown> = Record<string, unknown>> = {
  id: string;
  field?: keyof RowData | string;
  header: string;
  description?: string;

  dataType?: DataGridColumnDataType;

  width?: number;
  minWidth?: number;
  maxWidth?: number;

  align?: "left" | "center" | "right";

  resizable?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  searchable?: boolean;
  groupable?: boolean;
  hideable?: boolean;
  required?: boolean;

  enumOptions?: Array<{
    label: string;
    value: string | number | boolean;
  }>;

  accessor?: (row: RowData) => unknown;
  renderCell?: (params: DataGridCellParams<RowData>) => React.ReactNode;
  formatValue?: (value: unknown, row: RowData) => string;
  exportValue?: (value: unknown, row: RowData) => string | number | boolean | null;

  filterOperators?: DataGridFilterOperator[];

  meta?: Record<string, unknown>;
};
```

---

## 4. Cell Params

```ts
export type DataGridCellParams<RowData extends Record<string, unknown>> = {
  row: RowData;
  value: unknown;
  column: DataGridColumnDef<RowData>;
  rowId: string;
  rowIndex: number;
};
```

---

## 5. Feature Flags

```ts
export type DataGridFeatureFlags = {
  search?: boolean;
  filters?: boolean;
  advancedFilters?: boolean;
  sorting?: boolean;
  pagination?: boolean;
  cursorPagination?: boolean;
  grouping?: boolean;
  selection?: boolean;
  bulkActions?: boolean;
  columnVisibility?: boolean;
  columnOrdering?: boolean;
  columnResizing?: boolean;
  densitySwitch?: boolean;
  refresh?: boolean;
  export?: boolean;
  savedViews?: boolean;
  virtualization?: boolean;
};
```

Default behavior:

```ts
export const defaultDataGridFeatures: DataGridFeatureFlags = {
  search: true,
  filters: true,
  advancedFilters: false,
  sorting: true,
  pagination: true,
  cursorPagination: false,
  grouping: false,
  selection: false,
  bulkActions: false,
  columnVisibility: true,
  columnOrdering: true,
  columnResizing: true,
  densitySwitch: true,
  refresh: true,
  export: true,
  savedViews: false,
  virtualization: true
};
```

---

## 6. Query State

```ts
export type DataGridQueryState = {
  globalSearch: string;
  filters: DataGridFilter[];
  sort: DataGridSort[];
  grouping: string[];
  pagination: DataGridPaginationState;
};
```

---

## 7. Filter Model

```ts
export type DataGridFilter = {
  id: string;
  columnId: string;
  operator: DataGridFilterOperator;
  value?: unknown;
  valueTo?: unknown;
};

export type DataGridFilterOperator =
  | "contains"
  | "equals"
  | "notEquals"
  | "startsWith"
  | "endsWith"
  | "isEmpty"
  | "isNotEmpty"
  | "greaterThan"
  | "greaterThanOrEqual"
  | "lessThan"
  | "lessThanOrEqual"
  | "between"
  | "on"
  | "before"
  | "after"
  | "isTrue"
  | "isFalse"
  | "isAnyOf"
  | "isNot";
```

---

## 8. Sort Model

```ts
export type DataGridSort = {
  columnId: string;
  direction: "asc" | "desc";
};
```

---

## 9. Pagination Model

```ts
export type DataGridPaginationState = {
  type: "page" | "cursor";
  pageIndex?: number;
  pageSize: number;
  cursor?: string;
  nextCursor?: string;
  previousCursor?: string;
};
```

---

## 10. View State

```ts
export type DataGridViewState = {
  columnVisibility: Record<string, boolean>;
  columnOrder: string[];
  columnSizing: Record<string, number>;
  density: DataGridDensity;
  pinnedColumns?: {
    left?: string[];
    right?: string[];
  };
};

export type DataGridDensity = "compact" | "standard" | "comfortable";
```

---

## 11. Selection State

```ts
export type DataGridSelectionState = {
  selectedRowIds: string[];
  selectionMode: "none" | "single" | "multiple";
  allMatchingQuerySelected?: boolean;
};
```

---

## 12. Expansion State

```ts
export type DataGridExpansionState = {
  expandedGroupIds: string[];
};
```

---

## 13. Full Redux State

```ts
export type DataGridTableState = {
  tableId: string;
  query: DataGridQueryState;
  view: DataGridViewState;
  selection: DataGridSelectionState;
  expansion: DataGridExpansionState;
  status: DataGridStatusState;
};

export type DataGridStatusState = {
  loading: boolean;
  fetching: boolean;
  fetchingMore: boolean;
  error?: string;
  lastRefreshedAt?: string;
};

export type DataGridRootState = {
  tables: Record<string, DataGridTableState>;
};
```

---

## 14. Redux Actions

Required actions:

```ts
initializeGrid(tableId, initialState)
setGlobalSearch(tableId, value)
setFilters(tableId, filters)
addFilter(tableId, filter)
removeFilter(tableId, filterId)
clearFilters(tableId)
setSort(tableId, sort)
setGrouping(tableId, grouping)
setPagination(tableId, pagination)
setColumnVisibility(tableId, columnVisibility)
setColumnOrder(tableId, columnOrder)
setColumnSizing(tableId, columnSizing)
setDensity(tableId, density)
setSelection(tableId, selection)
clearSelection(tableId)
setExpandedGroups(tableId, expandedGroupIds)
setLoading(tableId, loading)
setFetching(tableId, fetching)
setFetchingMore(tableId, fetchingMore)
setError(tableId, error)
setLastRefreshedAt(tableId, timestamp)
resetGridView(tableId)
applySavedView(tableId, savedView)
```

---

## 15. Data Source Contract

```ts
export type DataGridDataSource<RowData extends Record<string, unknown>> =
  | ClientDataGridDataSource<RowData>
  | ServerDataGridDataSource<RowData>;
```

---

## 16. Client Data Source

```ts
export type ClientDataGridDataSource<RowData extends Record<string, unknown>> = {
  type: "client";
  rows: RowData[];
  total?: number;
};
```

---

## 17. Server Data Source

```ts
export type ServerDataGridDataSource<RowData extends Record<string, unknown>> = {
  type: "server";
  loadRows: (request: DataGridLoadRowsRequest) => Promise<DataGridLoadRowsResult<RowData>>;
  refreshKey?: string | number;
};

export type DataGridLoadRowsRequest = {
  tableId: string;
  query: DataGridQueryState;
  visibleColumns: string[];
  signal?: AbortSignal;
};

export type DataGridLoadRowsResult<RowData extends Record<string, unknown>> = {
  rows: RowData[];
  total?: number;
  pageIndex?: number;
  pageSize?: number;
  nextCursor?: string;
  previousCursor?: string;
  grouped?: boolean;
  lastRefreshedAt?: string;
};
```

---

## 18. Saved View Contract

```ts
export type DataGridSavedView = {
  id: string;
  tableId: string;
  name: string;
  description?: string;
  scope: "user" | "tenant" | "system";
  isDefault?: boolean;
  query: DataGridQueryState;
  view: DataGridViewState;
  createdAt?: string;
  updatedAt?: string;
};
```

---

## 19. Export Contract

```ts
export type DataGridExportFormat = "csv" | "xlsx" | "pdf" | "json";

export type DataGridExportScope =
  | "current_page"
  | "selected_rows"
  | "filtered_result"
  | "all_matching_query";

export type DataGridExportRequest = {
  tableId: string;
  format: DataGridExportFormat;
  scope: DataGridExportScope;
  query: DataGridQueryState;
  columns: DataGridExportColumn[];
  selectedRowIds?: string[];
  requestedAt: string;
};

export type DataGridExportColumn = {
  id: string;
  field?: string;
  header: string;
  dataType?: DataGridColumnDataType;
  order: number;
  visible: boolean;
};
```

---

## 20. Export Request Builder

```ts
export type BuildExportRequestParams<RowData extends Record<string, unknown>> = {
  tableId: string;
  format: DataGridExportFormat;
  scope: DataGridExportScope;
  columns: DataGridColumnDef<RowData>[];
  query: DataGridQueryState;
  view: DataGridViewState;
  selection: DataGridSelectionState;
};

export function buildDataGridExportRequest<RowData extends Record<string, unknown>>(
  params: BuildExportRequestParams<RowData>
): DataGridExportRequest;
```

---

## 21. Bulk Action Contract

```ts
export type DataGridBulkAction<RowData extends Record<string, unknown>> = {
  id: string;
  label: string;
  icon?: React.ReactNode;
  variant?: "default" | "primary" | "danger";
  disabled?: boolean | ((context: DataGridBulkActionContext<RowData>) => boolean);
  onClick: (context: DataGridBulkActionContext<RowData>) => void | Promise<void>;
};

export type DataGridBulkActionContext<RowData extends Record<string, unknown>> = {
  selectedRowIds: string[];
  selectedRows: RowData[];
  query: DataGridQueryState;
  allMatchingQuerySelected?: boolean;
};
```

---

## 22. Persistence Contract

```ts
export type DataGridPersistenceAdapter = {
  load: (key: string) => Promise<Partial<DataGridTableState> | null> | Partial<DataGridTableState> | null;
  save: (key: string, value: Partial<DataGridTableState>) => Promise<void> | void;
  remove: (key: string) => Promise<void> | void;
};
```

Default adapter:

```text
localStorage
```

Future adapters:

- Backend user preference API
- Tenant-level saved views API
- System default view API

---

## 23. Persistence Key Strategy

```ts
export function createDataGridPersistenceKey(params: {
  appId?: string;
  tenantId?: string;
  userId?: string;
  tableId: string;
}) {
  return ["data-grid", params.appId, params.tenantId, params.userId, params.tableId]
    .filter(Boolean)
    .join(":");
}
```

---

## 24. Server API Query Shape Recommendation

For backend integration, send query state as JSON.

```json
{
  "search": "john",
  "filters": [
    {
      "columnId": "status",
      "operator": "isAnyOf",
      "value": ["ACTIVE", "PENDING"]
    }
  ],
  "sort": [
    {
      "columnId": "createdAt",
      "direction": "desc"
    }
  ],
  "grouping": ["status"],
  "pagination": {
    "type": "page",
    "pageIndex": 0,
    "pageSize": 25
  }
}
```

Do not expose internal TanStack state directly to backend APIs.

Use a stable application-level query contract.
