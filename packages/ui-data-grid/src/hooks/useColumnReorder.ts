import { useCallback } from "react";
import {
  moveColumnBefore,
  moveColumnOrder
} from "../core/columnManagement";

export type ColumnReorderPlacement = "before" | "after";

export type UseColumnReorderParams = {
  allColumnIds: string[];
  columnOrder: string[];
  onColumnOrderChange: (nextColumnOrder: string[]) => void;
};

export function useColumnReorder({
  allColumnIds,
  columnOrder,
  onColumnOrderChange
}: UseColumnReorderParams) {
  const moveColumn = useCallback(
    (columnId: string, direction: "up" | "down" | "first" | "last") => {
      onColumnOrderChange(
        moveColumnOrder(allColumnIds, columnOrder, columnId, direction)
      );
    },
    [allColumnIds, columnOrder, onColumnOrderChange]
  );

  const moveColumnTo = useCallback(
    (
      columnId: string,
      targetColumnId: string,
      placement: ColumnReorderPlacement = "before"
    ) => {
      onColumnOrderChange(
        moveColumnBefore(
          allColumnIds,
          columnOrder,
          columnId,
          targetColumnId,
          placement
        )
      );
    },
    [allColumnIds, columnOrder, onColumnOrderChange]
  );

  const resetColumnOrder = useCallback(() => {
    onColumnOrderChange([]);
  }, [onColumnOrderChange]);

  return {
    moveColumn,
    moveColumnTo,
    resetColumnOrder
  };
}
