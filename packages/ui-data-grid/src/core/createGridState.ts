import type { DataGridState } from "../types/dataGrid.types";

export const defaultDataGridState: DataGridState = {
  search: "",
  filters: [],
  sorting: [],
  grouping: [],
  pagination: {
    pageIndex: 0,
    pageSize: 25
  },
  columnVisibility: {},
  columnSizing: {},
  selectedRowIds: []
};

export function createGridState(
  initialState?: Partial<DataGridState>
): DataGridState {
  return {
    ...defaultDataGridState,
    ...initialState,
    pagination: {
      ...defaultDataGridState.pagination,
      ...initialState?.pagination
    },
    columnVisibility: {
      ...defaultDataGridState.columnVisibility,
      ...initialState?.columnVisibility
    },
    columnSizing: {
      ...defaultDataGridState.columnSizing,
      ...initialState?.columnSizing
    }
  };
}
