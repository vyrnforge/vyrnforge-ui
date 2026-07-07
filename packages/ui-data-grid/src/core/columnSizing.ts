import type {
  DataGridColumnDef,
  DataGridColumnSizingState
} from "../types/column.types";

export const defaultColumnMinWidth = 80;
export const defaultColumnWidth = 160;

export function isColumnResizable<
  RowData extends Record<string, unknown>
>(column: DataGridColumnDef<RowData>) {
  return column.resizable !== false;
}

export function resolveColumnMinWidth<
  RowData extends Record<string, unknown>
>(column: DataGridColumnDef<RowData>) {
  return column.minWidth ?? defaultColumnMinWidth;
}

export function resolveColumnMaxWidth<
  RowData extends Record<string, unknown>
>(column: DataGridColumnDef<RowData>) {
  return column.maxWidth;
}

export function clampColumnWidth(
  width: number,
  {
    minWidth = defaultColumnMinWidth,
    maxWidth
  }: {
    minWidth?: number;
    maxWidth?: number;
  } = {}
) {
  const safeWidth = Number.isFinite(width) ? width : defaultColumnWidth;
  const minClampedWidth = Math.max(minWidth, safeWidth);

  if (typeof maxWidth === "number") {
    return Math.min(maxWidth, minClampedWidth);
  }

  return minClampedWidth;
}

export function resolveColumnWidth<
  RowData extends Record<string, unknown>
>(
  column: DataGridColumnDef<RowData>,
  sizing: DataGridColumnSizingState = {}
) {
  const widthFromState = isColumnResizable(column) ? sizing[column.id] : undefined;
  const rawWidth = widthFromState ?? column.width ?? defaultColumnWidth;

  return clampColumnWidth(rawWidth, {
    minWidth: resolveColumnMinWidth(column),
    maxWidth: resolveColumnMaxWidth(column)
  });
}

export function resolveColumnSizing<
  RowData extends Record<string, unknown>
>(
  columns: DataGridColumnDef<RowData>[],
  sizing: DataGridColumnSizingState
) {
  return columns.reduce<DataGridColumnSizingState>((nextSizing, column) => {
    if (!isColumnResizable(column) || sizing[column.id] === undefined) {
      return nextSizing;
    }

    return {
      ...nextSizing,
      [column.id]: resolveColumnWidth(column, sizing)
    };
  }, {});
}

export function setColumnSize<
  RowData extends Record<string, unknown>
>(
  columns: DataGridColumnDef<RowData>[],
  sizing: DataGridColumnSizingState,
  columnId: string,
  width: number
): DataGridColumnSizingState {
  const column = columns.find((candidate) => candidate.id === columnId);

  if (!column || !isColumnResizable(column)) {
    return sizing;
  }

  return {
    ...sizing,
    [columnId]: resolveColumnWidth(column, {
      ...sizing,
      [columnId]: width
    })
  };
}

export function resetColumnSize(
  sizing: DataGridColumnSizingState,
  columnId: string
): DataGridColumnSizingState {
  if (!(columnId in sizing)) {
    return sizing;
  }

  const { [columnId]: _removedSize, ...nextSizing } = sizing;
  return nextSizing;
}

export function resetAllColumnSizes(): DataGridColumnSizingState {
  return {};
}
