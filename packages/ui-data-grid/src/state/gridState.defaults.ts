import type { DataGridState } from "./gridState.types";

export const defaultDataGridState: DataGridState = {
  search: "",
  filters: [],
  sort: [],
  grouping: [],
  expandedGroupIds: [],
  pagination: {
    pageIndex: 0,
    pageSize: 10
  },
  columnVisibility: {},
  columnOrder: [],
  columnSizing: {},
  selectedRowIds: [],
  density: "standard"
};
