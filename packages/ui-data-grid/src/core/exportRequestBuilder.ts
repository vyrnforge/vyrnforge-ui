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
  sort,
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
      visible:
        !column.hidden &&
        column.visible !== false &&
        columnVisibility[column.id] !== false
    })),
    filters,
    search,
    sorting: sorting ?? sort ?? [],
    sort: sort ?? sorting ?? [],
    grouping,
    pagination,
    selectedRowIds,
    scope,
    format,
    requestedAt: new Date().toISOString()
  };
}
