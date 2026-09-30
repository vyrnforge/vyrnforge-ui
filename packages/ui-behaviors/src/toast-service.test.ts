import { describe, expect, it, vi } from "vitest";
import {
  createToastService,
  type ToastServiceScheduler,
} from "./toast-service";

interface Scheduled {
  readonly callback: () => void;
  readonly delay: number;
}

function createScheduler() {
  let now = 100;
  let nextHandle = 0;
  const scheduled = new Map<number, Scheduled>();
  const scheduler: ToastServiceScheduler = {
    now: () => now,
    setTimeout(callback, delay) {
      nextHandle += 1;
      scheduled.set(nextHandle, { callback, delay });
      return nextHandle;
    },
    clearTimeout(handle) {
      scheduled.delete(handle as number);
    },
  };
  return {
    scheduler,
    scheduled,
    advance(milliseconds: number) {
      now += milliseconds;
    },
    run(handle: number) {
      const task = scheduled.get(handle);
      scheduled.delete(handle);
      task?.callback();
    },
  };
}

describe("toast service", () => {
  it("owns id creation, visible timers, and timeout dismissal", () => {
    const clock = createScheduler();
    const service = createToastService<{ title: string }>({
      createId: () => "generated",
      defaultDuration: 5000,
      maxVisible: 1,
      scheduler: clock.scheduler,
    });

    expect(service.add({ payload: { title: "One" } })).toBe("generated");
    service.add({ id: "queued", payload: { title: "Two" } });

    expect(clock.scheduled.size).toBe(1);
    const firstHandle = [...clock.scheduled.keys()][0];
    clock.run(firstHandle);

    expect(service.getSnapshot().records.map((record) => record.id)).toEqual([
      "queued",
    ]);
    expect(clock.scheduled.size).toBe(1);
  });

  it("preserves remaining duration across pause and resume", () => {
    const clock = createScheduler();
    const service = createToastService({
      scheduler: clock.scheduler,
      defaultDuration: 1000,
    });

    service.add({ id: "one", payload: {} });
    const initialHandle = [...clock.scheduled.keys()][0];
    expect(clock.scheduled.get(initialHandle)?.delay).toBe(1000);

    clock.advance(250);
    expect(service.pause("one", "hover")).toBe(true);
    expect(clock.scheduled.size).toBe(0);
    expect(service.getSnapshot().records[0]?.paused).toBe(true);

    clock.advance(500);
    expect(service.resume("one", "hover")).toBe(true);
    const resumedHandle = [...clock.scheduled.keys()][0];
    expect(clock.scheduled.get(resumedHandle)?.delay).toBe(750);
  });

  it("reschedules updates and supports persistent records", () => {
    const clock = createScheduler();
    const service = createToastService({
      scheduler: clock.scheduler,
      defaultDuration: 1000,
    });

    service.add({ id: "one", payload: { value: 1 } });
    expect(clock.scheduled.size).toBe(1);
    expect(
      service.update("one", { payload: { value: 2 }, duration: null }),
    ).toBe(true);
    expect(clock.scheduled.size).toBe(0);
    expect(service.getSnapshot().records[0]?.payload).toEqual({ value: 2 });
  });

  it("proxies controller events and clears lifecycle state on destroy", () => {
    const clock = createScheduler();
    const listener = vi.fn();
    const service = createToastService({
      scheduler: clock.scheduler,
      defaultDuration: 1000,
    });
    const unsubscribe = service.subscribeEvent(listener);

    service.add({ id: "one", payload: {} });
    expect(service.triggerAction("one")).toBe(true);
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({ type: "action" }),
    );
    expect(clock.scheduled.size).toBe(1);

    unsubscribe();
    service.stop();
    expect(clock.scheduled.size).toBe(0);
    expect(service.getSnapshot().records).toHaveLength(1);

    service.start();
    expect(clock.scheduled.size).toBe(1);

    service.destroy();
    service.destroy();
    service.start();
    expect(clock.scheduled.size).toBe(0);
  });

  it("supports service-level visibility and dismissal controls", () => {
    const clock = createScheduler();
    const service = createToastService({
      scheduler: clock.scheduler,
      maxVisible: 2,
      newestOnTop: false,
    });

    service.add({ id: "one", payload: {} });
    service.add({ id: "two", payload: {} });
    expect(service.setNewestOnTop(true)).toBe(true);
    expect(service.setMaxVisible(1)).toBe(true);
    expect(service.getSnapshot().visibleRecords).toHaveLength(1);
    expect(service.dismiss("missing")).toBe(false);
    expect(service.dismiss("one")).toBe(true);
    expect(service.dismissAll()).toBe(true);
    expect(service.dismissAll()).toBe(false);
  });
});
