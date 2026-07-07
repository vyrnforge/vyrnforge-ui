import type { DataGridFilter } from "../types/filter.types";

export function upsertColumnFilter(
  filters: DataGridFilter[],
  filter: DataGridFilter
) {
  return [
    ...filters.filter((candidate) => candidate.columnId !== filter.columnId),
    filter
  ];
}

export function removeColumnFilter(filters: DataGridFilter[], columnId: string) {
  return filters.filter((filter) => filter.columnId !== columnId);
}

export function getColumnFilter(filters: DataGridFilter[], columnId: string) {
  return filters.find((filter) => filter.columnId === columnId);
}
