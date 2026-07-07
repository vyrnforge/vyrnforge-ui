import type { ReactNode } from "react";

export type DataGridColumnVisibilityState = Record<string, boolean>;

export type DataGridColumnSizingState = Record<string, number>;

export type DataGridColumnDataType =
  | "string"
  | "number"
  | "date"
  | "datetime"
  | "boolean"
  | "enum"
  | "status"
  | "custom";

export type DataGridAggregationType =
  | "count"
  | "sum"
  | "avg"
  | "min"
  | "max"
  | "custom";

export type DataGridAggregationContext<
  RowData extends Record<string, unknown> = Record<string, unknown>
> = {
  columnId: string;
  rows: RowData[];
  rowCount: number;
};

export type DataGridAggregationDef<
  RowData extends Record<string, unknown> = Record<string, unknown>
> = {
  type: DataGridAggregationType;
  accessor?: (row: RowData) => number | string | Date | null | undefined;
  render?: (
    value: unknown,
    context: DataGridAggregationContext<RowData>
  ) => ReactNode;
};

export type DataGridColumnDef<
  RowData extends Record<string, unknown> = Record<string, unknown>
> = {
  id: string;
  header: string;
  accessorKey?: keyof RowData;
  accessorFn?: (row: RowData) => unknown;
  cell?: (value: unknown, row: RowData, index: number) => ReactNode;
  groupable?: boolean;
  groupLabel?: (value: unknown) => ReactNode;
  groupValue?: (row: RowData) => unknown;
  aggregation?: DataGridAggregationDef<RowData>;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  resizable?: boolean;
  sortable?: boolean;
  searchable?: boolean;
  filterable?: boolean;
  hideable?: boolean;
  hidden?: boolean;
  visible?: boolean;
  align?: "left" | "center" | "right";
  dataType?: DataGridColumnDataType;
  meta?: Record<string, unknown>;
};
