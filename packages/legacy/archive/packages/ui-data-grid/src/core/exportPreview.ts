import type {
  DataGridExportColumn,
  DataGridExportFormat,
  DataGridExportRequest,
  DataGridExportScope,
} from "../types/export.types";
import type { DataGridPaginationState } from "../types/dataGrid.types";

export type DataGridExportPreview = {
  tableId: string;
  format: DataGridExportFormat;
  scope: DataGridExportScope;
  visibleColumns: DataGridExportColumn[];
  hiddenColumnCount: number;
  filterCount: number;
  hasSearch: boolean;
  sortCount: number;
  groupingCount: number;
  selectedRowCount: number;
  pagination: DataGridPaginationState;
};

export function buildDataGridExportPreview(
  request: DataGridExportRequest,
): DataGridExportPreview {
  const visibleColumns = request.columns
    .filter((column) => column.visible)
    .map((column) => ({ ...column }));

  return {
    tableId: request.tableId,
    format: request.format,
    scope: request.scope,
    visibleColumns,
    hiddenColumnCount: request.columns.length - visibleColumns.length,
    filterCount: request.filters.length,
    hasSearch: request.search.trim().length > 0,
    sortCount: request.sorting.length,
    groupingCount: request.grouping.length,
    selectedRowCount: request.selectedRowIds.length,
    pagination: { ...request.pagination },
  };
}
