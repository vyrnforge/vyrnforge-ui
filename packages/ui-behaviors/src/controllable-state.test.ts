import { describe, expect, it, vi } from "vitest";

import { createControllableState } from "./controllable-state";

describe("controllable state", () => {
  it("owns and publishes uncontrolled state", () => {
    const onChange = vi.fn();
    const listener = vi.fn();
    const events = vi.fn();
    const controller = createControllableState({
      defaultValue: 2,
      onChange,
    });
    controller.subscribe(listener);
    controller.subscribeEvent(events);

    expect(controller.getSnapshot()).toEqual({
      value: 2,
      isControlled: false,
      revision: 0,
    });
    expect(controller.setValue((value) => value + 3, "user")).toBe(true);
    expect(controller.getSnapshot().value).toBe(5);
    expect(listener).toHaveBeenCalledWith({
      value: 5,
      isControlled: false,
      revision: 1,
    });
    expect(events.mock.calls[0][0]).toMatchObject({
      type: "value-change",
      detail: {
        value: 5,
        previousValue: 2,
        isControlled: false,
      },
      reason: "user",
    });
    expect(onChange).toHaveBeenCalledOnce();
    expect(controller.setValue(5)).toBe(false);
  });

  it("emits controlled proposals without mutating the snapshot", () => {
    const onChange = vi.fn();
    const listener = vi.fn();
    const controller = createControllableState({
      value: "server",
      defaultValue: "default",
      onChange,
    });
    controller.subscribe(listener);

    expect(controller.setValue("draft", "user")).toBe(true);
    expect(controller.getSnapshot()).toEqual({
      value: "server",
      isControlled: true,
      revision: 0,
    });
    expect(listener).not.toHaveBeenCalled();
    expect(onChange.mock.calls[0][0].detail.value).toBe("draft");

    expect(controller.syncValue("draft")).toBe(true);
    expect(controller.getSnapshot()).toEqual({
      value: "draft",
      isControlled: true,
      revision: 1,
    });
    expect(controller.syncValue("draft")).toBe(false);
  });

  it("supports explicit controlled undefined values", () => {
    const controller = createControllableState<string | undefined>({
      value: undefined,
      defaultValue: "fallback",
    });

    expect(controller.getSnapshot().isControlled).toBe(true);
    expect(controller.getSnapshot().value).toBeUndefined();
  });

  it("resets and dispatches each command", () => {
    const controller = createControllableState({
      defaultValue: 1,
      equals: (left, right) => left === right,
    });

    controller.dispatch({ type: "set", value: 3 });
    controller.dispatch({ type: "sync", value: 4 });
    controller.dispatch({ type: "reset", reason: "restore" });

    expect(controller.getSnapshot().value).toBe(1);
    expect(controller.getSnapshot().revision).toBe(3);
  });
});
