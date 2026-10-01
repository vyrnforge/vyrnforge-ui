import { describe, expect, it } from "vitest";
import type { DataGridExportRequest } from "../types/export.types";
import { buildDataGridExportPreview } from "./exportPreview";

const request: DataGridExportRequest = {
  tableId: "orders",
  columns: [
    { id: "id", header: "ID", visible: true },
    { id: "status", header: "Status", visible: true },
    { id: "internal", header: "Internal", visible: false },
  ],
  filters: [
    {
      id: "status-filter",
      columnId: "status",
      operator: "equals",
      value: "open",
    },
  ],
  search: "acme",
  sorting: [{ columnId: "id", direction: "desc" }],
  sort: [{ columnId: "id", direction: "desc" }],
  grouping: ["status"],
  pagination: { pageIndex: 2, pageSize: 25 },
  selectedRowIds: ["order-1", "order-2"],
  scope: "selected_rows",
  format: "xlsx",
  requestedAt: "2026-10-01T00:00:00.000Z",
};

describe("buildDataGridExportPreview", () => {
  it("summarizes the canonical export request without file-generation state", () => {
    expect(buildDataGridExportPreview(request)).toEqual({
      tableId: "orders",
      format: "xlsx",
      scope: "selected_rows",
      visibleColumns: [
        { id: "id", header: "ID", visible: true },
        { id: "status", header: "Status", visible: true },
      ],
      hiddenColumnCount: 1,
      filterCount: 1,
      hasSearch: true,
      sortCount: 1,
      groupingCount: 1,
      selectedRowCount: 2,
      pagination: { pageIndex: 2, pageSize: 25 },
    });
  });

  it("does not expose mutable references back to the request", () => {
    const preview = buildDataGridExportPreview(request);

    preview.visibleColumns[0].header = "Changed";
    preview.pagination.pageIndex = 99;

    expect(request.columns[0].header).toBe("ID");
    expect(request.pagination.pageIndex).toBe(2);
  });

  it("keeps export scope explicit for non-selection workflows", () => {
    expect(
      buildDataGridExportPreview({
        ...request,
        scope: "current_page",
        selectedRowIds: [],
        search: "   ",
        filters: [],
        sorting: [],
        sort: [],
        grouping: [],
      }),
    ).toMatchObject({
      scope: "current_page",
      selectedRowCount: 0,
      hasSearch: false,
      filterCount: 0,
      sortCount: 0,
      groupingCount: 0,
    });
  });
});
