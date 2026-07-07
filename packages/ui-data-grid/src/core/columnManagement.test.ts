import { describe, expect, it } from "vitest";
import { createGridState } from "./createGridState";
import {
  filterColumnMenuColumns,
  hideOptionalColumns,
  moveColumnBefore,
  moveColumnOrder,
  pickPersistableGridState,
  resetGridViewState,
  resolveOrderedColumns,
  resolveVisibleColumns,
  showAllColumns,
  updateColumnVisibility
} from "./columnManagement";
import type { DataGridColumnDef } from "../types/column.types";

type Row = {
  id: number;
  name: string;
  status: string;
  score: number;
};

const columns: DataGridColumnDef<Row>[] = [
  { id: "id", header: "ID", accessorKey: "id", hideable: false },
  { id: "name", header: "Name", accessorKey: "name" },
  { id: "status", header: "Status", accessorKey: "status", hidden: true },
  { id: "score", header: "Score", accessorKey: "score" }
];

describe("columnManagement", () => {
  it("resolves visible columns and respects default hidden columns", () => {
    expect(resolveVisibleColumns(columns, {}).map((column) => column.id)).toEqual([
      "id",
      "name",
      "score"
    ]);
  });

  it("allows default hidden columns to be shown through visibility state", () => {
    expect(
      resolveVisibleColumns(columns, { status: true }).map((column) => column.id)
    ).toContain("status");
  });

  it("does not hide columns with hideable false", () => {
    const nextVisibility = updateColumnVisibility(columns, {}, "id", false);

    expect(nextVisibility).toEqual({});
    expect(resolveVisibleColumns(columns, { id: false }).map((column) => column.id)).toContain(
      "id"
    );
  });

  it("filters column menu columns by header and id", () => {
    expect(filterColumnMenuColumns(columns, "stat").map((column) => column.id)).toEqual([
      "status"
    ]);
    expect(filterColumnMenuColumns(columns, "score").map((column) => column.id)).toEqual([
      "score"
    ]);
    expect(filterColumnMenuColumns(columns, " ").map((column) => column.id)).toEqual([
      "id",
      "name",
      "status",
      "score"
    ]);
  });

  it("shows all columns without mutating existing visibility", () => {
    expect(showAllColumns(columns, { status: false })).toEqual({
      id: true,
      name: true,
      status: true,
      score: true
    });
  });

  it("hides optional columns while keeping required columns visible", () => {
    expect(hideOptionalColumns(columns, {})).toEqual({
      id: true,
      name: false,
      status: false,
      score: false
    });
  });

  it("orders known columns and appends unknown/new columns safely", () => {
    expect(
      resolveOrderedColumns(columns, ["score", "missing", "name"]).map(
        (column) => column.id
      )
    ).toEqual(["score", "name", "id", "status"]);
  });

  it("moves columns up, down, first, and last without mutating input", () => {
    const originalOrder = ["id", "name", "status", "score"];

    expect(moveColumnOrder(originalOrder, originalOrder, "status", "up")).toEqual([
      "id",
      "status",
      "name",
      "score"
    ]);
    expect(moveColumnOrder(originalOrder, originalOrder, "name", "down")).toEqual([
      "id",
      "status",
      "name",
      "score"
    ]);
    expect(moveColumnOrder(originalOrder, originalOrder, "score", "first")[0]).toBe(
      "score"
    );
    const lastMove = moveColumnOrder(originalOrder, originalOrder, "id", "last");
    expect(lastMove[lastMove.length - 1]).toBe("id");
    expect(originalOrder).toEqual(["id", "name", "status", "score"]);
  });

  it("moves a dragged column before or after a visible target", () => {
    expect(
      moveColumnBefore(["id", "name", "score"], [], "score", "name")
    ).toEqual(["id", "score", "name"]);
    expect(
      moveColumnBefore(["id", "name", "score"], [], "id", "score", "after")
    ).toEqual(["name", "score", "id"]);
  });

  it("ignores hidden or unknown targets during drag ordering", () => {
    const originalOrder = ["id", "name", "score"];

    expect(
      moveColumnBefore(originalOrder, originalOrder, "score", "status")
    ).toEqual(originalOrder);
    expect(originalOrder).toEqual(["id", "name", "score"]);
  });

  it("resets view state and clears selection to the default state", () => {
    const currentState = createGridState({
      search: "abc",
      sort: [{ columnId: "name", direction: "asc" }],
      pagination: { pageIndex: 4, pageSize: 50 },
      columnVisibility: { status: true },
      columnOrder: ["score", "name"],
      columnSizing: { name: 240 },
      grouping: ["status"],
      expandedGroupIds: ["0:status:Active"],
      density: "comfortable",
      selectedRowIds: [1]
    });
    const resetState = resetGridViewState(currentState, {
      pagination: { pageIndex: 0, pageSize: 25 },
      density: "compact"
    });

    expect(resetState.search).toBe("");
    expect(resetState.sort).toEqual([]);
    expect(resetState.pagination).toEqual({ pageIndex: 0, pageSize: 25 });
    expect(resetState.columnVisibility).toEqual({});
    expect(resetState.columnOrder).toEqual([]);
    expect(resetState.columnSizing).toEqual({});
    expect(resetState.grouping).toEqual([]);
    expect(resetState.expandedGroupIds).toEqual([]);
    expect(resetState.density).toBe("compact");
    expect(resetState.selectedRowIds).toEqual([]);
  });

  it("picks only persistable preferences and resets persisted page index", () => {
    const state = createGridState({
      search: "workspace",
      pagination: { pageIndex: 3, pageSize: 25 },
      columnOrder: ["score"],
      columnSizing: { name: 220 },
      grouping: ["status"],
      expandedGroupIds: ["0:status:Active"],
      selectedRowIds: [1],
      density: "compact"
    });

    expect(pickPersistableGridState(state)).toEqual({
      search: "workspace",
      filters: [],
      sort: [],
      pagination: { pageIndex: 0, pageSize: 25 },
      columnVisibility: {},
      columnOrder: ["score"],
      columnSizing: { name: 220 },
      grouping: ["status"],
      density: "compact"
    });
  });
});
