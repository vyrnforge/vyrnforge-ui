import type {
  DataGridColumnDef,
  DataGridColumnVisibilityState
} from "../types/column.types";

export function getVisibleColumns<RowData extends Record<string, unknown>>(
  columns: DataGridColumnDef<RowData>[],
  visibility: DataGridColumnVisibilityState
) {
  return columns.filter(
    (column) =>
      !column.hidden && column.visible !== false && visibility[column.id] !== false
  );
}
