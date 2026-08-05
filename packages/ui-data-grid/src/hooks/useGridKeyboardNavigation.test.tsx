// @vitest-environment jsdom

import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { DataGridRowId } from "../types/dataGrid.types";
import { useGridKeyboardNavigation } from "./useGridKeyboardNavigation";

type HarnessProps = {
  rows?: readonly { id: string; selectable: boolean }[];
  columnIds?: readonly string[];
  selectionEnabled?: boolean;
  onActivateRow?: (rowId: DataGridRowId) => void;
  onToggleRowSelection?: (rowId: DataGridRowId) => void;
};

function Harness({
  rows = [
    { id: "row-1", selectable: true },
    { id: "row-2", selectable: false },
  ],
  columnIds = ["name", "status"],
  selectionEnabled = true,
  onActivateRow = () => undefined,
  onToggleRowSelection = () => undefined,
}: HarnessProps) {
  const [, renderAgain] = useState(0);
  const { activeCell, getCellProps } = useGridKeyboardNavigation({
    rows,
    columnIds,
    selectionEnabled,
    onActivateRow,
    onToggleRowSelection,
  });

  return (
    <>
      <output data-active-cell>
        {activeCell
          ? `${String(activeCell.rowId)}:${activeCell.columnId}`
          : "none"}
      </output>
      <button type="button" onClick={() => renderAgain((value) => value + 1)}>
        Render
      </button>
      <table>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={row.id}>
              {columnIds.map((columnId, columnIndex) => {
                const cellProps = getCellProps(
                  row.id,
                  columnId,
                  rowIndex,
                  columnIndex,
                );

                return (
                  <td
                    key={columnId}
                    data-cell={`${row.id}:${columnId}`}
                    {...cellProps}
                  >
                    <button type="button">Nested</button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

const setReactActEnvironment = (value: boolean) => {
  (
    globalThis as typeof globalThis & {
      IS_REACT_ACT_ENVIRONMENT?: boolean;
    }
  ).IS_REACT_ACT_ENVIRONMENT = value;
};

const keyDown = (
  element: Element,
  key: string,
  init: KeyboardEventInit = {},
) => {
  act(() => {
    element.dispatchEvent(
      new KeyboardEvent("keydown", {
        bubbles: true,
        cancelable: true,
        key,
        ...init,
      }),
    );
  });
};

describe("useGridKeyboardNavigation", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    setReactActEnvironment(true);
    HTMLElement.prototype.scrollIntoView = vi.fn();
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    vi.restoreAllMocks();
    setReactActEnvironment(false);
  });

  const render = (props: HarnessProps = {}) => {
    act(() => root.render(<Harness {...props} />));
  };

  const cell = (id: string) => {
    const element = container.querySelector<HTMLTableCellElement>(
      `[data-cell="${id}"]`,
    );
    expect(element).not.toBeNull();
    return element!;
  };

  it("maintains one tab stop and moves focus across the grid", () => {
    render();
    const first = cell("row-1:name");
    const second = cell("row-1:status");
    const last = cell("row-2:status");

    expect(first.tabIndex).toBe(0);
    expect(second.tabIndex).toBe(-1);

    act(() => first.focus());
    keyDown(first, "ArrowRight");
    expect(document.activeElement).toBe(second);
    expect(HTMLElement.prototype.scrollIntoView).toHaveBeenCalled();

    keyDown(second, "End", { ctrlKey: true });
    expect(document.activeElement).toBe(last);
    expect(container.querySelector("[data-active-cell]")?.textContent).toBe(
      "row-2:status",
    );
  });

  it("activates rows and toggles only selectable rows", () => {
    const onActivateRow = vi.fn();
    const onToggleRowSelection = vi.fn();
    render({ onActivateRow, onToggleRowSelection });

    const selectable = cell("row-1:name");
    keyDown(selectable, " ");
    keyDown(selectable, "Enter");
    expect(onToggleRowSelection).toHaveBeenCalledWith("row-1");
    expect(onActivateRow).toHaveBeenCalledWith("row-1");

    const disabled = cell("row-2:name");
    keyDown(disabled, " ");
    expect(onToggleRowSelection).toHaveBeenCalledTimes(1);
  });

  it("ignores nested controls and disabled selection mode", () => {
    const onActivateRow = vi.fn();
    const onToggleRowSelection = vi.fn();
    render({
      selectionEnabled: false,
      onActivateRow,
      onToggleRowSelection,
    });

    const first = cell("row-1:name");
    keyDown(first, " ");
    expect(onToggleRowSelection).not.toHaveBeenCalled();

    const nested = first.querySelector("button")!;
    keyDown(nested, "Enter");
    expect(onActivateRow).not.toHaveBeenCalled();
  });

  it("resets the active cell when rows or columns change", () => {
    render();
    const last = cell("row-2:status");
    act(() => last.focus());
    expect(container.querySelector("[data-active-cell]")?.textContent).toBe(
      "row-2:status",
    );

    act(() =>
      root.render(
        <Harness
          rows={[{ id: "row-3", selectable: true }]}
          columnIds={["summary"]}
        />,
      ),
    );

    expect(container.querySelector("[data-active-cell]")?.textContent).toBe(
      "row-3:summary",
    );
    expect(cell("row-3:summary").tabIndex).toBe(0);
  });

  it("supports an empty grid without exposing an active cell", () => {
    render({ rows: [], columnIds: [] });
    expect(container.querySelector("[data-active-cell]")?.textContent).toBe(
      "none",
    );
  });
});
