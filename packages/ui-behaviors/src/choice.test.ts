import { describe, expect, it, vi } from "vitest";
import { createChoiceController } from "./choice";

const items = [
  { value: "first" },
  { value: "disabled", disabled: true },
  { value: "last" },
] as const;

describe("choice behavior", () => {
  it("deduplicates, orders, and exposes enabled values", () => {
    const controller = createChoiceController<string>({
      items: [
        { value: "late", order: 2 },
        { value: "early", order: 1 },
        { value: "late", order: 0 },
        { value: "blocked", disabled: true },
      ],
    });

    expect(controller.getSnapshot().items.map((item) => item.value)).toEqual([
      "early",
      "late",
      "blocked",
    ]);
    expect(controller.getSnapshot().enabledValues).toEqual(["early", "late"]);
  });

  it("skips disabled values during looping active navigation", () => {
    const controller = createChoiceController<string>({
      items,
      defaultValue: "first",
      activeValue: "first",
    });

    expect(controller.moveActive("next", { select: true })).toBe("last");
    expect(controller.getSnapshot()).toMatchObject({
      value: "last",
      activeValue: "last",
    });
    expect(controller.moveActive("next")).toBe("first");
    expect(controller.moveActive("previous")).toBe("last");
    expect(controller.moveActive("first")).toBe("first");
    expect(controller.moveActive("last")).toBe("last");
  });

  it("clamps non-looping movement and starts from a missing active value", () => {
    const controller = createChoiceController<string>({ items, loop: false });

    expect(controller.moveActive("next", { loop: false })).toBe("first");
    expect(controller.moveActive("previous", { loop: false })).toBe("first");
    expect(controller.moveActive("last", { loop: false })).toBe("last");
    expect(controller.moveActive("next", { loop: false })).toBe("last");
  });

  it("returns null when no enabled item exists", () => {
    const controller = createChoiceController<string>({
      items: [{ value: "blocked", disabled: true }],
    });
    expect(controller.moveActive("next")).toBeNull();
  });

  it("rejects disabled selection and invalid activity", () => {
    const controller = createChoiceController<string>({ items });
    expect(controller.select("disabled")).toBe(false);
    expect(controller.setActiveValue("disabled")).toBe(false);
    expect(controller.getSnapshot().value).toBeNull();
  });

  it("does not emit a duplicate value change for the selected item", () => {
    const events = vi.fn();
    const controller = createChoiceController<string>({
      items,
      defaultValue: "first",
      activeValue: "last",
      onEvent: events,
    });

    expect(controller.select("first", "pointer")).toBe(false);
    expect(controller.getSnapshot().activeValue).toBe("first");
    expect(events).toHaveBeenCalledWith(
      expect.objectContaining({ type: "active-change" }),
    );
  });

  it("supports controlled proposals and external synchronization", () => {
    const events = vi.fn();
    const controller = createChoiceController<string>({
      items,
      value: "first",
      onEvent: events,
    });

    expect(controller.select("last", "keyboard")).toBe(true);
    expect(controller.getSnapshot().value).toBe("first");
    expect(events).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "value-change",
        reason: "keyboard",
        detail: expect.objectContaining({ value: "last", isControlled: true }),
      }),
    );
    expect(controller.syncValue("last")).toBe(true);
    expect(controller.syncValue("last")).toBe(false);
  });

  it("clears only when empty selection is allowed", () => {
    const allowed = createChoiceController<string>({
      items,
      defaultValue: "first",
    });
    expect(allowed.clear()).toBe(true);
    expect(allowed.getSnapshot().value).toBeNull();
    expect(allowed.clear()).toBe(false);

    const required = createChoiceController<string>({
      items,
      defaultValue: "first",
      allowEmpty: false,
    });
    expect(required.clear()).toBe(false);
  });

  it("reconciles selection and activity when items change", () => {
    const events = vi.fn();
    const controller = createChoiceController<string>({
      items,
      defaultValue: "last",
      activeValue: "last",
      onEvent: events,
    });

    expect(controller.replaceItems(items)).toBe(false);
    expect(controller.replaceItems([{ value: "first" }])).toBe(true);

    expect(controller.getSnapshot()).toMatchObject({
      value: null,
      activeValue: "first",
    });
    expect(events).toHaveBeenCalledWith(
      expect.objectContaining({ type: "items-change" }),
    );
    expect(events).toHaveBeenCalledWith(
      expect.objectContaining({ type: "value-change" }),
    );
  });

  it("supports all command forms", () => {
    const controller = createChoiceController<string>({ items });
    controller.dispatch({ type: "select", value: "first" });
    controller.dispatch({ type: "set-active", value: "last" });
    controller.dispatch({ type: "move-active", intent: "previous" });
    controller.dispatch({ type: "sync", value: "last" });
    controller.dispatch({
      type: "replace-items",
      items: [{ value: "last" }, { value: "new" }],
    });
    controller.dispatch({ type: "clear" });

    expect(controller.getSnapshot()).toMatchObject({ value: null });
  });
});
