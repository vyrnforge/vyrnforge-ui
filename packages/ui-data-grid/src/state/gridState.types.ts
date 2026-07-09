import type {
  DataGridPersistKey,
  DataGridPersistedState,
  DataGridState
} from "../types/dataGrid.types";

export type {
  DataGridPersistKey,
  DataGridPersistedState,
  DataGridState
};

export type GridStateAction =
  | { type: "merge"; state: Partial<DataGridState> }
  | { type: "reset"; defaultState?: Partial<DataGridState> }
  | { type: "setColumnOrder"; columnOrder: DataGridState["columnOrder"] }
  | {
      type: "setColumnSizing";
      columnSizing: DataGridState["columnSizing"];
    }
  | {
      type: "setColumnVisibility";
      columnVisibility: DataGridState["columnVisibility"];
    }
  | { type: "setDensity"; density: DataGridState["density"] }
  | { type: "setExpandedGroupIds"; expandedGroupIds: string[] }
  | { type: "setFilters"; filters: DataGridState["filters"] }
  | { type: "setGrouping"; grouping: DataGridState["grouping"] }
  | { type: "setPagination"; pagination: DataGridState["pagination"] }
  | { type: "setSearch"; search: string }
  | { type: "setSelectedRowIds"; selectedRowIds: DataGridState["selectedRowIds"] }
  | { type: "setSort"; sort: DataGridState["sort"] };
