import type { DataGridFoundationColumnDef } from "./types";

const getColumnValue = <RowData extends Record<string, unknown>>(
  row: RowData,
  column: DataGridFoundationColumnDef<RowData>,
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
  columns: DataGridFoundationColumnDef<RowData>[],
  search: string,
): RowData[] {
  const query = search.trim().toLowerCase();
  if (!query) {
    return rows;
  }

  const searchableColumns = columns.filter(
    (column) => column.searchable !== false,
  );

  return rows.filter((row) =>
    searchableColumns.some((column) =>
      String(getColumnValue(row, column) ?? "")
        .toLowerCase()
        .includes(query),
    ),
  );
}
