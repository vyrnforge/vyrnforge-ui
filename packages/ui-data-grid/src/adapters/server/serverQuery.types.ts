import type {
  DataGridGroupingState,
  DataGridPaginationState
} from "../../types/dataGrid.types";
import type { DataGridFilter, DataGridSort } from "../../types/filter.types";

export type DataGridServerQuery = {
  tableId: string;
  search: string;
  filters: DataGridFilter[];
  sort: DataGridSort[];
  grouping: DataGridGroupingState;
  pagination: DataGridPaginationState;
};

export type BuildDataGridServerQueryParams = DataGridServerQuery;
