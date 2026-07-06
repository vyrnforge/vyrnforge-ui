import * as react from 'react';
import { ReactNode, CSSProperties } from 'react';

type DataGridColumnVisibilityState = Record<string, boolean>;
type DataGridColumnSizingState = Record<string, number>;
type DataGridColumnDef<RowData extends Record<string, unknown> = Record<string, unknown>> = {
    id: string;
    header: ReactNode;
    accessorKey?: keyof RowData | string;
    accessorFn?: (row: RowData) => unknown;
    cell?: (params: {
        row: RowData;
        value: unknown;
        rowIndex: number;
    }) => ReactNode;
    width?: number;
    minWidth?: number;
    maxWidth?: number;
    searchable?: boolean;
    sortable?: boolean;
    filterable?: boolean;
    visible?: boolean;
    meta?: Record<string, unknown>;
};

type DataGridFilterOperator = "contains" | "equals" | "notEquals" | "startsWith" | "endsWith" | "isEmpty" | "isNotEmpty" | "greaterThan" | "greaterThanOrEqual" | "lessThan" | "lessThanOrEqual";
type DataGridFilter = {
    id: string;
    columnId: string;
    operator: DataGridFilterOperator;
    value?: unknown;
};
type DataGridSort = {
    columnId: string;
    direction: "asc" | "desc";
};

type DataGridRowId = string | number;
type DataGridPaginationState = {
    pageIndex: number;
    pageSize: number;
};
type DataGridGroupingState = string[];
type DataGridState = {
    search: string;
    filters: DataGridFilter[];
    sorting: DataGridSort[];
    grouping: DataGridGroupingState;
    pagination: DataGridPaginationState;
    columnVisibility: DataGridColumnVisibilityState;
    columnSizing: DataGridColumnSizingState;
    selectedRowIds: DataGridRowId[];
};
type DataGridStateChangeHandler = (nextState: DataGridState) => void;
type DataGridQueryChange = Pick<DataGridState, "search" | "filters" | "sorting" | "grouping" | "pagination">;
type UniversalDataGridProps<RowData extends Record<string, unknown> = Record<string, unknown>> = {
    tableId: string;
    columns: DataGridColumnDef<RowData>[];
    rows: RowData[];
    getRowId?: (row: RowData, index: number) => DataGridRowId;
    state?: DataGridState;
    defaultState?: Partial<DataGridState>;
    onStateChange?: DataGridStateChangeHandler;
    loading?: boolean;
    error?: string | null;
    totalRows?: number;
    serverMode?: boolean;
    onQueryChange?: (query: DataGridQueryChange) => void;
    emptyMessage?: string;
    className?: string;
    style?: CSSProperties;
};

declare function UniversalDataGrid<RowData extends Record<string, unknown> = Record<string, unknown>>({ tableId, columns, rows, getRowId, state, defaultState, onStateChange, loading, error, totalRows, serverMode, onQueryChange, emptyMessage, className, style }: UniversalDataGridProps<RowData>): react.JSX.Element;

declare function createGridState(initialState?: Partial<DataGridState>): DataGridState;

declare function applySearch<RowData extends Record<string, unknown>>(rows: RowData[], columns: DataGridColumnDef<RowData>[], search: string): RowData[];

declare function applyFilters<RowData extends Record<string, unknown>>(rows: RowData[], columns: DataGridColumnDef<RowData>[], filters: DataGridFilter[]): RowData[];

declare function applySorting<RowData extends Record<string, unknown>>(rows: RowData[], columns: DataGridColumnDef<RowData>[], sorting: DataGridSort[]): RowData[];

declare function applyGrouping<RowData>(rows: RowData[], _grouping: DataGridGroupingState): RowData[];

declare function applyPagination<RowData>(rows: RowData[], pagination: DataGridPaginationState): RowData[];

type DataGridExportFormat = "csv" | "xlsx" | "pdf" | "json";
type DataGridExportScope = "current_page" | "selected_rows" | "filtered_rows" | "all_rows";
type DataGridExportColumn = {
    id: string;
    header: string;
    visible: boolean;
};
type DataGridExportRequest = {
    tableId: string;
    columns: DataGridExportColumn[];
    filters: DataGridFilter[];
    search: string;
    sorting: DataGridSort[];
    grouping: DataGridGroupingState;
    pagination: DataGridPaginationState;
    selectedRowIds: DataGridRowId[];
    scope: DataGridExportScope;
    format: DataGridExportFormat;
    requestedAt: string;
};
type BuildDataGridExportRequestParams<RowData extends Record<string, unknown> = Record<string, unknown>> = {
    tableId: string;
    columns: DataGridColumnDef<RowData>[];
    columnVisibility: Record<string, boolean>;
    filters: DataGridFilter[];
    search: string;
    sorting: DataGridSort[];
    grouping: DataGridGroupingState;
    pagination: DataGridPaginationState;
    selectedRowIds: DataGridRowId[];
    scope: DataGridExportScope;
    format: DataGridExportFormat;
};

declare function buildDataGridExportRequest<RowData extends Record<string, unknown>>({ tableId, columns, columnVisibility, filters, search, sorting, grouping, pagination, selectedRowIds, scope, format }: BuildDataGridExportRequestParams<RowData>): DataGridExportRequest;

declare function useDataGridState({ state, defaultState, onStateChange }: {
    state?: DataGridState;
    defaultState?: Partial<DataGridState>;
    onStateChange?: (nextState: DataGridState) => void;
}): readonly [DataGridState, (nextValue: DataGridState | ((currentValue: DataGridState) => DataGridState)) => void];

declare function useControlledState<State>(controlledValue: State | undefined, defaultValue: State, onChange?: (nextValue: State) => void): readonly [State, (nextValue: State | ((currentValue: State) => State)) => void];

declare function useDebouncedValue<Value>(value: Value, delayMs?: number): Value;

declare function useColumnResize({ columnSizing, onColumnSizingChange }: {
    columnSizing: DataGridColumnSizingState;
    onColumnSizingChange: (nextSizing: DataGridColumnSizingState) => void;
}): {
    setSize: (columnId: string, width: number) => void;
};

export { type BuildDataGridExportRequestParams, type DataGridColumnDef, type DataGridColumnSizingState, type DataGridColumnVisibilityState, type DataGridExportColumn, type DataGridExportFormat, type DataGridExportRequest, type DataGridExportScope, type DataGridFilter, type DataGridFilterOperator, type DataGridGroupingState, type DataGridPaginationState, type DataGridRowId, type DataGridSort, type DataGridState, UniversalDataGrid, type UniversalDataGridProps, applyFilters, applyGrouping, applyPagination, applySearch, applySorting, buildDataGridExportRequest, createGridState, useColumnResize, useControlledState, useDataGridState, useDebouncedValue };
