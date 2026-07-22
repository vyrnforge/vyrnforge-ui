export type DataGridCellCoordinate = {
  rowIndex: number;
  columnIndex: number;
};

export type ResolveGridNavigationTargetParams = DataGridCellCoordinate & {
  key: string;
  rowCount: number;
  columnCount: number;
  ctrlKey?: boolean;
  metaKey?: boolean;
};

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(Math.max(value, minimum), maximum);

export function resolveGridNavigationTarget({
  key,
  rowIndex,
  columnIndex,
  rowCount,
  columnCount,
  ctrlKey = false,
  metaKey = false,
}: ResolveGridNavigationTargetParams): DataGridCellCoordinate | null {
  if (rowCount <= 0 || columnCount <= 0) {
    return null;
  }

  const lastRowIndex = rowCount - 1;
  const lastColumnIndex = columnCount - 1;
  const moveToGridBoundary = ctrlKey || metaKey;

  switch (key) {
    case "ArrowUp":
      return {
        rowIndex: clamp(rowIndex - 1, 0, lastRowIndex),
        columnIndex,
      };
    case "ArrowDown":
      return {
        rowIndex: clamp(rowIndex + 1, 0, lastRowIndex),
        columnIndex,
      };
    case "ArrowLeft":
      return {
        rowIndex,
        columnIndex: clamp(columnIndex - 1, 0, lastColumnIndex),
      };
    case "ArrowRight":
      return {
        rowIndex,
        columnIndex: clamp(columnIndex + 1, 0, lastColumnIndex),
      };
    case "Home":
      return {
        rowIndex: moveToGridBoundary ? 0 : rowIndex,
        columnIndex: 0,
      };
    case "End":
      return {
        rowIndex: moveToGridBoundary ? lastRowIndex : rowIndex,
        columnIndex: lastColumnIndex,
      };
    default:
      return null;
  }
}
