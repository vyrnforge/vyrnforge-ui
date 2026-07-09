import type {
  DataGridPersistKey,
  DataGridPersistedState,
  DataGridState
} from "./gridState.types";

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

export function selectGridQueryState(state: DataGridState) {
  return {
    search: state.search,
    filters: state.filters,
    sort: state.sort,
    grouping: state.grouping,
    pagination: state.pagination
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
