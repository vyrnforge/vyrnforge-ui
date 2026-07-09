import { describe, expect, it } from "vitest";
import { buildDataGridExportRequest } from "./buildExportRequest";

describe("buildDataGridExportRequest adapter", () => {
  it("builds an export request contract without generating a file", () => {
    const request = buildDataGridExportRequest({
      tableId: "users",
      columns: [
        { id: "name", header: "Name", accessorKey: "name" },
        { id: "email", header: "Email", accessorKey: "email", hidden: true }
      ],
      columnVisibility: { email: true },
      filters: [],
      search: "",
      sort: [{ columnId: "name", direction: "asc" }],
      grouping: [],
      pagination: { pageIndex: 0, pageSize: 10 },
      selectedRowIds: [1],
      scope: "selected_rows",
      format: "csv"
    });

    expect(request).toMatchObject({
      tableId: "users",
      columns: [
        { id: "name", header: "Name", visible: true },
        { id: "email", header: "Email", visible: false }
      ],
      sort: [{ columnId: "name", direction: "asc" }],
      scope: "selected_rows",
      format: "csv"
    });
    expect(typeof request.requestedAt).toBe("string");
  });
});
