import { defaultDataGridState } from "./gridState.defaults";
import type { DataGridState } from "./gridState.types";

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

export const mergeGridState = createGridState;

export function resetGridViewState(
  currentState: DataGridState,
  defaultState?: Partial<DataGridState>
) {
  const baselineState = createGridState(defaultState);

  return {
    ...currentState,
    search: baselineState.search,
    filters: baselineState.filters,
    sort: baselineState.sort,
    sorting: baselineState.sort,
    pagination: {
      ...currentState.pagination,
      ...baselineState.pagination,
      pageIndex: 0
    },
    columnVisibility: baselineState.columnVisibility,
    columnOrder: baselineState.columnOrder,
    columnSizing: baselineState.columnSizing,
    grouping: baselineState.grouping,
    expandedGroupIds: baselineState.expandedGroupIds,
    selectedRowIds: baselineState.selectedRowIds,
    density: baselineState.density
  };
}
