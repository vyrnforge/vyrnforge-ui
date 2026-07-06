import { describe, expect, it } from "vitest";
import { applySearch } from "./applySearch";
import type { DataGridColumnDef } from "../types/column.types";

type Row = {
  id: number;
  name: string;
  status: string;
};

const rows: Row[] = [
  { id: 1, name: "Alpha", status: "Active" },
  { id: 2, name: "Beta", status: "Disabled" },
  { id: 3, name: "Gamma", status: "Active" }
];

const columns: DataGridColumnDef<Row>[] = [
  { id: "name", header: "Name", accessorKey: "name" },
  { id: "status", header: "Status", accessorKey: "status", searchable: false }
];

describe("applySearch", () => {
  it("filters rows by searchable columns", () => {
    expect(applySearch(rows, columns, "alp")).toEqual([rows[0]]);
  });

  it("ignores columns marked as not searchable", () => {
    expect(applySearch(rows, columns, "disabled")).toEqual([]);
  });

  it("returns original rows for an empty query", () => {
    expect(applySearch(rows, columns, " ")).toBe(rows);
  });
});
