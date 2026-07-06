import { describe, expect, it } from "vitest";
import { applySorting } from "./applySorting";
import type { DataGridColumnDef } from "../types/column.types";

type Row = {
  id: number;
  name: string;
  count: number;
};

const rows: Row[] = [
  { id: 1, name: "Beta", count: 2 },
  { id: 2, name: "Alpha", count: 3 },
  { id: 3, name: "Gamma", count: 1 }
];

const columns: DataGridColumnDef<Row>[] = [
  { id: "name", header: "Name", accessorKey: "name" },
  { id: "count", header: "Count", accessorKey: "count" }
];

describe("applySorting", () => {
  it("sorts ascending by a single column", () => {
    expect(applySorting(rows, columns, [{ columnId: "name", direction: "asc" }])).toEqual([
      rows[1],
      rows[0],
      rows[2]
    ]);
  });

  it("sorts descending by a single column", () => {
    expect(applySorting(rows, columns, [{ columnId: "count", direction: "desc" }])).toEqual([
      rows[1],
      rows[0],
      rows[2]
    ]);
  });

  it("does not mutate the input rows", () => {
    applySorting(rows, columns, [{ columnId: "name", direction: "asc" }]);
    expect(rows[0].name).toBe("Beta");
  });
});
