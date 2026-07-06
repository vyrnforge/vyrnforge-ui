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

export type DataGridColumnDef<
  RowData extends Record<string, unknown> = Record<string, unknown>
> = {
  id: string;
  header: string;
  accessorKey?: keyof RowData;
  accessorFn?: (row: RowData) => unknown;
  cell?: (value: unknown, row: RowData, index: number) => ReactNode;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  sortable?: boolean;
  searchable?: boolean;
  filterable?: boolean;
  hidden?: boolean;
  visible?: boolean;
  align?: "left" | "center" | "right";
  dataType?: DataGridColumnDataType;
  meta?: Record<string, unknown>;
};
