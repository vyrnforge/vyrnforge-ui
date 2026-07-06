import type { DataGridColumnDef } from "./column.types";
import type {
  DataGridGroupingState,
  DataGridPaginationState,
  DataGridRowId
} from "./dataGrid.types";
import type { DataGridFilter, DataGridSort } from "./filter.types";

export type DataGridExportFormat = "csv" | "xlsx" | "pdf" | "json";

export type DataGridExportScope =
  | "current_page"
  | "selected_rows"
  | "filtered_rows"
  | "all_rows";

export type DataGridExportColumn = {
  id: string;
  header: string;
  visible: boolean;
};

export type DataGridExportRequest = {
  tableId: string;
  columns: DataGridExportColumn[];
  filters: DataGridFilter[];
  search: string;
  sorting: DataGridSort[];
  sort?: DataGridSort[];
  grouping: DataGridGroupingState;
  pagination: DataGridPaginationState;
  selectedRowIds: DataGridRowId[];
  scope: DataGridExportScope;
  format: DataGridExportFormat;
  requestedAt: string;
};

export type BuildDataGridExportRequestParams<
  RowData extends Record<string, unknown> = Record<string, unknown>
> = {
  tableId: string;
  columns: DataGridColumnDef<RowData>[];
  columnVisibility: Record<string, boolean>;
  filters: DataGridFilter[];
  search: string;
  sorting?: DataGridSort[];
  sort?: DataGridSort[];
  grouping: DataGridGroupingState;
  pagination: DataGridPaginationState;
  selectedRowIds: DataGridRowId[];
  scope: DataGridExportScope;
  format: DataGridExportFormat;
};
