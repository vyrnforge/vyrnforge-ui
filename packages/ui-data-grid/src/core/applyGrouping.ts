import type { DataGridGroupingState } from "../types/dataGrid.types";

export function applyGrouping<RowData>(
  rows: RowData[],
  _grouping: DataGridGroupingState
): RowData[] {
  return rows;
}
