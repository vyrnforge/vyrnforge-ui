import { describe, expect, it } from "vitest";
import { applyFilters } from "./applyFilters";
import { applySorting } from "./applySorting";
import {
  removeColumnFilter,
  upsertColumnFilter
} from "./columnFilters";
import type { DataGridColumnDef } from "../types/column.types";

type Row = {
  id: number;
  name: string;
  score: number;
  enabled: boolean;
  createdAt: string;
};

const rows: Row[] = [
  { id: 1, name: "Alpha", score: 42, enabled: true, createdAt: "2026-01-01" },
  { id: 2, name: "Beta", score: 88, enabled: false, createdAt: "2026-03-01" },
  { id: 3, name: "Alpine", score: 71, enabled: true, createdAt: "2026-02-01" }
];

const columns: DataGridColumnDef<Row>[] = [
  { id: "name", header: "Name", accessorKey: "name", dataType: "string" },
  { id: "score", header: "Score", accessorKey: "score", dataType: "number" },
  { id: "enabled", header: "Enabled", accessorKey: "enabled", dataType: "boolean" },
  { id: "createdAt", header: "Created", accessorKey: "createdAt", dataType: "date" }
];

describe("columnFilters", () => {
  it("upserts one filter per column", () => {
    const filters = upsertColumnFilter(
      [{ id: "name", columnId: "name", operator: "contains", value: "a" }],
      { id: "name", columnId: "name", operator: "startsWith", value: "Al" }
    );

    expect(filters).toEqual([
      { id: "name", columnId: "name", operator: "startsWith", value: "Al" }
    ]);
  });

  it("removes one column filter", () => {
    expect(
      removeColumnFilter(
        [
          { id: "name", columnId: "name", operator: "contains", value: "a" },
          { id: "score", columnId: "score", operator: "gte", value: 50 }
        ],
        "name"
      )
    ).toEqual([
      { id: "score", columnId: "score", operator: "gte", value: 50 }
    ]);
  });

  it("ignores hidden or unknown column filters safely", () => {
    expect(
      applyFilters(rows, columns, [
        { id: "missing", columnId: "missing", operator: "equals", value: "x" }
      ])
    ).toEqual(rows);
  });

  it("filters and then sorts rows", () => {
    const filteredRows = applyFilters(rows, columns, [
      { id: "name", columnId: "name", operator: "startsWith", value: "Al" }
    ]);

    expect(
      applySorting(filteredRows, columns, [
        { columnId: "score", direction: "desc" }
      ]).map((row) => row.name)
    ).toEqual(["Alpine", "Alpha"]);
  });

  it("filters ISO date strings with comparable operators", () => {
    expect(
      applyFilters(rows, columns, [
        { id: "createdAt", columnId: "createdAt", operator: "gte", value: "2026-02-01" }
      ]).map((row) => row.name)
    ).toEqual(["Beta", "Alpine"]);
  });
});
