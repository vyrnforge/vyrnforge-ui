import { describe, expect, it, vi } from "vitest";

import { createBehaviorSnapshotChannel } from "./controller";

describe("behavior snapshot channel", () => {
  it("subscribes, publishes, unsubscribes idempotently, and clears", () => {
    const channel = createBehaviorSnapshotChannel<number>();
    const listener = vi.fn();
    const unsubscribe = channel.subscribe(listener);

    channel.publish(1);
    unsubscribe();
    unsubscribe();
    channel.publish(2);

    expect(listener).toHaveBeenCalledOnce();
    expect(listener).toHaveBeenCalledWith(1);
    expect(channel.listenerCount()).toBe(0);

    channel.subscribe(listener);
    channel.clear();
    expect(channel.listenerCount()).toBe(0);
  });
});
