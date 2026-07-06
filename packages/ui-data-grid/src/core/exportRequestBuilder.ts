import type {
  BuildDataGridExportRequestParams,
  DataGridExportRequest
} from "../types/export.types";

const headerToString = (header: unknown) =>
  typeof header === "string" ? header : "";

export function buildDataGridExportRequest<
  RowData extends Record<string, unknown>
>({
  tableId,
  columns,
  columnVisibility,
  filters,
  search,
  sorting,
  grouping,
  pagination,
  selectedRowIds,
  scope,
  format
}: BuildDataGridExportRequestParams<RowData>): DataGridExportRequest {
  return {
    tableId,
    columns: columns.map((column) => ({
      id: column.id,
      header: headerToString(column.header),
      visible: column.visible !== false && columnVisibility[column.id] !== false
    })),
    filters,
    search,
    sorting,
    grouping,
    pagination,
    selectedRowIds,
    scope,
    format,
    requestedAt: new Date().toISOString()
  };
}
