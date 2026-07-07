import type { CSSProperties, ReactNode } from "react";
import type {
  DataGridColumnDef,
  DataGridColumnSizingState,
  DataGridColumnVisibilityState
} from "./column.types";
import type { DataGridFilter, DataGridSort } from "./filter.types";
import type { DataGridThemeVars } from "../theme/dataGridTheme.types";

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

export type DataGridRowId = string | number;

export type DataGridSelectionMode = "none" | "single" | "multiple";

export type DataGridSelectionScope = "page" | "filtered" | "allMatchingQuery";

export type DataGridPaginationState = {
  pageIndex: number;
  pageSize: number;
};

export type DataGridGroupingState = string[];

export type DataGridDefaultExpandedGroups = "none" | "all" | string[];

export type DataGridGroupPathItem = {
  columnId: string;
  value: unknown;
};

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

export type DataGridBulkActionVariant = "default" | "primary" | "danger";

export type DataGridLeafRow<
  RowData extends Record<string, unknown> = Record<string, unknown>
> = {
  type: "row";
  id: DataGridRowId;
  row: RowData;
  index: number;
  depth: number;
};

export type DataGridGroupRow<
  RowData extends Record<string, unknown> = Record<string, unknown>
> = {
  type: "group";
  id: string;
  depth: number;
  columnId: string;
  value: unknown;
  label: ReactNode;
  rowCount: number;
  leafRowIds: DataGridRowId[];
  children: DataGridDisplayRow<RowData>[];
  isExpanded: boolean;
};

export type DataGridDisplayRow<
  RowData extends Record<string, unknown> = Record<string, unknown>
> = DataGridLeafRow<RowData> | DataGridGroupRow<RowData>;

export type DataGridGroupIdContext<
  RowData extends Record<string, unknown> = Record<string, unknown>
> = {
  columnId: string;
  value: unknown;
  depth: number;
  parentId?: string;
  path: DataGridGroupPathItem[];
  rows: RowData[];
};

export type DataGridGroupHeaderContext<
  RowData extends Record<string, unknown> = Record<string, unknown>
> = {
  group: DataGridGroupRow<RowData>;
  state: DataGridState;
};

export type DataGridBulkActionContext<
  RowData extends Record<string, unknown> = Record<string, unknown>
> = {
  tableId: string;
  selectedRowIds: DataGridRowId[];
  selectedRows: RowData[];
  selectionScope: DataGridSelectionScope;
  state: DataGridState;
};

export type DataGridBulkAction<
  RowData extends Record<string, unknown> = Record<string, unknown>
> = {
  id: string;
  label: string;
  variant?: DataGridBulkActionVariant;
  disabled?:
    | boolean
    | ((context: DataGridBulkActionContext<RowData>) => boolean);
  hidden?:
    | boolean
    | ((context: DataGridBulkActionContext<RowData>) => boolean);
  onClick: (context: DataGridBulkActionContext<RowData>) => void;
};

export type DataGridStateChangeHandler = (
  nextState: DataGridState
) => void;

export type DataGridQueryChange = Pick<
  DataGridState,
  "search" | "filters" | "sort" | "grouping" | "pagination"
>;

export type DataGridTheme =
  | "light"
  | "dark"
  | "system"
  | "enterprise"
  | (string & {});

export type DataGridVariant = "plain" | "card" | "bordered";

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
    tableId: string
  ) => DataGridPersistedState | null | Promise<DataGridPersistedState | null>;
  save: (
    tableId: string,
    state: DataGridPersistedState
  ) => void | Promise<void>;
  clear?: (tableId: string) => void | Promise<void>;
};

export type UniversalDataGridProps<
  RowData extends Record<string, unknown> = Record<string, unknown>
> = {
  tableId: string;
  columns: DataGridColumnDef<RowData>[];
  rows: RowData[];
  getRowId?: (row: RowData, index: number) => DataGridRowId;
  selectable?: boolean;
  selectionMode?: DataGridSelectionMode;
  selectedRowIds?: DataGridRowId[];
  defaultSelectedRowIds?: DataGridRowId[];
  onSelectedRowIdsChange?: (selectedRowIds: DataGridRowId[]) => void;
  getRowSelectable?: (row: RowData, index: number) => boolean;
  onRowClick?: (row: RowData, index: number) => void;
  enableRowClickSelection?: boolean;
  bulkActions?: DataGridBulkAction<RowData>[];
  enableGrouping?: boolean;
  defaultGrouping?: string[];
  onGroupingChange?: (grouping: string[]) => void;
  renderGroupHeader?: (
    context: DataGridGroupHeaderContext<RowData>
  ) => ReactNode;
  getGroupId?: (context: DataGridGroupIdContext<RowData>) => string;
  defaultExpandedGroups?: DataGridDefaultExpandedGroups;
  state?: Partial<DataGridState>;
  defaultState?: Partial<DataGridState>;
  onStateChange?: DataGridStateChangeHandler;
  loading?: boolean;
  error?: string | Error | null;
  totalRows?: number;
  title?: string;
  serverMode?: boolean;
  onQueryChange?: (query: DataGridQueryChange) => void;
  emptyMessage?: string;
  density?: DataGridDensity;
  persistenceAdapter?: DataGridPersistenceAdapter;
  persistState?: boolean;
  persistKeys?: DataGridPersistKey[];
  onResetView?: () => void;
  theme?: DataGridTheme;
  themeVars?: DataGridThemeVars;
  variant?: DataGridVariant;
  height?: number | string;
  maxHeight?: number | string;
  className?: string;
  style?: CSSProperties;
};
