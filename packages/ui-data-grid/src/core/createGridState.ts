import type { DataGridState } from "../types/dataGrid.types";

export const defaultDataGridState: DataGridState = {
  search: "",
  filters: [],
  sort: [],
  grouping: [],
  pagination: {
    pageIndex: 0,
    pageSize: 10
  },
  columnVisibility: {},
  columnOrder: [],
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
    columnOrder: initialState?.columnOrder ?? defaultDataGridState.columnOrder,
    columnSizing: {
      ...defaultDataGridState.columnSizing,
      ...initialState?.columnSizing
    },
    sort: initialState?.sort ?? initialState?.sorting ?? defaultDataGridState.sort
  };
}
