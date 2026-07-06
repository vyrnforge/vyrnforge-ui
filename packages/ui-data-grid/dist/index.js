// src/components/UniversalDataGrid.tsx
import { useEffect, useMemo as useMemo2 } from "react";

// src/core/applyFilters.ts
var getColumnValue = (row, column) => {
  if (column.accessorFn) {
    return column.accessorFn(row);
  }
  if (column.accessorKey) {
    return row[column.accessorKey];
  }
  return row[column.id];
};
var compareNumber = (value, filterValue) => Number(value) - Number(filterValue);
function matchesFilter(value, filter) {
  const text = String(value ?? "").toLowerCase();
  const filterText = String(filter.value ?? "").toLowerCase();
  switch (filter.operator) {
    case "contains":
      return text.includes(filterText);
    case "equals":
      return value === filter.value || text === filterText;
    case "notEquals":
      return value !== filter.value && text !== filterText;
    case "startsWith":
      return text.startsWith(filterText);
    case "endsWith":
      return text.endsWith(filterText);
    case "isEmpty":
      return value == null || value === "";
    case "isNotEmpty":
      return value != null && value !== "";
    case "greaterThan":
      return compareNumber(value, filter.value) > 0;
    case "greaterThanOrEqual":
      return compareNumber(value, filter.value) >= 0;
    case "lessThan":
      return compareNumber(value, filter.value) < 0;
    case "lessThanOrEqual":
      return compareNumber(value, filter.value) <= 0;
    default:
      return true;
  }
}
function applyFilters(rows, columns, filters) {
  if (filters.length === 0) {
    return rows;
  }
  return rows.filter(
    (row) => filters.every((filter) => {
      const column = columns.find((candidate) => candidate.id === filter.columnId);
      if (!column) {
        return true;
      }
      return matchesFilter(getColumnValue(row, column), filter);
    })
  );
}

// src/core/applyPagination.ts
function applyPagination(rows, pagination) {
  const start = pagination.pageIndex * pagination.pageSize;
  return rows.slice(start, start + pagination.pageSize);
}

// src/core/applySearch.ts
var getColumnValue2 = (row, column) => {
  if (column.accessorFn) {
    return column.accessorFn(row);
  }
  if (column.accessorKey) {
    return row[column.accessorKey];
  }
  return row[column.id];
};
function applySearch(rows, columns, search) {
  const query = search.trim().toLowerCase();
  if (!query) {
    return rows;
  }
  const searchableColumns = columns.filter((column) => column.searchable !== false);
  return rows.filter(
    (row) => searchableColumns.some((column) => {
      const value = getColumnValue2(row, column);
      return String(value ?? "").toLowerCase().includes(query);
    })
  );
}

// src/core/applySorting.ts
var getColumnValue3 = (row, column) => {
  if (column.accessorFn) {
    return column.accessorFn(row);
  }
  if (column.accessorKey) {
    return row[column.accessorKey];
  }
  return row[column.id];
};
var compareValues = (left, right) => {
  if (left == null && right == null) {
    return 0;
  }
  if (left == null) {
    return -1;
  }
  if (right == null) {
    return 1;
  }
  if (typeof left === "number" && typeof right === "number") {
    return left - right;
  }
  return String(left).localeCompare(String(right), void 0, {
    numeric: true,
    sensitivity: "base"
  });
};
function applySorting(rows, columns, sorting) {
  if (sorting.length === 0) {
    return rows;
  }
  return [...rows].sort((leftRow, rightRow) => {
    for (const sort of sorting) {
      const column = columns.find((candidate) => candidate.id === sort.columnId);
      if (!column) {
        continue;
      }
      const result = compareValues(
        getColumnValue3(leftRow, column),
        getColumnValue3(rightRow, column)
      );
      if (result !== 0) {
        return sort.direction === "asc" ? result : -result;
      }
    }
    return 0;
  });
}

// src/core/columnVisibility.ts
function getVisibleColumns(columns, visibility) {
  return columns.filter(
    (column) => column.visible !== false && visibility[column.id] !== false
  );
}

// src/hooks/useDataGridState.ts
import { useMemo } from "react";

// src/core/createGridState.ts
var defaultDataGridState = {
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
function createGridState(initialState) {
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

// src/hooks/useControlledState.ts
import { useCallback, useState } from "react";
function useControlledState(controlledValue, defaultValue, onChange) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const isControlled = controlledValue !== void 0;
  const value = isControlled ? controlledValue : uncontrolledValue;
  const setValue = useCallback(
    (nextValue) => {
      const resolvedValue = typeof nextValue === "function" ? nextValue(value) : nextValue;
      if (!isControlled) {
        setUncontrolledValue(resolvedValue);
      }
      onChange?.(resolvedValue);
    },
    [isControlled, onChange, value]
  );
  return [value, setValue];
}

// src/hooks/useDataGridState.ts
function useDataGridState({
  state,
  defaultState,
  onStateChange
}) {
  const initialState = useMemo(() => createGridState(defaultState), [defaultState]);
  return useControlledState(state, initialState, onStateChange);
}

// src/components/DataGridEmptyState.tsx
import { jsx } from "react/jsx-runtime";
function DataGridEmptyState({
  message = "No rows found.",
  columnCount = 1
}) {
  return /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { className: "udg-empty", colSpan: columnCount, children: message }) });
}

// src/components/DataGridErrorState.tsx
import { jsx as jsx2 } from "react/jsx-runtime";
function DataGridErrorState({
  error,
  columnCount = 1
}) {
  if (!error) {
    return null;
  }
  return /* @__PURE__ */ jsx2("tr", { children: /* @__PURE__ */ jsx2("td", { className: "udg-error", colSpan: columnCount, role: "alert", children: error }) });
}

// src/components/DataGridPagination.tsx
import { jsx as jsx3, jsxs } from "react/jsx-runtime";
function DataGridPagination({
  pagination,
  totalRows,
  onChange
}) {
  const pageCount = Math.max(1, Math.ceil(totalRows / pagination.pageSize));
  const currentPage = Math.min(pagination.pageIndex + 1, pageCount);
  return /* @__PURE__ */ jsxs("div", { className: "udg-pagination", children: [
    /* @__PURE__ */ jsxs("span", { children: [
      "Page ",
      currentPage,
      " of ",
      pageCount
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "udg-pagination-actions", children: [
      /* @__PURE__ */ jsx3(
        "button",
        {
          type: "button",
          onClick: () => onChange({
            ...pagination,
            pageIndex: Math.max(0, pagination.pageIndex - 1)
          }),
          disabled: pagination.pageIndex <= 0,
          children: "Previous"
        }
      ),
      /* @__PURE__ */ jsx3(
        "button",
        {
          type: "button",
          onClick: () => onChange({
            ...pagination,
            pageIndex: Math.min(pageCount - 1, pagination.pageIndex + 1)
          }),
          disabled: pagination.pageIndex >= pageCount - 1,
          children: "Next"
        }
      )
    ] })
  ] });
}

// src/components/DataGridSearch.tsx
import { jsx as jsx4, jsxs as jsxs2 } from "react/jsx-runtime";
function DataGridSearch({
  value,
  onChange,
  placeholder = "Search"
}) {
  return /* @__PURE__ */ jsxs2("label", { className: "udg-search", children: [
    /* @__PURE__ */ jsx4("span", { className: "udg-sr-only", children: placeholder }),
    /* @__PURE__ */ jsx4(
      "input",
      {
        className: "udg-search-input",
        placeholder,
        type: "search",
        value,
        onChange: (event) => onChange(event.currentTarget.value)
      }
    )
  ] });
}

// src/components/DataGridSkeletonRows.tsx
import { Fragment, jsx as jsx5 } from "react/jsx-runtime";
function DataGridSkeletonRows({
  rowCount = 5,
  columnCount = 1
}) {
  return /* @__PURE__ */ jsx5(Fragment, { children: Array.from({ length: rowCount }).map((_, index) => /* @__PURE__ */ jsx5("tr", { className: "udg-skeleton-row", children: /* @__PURE__ */ jsx5("td", { colSpan: columnCount, children: /* @__PURE__ */ jsx5("span", { className: "udg-skeleton-line" }) }) }, index)) });
}

// src/components/DataGridToolbar.tsx
import { jsx as jsx6 } from "react/jsx-runtime";
function DataGridToolbar({ children }) {
  return /* @__PURE__ */ jsx6("div", { className: "udg-toolbar", role: "toolbar", children });
}

// src/components/UniversalDataGrid.tsx
import { jsx as jsx7, jsxs as jsxs3 } from "react/jsx-runtime";
var getCellValue = (row, column) => {
  if (column.accessorFn) {
    return column.accessorFn(row);
  }
  if (column.accessorKey) {
    return row[column.accessorKey];
  }
  return row[column.id];
};
function UniversalDataGrid({
  tableId,
  columns,
  rows,
  getRowId,
  state,
  defaultState,
  onStateChange,
  loading = false,
  error = null,
  totalRows,
  serverMode = false,
  onQueryChange,
  emptyMessage,
  className,
  style
}) {
  const [gridState, setGridState] = useDataGridState({
    state,
    defaultState,
    onStateChange
  });
  const visibleColumns = useMemo2(
    () => getVisibleColumns(columns, gridState.columnVisibility),
    [columns, gridState.columnVisibility]
  );
  const clientRows = useMemo2(() => {
    if (serverMode) {
      return rows;
    }
    const searchedRows = applySearch(rows, visibleColumns, gridState.search);
    const filteredRows = applyFilters(
      searchedRows,
      visibleColumns,
      gridState.filters
    );
    return applySorting(filteredRows, visibleColumns, gridState.sorting);
  }, [
    gridState.filters,
    gridState.search,
    gridState.sorting,
    rows,
    serverMode,
    visibleColumns
  ]);
  const renderedRows = useMemo2(
    () => serverMode ? rows : applyPagination(clientRows, gridState.pagination),
    [clientRows, gridState.pagination, rows, serverMode]
  );
  const resolvedTotalRows = totalRows ?? (serverMode ? rows.length : clientRows.length);
  const rootClassName = ["udg-root", className].filter(Boolean).join(" ");
  useEffect(() => {
    onQueryChange?.({
      search: gridState.search,
      filters: gridState.filters,
      sorting: gridState.sorting,
      grouping: gridState.grouping,
      pagination: gridState.pagination
    });
  }, [
    gridState.filters,
    gridState.grouping,
    gridState.pagination,
    gridState.search,
    gridState.sorting,
    onQueryChange
  ]);
  const updateSearch = (search) => {
    setGridState((currentState) => ({
      ...currentState,
      search,
      pagination: {
        ...currentState.pagination,
        pageIndex: 0
      }
    }));
  };
  const updateSorting = (columnId) => {
    setGridState((currentState) => {
      const currentSort = currentState.sorting.find(
        (sort) => sort.columnId === columnId
      );
      const direction = currentSort?.direction === "asc" ? "desc" : "asc";
      return {
        ...currentState,
        sorting: [{ columnId, direction }]
      };
    });
  };
  return /* @__PURE__ */ jsxs3(
    "section",
    {
      "aria-label": "Data grid",
      className: rootClassName,
      "data-table-id": tableId,
      style,
      children: [
        /* @__PURE__ */ jsx7(DataGridToolbar, { children: /* @__PURE__ */ jsx7(DataGridSearch, { value: gridState.search, onChange: updateSearch }) }),
        /* @__PURE__ */ jsx7("div", { className: "udg-table-wrap", children: /* @__PURE__ */ jsxs3("table", { className: "udg-table", children: [
          /* @__PURE__ */ jsx7("thead", { children: /* @__PURE__ */ jsx7("tr", { children: visibleColumns.map((column) => /* @__PURE__ */ jsx7(
            "th",
            {
              style: {
                width: gridState.columnSizing[column.id] ?? column.width,
                minWidth: column.minWidth,
                maxWidth: column.maxWidth
              },
              scope: "col",
              children: /* @__PURE__ */ jsx7(
                "button",
                {
                  className: "udg-header-button",
                  type: "button",
                  onClick: () => updateSorting(column.id),
                  disabled: column.sortable === false,
                  children: column.header
                }
              )
            },
            column.id
          )) }) }),
          /* @__PURE__ */ jsxs3("tbody", { children: [
            /* @__PURE__ */ jsx7(
              DataGridErrorState,
              {
                columnCount: visibleColumns.length,
                error
              }
            ),
            !error && loading && /* @__PURE__ */ jsx7(DataGridSkeletonRows, { columnCount: visibleColumns.length }),
            !error && !loading && renderedRows.length === 0 && /* @__PURE__ */ jsx7(
              DataGridEmptyState,
              {
                columnCount: visibleColumns.length,
                message: emptyMessage
              }
            ),
            !error && !loading && renderedRows.map((row, rowIndex) => {
              const rowId = getRowId?.(row, rowIndex) ?? rowIndex;
              return /* @__PURE__ */ jsx7("tr", { children: visibleColumns.map((column) => {
                const value = getCellValue(row, column);
                return /* @__PURE__ */ jsx7("td", { children: column.cell ? column.cell({ row, value, rowIndex }) : String(value ?? "") }, column.id);
              }) }, rowId);
            })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx7(
          DataGridPagination,
          {
            pagination: gridState.pagination,
            totalRows: resolvedTotalRows,
            onChange: (pagination) => setGridState((currentState) => ({
              ...currentState,
              pagination
            }))
          }
        )
      ]
    }
  );
}

// src/core/applyGrouping.ts
function applyGrouping(rows, _grouping) {
  return rows;
}

// src/core/exportRequestBuilder.ts
var headerToString = (header) => typeof header === "string" ? header : "";
function buildDataGridExportRequest({
  tableId,
  columns,
  columnVisibility,
  filters,
  search,
  sorting,
  grouping,
  pagination,
  selectedRowIds,
  scope,
  format
}) {
  return {
    tableId,
    columns: columns.map((column) => ({
      id: column.id,
      header: headerToString(column.header),
      visible: column.visible !== false && columnVisibility[column.id] !== false
    })),
    filters,
    search,
    sorting,
    grouping,
    pagination,
    selectedRowIds,
    scope,
    format,
    requestedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
}

// src/hooks/useDebouncedValue.ts
import { useEffect as useEffect2, useState as useState2 } from "react";
function useDebouncedValue(value, delayMs = 200) {
  const [debouncedValue, setDebouncedValue] = useState2(value);
  useEffect2(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);
    return () => window.clearTimeout(timeoutId);
  }, [delayMs, value]);
  return debouncedValue;
}

// src/hooks/useColumnResize.ts
import { useCallback as useCallback2 } from "react";

// src/core/columnSizing.ts
function setColumnSize(sizing, columnId, width) {
  return {
    ...sizing,
    [columnId]: Math.max(0, width)
  };
}

// src/hooks/useColumnResize.ts
function useColumnResize({
  columnSizing,
  onColumnSizingChange
}) {
  const setSize = useCallback2(
    (columnId, width) => {
      onColumnSizingChange(setColumnSize(columnSizing, columnId, width));
    },
    [columnSizing, onColumnSizingChange]
  );
  return { setSize };
}
export {
  UniversalDataGrid,
  applyFilters,
  applyGrouping,
  applyPagination,
  applySearch,
  applySorting,
  buildDataGridExportRequest,
  createGridState,
  useColumnResize,
  useControlledState,
  useDataGridState,
  useDebouncedValue
};
//# sourceMappingURL=index.js.map