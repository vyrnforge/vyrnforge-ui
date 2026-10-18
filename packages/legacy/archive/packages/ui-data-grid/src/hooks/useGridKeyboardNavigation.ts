import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type RefCallback,
} from "react";
import { resolveGridNavigationTarget } from "../core/gridKeyboardNavigation";
import type { DataGridRowId } from "../types/dataGrid.types";

type GridKeyboardRow = {
  id: DataGridRowId;
  selectable: boolean;
};

type ActiveGridCell = {
  rowId: DataGridRowId;
  columnId: string;
};

type GridCellProps = {
  tabIndex: 0 | -1;
  ref: RefCallback<HTMLTableCellElement>;
  onFocus: (event: FocusEvent<HTMLTableCellElement>) => void;
  onKeyDown: (event: KeyboardEvent<HTMLTableCellElement>) => void;
};

const createCellKey = (rowId: DataGridRowId, columnId: string) =>
  `${typeof rowId}:${String(rowId)}::${columnId}`;

export function useGridKeyboardNavigation({
  rows,
  columnIds,
  selectionEnabled,
  onActivateRow,
  onToggleRowSelection,
}: {
  rows: readonly GridKeyboardRow[];
  columnIds: readonly string[];
  selectionEnabled: boolean;
  onActivateRow: (rowId: DataGridRowId) => void;
  onToggleRowSelection: (rowId: DataGridRowId) => void;
}) {
  const cellRefs = useRef(new Map<string, HTMLTableCellElement>());
  const firstCell = useMemo<ActiveGridCell | null>(() => {
    const firstRow = rows[0];
    const firstColumnId = columnIds[0];

    return firstRow && firstColumnId
      ? { rowId: firstRow.id, columnId: firstColumnId }
      : null;
  }, [columnIds, rows]);
  const [activeCell, setActiveCell] = useState<ActiveGridCell | null>(
    firstCell,
  );

  useEffect(() => {
    if (
      activeCell &&
      rows.some((row) => row.id === activeCell.rowId) &&
      columnIds.includes(activeCell.columnId)
    ) {
      return;
    }

    setActiveCell(firstCell);
  }, [activeCell, columnIds, firstCell, rows]);

  const focusCell = useCallback((rowId: DataGridRowId, columnId: string) => {
    const target = cellRefs.current.get(createCellKey(rowId, columnId));

    if (!target) {
      return;
    }

    setActiveCell({ rowId, columnId });
    target.focus({ preventScroll: true });
    target.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, []);

  const getCellProps = useCallback(
    (
      rowId: DataGridRowId,
      columnId: string,
      rowIndex: number,
      columnIndex: number,
    ): GridCellProps => {
      const cellKey = createCellKey(rowId, columnId);
      const isActive =
        activeCell?.rowId === rowId && activeCell.columnId === columnId;

      return {
        tabIndex: isActive ? 0 : -1,
        ref: (element) => {
          if (element) {
            cellRefs.current.set(cellKey, element);
          } else {
            cellRefs.current.delete(cellKey);
          }
        },
        onFocus: () => setActiveCell({ rowId, columnId }),
        onKeyDown: (event) => {
          if (event.target !== event.currentTarget) {
            return;
          }

          const target = resolveGridNavigationTarget({
            key: event.key,
            rowIndex,
            columnIndex,
            rowCount: rows.length,
            columnCount: columnIds.length,
            ctrlKey: event.ctrlKey,
            metaKey: event.metaKey,
          });

          if (target) {
            const targetRow = rows[target.rowIndex];
            const targetColumnId = columnIds[target.columnIndex];

            if (!targetRow || !targetColumnId) {
              return;
            }

            event.preventDefault();
            focusCell(targetRow.id, targetColumnId);
            return;
          }

          if (event.key === " " && selectionEnabled) {
            const row = rows[rowIndex];

            if (!row?.selectable) {
              return;
            }

            event.preventDefault();
            onToggleRowSelection(row.id);
            return;
          }

          if (event.key === "Enter") {
            event.preventDefault();
            onActivateRow(rowId);
          }
        },
      };
    },
    [
      activeCell,
      columnIds,
      focusCell,
      onActivateRow,
      onToggleRowSelection,
      rows,
      selectionEnabled,
    ],
  );

  return { activeCell, getCellProps };
}
