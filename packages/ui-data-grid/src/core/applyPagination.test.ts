import { describe, expect, it } from "vitest";
import { applyPagination } from "./applyPagination";

describe("applyPagination", () => {
  it("returns the requested page slice", () => {
    expect(
      applyPagination([1, 2, 3, 4, 5], {
        pageIndex: 1,
        pageSize: 2
      })
    ).toEqual([3, 4]);
  });

  it("returns an empty page when the index is beyond the rows", () => {
    expect(
      applyPagination([1, 2], {
        pageIndex: 2,
        pageSize: 2
      })
    ).toEqual([]);
  });
});
