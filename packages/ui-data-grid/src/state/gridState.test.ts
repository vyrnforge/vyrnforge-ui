import { describe, expect, it } from "vitest";
import { gridStateActions } from "./gridState.actions";
import { createGridState } from "./gridState.merge";
import { gridStateReducer } from "./gridState.reducer";
import {
  pickPersistableGridState,
  selectGridQueryState
} from "./gridState.selectors";

describe("grid state module", () => {
  it("merges partial state without persisting selected rows by default", () => {
    const state = createGridState({
      search: "alpha",
      pagination: { pageIndex: 3, pageSize: 25 },
      selectedRowIds: [1, 2],
      density: "compact"
    });

    expect(state.pagination).toEqual({ pageIndex: 3, pageSize: 25 });
    expect(pickPersistableGridState(state)).toEqual({
      search: "alpha",
      filters: [],
      sort: [],
      pagination: { pageIndex: 0, pageSize: 25 },
      columnVisibility: {},
      columnOrder: [],
      columnSizing: {},
      grouping: [],
      density: "compact"
    });
  });

  it("applies reducer actions and resets search pagination", () => {
    const state = createGridState({
      search: "before",
      pagination: { pageIndex: 4, pageSize: 50 }
    });
    const nextState = gridStateReducer(
      state,
      gridStateActions.setSearch("after")
    );

    expect(nextState.search).toBe("after");
    expect(nextState.pagination).toEqual({ pageIndex: 0, pageSize: 50 });
  });

  it("resets state from a default state baseline", () => {
    const state = createGridState({
      search: "query",
      density: "comfortable",
      selectedRowIds: [9]
    });
    const resetState = gridStateReducer(
      state,
      gridStateActions.reset({ density: "compact" })
    );

    expect(resetState.search).toBe("");
    expect(resetState.density).toBe("compact");
    expect(resetState.selectedRowIds).toEqual([]);
  });

  it("selects query state without row data", () => {
    const state = createGridState({
      search: "workspace",
      grouping: ["status"],
      pagination: { pageIndex: 1, pageSize: 10 }
    });

    expect(selectGridQueryState(state)).toEqual({
      search: "workspace",
      filters: [],
      sort: [],
      grouping: ["status"],
      pagination: { pageIndex: 1, pageSize: 10 }
    });
  });
});
