import type {
  BuildDataGridServerQueryParams,
  DataGridServerQuery
} from "./serverQuery.types";

export function buildDataGridServerQuery({
  tableId,
  search,
  filters,
  sort,
  grouping,
  pagination
}: BuildDataGridServerQueryParams): DataGridServerQuery {
  return {
    tableId,
    search,
    filters,
    sort,
    grouping,
    pagination: {
      pageIndex: pagination.pageIndex,
      pageSize: pagination.pageSize
    }
  };
}
