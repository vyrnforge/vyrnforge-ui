import type { DataGridColumnDef } from "../types/column.types";
import type { DataGridSort } from "../types/filter.types";

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

const compareValues = (left: unknown, right: unknown) => {
  if (left == null && right == null) {
    return 0;
  }

  if (left == null) {
    return -1;
  }

  if (right == null) {
    return 1;
  }

  if (typeof left === "number" && typeof right === "number") {
    return left - right;
  }

  return String(left).localeCompare(String(right), undefined, {
    numeric: true,
    sensitivity: "base"
  });
};

export function applySorting<RowData extends Record<string, unknown>>(
  rows: RowData[],
  columns: DataGridColumnDef<RowData>[],
  sorting: DataGridSort[]
): RowData[] {
  if (sorting.length === 0) {
    return rows;
  }

  return [...rows].sort((leftRow, rightRow) => {
    for (const sort of sorting) {
      const column = columns.find((candidate) => candidate.id === sort.columnId);

      if (!column) {
        continue;
      }

      const result = compareValues(
        getColumnValue(leftRow, column),
        getColumnValue(rightRow, column)
      );

      if (result !== 0) {
        return sort.direction === "asc" ? result : -result;
      }
    }

    return 0;
  });
}
