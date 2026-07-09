import { describe, expect, it } from "vitest";
import { buildDataGridServerQuery } from "./buildServerQuery";

describe("buildDataGridServerQuery", () => {
  it("builds a query contract without fetching data", () => {
    expect(
      buildDataGridServerQuery({
        tableId: "users",
        search: "alpha",
        filters: [],
        sort: [{ columnId: "name", direction: "asc" }],
        grouping: ["status"],
        pagination: { pageIndex: 2, pageSize: 25 }
      })
    ).toEqual({
      tableId: "users",
      search: "alpha",
      filters: [],
      sort: [{ columnId: "name", direction: "asc" }],
      grouping: ["status"],
      pagination: { pageIndex: 2, pageSize: 25 }
    });
  });
});
