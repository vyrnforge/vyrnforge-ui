import { describe, expect, it, vi } from "vitest";

import {
  behaviorChangeReasons,
  createBehaviorEvent,
  createBehaviorEventChannel,
  type BehaviorEvent,
} from "./events";

describe("behavior event model", () => {
  it("exposes the canonical reason vocabulary", () => {
    expect(behaviorChangeReasons).toEqual([
      "user",
      "programmatic",
      "keyboard",
      "pointer",
      "selection",
      "collection-change",
      "clear",
      "reset",
      "restore",
    ]);
  });

  it("creates immutable typed events", () => {
    const event = createBehaviorEvent(
      "value-change",
      { value: "approved" },
      "user",
    );

    expect(event).toEqual({
      type: "value-change",
      detail: { value: "approved" },
      reason: "user",
    });
    expect(Object.isFrozen(event)).toBe(true);
  });

  it("publishes to a stable listener snapshot", () => {
    const channel =
      createBehaviorEventChannel<BehaviorEvent<"change", number>>();
    const first = vi.fn();
    const second = vi.fn();
    const unsubscribeFirst = channel.subscribe((event) => {
      first(event);
      unsubscribeFirst();
    });
    channel.subscribe(second);

    const event = createBehaviorEvent("change", 1, "programmatic");
    channel.emit(event);
    channel.emit(event);

    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(2);
    expect(channel.listenerCount()).toBe(1);

    channel.clear();
    expect(channel.listenerCount()).toBe(0);
    unsubscribeFirst();
  });
});
