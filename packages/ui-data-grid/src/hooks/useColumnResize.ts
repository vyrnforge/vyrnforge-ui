import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent
} from "react";
import {
  resolveColumnWidth,
  setColumnSize
} from "../core/columnSizing";
import type {
  DataGridColumnDef,
  DataGridColumnSizingState
} from "../types/column.types";

type ResizeSession = {
  columnId: string;
  pointerId: number;
  startX: number;
  startWidth: number;
};

export function useColumnResize<
  RowData extends Record<string, unknown> = Record<string, unknown>
>({
  columns,
  columnSizing,
  onColumnSizingChange
}: {
  columns: DataGridColumnDef<RowData>[];
  columnSizing: DataGridColumnSizingState;
  onColumnSizingChange: (nextSizing: DataGridColumnSizingState) => void;
}) {
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);
  const sessionRef = useRef<ResizeSession | null>(null);
  const frameRef = useRef<number | null>(null);
  const latestSizingRef = useRef(columnSizing);

  useEffect(() => {
    latestSizingRef.current = columnSizing;
  }, [columnSizing]);

  useEffect(
    () => () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    },
    []
  );

  const setSize = useCallback(
    (columnId: string, width: number) => {
      const nextSizing = setColumnSize(
        columns,
        latestSizingRef.current,
        columnId,
        width
      );

      latestSizingRef.current = nextSizing;
      onColumnSizingChange(nextSizing);
    },
    [columns, onColumnSizingChange]
  );

  const stopResize = useCallback((event?: PointerEvent) => {
    if (
      event &&
      sessionRef.current &&
      event.pointerId !== sessionRef.current.pointerId
    ) {
      return;
    }

    sessionRef.current = null;
    setActiveColumnId(null);
    document.body.classList.remove("udg-is-resizing");
  }, []);

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      const session = sessionRef.current;

      if (!session || event.pointerId !== session.pointerId) {
        return;
      }

      const nextWidth = session.startWidth + event.clientX - session.startX;

      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }

      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = null;
        setSize(session.columnId, nextWidth);
      });
    },
    [setSize]
  );

  useEffect(() => {
    if (!activeColumnId) {
      return;
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", stopResize);
    window.addEventListener("pointercancel", stopResize);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", stopResize);
      window.removeEventListener("pointercancel", stopResize);
    };
  }, [activeColumnId, handlePointerMove, stopResize]);

  const startResize = useCallback(
    (
      event: ReactPointerEvent<HTMLElement>,
      column: DataGridColumnDef<RowData>,
      currentWidth?: number
    ) => {
      if (column.resizable === false) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      event.currentTarget.setPointerCapture?.(event.pointerId);

      sessionRef.current = {
        columnId: column.id,
        pointerId: event.pointerId,
        startX: event.clientX,
        startWidth:
          currentWidth ?? resolveColumnWidth(column, latestSizingRef.current)
      };
      setActiveColumnId(column.id);
      document.body.classList.add("udg-is-resizing");
    },
    []
  );

  const resizeBy = useCallback(
    (column: DataGridColumnDef<RowData>, delta: number) => {
      if (column.resizable === false) {
        return;
      }

      setSize(
        column.id,
        resolveColumnWidth(column, latestSizingRef.current) + delta
      );
    },
    [setSize]
  );

  return {
    activeColumnId,
    resizeBy,
    setSize,
    startResize,
    stopResize
  };
}
