import type {
  DataGridRowId,
  DataGridSelectionMode
} from "../types/dataGrid.types";

export type DataGridRowIdGetter<
  RowData extends Record<string, unknown> = Record<string, unknown>
> = (row: RowData, index: number) => DataGridRowId;

export type DataGridRowSelectableGetter<
  RowData extends Record<string, unknown> = Record<string, unknown>
> = (row: RowData, index: number) => boolean;

export type DataGridPageSelectionState = {
  allSelected: boolean;
  indeterminate: boolean;
  noneSelected: boolean;
  selectedCount: number;
  totalSelectableCount: number;
};

export function getRowIdValue<
  RowData extends Record<string, unknown>
>(
  row: RowData,
  index: number,
  getRowId?: DataGridRowIdGetter<RowData>
): DataGridRowId {
  if (getRowId) {
    return getRowId(row, index);
  }

  const candidate = row.id;
  return typeof candidate === "string" || typeof candidate === "number"
    ? candidate
    : index;
}

export function isRowSelectable<
  RowData extends Record<string, unknown>
>(
  row: RowData,
  index: number,
  getRowSelectable?: DataGridRowSelectableGetter<RowData>
) {
  return getRowSelectable?.(row, index) ?? true;
}

export function isRowSelected(
  selectedRowIds: DataGridRowId[],
  rowId: DataGridRowId
) {
  return selectedRowIds.includes(rowId);
}

export function toggleRowSelection(
  selectedRowIds: DataGridRowId[],
  rowId: DataGridRowId,
  selectionMode: DataGridSelectionMode = "multiple"
) {
  if (selectionMode === "none") {
    return selectedRowIds;
  }

  const selected = isRowSelected(selectedRowIds, rowId);

  if (selectionMode === "single") {
    return selected ? [] : [rowId];
  }

  return selected
    ? selectedRowIds.filter((selectedRowId) => selectedRowId !== rowId)
    : [...selectedRowIds, rowId];
}

export function selectRows(
  selectedRowIds: DataGridRowId[],
  rowIds: DataGridRowId[],
  selectionMode: DataGridSelectionMode = "multiple"
) {
  if (selectionMode === "none" || rowIds.length === 0) {
    return selectedRowIds;
  }

  if (selectionMode === "single") {
    return [rowIds[0]];
  }

  const nextRowIds = new Set(selectedRowIds);
  rowIds.forEach((rowId) => nextRowIds.add(rowId));
  return [...nextRowIds];
}

export function deselectRows(
  selectedRowIds: DataGridRowId[],
  rowIds: DataGridRowId[]
) {
  const rowIdSet = new Set(rowIds);
  return selectedRowIds.filter((rowId) => !rowIdSet.has(rowId));
}

export function clearSelection() {
  return [] as DataGridRowId[];
}

export function getSelectableRowIds<
  RowData extends Record<string, unknown>
>(
  rows: RowData[],
  getRowId?: DataGridRowIdGetter<RowData>,
  getRowSelectable?: DataGridRowSelectableGetter<RowData>
) {
  return rows.reduce<DataGridRowId[]>((rowIds, row, index) => {
    if (!isRowSelectable(row, index, getRowSelectable)) {
      return rowIds;
    }

    rowIds.push(getRowIdValue(row, index, getRowId));
    return rowIds;
  }, []);
}

export function resolveSelectedRows<
  RowData extends Record<string, unknown>
>(
  rows: RowData[],
  selectedRowIds: DataGridRowId[],
  getRowId?: DataGridRowIdGetter<RowData>
) {
  const selectedRowIdSet = new Set(selectedRowIds);
  return rows.filter((row, index) =>
    selectedRowIdSet.has(getRowIdValue(row, index, getRowId))
  );
}

export function getSelectionStateForPage(
  selectedRowIds: DataGridRowId[],
  pageSelectableRowIds: DataGridRowId[]
): DataGridPageSelectionState {
  const selectedRowIdSet = new Set(selectedRowIds);
  const selectedCount = pageSelectableRowIds.filter((rowId) =>
    selectedRowIdSet.has(rowId)
  ).length;
  const totalSelectableCount = pageSelectableRowIds.length;
  const allSelected =
    totalSelectableCount > 0 && selectedCount === totalSelectableCount;
  const noneSelected = selectedCount === 0;

  return {
    allSelected,
    indeterminate: !allSelected && !noneSelected,
    noneSelected,
    selectedCount,
    totalSelectableCount
  };
}
