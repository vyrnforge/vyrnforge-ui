import { describe, expect, it } from "vitest";
import {
  clearSelection,
  deselectRows,
  getRowIdValue,
  getSelectableRowIds,
  getSelectionStateForPage,
  isRowSelectable,
  isRowSelected,
  resolveSelectedRows,
  selectRows,
  toggleRowSelection
} from "./rowSelection";

type Row = {
  id: number;
  name: string;
  disabled?: boolean;
};

const rows: Row[] = [
  { id: 1, name: "Alpha" },
  { id: 2, name: "Beta", disabled: true },
  { id: 3, name: "Gamma" }
];

describe("rowSelection", () => {
  it("resolves row ids from getter, row.id, or index fallback", () => {
    expect(getRowIdValue(rows[0], 0, (row) => `row-${row.id}`)).toBe("row-1");
    expect(getRowIdValue(rows[0], 0)).toBe(1);
    expect(getRowIdValue({ name: "No id" }, 5)).toBe(5);
  });

  it("checks row selectability with an optional guard", () => {
    expect(isRowSelectable(rows[0], 0)).toBe(true);
    expect(isRowSelectable(rows[1], 1, (row) => !row.disabled)).toBe(false);
  });

  it("toggles multiple and single selection modes", () => {
    expect(toggleRowSelection([], 1)).toEqual([1]);
    expect(toggleRowSelection([1], 1)).toEqual([]);
    expect(toggleRowSelection([1], 2)).toEqual([1, 2]);
    expect(toggleRowSelection([1], 2, "single")).toEqual([2]);
    expect(toggleRowSelection([2], 2, "single")).toEqual([]);
    expect(toggleRowSelection([1], 2, "none")).toEqual([1]);
  });

  it("selects, deselects, and clears row ids", () => {
    expect(selectRows([1], [1, 2, 3])).toEqual([1, 2, 3]);
    expect(selectRows([1], [2, 3], "single")).toEqual([2]);
    expect(deselectRows([1, 2, 3], [2, 4])).toEqual([1, 3]);
    expect(clearSelection()).toEqual([]);
  });

  it("resolves selected rows from the provided row collection", () => {
    expect(resolveSelectedRows(rows, [1, 3]).map((row) => row.name)).toEqual([
      "Alpha",
      "Gamma"
    ]);
  });

  it("returns selectable ids and page selection state", () => {
    const selectableIds = getSelectableRowIds(
      rows,
      (row) => row.id,
      (row) => !row.disabled
    );

    expect(selectableIds).toEqual([1, 3]);
    expect(isRowSelected([1], 1)).toBe(true);
    expect(getSelectionStateForPage([1], selectableIds)).toEqual({
      allSelected: false,
      indeterminate: true,
      noneSelected: false,
      selectedCount: 1,
      totalSelectableCount: 2
    });
    expect(getSelectionStateForPage([1, 3], selectableIds).allSelected).toBe(
      true
    );
  });
});
