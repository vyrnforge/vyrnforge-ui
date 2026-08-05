import { describe, expect, it, vi } from "vitest";

import { createCollectionController } from "./collection";

describe("collection controller", () => {
  it("orders items and skips disabled items during navigation", () => {
    const controller = createCollectionController({
      initialItems: [
        { key: "third", data: 3, order: 30 },
        { key: "first", data: 1, order: 10 },
        { key: "disabled", data: 2, order: 20, disabled: true },
      ],
      loop: true,
    });

    expect(controller.getSnapshot().items.map((item) => item.key)).toEqual([
      "first",
      "disabled",
      "third",
    ]);
    expect(controller.getSnapshot().enabledKeys).toEqual(["first", "third"]);

    expect(controller.moveActive("next")).toBe("first");
    expect(controller.moveActive("next")).toBe("third");
    expect(controller.moveActive("next")).toBe("first");
    expect(controller.moveActive("previous")).toBe("third");
    expect(controller.moveActive("first")).toBe("first");
    expect(controller.moveActive("last")).toBe("third");
  });

  it("clamps navigation when looping is disabled", () => {
    const controller = createCollectionController({
      initialItems: [
        { key: 1, data: "a" },
        { key: 2, data: "b" },
      ],
      activeKey: 1,
    });

    expect(controller.moveActive("previous")).toBe(1);
    expect(controller.moveActive("last")).toBe(2);
    expect(controller.moveActive("next")).toBe(2);
  });

  it("registers, updates, removes, and reconciles active state", () => {
    const events = vi.fn();
    const snapshots = vi.fn();
    const controller = createCollectionController<string, number>({
      initialItems: [
        { key: "a", data: 1 },
        { key: "b", data: 2 },
      ],
      activeKey: "b",
      onEvent: events,
    });
    controller.subscribe(snapshots);

    expect(controller.upsertItem({ key: "b", data: 2 })).toBe(false);
    expect(controller.upsertItem({ key: "b", data: 20, disabled: true })).toBe(
      true,
    );
    expect(controller.getSnapshot().activeKey).toBe("a");
    expect(controller.getItem("b")).toMatchObject({
      key: "b",
      data: 20,
      disabled: true,
    });

    expect(controller.upsertItem({ key: "c", data: 3 })).toBe(true);
    expect(controller.removeItem("missing")).toBe(false);
    expect(controller.removeItem("a")).toBe(true);
    expect(controller.getSnapshot().activeKey).toBe("c");
    expect(events).toHaveBeenCalled();
    expect(snapshots).toHaveBeenCalled();
  });

  it("validates active keys and handles empty collections", () => {
    const controller = createCollectionController<string, null>();

    expect(controller.setActiveKey("missing")).toBe(false);
    expect(controller.moveActive("next")).toBeNull();
    expect(controller.clear()).toBe(false);

    controller.upsertItem({ key: "disabled", data: null, disabled: true });
    expect(controller.moveActive("next")).toBeNull();
    expect(controller.setActiveKey(null)).toBe(false);
    expect(controller.clear()).toBe(true);
  });

  it("handles invalid initial active keys and tied ordering", () => {
    const controller = createCollectionController({
      initialItems: [
        { key: "b", data: 2, order: 1 },
        { key: "a", data: 1, order: 1 },
      ],
      activeKey: "missing",
    });

    expect(controller.getSnapshot().activeKey).toBeNull();
    expect(controller.getSnapshot().items.map((item) => item.key)).toEqual([
      "b",
      "a",
    ]);
    expect(controller.getItem("missing")).toBeUndefined();
    expect(controller.moveActive("previous")).toBe("a");
  });

  it("clears active state when the last enabled item becomes disabled", () => {
    const controller = createCollectionController({
      initialItems: [{ key: "a", data: 1 }],
      activeKey: "a",
    });
    const events = vi.fn();
    controller.subscribeEvent(events);

    expect(controller.upsertItem({ key: "a", data: 1, disabled: true })).toBe(
      true,
    );
    expect(controller.getSnapshot().activeKey).toBeNull();
    expect(events.mock.calls[0][0].type).toBe("collection-change");
    expect(events.mock.calls[1][0].type).toBe("active-change");
  });

  it("dispatches collection commands", () => {
    const controller = createCollectionController<string, number>();

    controller.dispatch({
      type: "upsert",
      item: { key: "a", data: 1 },
    });
    controller.dispatch({
      type: "upsert",
      item: { key: "b", data: 2 },
    });
    controller.dispatch({ type: "set-active", key: "a" });
    controller.dispatch({
      type: "move-active",
      intent: "next",
      loop: false,
    });
    controller.dispatch({ type: "remove", key: "a" });
    controller.dispatch({ type: "clear" });

    expect(controller.getSnapshot().items).toEqual([]);
  });

  it("supports event subscriptions and idempotent active changes", () => {
    const controller = createCollectionController({
      initialItems: [{ key: "a", data: 1 }],
    });
    const listener = vi.fn();
    const unsubscribe = controller.subscribeEvent(listener);

    expect(controller.setActiveKey("a", "pointer")).toBe(true);
    expect(controller.setActiveKey("a")).toBe(false);
    unsubscribe();
    controller.setActiveKey(null);

    expect(listener).toHaveBeenCalledOnce();
    expect(listener.mock.calls[0][0]).toMatchObject({
      type: "active-change",
      reason: "pointer",
    });
  });
});
