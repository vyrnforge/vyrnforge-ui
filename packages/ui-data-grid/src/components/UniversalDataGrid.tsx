import { useEffect, useMemo } from "react";
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

  const clientRows = useMemo(() => {
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

  const renderedRows = useMemo(
    () =>
      serverMode ? rows : applyPagination(clientRows, gridState.pagination),
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

  const updateSearch = (search: string) => {
    setGridState((currentState) => ({
      ...currentState,
      search,
      pagination: {
        ...currentState.pagination,
        pageIndex: 0
      }
    }));
  };

  const updateSorting = (columnId: string) => {
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

  return (
    <section
      aria-label="Data grid"
      className={rootClassName}
      data-table-id={tableId}
      style={style}
    >
      <DataGridToolbar>
        <DataGridSearch value={gridState.search} onChange={updateSearch} />
      </DataGridToolbar>

      <div className="udg-table-wrap">
        <table className="udg-table">
          <thead>
            <tr>
              {visibleColumns.map((column) => (
                <th
                  key={column.id}
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
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <DataGridErrorState
              columnCount={visibleColumns.length}
              error={error}
            />
            {!error && loading && (
              <DataGridSkeletonRows columnCount={visibleColumns.length} />
            )}
            {!error && !loading && renderedRows.length === 0 && (
              <DataGridEmptyState
                columnCount={visibleColumns.length}
                message={emptyMessage}
              />
            )}
            {!error &&
              !loading &&
              renderedRows.map((row, rowIndex) => {
                const rowId = getRowId?.(row, rowIndex) ?? rowIndex;

                return (
                  <tr key={rowId}>
                    {visibleColumns.map((column) => {
                      const value = getCellValue(row, column);

                      return (
                        <td key={column.id}>
                          {column.cell
                            ? column.cell({ row, value, rowIndex })
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
