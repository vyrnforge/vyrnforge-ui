export type DataGridFilterOperator =
  | "contains"
  | "equals"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "notEquals"
  | "startsWith"
  | "endsWith"
  | "isEmpty"
  | "isNotEmpty"
  | "greaterThan"
  | "greaterThanOrEqual"
  | "lessThan"
  | "lessThanOrEqual";

export type DataGridFilter = {
  id: string;
  columnId: string;
  operator: DataGridFilterOperator;
  value?: unknown;
};

export type DataGridSort = {
  columnId: string;
  direction: "asc" | "desc";
};

export type DataGridPaginationState = {
  pageIndex: number;
  pageSize: number;
};

export type DataGridRowId = string | number;

export type DataGridSelectionMode = "none" | "single" | "multiple";

export type DataGridGroupingState = string[];

export type DataGridFoundationColumnDef<
  RowData extends Record<string, unknown> = Record<string, unknown>,
> = {
  id: string;
  accessorKey?: keyof RowData;
  accessorFn?: (row: RowData) => unknown;
  searchable?: boolean;
};

export type DataGridColumnVisibilityState = Record<string, boolean>;

export type DataGridColumnSizingState = Record<string, number>;

export type DataGridDensity = "compact" | "standard" | "comfortable";

export type DataGridPersistKey =
  | "search"
  | "filters"
  | "sort"
  | "pagination"
  | "columnVisibility"
  | "columnOrder"
  | "columnSizing"
  | "grouping"
  | "density";

export type DataGridSelectionScope = "page" | "filtered" | "allMatchingQuery";

export type DataGridState = {
  search: string;
  filters: DataGridFilter[];
  sort: DataGridSort[];
  sorting?: DataGridSort[];
  grouping: DataGridGroupingState;
  expandedGroupIds: string[];
  pagination: DataGridPaginationState;
  columnVisibility: DataGridColumnVisibilityState;
  columnOrder: string[];
  columnSizing: DataGridColumnSizingState;
  selectedRowIds: DataGridRowId[];
  density: DataGridDensity;
};

export type DataGridQueryChange = Pick<
  DataGridState,
  "search" | "filters" | "sort" | "grouping" | "pagination"
>;

export type DataGridPersistedState = Partial<
  Pick<
    DataGridState,
    | "search"
    | "filters"
    | "sort"
    | "pagination"
    | "columnVisibility"
    | "columnOrder"
    | "columnSizing"
    | "grouping"
    | "density"
  >
>;

export type DataGridPersistenceAdapter = {
  load: (
    tableId: string,
  ) => DataGridPersistedState | null | Promise<DataGridPersistedState | null>;
  save: (
    tableId: string,
    state: DataGridPersistedState,
  ) => void | Promise<void>;
  clear?: (tableId: string) => void | Promise<void>;
};
