import { createGridState } from "./createGridState";
import type { DataGridColumnDef } from "../types/column.types";
import type {
  DataGridPersistKey,
  DataGridPersistedState,
  DataGridState
} from "../types/dataGrid.types";

export const defaultPersistKeys: DataGridPersistKey[] = [
  "search",
  "filters",
  "sort",
  "pagination",
  "columnVisibility",
  "columnOrder",
  "columnSizing",
  "grouping",
  "density"
];

const isColumnVisible = <RowData extends Record<string, unknown>>(
  column: DataGridColumnDef<RowData>,
  visibility: DataGridState["columnVisibility"]
) => {
  if (column.hideable === false) {
    return true;
  }

  const visibilityValue = visibility[column.id];

  if (typeof visibilityValue === "boolean") {
    return visibilityValue;
  }

  return !column.hidden && column.visible !== false;
};

export function resolveVisibleColumns<
  RowData extends Record<string, unknown>
>(
  columns: DataGridColumnDef<RowData>[],
  visibility: DataGridState["columnVisibility"]
) {
  return columns.filter((column) => isColumnVisible(column, visibility));
}

export function resolveOrderedColumns<
  RowData extends Record<string, unknown>
>(
  columns: DataGridColumnDef<RowData>[],
  columnOrder: string[]
) {
  if (columnOrder.length === 0) {
    return [...columns];
  }

  const byId = new Map(columns.map((column) => [column.id, column]));
  const orderedColumns = columnOrder
    .map((columnId) => byId.get(columnId))
    .filter((column): column is DataGridColumnDef<RowData> => Boolean(column));
  const orderedIds = new Set(orderedColumns.map((column) => column.id));
  const remainingColumns = columns.filter((column) => !orderedIds.has(column.id));

  return [...orderedColumns, ...remainingColumns];
}

export function updateColumnVisibility<
  RowData extends Record<string, unknown>
>(
  columns: DataGridColumnDef<RowData>[],
  visibility: DataGridState["columnVisibility"],
  columnId: string,
  visible: boolean
) {
  const column = columns.find((candidate) => candidate.id === columnId);

  if (!column || (column.hideable === false && !visible)) {
    return visibility;
  }

  return {
    ...visibility,
    [columnId]: visible
  };
}

export function showAllColumns<RowData extends Record<string, unknown>>(
  columns: DataGridColumnDef<RowData>[],
  visibility: DataGridState["columnVisibility"]
) {
  return columns.reduce<DataGridState["columnVisibility"]>(
    (nextVisibility, column) => ({
      ...nextVisibility,
      [column.id]: true
    }),
    visibility
  );
}

export function hideOptionalColumns<RowData extends Record<string, unknown>>(
  columns: DataGridColumnDef<RowData>[],
  visibility: DataGridState["columnVisibility"]
) {
  return columns.reduce<DataGridState["columnVisibility"]>(
    (nextVisibility, column) => {
      if (column.hideable === false) {
        return {
          ...nextVisibility,
          [column.id]: true
        };
      }

      return {
        ...nextVisibility,
        [column.id]: false
      };
    },
    visibility
  );
}

export function filterColumnMenuColumns<
  RowData extends Record<string, unknown>
>(columns: DataGridColumnDef<RowData>[], search: string) {
  const query = search.trim().toLowerCase();

  if (!query) {
    return columns;
  }

  return columns.filter(
    (column) =>
      column.id.toLowerCase().includes(query) ||
      column.header.toLowerCase().includes(query)
  );
}

export function moveColumnOrder(
  allColumnIds: string[],
  currentOrder: string[],
  columnId: string,
  direction: "up" | "down" | "first" | "last"
) {
  const knownIds = new Set(allColumnIds);
  const normalizedOrder = [
    ...currentOrder.filter((candidate) => knownIds.has(candidate)),
    ...allColumnIds.filter((candidate) => !currentOrder.includes(candidate))
  ];
  const currentIndex = normalizedOrder.indexOf(columnId);

  if (currentIndex < 0) {
    return normalizedOrder;
  }

  const nextOrder = [...normalizedOrder];
  const [column] = nextOrder.splice(currentIndex, 1);
  const nextIndex =
    direction === "first"
      ? 0
      : direction === "last"
        ? nextOrder.length
        : direction === "up"
          ? Math.max(0, currentIndex - 1)
          : Math.min(nextOrder.length, currentIndex + 1);

  nextOrder.splice(nextIndex, 0, column);
  return nextOrder;
}

export function moveColumnBefore(
  allColumnIds: string[],
  currentOrder: string[],
  columnId: string,
  targetColumnId: string,
  placement: "before" | "after" = "before"
) {
  const knownIds = new Set(allColumnIds);
  const normalizedOrder = [
    ...currentOrder.filter((candidate) => knownIds.has(candidate)),
    ...allColumnIds.filter((candidate) => !currentOrder.includes(candidate))
  ];

  if (columnId === targetColumnId || !knownIds.has(columnId)) {
    return normalizedOrder;
  }

  const nextOrder = normalizedOrder.filter(
    (candidate) => candidate !== columnId
  );
  const targetIndex = nextOrder.indexOf(targetColumnId);

  if (targetIndex < 0) {
    return normalizedOrder;
  }

  nextOrder.splice(placement === "after" ? targetIndex + 1 : targetIndex, 0, columnId);
  return nextOrder;
}

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

export function pickPersistableGridState(
  state: DataGridState,
  keys: DataGridPersistKey[] = defaultPersistKeys
): DataGridPersistedState {
  const persistableState: DataGridPersistedState = {};
  const keySet = new Set(keys);

  if (keySet.has("search")) {
    persistableState.search = state.search;
  }

  if (keySet.has("filters")) {
    persistableState.filters = state.filters;
  }

  if (keySet.has("sort")) {
    persistableState.sort = state.sort;
  }

  if (keySet.has("pagination")) {
    persistableState.pagination = {
      pageIndex: 0,
      pageSize: state.pagination.pageSize
    };
  }

  if (keySet.has("columnVisibility")) {
    persistableState.columnVisibility = state.columnVisibility;
  }

  if (keySet.has("columnOrder")) {
    persistableState.columnOrder = state.columnOrder;
  }

  if (keySet.has("columnSizing")) {
    persistableState.columnSizing = state.columnSizing;
  }

  if (keySet.has("grouping")) {
    persistableState.grouping = state.grouping;
  }

  if (keySet.has("density")) {
    persistableState.density = state.density;
  }

  return persistableState;
}
