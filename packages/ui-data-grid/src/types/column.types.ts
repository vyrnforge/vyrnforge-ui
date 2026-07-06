import type { ReactNode } from "react";

export type DataGridColumnVisibilityState = Record<string, boolean>;

export type DataGridColumnSizingState = Record<string, number>;

export type DataGridColumnDef<
  RowData extends Record<string, unknown> = Record<string, unknown>
> = {
  id: string;
  header: ReactNode;
  accessorKey?: keyof RowData | string;
  accessorFn?: (row: RowData) => unknown;
  cell?: (params: { row: RowData; value: unknown; rowIndex: number }) => ReactNode;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  searchable?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  visible?: boolean;
  meta?: Record<string, unknown>;
};
