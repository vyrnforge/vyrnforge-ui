import { describe, expect, it } from "vitest";
import { applyFilters } from "./applyFilters";
import type { DataGridColumnDef } from "../types/column.types";

type Row = {
  id: number;
  name: string;
  count: number;
};

const rows: Row[] = [
  { id: 1, name: "Alpha", count: 2 },
  { id: 2, name: "Beta", count: 5 },
  { id: 3, name: "Gamma", count: 10 }
];

const columns: DataGridColumnDef<Row>[] = [
  { id: "name", header: "Name", accessorKey: "name" },
  { id: "count", header: "Count", accessorKey: "count" }
];

describe("applyFilters", () => {
  it("filters with contains", () => {
    expect(
      applyFilters(rows, columns, [
        { id: "name-filter", columnId: "name", operator: "contains", value: "alp" }
      ])
    ).toEqual([rows[0]]);
  });

  it("filters with equals", () => {
    expect(
      applyFilters(rows, columns, [
        { id: "name-filter", columnId: "name", operator: "equals", value: "Beta" }
      ])
    ).toEqual([rows[1]]);
  });

  it("filters with numeric comparison aliases", () => {
    expect(
      applyFilters(rows, columns, [
        { id: "count-filter", columnId: "count", operator: "gte", value: 5 }
      ])
    ).toEqual([rows[1], rows[2]]);
  });
});
