import { describe, expect, it } from "vitest";
import { applyFilters } from "./applyFilters";
import {
  buildGroupedRows,
  collapseAllGroups,
  expandAllGroups,
  flattenGroupedRows,
  getGroupLeafRowIds,
  normalizeGrouping,
  resolveGroupableColumns,
  toggleGroupExpanded
} from "./applyGrouping";
import { applyPagination } from "./applyPagination";
import { applySearch } from "./applySearch";
import { applySorting } from "./applySorting";
import type { DataGridColumnDef } from "../types/column.types";

type Row = {
  id: number;
  name: string;
  owner: string;
  status: string;
  score: number;
};

const rows: Row[] = [
  { id: 1, name: "Alpha", owner: "Ava", status: "Active", score: 20 },
  { id: 2, name: "Beta", owner: "Ava", status: "Pending", score: 40 },
  { id: 3, name: "Gamma", owner: "Ben", status: "Active", score: 30 },
  { id: 4, name: "Delta", owner: "Ben", status: "Pending", score: 10 }
];

const columns: DataGridColumnDef<Row>[] = [
  { id: "name", header: "Name", accessorKey: "name" },
  { id: "owner", header: "Owner", accessorKey: "owner" },
  { id: "status", header: "Status", accessorKey: "status" },
  { id: "score", header: "Score", accessorKey: "score" },
  {
    id: "locked",
    header: "Locked",
    accessorFn: () => "locked",
    groupable: false
  }
];

describe("applyGrouping", () => {
  it("normalizes grouping by ignoring unknown and non-groupable columns", () => {
    expect(
      normalizeGrouping(columns, ["missing", "locked", "status", "status"])
    ).toEqual(["status"]);
    expect(resolveGroupableColumns(columns).map((column) => column.id)).not.toContain(
      "locked"
    );
  });

  it("groups rows by one column with stable row counts and ids", () => {
    const groupedRows = buildGroupedRows({
      rows,
      columns,
      grouping: ["status"],
      getRowId: (row) => row.id
    });

    expect(groupedRows.map((row) => row.type)).toEqual(["group", "group"]);
    expect(groupedRows[0]).toMatchObject({
      type: "group",
      id: "0:status:Active",
      rowCount: 2,
      leafRowIds: [1, 3]
    });
  });

  it("groups rows by multiple columns", () => {
    const groupedRows = buildGroupedRows({
      rows,
      columns,
      grouping: ["owner", "status"],
      expandedGroupIds: ["0:owner:Ava"],
      getRowId: (row) => row.id
    });
    const firstGroup = groupedRows[0];

    expect(firstGroup.type).toBe("group");
    if (firstGroup.type === "group") {
      expect(firstGroup.children.map((row) => row.type)).toEqual([
        "group",
        "group"
      ]);
      expect(firstGroup.rowCount).toBe(2);
    }
  });

  it("flattens rows according to expanded group ids", () => {
    const collapsed = buildGroupedRows({
      rows,
      columns,
      grouping: ["status"],
      getRowId: (row) => row.id
    });
    const expanded = buildGroupedRows({
      rows,
      columns,
      grouping: ["status"],
      expandedGroupIds: ["0:status:Active"],
      getRowId: (row) => row.id
    });

    expect(flattenGroupedRows(collapsed)).toHaveLength(2);
    expect(flattenGroupedRows(expanded).map((row) => row.type)).toEqual([
      "group",
      "row",
      "row",
      "group"
    ]);
  });

  it("expands, collapses, and toggles group ids", () => {
    const groupedRows = buildGroupedRows({
      rows,
      columns,
      grouping: ["status"],
      getRowId: (row) => row.id
    });

    expect(expandAllGroups(groupedRows)).toEqual([
      "0:status:Active",
      "0:status:Pending"
    ]);
    expect(collapseAllGroups()).toEqual([]);
    expect(toggleGroupExpanded([], "0:status:Active")).toEqual([
      "0:status:Active"
    ]);
    expect(toggleGroupExpanded(["0:status:Active"], "0:status:Active")).toEqual(
      []
    );
  });

  it("supports search, filters, sorting, and display-row pagination before and after grouping", () => {
    const searchedRows = applySearch(rows, columns, "a");
    const filteredRows = applyFilters(searchedRows, columns, [
      {
        id: "status-active",
        columnId: "status",
        operator: "equals",
        value: "Active"
      }
    ]);
    const sortedRows = applySorting(filteredRows, columns, [
      { columnId: "score", direction: "desc" }
    ]);
    const groupedRows = buildGroupedRows({
      rows: sortedRows,
      columns,
      grouping: ["status"],
      expandedGroupIds: ["0:status:Active"],
      getRowId: (row) => row.id
    });
    const displayRows = flattenGroupedRows(groupedRows);

    expect(getGroupLeafRowIds(groupedRows)).toEqual([3, 1]);
    expect(applyPagination(displayRows, { pageIndex: 0, pageSize: 2 })).toHaveLength(
      2
    );
  });
});
