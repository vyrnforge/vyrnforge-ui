import { useCallback, useEffect, useMemo } from "react";
import { applyFilters } from "../core/applyFilters";
import { applyPagination } from "../core/applyPagination";
import { applySearch } from "../core/applySearch";
import { applySorting } from "../core/applySorting";
import { getVisibleColumns } from "../core/columnVisibility";
import { useDataGridState } from "../hooks/useDataGridState";
import type { DataGridColumnDef } from "../types/column.types";
import type { UniversalDataGridProps } from "../types/dataGrid.types";
import { DataGridEmptyState } from "./DataGridEmptyState";
import { DataGridErrorState } from "./DataGridErrorState";
import { DataGridPagination } from "./DataGridPagination";
import { DataGridSearch } from "./DataGridSearch";
import { DataGridSkeletonRows } from "./DataGridSkeletonRows";
import { DataGridToolbar } from "./DataGridToolbar";

const getCellValue = <RowData extends Record<string, unknown>>(
  row: RowData,
  column: DataGridColumnDef<RowData>
) => {
  if (column.accessorFn) {
    return column.accessorFn(row);
  }

  if (column.accessorKey) {
    return row[column.accessorKey as keyof RowData];
  }

  return row[column.id as keyof RowData];
};

export function UniversalDataGrid<
  RowData extends Record<string, unknown> = Record<string, unknown>
>({
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
  title,
  serverMode = false,
  onQueryChange,
  emptyMessage,
  className,
  style
}: UniversalDataGridProps<RowData>) {
  const [gridState, setGridState] = useDataGridState({
    state,
    defaultState,
    onStateChange
  });

  const visibleColumns = useMemo(
    () => getVisibleColumns(columns, gridState.columnVisibility),
    [columns, gridState.columnVisibility]
  );

  const orderedColumns = useMemo(() => {
    if (gridState.columnOrder.length === 0) {
      return visibleColumns;
    }

    const order = new Map(
      gridState.columnOrder.map((columnId, index) => [columnId, index])
    );

    return [...visibleColumns].sort((left, right) => {
      const leftIndex = order.get(left.id) ?? Number.MAX_SAFE_INTEGER;
      const rightIndex = order.get(right.id) ?? Number.MAX_SAFE_INTEGER;
      return leftIndex - rightIndex;
    });
  }, [gridState.columnOrder, visibleColumns]);

  const clientRows = useMemo(() => {
    if (serverMode) {
      return rows;
    }

    const searchedRows = applySearch(rows, orderedColumns, gridState.search);
    const filteredRows = applyFilters(
      searchedRows,
      orderedColumns,
      gridState.filters
    );
    return applySorting(filteredRows, orderedColumns, gridState.sort);
  }, [
    gridState.filters,
    gridState.search,
    gridState.sort,
    orderedColumns,
    rows,
    serverMode
  ]);

  const renderedRows = useMemo(
    () =>
      serverMode ? rows : applyPagination(clientRows, gridState.pagination),
    [clientRows, gridState.pagination, rows, serverMode]
  );

  const resolvedTotalRows = totalRows ?? (serverMode ? rows.length : clientRows.length);
  const rootClassName = ["udg-root", className].filter(Boolean).join(" ");
  const hasQuery = gridState.search.trim().length > 0 || gridState.filters.length > 0;

  useEffect(() => {
    onQueryChange?.({
      search: gridState.search,
      filters: gridState.filters,
      sort: gridState.sort,
      grouping: gridState.grouping,
      pagination: gridState.pagination
    });
  }, [
    gridState.filters,
    gridState.grouping,
    gridState.pagination,
    gridState.search,
    gridState.sort,
    onQueryChange
  ]);

  const updateSearch = useCallback((search: string) => {
    setGridState((currentState) => ({
      ...currentState,
      search,
      pagination: {
        ...currentState.pagination,
        pageIndex: 0
      }
    }));
  }, [setGridState]);

  const updateSorting = (columnId: string) => {
    setGridState((currentState) => {
      const currentSort = currentState.sort.find(
        (sort) => sort.columnId === columnId
      );
      const nextSort =
        currentSort?.direction === "asc"
          ? [{ columnId, direction: "desc" as const }]
          : currentSort?.direction === "desc"
            ? []
            : [{ columnId, direction: "asc" as const }];

      return {
        ...currentState,
        sort: nextSort
      };
    });
  };

  const getSortIndicator = (columnId: string) => {
    const sort = gridState.sort.find((candidate) => candidate.columnId === columnId);

    if (sort?.direction === "asc") {
      return " ↑";
    }

    if (sort?.direction === "desc") {
      return " ↓";
    }

    return "";
  };

  return (
    <section
      aria-label="Data grid"
      className={rootClassName}
      data-table-id={tableId}
      style={style}
    >
      {title && <h2 className="udg-title">{title}</h2>}

      <DataGridToolbar>
        <DataGridSearch value={gridState.search} onChange={updateSearch} />
      </DataGridToolbar>

      {hasQuery && (
        <div className="udg-summary" role="status">
          Showing {resolvedTotalRows} result{resolvedTotalRows === 1 ? "" : "s"}
          {gridState.search && <> for "{gridState.search}"</>}
          {gridState.filters.length > 0 && (
            <> with {gridState.filters.length} active filter{gridState.filters.length === 1 ? "" : "s"}</>
          )}
        </div>
      )}

      <div className="udg-table-wrap">
        <table className="udg-table">
          <thead>
            <tr>
              {orderedColumns.map((column) => (
                <th
                  key={column.id}
                  className={`udg-align-${column.align ?? "left"}`}
                  style={{
                    width: gridState.columnSizing[column.id] ?? column.width,
                    minWidth: column.minWidth,
                    maxWidth: column.maxWidth
                  }}
                  scope="col"
                >
                  <button
                    className="udg-header-button"
                    type="button"
                    onClick={() => updateSorting(column.id)}
                    disabled={column.sortable === false}
                  >
                    {column.header}
                    <span aria-hidden="true">{getSortIndicator(column.id)}</span>
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <DataGridErrorState
              columnCount={orderedColumns.length}
              error={error}
            />
            {!error && loading && (
              <DataGridSkeletonRows columnCount={orderedColumns.length} />
            )}
            {!error && !loading && renderedRows.length === 0 && (
              <DataGridEmptyState
                columnCount={orderedColumns.length}
                hasQuery={hasQuery}
                message={emptyMessage}
              />
            )}
            {!error &&
              !loading &&
              renderedRows.map((row, rowIndex) => {
                const rowId = getRowId?.(row, rowIndex) ?? rowIndex;

                return (
                  <tr key={rowId}>
                    {orderedColumns.map((column) => {
                      const value = getCellValue(row, column);

                      return (
                        <td
                          className={`udg-align-${column.align ?? "left"}`}
                          key={column.id}
                        >
                          {column.cell
                            ? column.cell(value, row, rowIndex)
                            : String(value ?? "")}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      <DataGridPagination
        pagination={gridState.pagination}
        totalRows={resolvedTotalRows}
        onChange={(pagination) =>
          setGridState((currentState) => ({
            ...currentState,
            pagination
          }))
        }
      />
    </section>
  );
}
