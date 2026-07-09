import type { DataGridState, GridStateAction } from "./gridState.types";

export const gridStateActions = {
  merge(state: Partial<DataGridState>): GridStateAction {
    return { type: "merge", state };
  },
  reset(defaultState?: Partial<DataGridState>): GridStateAction {
    return { type: "reset", defaultState };
  },
  setSearch(search: string): GridStateAction {
    return { type: "setSearch", search };
  },
  setFilters(filters: DataGridState["filters"]): GridStateAction {
    return { type: "setFilters", filters };
  },
  setSort(sort: DataGridState["sort"]): GridStateAction {
    return { type: "setSort", sort };
  },
  setPagination(pagination: DataGridState["pagination"]): GridStateAction {
    return { type: "setPagination", pagination };
  },
  setColumnVisibility(
    columnVisibility: DataGridState["columnVisibility"]
  ): GridStateAction {
    return { type: "setColumnVisibility", columnVisibility };
  },
  setColumnOrder(columnOrder: DataGridState["columnOrder"]): GridStateAction {
    return { type: "setColumnOrder", columnOrder };
  },
  setColumnSizing(
    columnSizing: DataGridState["columnSizing"]
  ): GridStateAction {
    return { type: "setColumnSizing", columnSizing };
  },
  setGrouping(grouping: DataGridState["grouping"]): GridStateAction {
    return { type: "setGrouping", grouping };
  },
  setExpandedGroupIds(expandedGroupIds: string[]): GridStateAction {
    return { type: "setExpandedGroupIds", expandedGroupIds };
  },
  setSelectedRowIds(
    selectedRowIds: DataGridState["selectedRowIds"]
  ): GridStateAction {
    return { type: "setSelectedRowIds", selectedRowIds };
  },
  setDensity(density: DataGridState["density"]): GridStateAction {
    return { type: "setDensity", density };
  }
};
