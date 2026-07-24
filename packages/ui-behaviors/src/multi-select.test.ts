import { describe, expect, it, vi } from "vitest";
import {
  createMultiSelectController,
  type MultiSelectItem,
} from "./multi-select";

const items: readonly MultiSelectItem[] = [
  { value: "iam", text: "Identity and Access Management" },
  { value: "atlas", text: "Atlas Intelligence" },
  { value: "gateway", text: "Gateway", disabled: true },
];

describe("multi-select behavior", () => {
  it("filters options and reconciles active values", () => {
    const controller = createMultiSelectController({ items });
    controller.setQuery("atlas");
    controller.setOpen(true);

    expect(controller.getSnapshot().filteredItems).toHaveLength(1);
    expect(controller.getSnapshot().activeValue).toBe("atlas");
  });

  it("toggles enabled values and rejects disabled values", () => {
    const controller = createMultiSelectController({ items });

    expect(controller.toggle("gateway")).toBe(false);
    expect(controller.toggle("iam")).toBe(true);
    expect(controller.getSnapshot().selectedValues).toEqual(["iam"]);
    controller.toggle("iam");
    expect(controller.getSnapshot().selectedValues).toEqual([]);
  });

  it("moves active intent through enabled filtered items", () => {
    const controller = createMultiSelectController({ items });
    controller.setOpen(true);

    expect(controller.getSnapshot().activeValue).toBe("iam");
    expect(controller.moveActive("next")).toBe("atlas");
    expect(controller.moveActive("next")).toBe("iam");
  });

  it("clears selected values", () => {
    const controller = createMultiSelectController({
      items,
      defaultValues: ["iam", "atlas"],
    });

    controller.clear();
    expect(controller.getSnapshot().selectedValues).toEqual([]);
  });

  it("emits controlled selection proposals", () => {
    const events = vi.fn();
    const controller = createMultiSelectController({
      items,
      values: ["iam"],
      onEvent: events,
    });

    controller.toggle("atlas");
    expect(controller.getSnapshot().selectedValues).toEqual(["iam"]);
    expect(events).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "selection-change",
        detail: expect.objectContaining({
          selectedValues: ["iam", "atlas"],
          isControlled: true,
        }),
      }),
    );
  });

  it("normalizes duplicate items and respects explicit order", () => {
    const controller = createMultiSelectController({
      items: [
        { value: "late", text: "Late", order: 2 },
        { value: "early", text: "Early", order: 1 },
        { value: "late", text: "Duplicate", order: 0 },
      ],
      defaultValues: ["late", "late"],
    });

    expect(controller.getSnapshot().items.map((item) => item.value)).toEqual([
      "early",
      "late",
    ]);
    expect(controller.getSnapshot().selectedValues).toEqual(["late"]);
  });

  it("supports first, last, previous, and empty movement", () => {
    const controller = createMultiSelectController({ items });
    controller.setOpen(true);

    expect(controller.moveActive("last")).toBe("atlas");
    expect(controller.moveActive("previous")).toBe("iam");
    expect(controller.moveActive("first")).toBe("iam");

    controller.replaceItems([]);
    expect(controller.moveActive("next")).toBeNull();
  });

  it("rejects invalid active values and closes cleanly", () => {
    const controller = createMultiSelectController({ items });

    expect(controller.setActiveValue("gateway")).toBe(false);
    controller.setOpen(true);
    expect(controller.setOpen(true, { direction: -1 })).toBe(true);
    expect(controller.getSnapshot().activeValue).toBe("atlas");
    expect(controller.setOpen(false)).toBe(true);
    expect(controller.setOpen(false)).toBe(false);
  });

  it("updates filter and item collections", () => {
    const controller = createMultiSelectController({ items });
    const filter = (currentItems: readonly MultiSelectItem[]) =>
      currentItems.slice(0, 1);

    expect(controller.setFilter(filter)).toBe(true);
    expect(controller.setFilter(filter)).toBe(false);
    expect(controller.getSnapshot().filteredItems).toHaveLength(1);
    expect(controller.replaceItems(items)).toBe(false);
    expect(
      controller.replaceItems([...items, { value: "report", text: "Report" }]),
    ).toBe(true);
  });

  it("synchronizes controlled values without emitting", () => {
    const events = vi.fn();
    const controller = createMultiSelectController({
      items,
      values: ["iam"],
      onEvent: events,
    });

    expect(controller.syncValues(["iam"])).toBe(false);
    expect(controller.syncValues(["atlas"])).toBe(true);
    expect(controller.getSnapshot().selectedValues).toEqual(["atlas"]);
    expect(events).not.toHaveBeenCalled();
  });

  it("covers query no-op and direct active-value paths", () => {
    const controller = createMultiSelectController({ items });

    expect(controller.setQuery("")).toBe(false);
    expect(controller.setQuery("identity")).toBe(true);
    controller.setOpen(true);
    expect(controller.setActiveValue("iam")).toBe(false);
    expect(controller.setActiveValue(null)).toBe(true);
  });

  it("dispatches every public multi-select command", () => {
    const controller = createMultiSelectController({ items });

    controller.dispatch({ type: "set-query", query: "i" });
    controller.dispatch({ type: "set-open", open: true, direction: 1 });
    controller.dispatch({ type: "move-active", intent: "last" });
    controller.dispatch({ type: "set-active", value: "iam" });
    controller.dispatch({ type: "toggle", value: "iam" });
    controller.dispatch({ type: "clear" });
    controller.dispatch({ type: "replace-items", items });
    controller.dispatch({ type: "sync-values", values: ["atlas"] });

    expect(controller.getSnapshot().selectedValues).toEqual(["atlas"]);
  });
});
