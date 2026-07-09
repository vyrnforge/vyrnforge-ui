import { describe, expect, it } from "vitest";
import { resolveOrderedColumns } from "./columns";
import { applyFilters } from "./filtering";
import { buildGroupedRows } from "./grouping";
import { applyPagination } from "./pagination";
import { buildDataGridExportRequest } from "./exportRequest";
import { applySearch } from "./searching";
import { getRowIdValue } from "./selection";
import { applySorting } from "./sorting";
import { flattenGroupedRows } from "./rowModel";

describe("core grouped imports", () => {
  it("exposes pure core helpers from normalized folders", () => {
    expect(typeof resolveOrderedColumns).toBe("function");
    expect(typeof applyFilters).toBe("function");
    expect(typeof buildGroupedRows).toBe("function");
    expect(typeof applyPagination).toBe("function");
    expect(typeof buildDataGridExportRequest).toBe("function");
    expect(typeof applySearch).toBe("function");
    expect(typeof getRowIdValue).toBe("function");
    expect(typeof applySorting).toBe("function");
    expect(typeof flattenGroupedRows).toBe("function");
  });
});
