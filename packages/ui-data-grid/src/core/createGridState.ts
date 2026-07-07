import type { DataGridState } from "../types/dataGrid.types";

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
    selectedRowIds:
      initialState?.selectedRowIds ?? defaultDataGridState.selectedRowIds,
    density: initialState?.density ?? defaultDataGridState.density,
    grouping: initialState?.grouping ?? defaultDataGridState.grouping,
    expandedGroupIds:
      initialState?.expandedGroupIds ?? defaultDataGridState.expandedGroupIds,
    sort: initialState?.sort ?? initialState?.sorting ?? defaultDataGridState.sort
  };
}
