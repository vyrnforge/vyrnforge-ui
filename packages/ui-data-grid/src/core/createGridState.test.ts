import { describe, expect, it } from "vitest";
import { createGridState } from "./createGridState";

describe("createGridState", () => {
  it("normalizes undefined selected row ids to an empty array", () => {
    const state = createGridState({
      selectedRowIds: undefined
    });

    expect(state.selectedRowIds).toEqual([]);
  });
});
