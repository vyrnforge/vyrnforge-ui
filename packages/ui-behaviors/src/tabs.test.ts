import { describe, expect, it, vi } from "vitest";
import { createTabsController } from "./tabs";

const items = [
  { id: "summary" },
  { id: "billing", disabled: true },
  { id: "activity" },
];

describe("tabs behavior", () => {
  it("uses the first enabled item by default", () => {
    const controller = createTabsController({ items });
    expect(controller.getSnapshot()).toMatchObject({
      selectedValue: "summary",
      focusedValue: "summary",
      activationMode: "automatic",
    });
  });

  it("uses an explicit default and supports synchronized controlled values", () => {
    const controller = createTabsController({
      items,
      value: "summary",
      defaultValue: "activity",
    });
    expect(controller.getSnapshot().selectedValue).toBe("summary");
    expect(controller.select("activity", "pointer")).toBe(true);
    expect(controller.getSnapshot().selectedValue).toBe("summary");
    expect(controller.syncValue("activity")).toBe(true);
    expect(controller.syncValue("activity")).toBe(false);
  });

  it("moves focus, skips disabled tabs, and activates automatically", () => {
    const events = vi.fn();
    const controller = createTabsController({ items, onEvent: events });

    expect(controller.moveFocus("next")).toBe("activity");
    expect(controller.getSnapshot()).toMatchObject({
      focusedValue: "activity",
      selectedValue: "activity",
    });
    expect(events).toHaveBeenCalledWith(
      expect.objectContaining({ type: "value-change", reason: "keyboard" }),
    );
    expect(controller.moveFocus("previous")).toBe("summary");
    expect(controller.moveFocus("last")).toBe("activity");
    expect(controller.moveFocus("first")).toBe("summary");
  });

  it("supports manual activation mode", () => {
    const controller = createTabsController({
      items,
      activationMode: "manual",
      loop: false,
    });

    controller.moveFocus("next");
    expect(controller.getSnapshot()).toMatchObject({
      focusedValue: "activity",
      selectedValue: "summary",
    });
    controller.select("activity", "keyboard");
    expect(controller.getSnapshot().selectedValue).toBe("activity");
  });

  it("replaces items and exposes subscriptions", () => {
    const controller = createTabsController({ items });
    const snapshots = vi.fn();
    const events = vi.fn();
    const unsubscribeSnapshot = controller.subscribe(snapshots);
    const unsubscribeEvent = controller.subscribeEvent(events);

    expect(controller.replaceItems([{ id: "new" }])).toBe(true);
    expect(controller.getSnapshot().focusedValue).toBe("new");
    expect(snapshots).toHaveBeenCalled();
    expect(events).toHaveBeenCalled();

    unsubscribeSnapshot();
    unsubscribeEvent();
    expect(controller.setFocusedValue("new")).toBe(false);
    expect(controller.isDisabled("missing")).toBe(true);
  });

  it("dispatches renderer-neutral tab commands", () => {
    const controller = createTabsController({ items });

    controller.dispatch({ type: "move-focus", intent: "last" });
    expect(controller.getSnapshot()).toMatchObject({
      focusedValue: "activity",
      selectedValue: "activity",
    });

    controller.dispatch({ type: "set-focused", value: "summary" });
    controller.dispatch({ type: "select", value: "summary" });
    expect(controller.getSnapshot()).toMatchObject({
      focusedValue: "summary",
      selectedValue: "summary",
    });
  });

  it("keeps snapshot identity stable until state changes", () => {
    const controller = createTabsController({ items });

    const initialSnapshot = controller.getSnapshot();

    expect(controller.getSnapshot()).toBe(initialSnapshot);

    controller.moveFocus("next");

    const updatedSnapshot = controller.getSnapshot();

    expect(updatedSnapshot).not.toBe(initialSnapshot);
    expect(controller.getSnapshot()).toBe(updatedSnapshot);
  });
});
