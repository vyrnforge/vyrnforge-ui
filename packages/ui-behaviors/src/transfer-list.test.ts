import { describe, expect, it, vi } from "vitest";
import {
  createTransferListController,
  normalizeTransferListValues,
  partitionTransferListItems,
  type TransferListItem,
} from "./transfer-list";

const items: readonly TransferListItem[] = [
  { value: "iam", label: "Identity and Access Management" },
  { value: "atlas", label: "Atlas Intelligence" },
  { value: "gateway", label: "Gateway", disabled: true },
];

describe("transfer-list behavior", () => {
  it("normalizes values and partitions items in source order", () => {
    expect(normalizeTransferListValues(["missing", "atlas"], items)).toEqual([
      "atlas",
    ]);
    expect(partitionTransferListItems(items, ["atlas"])).toMatchObject({
      sourceItems: [items[0], items[2]],
      targetItems: [items[1]],
    });
  });

  it("selects visible values and moves enabled selections", () => {
    const controller = createTransferListController({ items });

    controller.setVisibleSelected("source", true);
    expect(controller.getSnapshot().sourceSelectedValues).toEqual([
      "iam",
      "atlas",
    ]);

    controller.moveSelected("target");
    expect(controller.getSnapshot().targetValues).toEqual(["iam", "atlas"]);
    expect(controller.getSnapshot().sourceSelectedValues).toEqual([]);
  });

  it("moves all enabled items without moving disabled items", () => {
    const controller = createTransferListController({ items });

    controller.moveAll("target");
    expect(controller.getSnapshot().targetValues).toEqual(["iam", "atlas"]);
    expect(
      controller.getSnapshot().sourceItems.map((item) => item.value),
    ).toEqual(["gateway"]);
  });

  it("filters each panel independently", () => {
    const controller = createTransferListController({
      items,
      defaultValue: ["atlas"],
    });

    controller.setQuery("source", "identity");
    controller.setQuery("target", "atlas");
    expect(controller.getSnapshot().visibleSourceItems[0]?.value).toBe("iam");
    expect(controller.getSnapshot().visibleTargetItems[0]?.value).toBe("atlas");
  });

  it("emits controlled move proposals and accepts synchronization", () => {
    const events = vi.fn();
    const controller = createTransferListController({
      items,
      value: ["atlas"],
      onEvent: events,
    });

    controller.toggleSelection("source", "iam");
    controller.moveSelected("target");
    expect(controller.getSnapshot().targetValues).toEqual(["atlas"]);
    expect(events).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "value-change",
        detail: expect.objectContaining({
          targetValues: ["iam", "atlas"],
          isControlled: true,
        }),
      }),
    );

    controller.syncValue(["iam", "atlas"]);
    expect(controller.getSnapshot().targetValues).toEqual(["iam", "atlas"]);
  });

  it("deduplicates items and respects explicit order", () => {
    const controller = createTransferListController({
      items: [
        { value: "late", label: "Late", order: 2 },
        { value: "early", label: "Early", order: 1 },
        { value: "late", label: "Duplicate", order: 0 },
      ],
      defaultValue: ["late", "late"],
    });

    expect(controller.getSnapshot().items.map((item) => item.value)).toEqual([
      "early",
      "late",
    ]);
    expect(controller.getSnapshot().targetValues).toEqual(["late"]);
  });

  it("toggles source and target selection and rejects disabled values", () => {
    const controller = createTransferListController({
      items,
      defaultValue: ["atlas"],
    });

    expect(controller.toggleSelection("source", "gateway")).toBe(false);
    expect(controller.toggleSelection("source", "iam")).toBe(true);
    expect(controller.toggleSelection("source", "iam")).toBe(true);
    expect(controller.toggleSelection("target", "atlas")).toBe(true);
    expect(controller.getSnapshot().targetSelectedValues).toEqual(["atlas"]);
  });

  it("selects and deselects visible values in each panel", () => {
    const controller = createTransferListController({
      items,
      defaultValue: ["atlas"],
    });

    controller.setVisibleSelected("source", true);
    expect(controller.getSnapshot().sourceSelectedValues).toEqual(["iam"]);
    controller.setVisibleSelected("source", false);
    expect(controller.getSnapshot().sourceSelectedValues).toEqual([]);

    controller.setVisibleSelected("target", true);
    expect(controller.getSnapshot().targetSelectedValues).toEqual(["atlas"]);
    controller.setVisibleSelected("target", false);
    expect(controller.getSnapshot().targetSelectedValues).toEqual([]);
  });

  it("moves selected items back to the source", () => {
    const controller = createTransferListController({
      items,
      defaultValue: ["iam", "atlas"],
    });

    controller.toggleSelection("target", "atlas");
    expect(controller.moveSelected("source")).toBe(true);
    expect(controller.getSnapshot().targetValues).toEqual(["iam"]);
    expect(controller.getSnapshot().targetSelectedValues).toEqual([]);
  });

  it("retains selection after moves when configured", () => {
    const controller = createTransferListController({
      items,
      clearSelectionAfterMove: false,
    });

    controller.toggleSelection("source", "iam");
    controller.moveSelected("target");
    expect(controller.getSnapshot().targetValues).toEqual(["iam"]);
    expect(controller.setClearSelectionAfterMove(true)).toBe(true);
    expect(controller.setClearSelectionAfterMove(true)).toBe(false);
  });

  it("returns false when no enabled values can move", () => {
    const controller = createTransferListController({
      items: [{ value: "disabled", label: "Disabled", disabled: true }],
    });

    expect(controller.moveSelected("target")).toBe(false);
    expect(controller.moveAll("target")).toBe(false);
    expect(controller.moveAll("source")).toBe(false);
  });

  it("moves all target values back to source", () => {
    const controller = createTransferListController({
      items,
      defaultValue: ["iam", "atlas"],
    });

    expect(controller.moveAll("source")).toBe(true);
    expect(controller.getSnapshot().targetValues).toEqual([]);
  });

  it("tracks active values and rejects invalid active targets", () => {
    const controller = createTransferListController({
      items,
      defaultValue: ["atlas"],
    });

    expect(controller.setActiveValue("source", "gateway")).toBe(false);
    expect(controller.setActiveValue("source", "iam")).toBe(true);
    expect(controller.setActiveValue("source", "iam")).toBe(false);
    expect(controller.setActiveValue("target", "atlas")).toBe(true);
    expect(controller.setActiveValue("target", null)).toBe(true);
  });

  it("covers query no-op and replacement reconciliation", () => {
    const controller = createTransferListController({
      items,
      defaultValue: ["atlas"],
    });

    expect(controller.setQuery("source", "")).toBe(false);
    expect(controller.setQuery("source", "iam")).toBe(true);
    expect(controller.setQuery("target", "atlas")).toBe(true);
    expect(controller.replaceItems(items)).toBe(false);
    expect(controller.replaceItems(items.slice(0, 1))).toBe(true);
    expect(controller.getSnapshot().targetValues).toEqual([]);
  });

  it("updates filter and synchronizes values without emitting", () => {
    const events = vi.fn();
    const controller = createTransferListController({
      items,
      onEvent: events,
    });
    const filter = (currentItems: readonly TransferListItem[]) =>
      currentItems.slice(0, 1);

    expect(controller.setFilter(filter)).toBe(true);
    expect(controller.setFilter(filter)).toBe(false);
    expect(controller.syncValue([])).toBe(false);
    expect(controller.syncValue(["atlas"])).toBe(true);
    expect(events).not.toHaveBeenCalled();
  });

  it("dispatches every public transfer-list command", () => {
    const controller = createTransferListController({ items });

    controller.dispatch({ type: "set-query", panel: "source", query: "iam" });
    controller.dispatch({ type: "set-active", panel: "source", value: "iam" });
    controller.dispatch({
      type: "toggle-selection",
      panel: "source",
      value: "iam",
    });
    controller.dispatch({
      type: "select-visible",
      panel: "source",
      selected: true,
    });
    controller.dispatch({ type: "move-selected", to: "target" });
    controller.dispatch({ type: "move-all", to: "source" });
    controller.dispatch({ type: "replace-items", items });
    controller.dispatch({
      type: "set-clear-selection-after-move",
      clear: false,
    });
    controller.dispatch({ type: "sync-value", value: ["atlas"] });

    expect(controller.getSnapshot().targetValues).toEqual(["atlas"]);
  });
});
