import type { DataGridColumnDef } from "../types/column.types";

const getColumnValue = <RowData extends Record<string, unknown>>(
  row: RowData,
  column: DataGridColumnDef<RowData>
) => {
  if (column.accessorFn) {
    return column.accessorFn(row);
  }

  if (column.accessorKey) {
    return row[column.accessorKey as keyof RowData];
  }

  return row[column.id as keyof RowData];
};

export function applySearch<RowData extends Record<string, unknown>>(
  rows: RowData[],
  columns: DataGridColumnDef<RowData>[],
  search: string
): RowData[] {
  const query = search.trim().toLowerCase();

  if (!query) {
    return rows;
  }

  const searchableColumns = columns.filter((column) => column.searchable !== false);

  return rows.filter((row) =>
    searchableColumns.some((column) => {
      const value = getColumnValue(row, column);
      return String(value ?? "").toLowerCase().includes(query);
    })
  );
}
