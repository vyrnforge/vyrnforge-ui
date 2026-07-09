import { defaultDataGridState } from "./gridState.defaults";
import type { DataGridState } from "./gridState.types";

export function createGridState(
  initialState?: Partial<DataGridState>
): DataGridState {
  const nextState: DataGridState = {
    search: initialState?.search ?? defaultDataGridState.search,
    filters: initialState?.filters ?? defaultDataGridState.filters,
    sort:
      initialState?.sort ??
      initialState?.sorting ??
      defaultDataGridState.sort,
    grouping: initialState?.grouping ?? defaultDataGridState.grouping,
    expandedGroupIds:
      initialState?.expandedGroupIds ?? defaultDataGridState.expandedGroupIds,
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
    density: initialState?.density ?? defaultDataGridState.density
  };

  if (initialState?.sorting !== undefined) {
    nextState.sorting = initialState.sorting;
  }

  return nextState;
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
