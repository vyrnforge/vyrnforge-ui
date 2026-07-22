import { describe, expect, it } from "vitest";
import { resolveGridNavigationTarget } from "./gridKeyboardNavigation";

describe("resolveGridNavigationTarget", () => {
  it("moves between adjacent cells without wrapping", () => {
    expect(
      resolveGridNavigationTarget({
        key: "ArrowRight",
        rowIndex: 1,
        columnIndex: 1,
        rowCount: 3,
        columnCount: 4,
      }),
    ).toEqual({ rowIndex: 1, columnIndex: 2 });

    expect(
      resolveGridNavigationTarget({
        key: "ArrowUp",
        rowIndex: 0,
        columnIndex: 2,
        rowCount: 3,
        columnCount: 4,
      }),
    ).toEqual({ rowIndex: 0, columnIndex: 2 });
  });

  it("moves to row and grid boundaries with Home and End", () => {
    expect(
      resolveGridNavigationTarget({
        key: "Home",
        rowIndex: 2,
        columnIndex: 3,
        rowCount: 4,
        columnCount: 5,
      }),
    ).toEqual({ rowIndex: 2, columnIndex: 0 });

    expect(
      resolveGridNavigationTarget({
        key: "End",
        rowIndex: 1,
        columnIndex: 0,
        rowCount: 4,
        columnCount: 5,
        ctrlKey: true,
      }),
    ).toEqual({ rowIndex: 3, columnIndex: 4 });
  });

  it("returns null for unsupported keys or an empty grid", () => {
    expect(
      resolveGridNavigationTarget({
        key: "PageDown",
        rowIndex: 0,
        columnIndex: 0,
        rowCount: 3,
        columnCount: 3,
      }),
    ).toBeNull();

    expect(
      resolveGridNavigationTarget({
        key: "ArrowDown",
        rowIndex: 0,
        columnIndex: 0,
        rowCount: 0,
        columnCount: 3,
      }),
    ).toBeNull();
  });
});
