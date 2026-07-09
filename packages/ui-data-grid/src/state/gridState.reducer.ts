import { createGridState, resetGridViewState } from "./gridState.merge";
import type { DataGridState, GridStateAction } from "./gridState.types";

export function gridStateReducer(
  state: DataGridState,
  action: GridStateAction
): DataGridState {
  switch (action.type) {
    case "merge":
      return createGridState({ ...state, ...action.state });
    case "reset":
      return resetGridViewState(state, action.defaultState);
    case "setColumnOrder":
      return { ...state, columnOrder: action.columnOrder };
    case "setColumnSizing":
      return { ...state, columnSizing: action.columnSizing };
    case "setColumnVisibility":
      return { ...state, columnVisibility: action.columnVisibility };
    case "setDensity":
      return { ...state, density: action.density };
    case "setExpandedGroupIds":
      return { ...state, expandedGroupIds: action.expandedGroupIds };
    case "setFilters":
      return { ...state, filters: action.filters };
    case "setGrouping":
      return { ...state, grouping: action.grouping };
    case "setPagination":
      return { ...state, pagination: action.pagination };
    case "setSearch":
      return {
        ...state,
        search: action.search,
        pagination: {
          ...state.pagination,
          pageIndex: 0
        }
      };
    case "setSelectedRowIds":
      return { ...state, selectedRowIds: action.selectedRowIds };
    case "setSort":
      return { ...state, sort: action.sort, sorting: action.sort };
    default:
      return state;
  }
}
