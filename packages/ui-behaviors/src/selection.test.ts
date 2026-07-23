import { describe, expect, it, vi } from "vitest";

import { createSelectionController } from "./selection";

describe("selection controller", () => {
  it("supports single selection and optional empty prevention", () => {
    const controller = createSelectionController<string>({
      mode: "single",
      defaultSelectedKeys: ["a", "b"],
      allowEmpty: false,
    });

    expect(controller.getSnapshot().selectedKeys).toEqual(["a"]);
    expect(controller.select("b")).toBe(true);
    expect(controller.getSnapshot().selectedKeys).toEqual(["b"]);
    expect(controller.toggle("b")).toBe(false);
    expect(controller.deselect("b")).toBe(false);
    expect(controller.clear()).toBe(false);
  });

  it("supports multiple select, deselect, toggle, replace, and clear", () => {
    const events = vi.fn();
    const controller = createSelectionController<string>({
      defaultSelectedKeys: ["a"],
      onSelectionChange: events,
    });

    expect(controller.select("b")).toBe(true);
    expect(controller.select("b")).toBe(false);
    expect(controller.toggle("a")).toBe(true);
    expect(controller.deselect("missing")).toBe(false);
    expect(controller.replace(["c", "c", "d"])).toBe(true);
    expect(controller.getSnapshot().selectedKeys).toEqual(["c", "d"]);
    expect(controller.clear()).toBe(true);
    expect(controller.clear()).toBe(false);

    const lastEvent = events.mock.calls[events.mock.calls.length - 1]?.[0];

    expect(lastEvent).toMatchObject({
      type: "selection-change",
      detail: {
        operation: "clear",
        selectedKeys: [],
        removedKeys: ["c", "d"],
      },
      reason: "clear",
    });
  });

  it("skips disabled keys and selects ordered ranges", () => {
    const controller = createSelectionController<string>({
      orderedKeys: ["a", "b", "c", "d"],
      isDisabled: (key) => key === "c",
    });

    expect(controller.select("c")).toBe(false);
    expect(controller.select("a")).toBe(true);
    expect(controller.selectRange("d")).toBe(true);
    expect(controller.getSnapshot().selectedKeys).toEqual(["a", "b", "d"]);
    expect(controller.selectRange("b", { reason: "keyboard" })).toBe(true);
    expect(controller.getSnapshot().selectedKeys).toEqual(["a", "b"]);
  });

  it("falls back to the target when range order is unavailable", () => {
    const controller = createSelectionController<number>({
      defaultSelectedKeys: [1],
    });

    expect(controller.selectRange(5)).toBe(true);
    expect(controller.getSnapshot().selectedKeys).toEqual([5]);
  });

  it("emits controlled proposals and synchronizes external keys", () => {
    const changes = vi.fn();
    const snapshots = vi.fn();
    const controller = createSelectionController<string>({
      selectedKeys: ["a"],
      onSelectionChange: changes,
    });
    controller.subscribe(snapshots);

    expect(controller.toggle("b")).toBe(true);
    expect(controller.getSnapshot().selectedKeys).toEqual(["a"]);
    expect(changes.mock.calls[0][0].detail.selectedKeys).toEqual(["a", "b"]);
    expect(controller.syncSelectedKeys(["a", "b"])).toBe(true);
    expect(controller.syncSelectedKeys(["a", "b"])).toBe(false);
    expect(controller.isSelected("b")).toBe(true);
    expect(snapshots).toHaveBeenCalled();
  });

  it("updates and validates the range anchor", () => {
    const controller = createSelectionController<string>({
      orderedKeys: () => ["a", "b", "c"],
      isDisabled: (key) => key === "b",
    });

    expect(controller.setAnchorKey("b")).toBe(false);
    expect(controller.setAnchorKey("a")).toBe(true);
    expect(controller.setAnchorKey("a")).toBe(false);
    expect(controller.setAnchorKey(null)).toBe(true);
  });

  it("treats an explicit undefined selectedKeys property as controlled", () => {
    const changes = vi.fn();
    const controller = createSelectionController<string>({
      selectedKeys: undefined,
      onSelectionChange: changes,
    });

    expect(controller.getSnapshot().isControlled).toBe(true);
    expect(controller.select("a")).toBe(true);
    expect(controller.getSnapshot().selectedKeys).toEqual([]);
    expect(changes.mock.calls[0][0].detail.selectedKeys).toEqual(["a"]);
  });

  it("supports additive ranges and anchor-only snapshot changes", () => {
    const controller = createSelectionController<string>({
      defaultSelectedKeys: ["a", "d"],
      orderedKeys: ["a", "b", "c", "d"],
    });

    expect(controller.setAnchorKey("b")).toBe(true);
    expect(
      controller.selectRange("c", { additive: true, reason: "keyboard" }),
    ).toBe(true);
    expect(controller.getSnapshot().selectedKeys).toEqual(["a", "d", "b", "c"]);

    expect(controller.setAnchorKey("a")).toBe(true);
    expect(controller.select("a")).toBe(false);
    expect(controller.getSnapshot().anchorKey).toBe("a");
  });

  it("keeps a valid anchor while synchronizing selection", () => {
    const controller = createSelectionController<string>({
      selectedKeys: ["a", "b"],
    });

    controller.setAnchorKey("b");
    expect(controller.syncSelectedKeys(["b", "c"])).toBe(true);
    expect(controller.getSnapshot().anchorKey).toBe("b");
  });

  it("dispatches every command type", () => {
    const controller = createSelectionController<number>({
      orderedKeys: [1, 2, 3],
    });

    controller.dispatch({ type: "select", key: 1 });
    controller.dispatch({ type: "toggle", key: 2 });
    controller.dispatch({ type: "range", key: 3, additive: true });
    controller.dispatch({ type: "deselect", key: 2 });
    controller.dispatch({ type: "replace", keys: [3] });
    controller.dispatch({ type: "set-anchor", key: 3 });
    controller.dispatch({ type: "sync", keys: [1, 2] });
    controller.dispatch({ type: "clear" });

    expect(controller.getSnapshot().selectedKeys).toEqual([]);
  });

  it("uses range semantics in single mode", () => {
    const controller = createSelectionController<string>({
      mode: "single",
      orderedKeys: ["a", "b"],
    });

    expect(controller.selectRange("b")).toBe(true);
    expect(controller.getSnapshot().selectedKeys).toEqual(["b"]);
  });

  it("does not replace the last required selection with an empty set", () => {
    const controller = createSelectionController<string>({
      defaultSelectedKeys: ["a"],
      allowEmpty: false,
    });

    expect(controller.replace([])).toBe(false);
  });
});
