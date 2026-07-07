import { describe, expect, it } from "vitest";
import {
  clampColumnWidth,
  resetAllColumnSizes,
  resetColumnSize,
  resolveColumnSizing,
  resolveColumnWidth,
  setColumnSize
} from "./columnSizing";
import type { DataGridColumnDef } from "../types/column.types";

type Row = {
  id: number;
  name: string;
  email: string;
  locked: string;
};

const columns: DataGridColumnDef<Row>[] = [
  {
    id: "name",
    header: "Name",
    accessorKey: "name",
    width: 180,
    minWidth: 120,
    maxWidth: 260
  },
  {
    id: "email",
    header: "Email",
    accessorKey: "email",
    minWidth: 160
  },
  {
    id: "locked",
    header: "Locked",
    accessorKey: "locked",
    width: 140,
    resizable: false
  }
];

describe("columnSizing", () => {
  it("resolves width from sizing state before column width", () => {
    expect(resolveColumnWidth(columns[0], { name: 220 })).toBe(220);
  });

  it("falls back to column width", () => {
    expect(resolveColumnWidth(columns[0], {})).toBe(180);
  });

  it("clamps to minWidth", () => {
    expect(resolveColumnWidth(columns[0], { name: 40 })).toBe(120);
    expect(clampColumnWidth(40, { minWidth: 90 })).toBe(90);
  });

  it("clamps to maxWidth", () => {
    expect(resolveColumnWidth(columns[0], { name: 400 })).toBe(260);
  });

  it("ignores sizing updates for non-resizable columns", () => {
    expect(resolveColumnWidth(columns[2], { locked: 300 })).toBe(140);
    expect(setColumnSize(columns, {}, "locked", 300)).toEqual({});
  });

  it("ignores unknown column sizing keys", () => {
    expect(resolveColumnSizing(columns, { missing: 300, name: 220 })).toEqual({
      name: 220
    });
  });

  it("resets one column size", () => {
    expect(resetColumnSize({ name: 220, email: 300 }, "name")).toEqual({
      email: 300
    });
  });

  it("resets all column sizes", () => {
    expect(resetAllColumnSizes()).toEqual({});
  });
});
