import { useCallback } from "react";
import { setColumnSize } from "../core/columnSizing";
import type { DataGridColumnSizingState } from "../types/column.types";

export function useColumnResize({
  columnSizing,
  onColumnSizingChange
}: {
  columnSizing: DataGridColumnSizingState;
  onColumnSizingChange: (nextSizing: DataGridColumnSizingState) => void;
}) {
  const setSize = useCallback(
    (columnId: string, width: number) => {
      onColumnSizingChange(setColumnSize(columnSizing, columnId, width));
    },
    [columnSizing, onColumnSizingChange]
  );

  return { setSize };
}
