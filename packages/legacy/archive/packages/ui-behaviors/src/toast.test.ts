import { describe, expect, it, vi } from "vitest";
import {
  createToastController,
  getVisibleToastBehaviorRecords,
  resolveToastBehaviorDuration,
} from "./toast";

describe("toast behavior", () => {
  it("queues, updates, and limits visible records deterministically", () => {
    const controller = createToastController<{ title: string }>({
      defaultDuration: 4000,
      maxVisible: 2,
    });

    controller.add({ id: "one", payload: { title: "One" } });
    controller.add({ id: "two", payload: { title: "Two" }, duration: null });
    controller.add({ id: "three", payload: { title: "Three" } });

    expect(
      controller.getSnapshot().visibleRecords.map((item) => item.id),
    ).toEqual(["one", "two"]);
    expect(controller.getSnapshot().records[0]?.duration).toBe(4000);
    expect(controller.getSnapshot().records[1]?.duration).toBeNull();

    controller.add({ id: "one", payload: { title: "Updated" } });
    expect(controller.getSnapshot().records).toHaveLength(3);
    expect(controller.getSnapshot().records[0]?.payload.title).toBe("Updated");
    expect(controller.update("two", { payload: { title: "Second" } })).toBe(
      true,
    );
    expect(controller.setNewestOnTop(true)).toBe(true);
    expect(
      controller.getSnapshot().visibleRecords.map((item) => item.id),
    ).toEqual(["two", "one"]);
  });

  it("tracks pause, resume, action, and dismissal reasons", () => {
    const onEvent = vi.fn();
    const controller = createToastController({ onEvent });

    controller.add({ id: "one", payload: {} });
    expect(controller.pause("one", "hover")).toBe(true);
    expect(controller.getSnapshot().records[0]?.paused).toBe(true);
    expect(controller.resume("one", "focus")).toBe(true);
    expect(controller.triggerAction("one")).toBe(true);
    expect(controller.dismiss("one", "close-button")).toBe(true);

    expect(onEvent).toHaveBeenCalledWith(
      expect.objectContaining({ type: "pause-change", reason: "hover" }),
    );
    expect(onEvent).toHaveBeenCalledWith(
      expect.objectContaining({ type: "action", reason: "action" }),
    );
    expect(onEvent).toHaveBeenLastCalledWith(
      expect.objectContaining({ type: "dismiss", reason: "close-button" }),
    );
  });

  it("supports dismissal of the complete queue", () => {
    const controller = createToastController();
    controller.add({ id: "one", payload: {} });
    controller.add({ id: "two", payload: {} });

    expect(controller.dismissAll()).toBe(true);
    expect(controller.getSnapshot().records).toEqual([]);
    expect(controller.dismissAll()).toBe(false);
  });

  it("covers helpers and every public command", () => {
    expect(resolveToastBehaviorDuration(undefined, 5000)).toBe(5000);
    expect(resolveToastBehaviorDuration(null, 5000)).toBeNull();
    expect(
      getVisibleToastBehaviorRecords(
        [
          {
            id: "one",
            payload: {},
            duration: 1,
            dismissible: true,
            createdAt: 1,
            paused: false,
          },
        ],
        0,
        false,
      ),
    ).toEqual([]);

    const controller = createToastController();
    controller.dispatch({ type: "add", toast: { id: "one", payload: {} } });
    controller.dispatch({ type: "pause", id: "one", reason: "focus" });
    controller.dispatch({ type: "resume", id: "one", reason: "focus" });
    controller.dispatch({ type: "action", id: "one" });
    controller.dispatch({ type: "update", id: "one", toast: { duration: 20 } });
    controller.dispatch({ type: "set-max-visible", maxVisible: 1 });
    controller.dispatch({ type: "set-newest-on-top", newestOnTop: true });
    controller.dispatch({ type: "dismiss", id: "one", reason: "timeout" });
    controller.dispatch({ type: "dismiss-all" });

    expect(controller.getSnapshot()).toMatchObject({
      maxVisible: 1,
      newestOnTop: true,
      records: [],
    });
  });

  it("covers subscriptions and no-op record branches", () => {
    const snapshotListener = vi.fn();
    const eventListener = vi.fn();
    const controller = createToastController({
      maxVisible: -1,
      newestOnTop: true,
    });
    const unsubscribeSnapshot = controller.subscribe(snapshotListener);
    const unsubscribeEvent = controller.subscribeEvent(eventListener);

    expect(controller.getSnapshot().maxVisible).toBe(0);
    expect(controller.setMaxVisible(0)).toBe(false);
    expect(controller.setNewestOnTop(true)).toBe(false);
    expect(controller.update("missing", {})).toBe(false);
    expect(controller.dismiss("missing")).toBe(false);
    expect(controller.pause("missing")).toBe(false);
    expect(controller.resume("missing")).toBe(false);
    expect(controller.triggerAction("missing")).toBe(false);

    controller.add({
      id: "one",
      payload: {},
      dismissible: false,
      createdAt: 1,
    });
    expect(controller.pause("one")).toBe(true);
    expect(controller.pause("one")).toBe(false);
    expect(controller.resume("one")).toBe(true);
    expect(controller.resume("one")).toBe(false);
    expect(controller.update("one", { dismissible: true, createdAt: 2 })).toBe(
      true,
    );

    expect(snapshotListener).toHaveBeenCalled();
    expect(eventListener).toHaveBeenCalledWith(
      expect.objectContaining({ type: "add", reason: "programmatic" }),
    );

    unsubscribeSnapshot();
    unsubscribeEvent();
  });
});
