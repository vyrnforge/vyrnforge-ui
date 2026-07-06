import type { DataGridPaginationState } from "../types/dataGrid.types";

export function applyPagination<RowData>(
  rows: RowData[],
  pagination: DataGridPaginationState
): RowData[] {
  const start = pagination.pageIndex * pagination.pageSize;
  return rows.slice(start, start + pagination.pageSize);
}
