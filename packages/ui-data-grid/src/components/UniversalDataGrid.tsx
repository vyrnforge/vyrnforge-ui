import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type InputHTMLAttributes
} from "react";
import {
  Badge,
  Button,
  Checkbox,
  Icon,
  IconButton,
  Menu,
  Select
} from "@vyrnforge/ui-components";
import { applyFilters } from "../core/applyFilters";
import {
  buildGroupedRows,
  collapseAllGroups,
  expandAllGroups,
  flattenGroupedRows,
  normalizeGrouping,
  resolveGroupableColumns,
  toggleGroupExpanded
} from "../core/applyGrouping";
import { applyPagination } from "../core/applyPagination";
import { applySearch } from "../core/applySearch";
import { applySorting } from "../core/applySorting";
import {
  resetAllColumnSizes,
  resetColumnSize,
  resolveColumnMaxWidth,
  resolveColumnMinWidth,
  resolveColumnWidth
} from "../core/columnSizing";
import {
  defaultPersistKeys,
  hideOptionalColumns,
  moveColumnBefore,
  moveColumnOrder,
  resolveOrderedColumns,
  resolveVisibleColumns,
  showAllColumns,
  updateColumnVisibility
} from "../core/columnManagement";
import {
  clearSelection,
  deselectRows,
  getRowIdValue,
  getSelectionStateForPage,
  isRowSelectable,
  isRowSelected,
  resolveSelectedRows,
  selectRows,
  toggleRowSelection
} from "../core/rowSelection";
import {
  createGridState,
  pickPersistableGridState,
  resetGridViewState
} from "../state";
import { toDataGridThemeStyle } from "../theme/createDataGridTheme";
import { useColumnResize, useDataGridState } from "../hooks";
import type { DataGridColumnDef } from "../types/column.types";
import type {
  DataGridDisplayRow,
  DataGridGroupRow,
  DataGridRowId,
  UniversalDataGridProps
} from "../types/dataGrid.types";
import type { DataGridSort } from "../types/filter.types";
import { DataGridColumnMenu } from "./DataGridColumnMenu";
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

type IndeterminateCheckboxProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size" | "type"
> & {
  indeterminate?: boolean;
};

type DataGridRuntimeStyle = CSSProperties & {
  "--udg-column-max-width"?: string;
  "--udg-column-min-width"?: string;
  "--udg-column-width"?: string;
  "--udg-group-depth"?: number;
  "--udg-selection-column-width"?: string;
  "--udg-table-min-width"?: string;
};

function IndeterminateCheckbox({
  indeterminate = false,
  ...props
}: IndeterminateCheckboxProps) {
  const checkboxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return <Checkbox ref={checkboxRef} size="sm" {...props} />;
}

export function UniversalDataGrid<
  RowData extends Record<string, unknown> = Record<string, unknown>
>({
  tableId,
  columns,
  rows,
  getRowId,
  selectable = false,
  selectionMode = "multiple",
  selectedRowIds,
  defaultSelectedRowIds,
  onSelectedRowIdsChange,
  getRowSelectable,
  onRowClick,
  enableRowClickSelection = false,
  bulkActions = [],
  enableGrouping = false,
  defaultGrouping,
  onGroupingChange,
  renderGroupHeader,
  getGroupId,
  defaultExpandedGroups = "all",
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
  density,
  persistenceAdapter,
  persistState = false,
  persistKeys = defaultPersistKeys,
  onResetView,
  theme = "light",
  themeVars,
  variant = "plain",
  height,
  maxHeight,
  className,
  style
}: UniversalDataGridProps<RowData>) {
  const resolvedDefaultState = useMemo(
    () => ({
      ...defaultState,
      grouping: defaultGrouping ?? defaultState?.grouping,
      expandedGroupIds:
        Array.isArray(defaultExpandedGroups)
          ? defaultExpandedGroups
          : defaultState?.expandedGroupIds,
      selectedRowIds:
        defaultSelectedRowIds ?? defaultState?.selectedRowIds
    }),
    [defaultExpandedGroups, defaultGrouping, defaultSelectedRowIds, defaultState]
  );
  const [gridState, setGridState] = useDataGridState({
    state,
    defaultState: resolvedDefaultState,
    onStateChange
  });
  const hasLoadedPersistedState = useRef(!persistState || Boolean(state));
  const [headerDragColumnId, setHeaderDragColumnId] = useState<string | null>(
    null
  );
  const [headerDropTarget, setHeaderDropTarget] = useState<{
    columnId: string;
    placement: "before" | "after";
  } | null>(null);
  const [menuColumnId, setMenuColumnId] = useState<string | null>(null);
  const defaultExpandedGroupingRef = useRef<string | null>(null);
  const selectionEnabled = selectable && selectionMode !== "none";
  const resolvedSelectedRowIds = selectedRowIds ?? gridState.selectedRowIds;

  const visibleColumns = useMemo(
    () => resolveVisibleColumns(columns, gridState.columnVisibility),
    [columns, gridState.columnVisibility]
  );

  const orderedColumns = useMemo(() => {
    return resolveOrderedColumns(visibleColumns, gridState.columnOrder);
  }, [gridState.columnOrder, visibleColumns]);

  const groupableColumns = useMemo(
    () => resolveGroupableColumns(visibleColumns),
    [visibleColumns]
  );

  const normalizedGrouping = useMemo(
    () =>
      enableGrouping && !serverMode
        ? normalizeGrouping(columns, gridState.grouping)
        : [],
    [columns, enableGrouping, gridState.grouping, serverMode]
  );

  const groupingActive = normalizedGrouping.length > 0;

  const columnWidths = useMemo(
    () =>
      orderedColumns.map((column) => ({
        column,
        width: resolveColumnWidth(column, gridState.columnSizing),
        minWidth: resolveColumnMinWidth(column),
        maxWidth: resolveColumnMaxWidth(column)
      })),
    [gridState.columnSizing, orderedColumns]
  );

  const tableMinWidth = useMemo(
    () => columnWidths.reduce((totalWidth, column) => totalWidth + column.width, 0),
    [columnWidths]
  );

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

  const groupedRows = useMemo(
    () =>
      buildGroupedRows({
        rows: clientRows,
        columns,
        grouping: normalizedGrouping,
        expandedGroupIds: gridState.expandedGroupIds,
        getRowId,
        getGroupId
      }),
    [
      clientRows,
      columns,
      getGroupId,
      getRowId,
      gridState.expandedGroupIds,
      normalizedGrouping
    ]
  );

  const displayRows = useMemo<DataGridDisplayRow<RowData>[]>(
    () => (groupingActive ? flattenGroupedRows(groupedRows) : groupedRows),
    [groupedRows, groupingActive]
  );

  const renderedRows = useMemo(
    () =>
      serverMode
        ? buildGroupedRows({ rows, columns, grouping: [], getRowId })
        : applyPagination(displayRows, gridState.pagination),
    [columns, displayRows, getRowId, gridState.pagination, rows, serverMode]
  );

  const resolvedTotalRows =
    totalRows ?? (serverMode ? rows.length : displayRows.length);
  const visibleColumnCount = orderedColumns.length + (selectionEnabled ? 1 : 0);
  const selectionColumnWidth = selectionEnabled ? 44 : 0;
  const pageSelectableRowIds = useMemo(
    () => {
      if (!selectionEnabled) {
        return [];
      }

      return renderedRows.reduce<DataGridRowId[]>((rowIds, displayRow) => {
        if (displayRow.type === "group") {
          return rowIds;
        }

        const { row, index: sourceRowIndex } = displayRow;

        if (!isRowSelectable(row, sourceRowIndex, getRowSelectable)) {
          return rowIds;
        }

        rowIds.push(getRowIdValue(row, sourceRowIndex, getRowId));
        return rowIds;
      }, []);
    },
    [
      getRowId,
      getRowSelectable,
      renderedRows,
      selectionEnabled
    ]
  );
  const pageSelectionState = useMemo(
    () => getSelectionStateForPage(resolvedSelectedRowIds, pageSelectableRowIds),
    [pageSelectableRowIds, resolvedSelectedRowIds]
  );
  const selectedRows = useMemo(
    () => resolveSelectedRows(rows, resolvedSelectedRowIds, getRowId),
    [getRowId, resolvedSelectedRowIds, rows]
  );
  const gridStateWithSelection = useMemo(
    () => ({
      ...gridState,
      selectedRowIds: resolvedSelectedRowIds
    }),
    [gridState, resolvedSelectedRowIds]
  );
  const bulkActionContext = useMemo(
    () => ({
      tableId,
      selectedRowIds: resolvedSelectedRowIds,
      selectedRows,
      selectionScope: "page" as const,
      state: gridStateWithSelection
    }),
    [gridStateWithSelection, resolvedSelectedRowIds, selectedRows, tableId]
  );
  const visibleBulkActions = useMemo(
    () =>
      bulkActions.filter((action) => {
        const hidden =
          typeof action.hidden === "function"
            ? action.hidden(bulkActionContext)
            : action.hidden;

        return !hidden;
      }),
    [bulkActionContext, bulkActions]
  );
  const rootClassName = ["udg", className].filter(Boolean).join(" ");
  const resolvedDensity = density ?? gridState.density;
  const rootStyle: CSSProperties = {
    ...toDataGridThemeStyle(themeVars),
    ...(height === undefined ? {} : { height }),
    ...(maxHeight === undefined ? {} : { maxHeight }),
    ...style
  };
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

  useEffect(() => {
    let cancelled = false;

    if (hasLoadedPersistedState.current) {
      return;
    }

    if (!persistState || !persistenceAdapter || state) {
      hasLoadedPersistedState.current = true;
      return;
    }

    Promise.resolve(persistenceAdapter.load(tableId))
      .then((persistedState) => {
        if (cancelled || !persistedState) {
          return;
        }

        setGridState((currentState) =>
          createGridState({
            ...currentState,
            ...persistedState,
            pagination: {
              ...currentState.pagination,
              ...persistedState.pagination
            }
          })
        );
      })
      .catch(() => {
        // Persistence should never break the grid.
      })
      .finally(() => {
        hasLoadedPersistedState.current = true;
      });

    return () => {
      cancelled = true;
    };
  }, [persistenceAdapter, persistState, setGridState, state, tableId]);

  useEffect(() => {
    if (!persistState || !persistenceAdapter || !hasLoadedPersistedState.current) {
      return;
    }

    void persistenceAdapter.save(
      tableId,
      pickPersistableGridState(gridState, persistKeys)
    );
  }, [gridState, persistKeys, persistenceAdapter, persistState, tableId]);

  useEffect(() => {
    if (!headerDragColumnId) {
      return;
    }

    document.body.classList.add("udg-is-reordering");

    return () => {
      document.body.classList.remove("udg-is-reordering");
    };
  }, [headerDragColumnId]);

  useEffect(() => {
    const groupingSignature = normalizedGrouping.join("|");

    if (
      !groupingActive ||
      defaultExpandedGroups !== "all" ||
      defaultExpandedGroupingRef.current === groupingSignature
    ) {
      return;
    }

    defaultExpandedGroupingRef.current = groupingSignature;

    if (gridState.expandedGroupIds.length > 0) {
      return;
    }

    setGridState((currentState) => ({
      ...currentState,
      expandedGroupIds: expandAllGroups(groupedRows)
    }));
  }, [
    defaultExpandedGroups,
    groupedRows,
    groupingActive,
    gridState.expandedGroupIds.length,
    normalizedGrouping,
    setGridState
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

  const setColumnSort = (
    columnId: string,
    direction: DataGridSort["direction"] | null
  ) => {
    setGridState((currentState) => ({
      ...currentState,
      sort: direction ? [{ columnId, direction }] : []
    }));
  };

  const updateDensity = (nextDensity: typeof gridState.density) => {
    setGridState((currentState) => ({
      ...currentState,
      density: nextDensity
    }));
  };

  const updateVisibility = (columnId: string, visible: boolean) => {
    setGridState((currentState) => ({
      ...currentState,
      columnVisibility: updateColumnVisibility(
        columns,
        currentState.columnVisibility,
        columnId,
        visible
      )
    }));
  };

  const moveColumn = (
    columnId: string,
    direction: "up" | "down" | "first" | "last"
  ) => {
    setGridState((currentState) => ({
      ...currentState,
      columnOrder: moveColumnOrder(
        columns.map((column) => column.id),
        currentState.columnOrder,
        columnId,
        direction
      )
    }));
  };

  const updateColumnOrder = (columnOrder: string[]) => {
    setGridState((currentState) => ({
      ...currentState,
      columnOrder
    }));
  };

  const updateColumnSizing = useCallback(
    (columnSizing: typeof gridState.columnSizing) => {
      setGridState((currentState) => ({
        ...currentState,
        columnSizing
      }));
    },
    [setGridState]
  );

  const {
    activeColumnId,
    resizeBy,
    startResize
  } = useColumnResize({
    columns,
    columnSizing: gridState.columnSizing,
    onColumnSizingChange: updateColumnSizing
  });

  const resetGridColumnSize = (columnId: string) => {
    setGridState((currentState) => ({
      ...currentState,
      columnSizing: resetColumnSize(currentState.columnSizing, columnId)
    }));
  };

  const resetAllGridColumnSizes = () => {
    setGridState((currentState) => ({
      ...currentState,
      columnSizing: resetAllColumnSizes()
    }));
  };

  const resetGridColumns = () => {
    setGridState((currentState) => ({
      ...currentState,
      columnVisibility: createGridState(defaultState).columnVisibility,
      columnOrder: [],
      columnSizing: resetAllColumnSizes()
    }));
  };

  const reorderHeaderColumn = (
    targetColumnId: string,
    placement: "before" | "after"
  ) => {
    if (!headerDragColumnId || headerDragColumnId === targetColumnId) {
      return;
    }

    setGridState((currentState) => ({
      ...currentState,
      columnOrder: moveColumnBefore(
        columns.map((column) => column.id),
        currentState.columnOrder,
        headerDragColumnId,
        targetColumnId,
        placement
      )
    }));
  };

  const showAllGridColumns = () => {
    setGridState((currentState) => ({
      ...currentState,
      columnVisibility: showAllColumns(columns, currentState.columnVisibility)
    }));
  };

  const hideOptionalGridColumns = () => {
    setGridState((currentState) => ({
      ...currentState,
      columnVisibility: hideOptionalColumns(columns, currentState.columnVisibility)
    }));
  };

  const resetColumnOrder = () => {
    setGridState((currentState) => ({
      ...currentState,
      columnOrder: []
    }));
  };

  const resolveDefaultExpandedGroupIds = useCallback(
    (grouping: string[]) => {
      if (Array.isArray(defaultExpandedGroups)) {
        return defaultExpandedGroups;
      }

      if (defaultExpandedGroups === "none" || grouping.length === 0) {
        return [];
      }

      return expandAllGroups(
        buildGroupedRows({
          rows: clientRows,
          columns,
          grouping,
          expandedGroupIds: [],
          getRowId,
          getGroupId
        })
      );
    },
    [clientRows, columns, defaultExpandedGroups, getGroupId, getRowId]
  );

  const updateGrouping = useCallback(
    (nextGrouping: string[]) => {
      const normalizedNextGrouping = normalizeGrouping(columns, nextGrouping);
      const nextExpandedGroupIds =
        resolveDefaultExpandedGroupIds(normalizedNextGrouping);

      setGridState((currentState) => ({
        ...currentState,
        grouping: normalizedNextGrouping,
        expandedGroupIds: nextExpandedGroupIds,
        pagination: {
          ...currentState.pagination,
          pageIndex: 0
        }
      }));
      onGroupingChange?.(normalizedNextGrouping);
    },
    [columns, onGroupingChange, resolveDefaultExpandedGroupIds, setGridState]
  );

  const addGroupingColumn = (columnId: string) => {
    if (!columnId || normalizedGrouping.includes(columnId)) {
      return;
    }

    updateGrouping([...normalizedGrouping, columnId]);
  };

  const removeGroupingColumn = (columnId: string) => {
    updateGrouping(
      normalizedGrouping.filter((groupingColumnId) => groupingColumnId !== columnId)
    );
  };

  const clearGrouping = () => {
    updateGrouping([]);
  };

  const expandAllGridGroups = () => {
    setGridState((currentState) => ({
      ...currentState,
      expandedGroupIds: expandAllGroups(groupedRows)
    }));
  };

  const collapseAllGridGroups = () => {
    setGridState((currentState) => ({
      ...currentState,
      expandedGroupIds: collapseAllGroups()
    }));
  };

  const toggleGridGroup = (groupId: string) => {
    setGridState((currentState) => ({
      ...currentState,
      expandedGroupIds: toggleGroupExpanded(
        currentState.expandedGroupIds,
        groupId
      )
    }));
  };

  const resetView = () => {
    const nextSelectedRowIds = createGridState(resolvedDefaultState).selectedRowIds;

    setGridState((currentState) =>
      resetGridViewState(currentState, resolvedDefaultState)
    );
    onSelectedRowIdsChange?.(nextSelectedRowIds);
    onGroupingChange?.(createGridState(resolvedDefaultState).grouping);
    onResetView?.();
    void persistenceAdapter?.clear?.(tableId);
  };

  const updateSelectedRows = useCallback(
    (nextSelectedRowIds: DataGridRowId[]) => {
      setGridState((currentState) => ({
        ...currentState,
        selectedRowIds: nextSelectedRowIds
      }));
      onSelectedRowIdsChange?.(nextSelectedRowIds);
    },
    [onSelectedRowIdsChange, setGridState]
  );

  const toggleSingleRowSelection = useCallback(
    (rowId: DataGridRowId) => {
      updateSelectedRows(
        toggleRowSelection(resolvedSelectedRowIds, rowId, selectionMode)
      );
    },
    [resolvedSelectedRowIds, selectionMode, updateSelectedRows]
  );

  const togglePageSelection = useCallback(() => {
    updateSelectedRows(
      pageSelectionState.allSelected
        ? deselectRows(resolvedSelectedRowIds, pageSelectableRowIds)
        : selectRows(resolvedSelectedRowIds, pageSelectableRowIds, selectionMode)
    );
  }, [
    pageSelectableRowIds,
    pageSelectionState.allSelected,
    resolvedSelectedRowIds,
    selectionMode,
    updateSelectedRows
  ]);

  const clearSelectedRows = useCallback(() => {
    updateSelectedRows(clearSelection());
  }, [updateSelectedRows]);

  const getSortDirection = (columnId: string) =>
    gridState.sort.find((candidate) => candidate.columnId === columnId)
      ?.direction;

  const getSortIconName = (columnId: string) => {
    const direction = getSortDirection(columnId);

    if (direction === "asc") {
      return "SortAsc";
    }

    if (direction === "desc") {
      return "SortDesc";
    }

    return "ChevronDown";
  };

  return (
    <section
      aria-busy={loading}
      aria-label={title ?? "Data grid"}
      className={rootClassName}
      data-density={resolvedDensity}
      data-table-id={tableId}
      data-theme={theme}
      data-variant={variant}
      style={rootStyle}
    >
      {title && <h2 className="udg-title">{title}</h2>}

      <DataGridToolbar>
        <DataGridSearch value={gridState.search} onChange={updateSearch} />
        {enableGrouping && !serverMode && (
          <div className="udg-group-controls">
            <details className="udg-group-menu">
              <summary className="udg-toolbar-button">
                <Icon name="Filter" size="xs" />
                Group
              </summary>
              <div className="udg-group-menu__panel">
                <label>
                  <span>Group by</span>
                  <Select
                    size="sm"
                    value=""
                    onChange={(event) => {
                      addGroupingColumn(event.currentTarget.value);
                      event.currentTarget.value = "";
                    }}
                  >
                    <option value="">Select column</option>
                    {groupableColumns
                      .filter((column) => !normalizedGrouping.includes(column.id))
                      .map((column) => (
                        <option key={column.id} value={column.id}>
                          {column.header}
                        </option>
                      ))}
                  </Select>
                </label>
                <div className="udg-group-menu__actions">
                  <Button
                    size="sm"
                    type="button"
                    variant="subtle"
                    disabled={!groupingActive}
                    onClick={expandAllGridGroups}
                  >
                    Expand all
                  </Button>
                  <Button
                    size="sm"
                    type="button"
                    variant="subtle"
                    disabled={!groupingActive}
                    onClick={collapseAllGridGroups}
                  >
                    Collapse all
                  </Button>
                  <Button
                    size="sm"
                    type="button"
                    variant="subtle"
                    disabled={!groupingActive}
                    onClick={clearGrouping}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </details>
          </div>
        )}
        <DataGridColumnMenu
          columns={columns}
          columnOrder={gridState.columnOrder}
          columnVisibility={gridState.columnVisibility}
          density={resolvedDensity}
          onColumnVisibilityChange={updateVisibility}
          onColumnOrderChange={updateColumnOrder}
          onDensityChange={updateDensity}
          onHideOptionalColumns={hideOptionalGridColumns}
          onMoveColumn={moveColumn}
          onResetColumnOrder={resetColumnOrder}
          onResetColumnSize={resetGridColumnSize}
          onResetColumnSizes={resetAllGridColumnSizes}
          onResetColumns={resetGridColumns}
          onResetView={resetView}
          onShowAllColumns={showAllGridColumns}
        />
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

      {groupingActive && (
        <div className="udg-group-chips" aria-label="Active grouping">
          <span className="udg-group-chips__label">Grouped by</span>
          {normalizedGrouping.map((columnId) => {
            const column = columns.find((candidate) => candidate.id === columnId);
            const label = column?.header ?? columnId;

            return (
              <span className="udg-group-chip" key={columnId}>
                <span>{label}</span>
                <button
                  aria-label={`Remove ${label} grouping`}
                  type="button"
                  onClick={() => removeGroupingColumn(columnId)}
                >
                  x
                </button>
              </span>
            );
          })}
          <button
            className="udg-group-chip__clear"
            type="button"
            onClick={clearGrouping}
          >
            Clear grouping
          </button>
        </div>
      )}

      {selectionEnabled && resolvedSelectedRowIds.length > 0 && (
        <div className="udg-bulk-action-bar" role="status">
          <div className="udg-bulk-action-bar__summary">
            <Badge size="sm" variant="info">
              {resolvedSelectedRowIds.length}
            </Badge>
            <span>
              row{resolvedSelectedRowIds.length === 1 ? "" : "s"} selected
            </span>
          </div>
          <div className="udg-bulk-action-bar__actions">
            {visibleBulkActions.map((action) => {
              const disabled =
                typeof action.disabled === "function"
                  ? action.disabled(bulkActionContext)
                  : action.disabled;

              return (
                <Button
                  className={[
                    "udg-bulk-action",
                    action.variant ? `udg-bulk-action--${action.variant}` : ""
                  ].filter(Boolean).join(" ")}
                  disabled={disabled}
                  key={action.id}
                  size="sm"
                  type="button"
                  variant={action.variant ?? "default"}
                  onClick={() => action.onClick(bulkActionContext)}
                >
                  {action.label}
                </Button>
              );
            })}
            <IconButton
              aria-label="Clear selected rows"
              className="udg-bulk-action udg-bulk-action--clear"
              size="sm"
              tooltip="Clear selection"
              type="button"
              variant="subtle"
              onClick={clearSelectedRows}
            >
              <Icon name="Close" size="xs" />
            </IconButton>
          </div>
        </div>
      )}

      <div className="udg-table-wrap">
        <table
          className="udg-table"
          style={{
            "--udg-table-min-width": `${tableMinWidth + selectionColumnWidth}px`
          } as DataGridRuntimeStyle}
        >
          <colgroup>
            {selectionEnabled && (
              <col
                className="udg-selection-col"
                style={{
                  "--udg-selection-column-width": `${selectionColumnWidth}px`
                } as DataGridRuntimeStyle}
              />
            )}
            {columnWidths.map(({ column, maxWidth, minWidth, width }) => (
              <col
                className="udg-column-col"
                key={column.id}
                style={{
                  "--udg-column-width": `${width}px`,
                  "--udg-column-min-width": `${minWidth}px`,
                  "--udg-column-max-width": `${maxWidth}px`
                } as DataGridRuntimeStyle}
              />
            ))}
          </colgroup>
          <thead>
            <tr>
              {selectionEnabled && (
                <th
                  className="udg-selection-cell udg-selection-cell--header"
                  scope="col"
                >
                  <IndeterminateCheckbox
                    aria-label={
                      selectionMode !== "multiple"
                        ? "Page selection is unavailable in single selection mode"
                        : pageSelectionState.allSelected
                        ? "Deselect rows on this page"
                        : "Select rows on this page"
                    }
                    checked={
                      selectionMode === "multiple" &&
                      pageSelectionState.allSelected
                    }
                    disabled={
                      selectionMode !== "multiple" ||
                      pageSelectionState.totalSelectableCount === 0
                    }
                    indeterminate={
                      selectionMode === "multiple" &&
                      pageSelectionState.indeterminate
                    }
                    onChange={togglePageSelection}
                  />
                </th>
              )}
              {columnWidths.map(({ column, maxWidth, minWidth, width }) => {
                const sortDirection = getSortDirection(column.id);
                const menuOpen = menuColumnId === column.id;

                return (
                  <th
                    key={column.id}
                    aria-sort={
                      sortDirection === "asc"
                        ? "ascending"
                        : sortDirection === "desc"
                          ? "descending"
                          : "none"
                    }
                    className={[
                      "udg-header-cell",
                      `udg-align-${column.align ?? "left"}`,
                      activeColumnId === column.id ? "udg-is-resizing" : "",
                      column.resizable !== false
                        ? "udg-header-cell--resizable"
                        : "",
                      sortDirection ? "udg-header-cell--sorted" : "",
                      menuOpen
                        ? "udg-header-cell--actions-visible"
                        : "",
                      headerDragColumnId === column.id
                        ? "udg-header-cell--dragging"
                        : "",
                      headerDropTarget?.columnId === column.id &&
                      headerDropTarget.placement === "before"
                        ? "udg-header-cell--drop-before"
                        : "",
                      headerDropTarget?.columnId === column.id &&
                      headerDropTarget.placement === "after"
                        ? "udg-header-cell--drop-after"
                        : ""
                    ].filter(Boolean).join(" ")}
                    style={{
                      "--udg-column-width": `${width}px`,
                      "--udg-column-min-width": `${minWidth}px`,
                      "--udg-column-max-width": `${maxWidth}px`
                    } as DataGridRuntimeStyle}
                    scope="col"
                    onDragLeave={() => setHeaderDropTarget(null)}
                    onDragOver={(event) => {
                      if (!headerDragColumnId) {
                        return;
                      }

                      event.preventDefault();
                      const rect = event.currentTarget.getBoundingClientRect();
                      const placement =
                        event.clientX < rect.left + rect.width / 2
                          ? "before"
                          : "after";

                      setHeaderDropTarget({
                        columnId: column.id,
                        placement
                      });
                    }}
                    onDrop={(event) => {
                      event.preventDefault();
                      const placement = headerDropTarget?.placement ?? "before";
                      reorderHeaderColumn(column.id, placement);
                      setHeaderDragColumnId(null);
                      setHeaderDropTarget(null);
                    }}
                  >
                    <div className="udg-header-cell__content">
                    <button
                      aria-label={`Reorder ${column.header} column`}
                      className="udg-header-drag-grip"
                      draggable
                      title="Drag to reorder"
                      type="button"
                      onClick={(event) => event.stopPropagation()}
                      onDragEnd={() => {
                        setHeaderDragColumnId(null);
                        setHeaderDropTarget(null);
                      }}
                      onDragStart={(event) => {
                        event.stopPropagation();
                        event.dataTransfer.effectAllowed = "move";
                        setHeaderDragColumnId(column.id);
                      }}
                    >
                      <Icon name="DragHandle" size="xs" />
                    </button>
                    <button
                      className="udg-header-button"
                      type="button"
                      onClick={() => updateSorting(column.id)}
                      disabled={column.sortable === false}
                    >
                      <span className="udg-header-label">{column.header}</span>
                      <span
                        className={[
                          "udg-sort-indicator",
                          sortDirection ? "udg-is-active" : ""
                        ].filter(Boolean).join(" ")}
                        aria-hidden="true"
                      >
                        <Icon name={getSortIconName(column.id)} size="xs" />
                      </span>
                    </button>
                    <div className="udg-header-cell__actions">
                      <Menu
                        className="udg-header-menu"
                        open={menuOpen}
                        onOpenChange={(nextOpen) =>
                          setMenuColumnId(nextOpen ? column.id : null)
                        }
                        items={[
                          {
                            id: "sort-asc",
                            label: "Sort ascending",
                            onSelect: () => {
                              setColumnSort(column.id, "asc");
                              setMenuColumnId(null);
                            }
                          },
                          {
                            id: "sort-desc",
                            label: "Sort descending",
                            onSelect: () => {
                              setColumnSort(column.id, "desc");
                              setMenuColumnId(null);
                            }
                          },
                          {
                            id: "clear-sort",
                            label: "Clear sort",
                            onSelect: () => {
                              setColumnSort(column.id, null);
                              setMenuColumnId(null);
                            }
                          },
                          ...(enableGrouping &&
                          !serverMode &&
                          column.groupable !== false
                            ? [
                                {
                                  id: "group",
                                  label: "Group by this column",
                                  disabled: normalizedGrouping.includes(column.id),
                                  onSelect: () => {
                                    addGroupingColumn(column.id);
                                    setMenuColumnId(null);
                                  }
                                }
                              ]
                            : []),
                          ...(column.hideable !== false
                            ? [
                                {
                                  id: "hide",
                                  label: "Hide column",
                                  onSelect: () => {
                                    updateVisibility(column.id, false);
                                    setMenuColumnId(null);
                                  }
                                }
                              ]
                            : []),
                          ...(column.resizable !== false
                            ? [
                                {
                                  id: "reset-size",
                                  label: "Reset size",
                                  onSelect: () => {
                                    resetGridColumnSize(column.id);
                                    setMenuColumnId(null);
                                  }
                                }
                              ]
                            : []),
                          {
                            id: "move-left",
                            label: "Move left",
                            onSelect: () => {
                              moveColumn(column.id, "up");
                              setMenuColumnId(null);
                            }
                          },
                          {
                            id: "move-right",
                            label: "Move right",
                            onSelect: () => {
                              moveColumn(column.id, "down");
                              setMenuColumnId(null);
                            }
                          }
                        ]}
                        placement="bottom-end"
                        size="sm"
                        trigger={
                          <IconButton
                            aria-label={`Open ${column.header} column actions`}
                            className="udg-header-cell__menu-button"
                            size="xs"
                            tooltip="Column actions"
                            type="button"
                            variant="ghost"
                          >
                            <Icon name="MoreHorizontal" size="xs" />
                          </IconButton>
                        }
                      />
                    </div>
                    {column.resizable !== false && (
                      <button
                        aria-label={`Resize ${column.header} column`}
                        className={[
                          "udg-column-resizer",
                          activeColumnId === column.id
                            ? "udg-column-resizer--active"
                            : ""
                        ].filter(Boolean).join(" ")}
                        title="Drag to resize. Double click to reset."
                        type="button"
                        onClick={(event) => event.stopPropagation()}
                        onDoubleClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          resetGridColumnSize(column.id);
                        }}
                        onKeyDown={(event) => {
                          if (
                            event.key !== "ArrowLeft" &&
                            event.key !== "ArrowRight"
                          ) {
                            return;
                          }

                          event.preventDefault();
                          event.stopPropagation();
                          const direction = event.key === "ArrowLeft" ? -1 : 1;
                          resizeBy(column, direction * (event.shiftKey ? 24 : 8));
                        }}
                        onPointerDown={(event) =>
                          startResize(event, column, width)
                        }
                      />
                    )}
                  </div>
                </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            <DataGridErrorState
              columnCount={visibleColumnCount}
              error={error}
            />
            {!error && loading && (
              <DataGridSkeletonRows columnCount={visibleColumnCount} />
            )}
            {!error && !loading && renderedRows.length === 0 && (
              <DataGridEmptyState
                columnCount={visibleColumnCount}
                hasQuery={hasQuery}
                message={emptyMessage}
              />
            )}
            {!error &&
              !loading &&
              renderedRows.map((displayRow, rowIndex) => {
                if (displayRow.type === "group") {
                  const group = displayRow as DataGridGroupRow<RowData>;
                  const column = columns.find(
                    (candidate) => candidate.id === group.columnId
                  );
                  const groupLabelText = String(group.value ?? "blank");
                  const groupHeader =
                    renderGroupHeader?.({
                      group,
                      state: gridStateWithSelection
                    }) ?? (
                      <>
                        <button
                          aria-expanded={group.isExpanded}
                          aria-label={`${
                            group.isExpanded ? "Collapse" : "Expand"
                          } ${column?.header ?? group.columnId} ${groupLabelText} group`}
                          className="udg-group-row__toggle"
                          type="button"
                          onClick={() => toggleGridGroup(group.id)}
                        >
                          {group.isExpanded ? "-" : "+"}
                        </button>
                        <span className="udg-group-row__label">
                          <span className="udg-group-row__column">
                            {column?.header ?? group.columnId}
                          </span>
                          <span>{group.label}</span>
                        </span>
                        <span className="udg-group-row__count">
                          {group.rowCount} row{group.rowCount === 1 ? "" : "s"}
                        </span>
                      </>
                    );

                  return (
                    <tr
                      className={[
                        "udg-group-row",
                        group.isExpanded
                          ? "udg-group-row--expanded"
                          : "udg-group-row--collapsed"
                      ].join(" ")}
                      key={group.id}
                    >
                      {selectionEnabled && (
                        <td className="udg-selection-cell" />
                      )}
                      <td
                        className="udg-group-row__cell"
                        colSpan={Math.max(1, orderedColumns.length)}
                      >
                        <div
                          className="udg-group-row__content"
                          style={{
                            "--udg-group-depth": group.depth
                          } as DataGridRuntimeStyle}
                        >
                          {groupHeader}
                        </div>
                      </td>
                    </tr>
                  );
                }

                const { id: rowId, index: sourceRowIndex, row, depth } = displayRow;
                const rowSelectable = isRowSelectable(
                  row,
                  sourceRowIndex,
                  getRowSelectable
                );
                const rowSelected = isRowSelected(
                  resolvedSelectedRowIds,
                  rowId
                );

                return (
                  <tr
                    aria-selected={selectionEnabled ? rowSelected : undefined}
                    className={[
                      rowSelected ? "udg-row--selected" : "",
                      groupingActive ? "udg-row--grouped" : "",
                      selectionEnabled && !rowSelectable
                        ? "udg-row--disabled"
                        : "",
                      enableRowClickSelection && rowSelectable
                        ? "udg-row--clickable"
                        : ""
                    ].filter(Boolean).join(" ")}
                    key={rowId}
                    onClick={() => {
                      onRowClick?.(row, sourceRowIndex);

                      if (
                        selectionEnabled &&
                        enableRowClickSelection &&
                        rowSelectable
                      ) {
                        toggleSingleRowSelection(rowId);
                      }
                    }}
                  >
                    {selectionEnabled && (
                      <td className="udg-selection-cell">
                        <IndeterminateCheckbox
                          aria-label={`Select row ${rowIndex + 1}`}
                          checked={rowSelected}
                          disabled={!rowSelectable}
                          onChange={() => toggleSingleRowSelection(rowId)}
                          onClick={(event) => event.stopPropagation()}
                        />
                      </td>
                    )}
                    {orderedColumns.map((column) => {
                      const value = getCellValue(row, column);

                      return (
                        <td
                          className={`udg-align-${column.align ?? "left"}`}
                          key={column.id}
                        >
                          <span
                            className="udg-cell-content"
                            style={
                              column.id === orderedColumns[0]?.id && depth > 0
                                ? ({
                                    "--udg-group-depth": depth
                                  } as DataGridRuntimeStyle)
                                : undefined
                            }
                          >
                            {column.cell
                              ? column.cell(value, row, sourceRowIndex)
                              : String(value ?? "")}
                          </span>
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
