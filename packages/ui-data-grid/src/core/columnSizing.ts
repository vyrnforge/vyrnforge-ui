import type { DataGridColumnSizingState } from "../types/column.types";

export function setColumnSize(
  sizing: DataGridColumnSizingState,
  columnId: string,
  width: number
): DataGridColumnSizingState {
  return {
    ...sizing,
    [columnId]: Math.max(0, width)
  };
}
