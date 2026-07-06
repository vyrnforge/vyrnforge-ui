import type { CSSProperties } from "react";
import type {
  DataGridColumnDef,
  DataGridColumnSizingState,
  DataGridColumnVisibilityState
} from "./column.types";
import type { DataGridFilter, DataGridSort } from "./filter.types";

export type DataGridRowId = string | number;

export type DataGridPaginationState = {
  pageIndex: number;
  pageSize: number;
};

export type DataGridGroupingState = string[];

export type DataGridState = {
  search: string;
  filters: DataGridFilter[];
  sorting: DataGridSort[];
  grouping: DataGridGroupingState;
  pagination: DataGridPaginationState;
  columnVisibility: DataGridColumnVisibilityState;
  columnSizing: DataGridColumnSizingState;
  selectedRowIds: DataGridRowId[];
};

export type DataGridStateChangeHandler = (
  nextState: DataGridState
) => void;

export type DataGridQueryChange = Pick<
  DataGridState,
  "search" | "filters" | "sorting" | "grouping" | "pagination"
>;

export type UniversalDataGridProps<
  RowData extends Record<string, unknown> = Record<string, unknown>
> = {
  tableId: string;
  columns: DataGridColumnDef<RowData>[];
  rows: RowData[];
  getRowId?: (row: RowData, index: number) => DataGridRowId;
  state?: DataGridState;
  defaultState?: Partial<DataGridState>;
  onStateChange?: DataGridStateChangeHandler;
  loading?: boolean;
  error?: string | null;
  totalRows?: number;
  serverMode?: boolean;
  onQueryChange?: (query: DataGridQueryChange) => void;
  emptyMessage?: string;
  className?: string;
  style?: CSSProperties;
};
