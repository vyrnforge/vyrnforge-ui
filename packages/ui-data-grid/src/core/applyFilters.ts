import type { DataGridColumnDef } from "../types/column.types";
import type { DataGridFilter } from "../types/filter.types";

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

const compareNumber = (value: unknown, filterValue: unknown) =>
  Number(value) - Number(filterValue);

function matchesFilter(value: unknown, filter: DataGridFilter) {
  const text = String(value ?? "").toLowerCase();
  const filterText = String(filter.value ?? "").toLowerCase();

  switch (filter.operator) {
    case "contains":
      return text.includes(filterText);
    case "equals":
      return value === filter.value || text === filterText;
    case "notEquals":
      return value !== filter.value && text !== filterText;
    case "startsWith":
      return text.startsWith(filterText);
    case "endsWith":
      return text.endsWith(filterText);
    case "isEmpty":
      return value == null || value === "";
    case "isNotEmpty":
      return value != null && value !== "";
    case "greaterThan":
      return compareNumber(value, filter.value) > 0;
    case "greaterThanOrEqual":
      return compareNumber(value, filter.value) >= 0;
    case "lessThan":
      return compareNumber(value, filter.value) < 0;
    case "lessThanOrEqual":
      return compareNumber(value, filter.value) <= 0;
    default:
      return true;
  }
}

export function applyFilters<RowData extends Record<string, unknown>>(
  rows: RowData[],
  columns: DataGridColumnDef<RowData>[],
  filters: DataGridFilter[]
): RowData[] {
  if (filters.length === 0) {
    return rows;
  }

  return rows.filter((row) =>
    filters.every((filter) => {
      const column = columns.find((candidate) => candidate.id === filter.columnId);

      if (!column) {
        return true;
      }

      return matchesFilter(getColumnValue(row, column), filter);
    })
  );
}
