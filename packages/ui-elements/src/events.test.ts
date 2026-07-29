import { describe, expect, expectTypeOf, it, vi } from "vitest";

import {
  assertVyrnForgeEventName,
  createVyrnForgeEvent,
  createVyrnForgeEventDispatcher,
  dispatchVyrnForgeEvent,
  vyrnForgeEventDispatcher,
  type VyrnForgeCanonicalEventDetailMap,
} from "./events";

describe("VyrnForge DOM event utilities", () => {
  it("validates canonical vf-* event names", () => {
    expect(() => assertVyrnForgeEventName("vf-value-change")).not.toThrow();
    expect(() => assertVyrnForgeEventName("value-change")).toThrow(TypeError);
    expect(() => assertVyrnForgeEventName("vf-ValueChange")).toThrow(TypeError);
  });

  it("creates bubbling and composed events by default", () => {
    const detail = { reason: "programmatic", value: "ready" };
    const event = createVyrnForgeEvent("vf-value-change", detail);

    expect(event.bubbles).toBe(true);
    expect(event.composed).toBe(true);
    expect(event.cancelable).toBe(false);
    expect(event.detail).toBe(detail);
  });

  it("supports explicit propagation and cancellation options", () => {
    const event = createVyrnForgeEvent(
      "vf-action",
      { reason: "keyboard" },
      { bubbles: false, cancelable: true, composed: false },
    );

    expect(event.bubbles).toBe(false);
    expect(event.composed).toBe(false);
    expect(event.cancelable).toBe(true);
  });

  it("returns the DOM dispatch result for cancelable events", () => {
    const target = new EventTarget();
    target.addEventListener("vf-dismiss", (event) => event.preventDefault());

    expect(
      dispatchVyrnForgeEvent(
        target,
        "vf-dismiss",
        { reason: "outside-pointer" },
        { cancelable: true },
      ),
    ).toBe(false);
  });

  it("creates typed component dispatchers", () => {
    type ProbeEvents = {
      "vf-probe-change": {
        readonly reason: "fixture";
        readonly value: string;
      };
    };

    const dispatcher = createVyrnForgeEventDispatcher<ProbeEvents>();
    const target = new EventTarget();
    const listener = vi.fn();
    target.addEventListener("vf-probe-change", listener);

    const event = dispatcher.create("vf-probe-change", {
      reason: "fixture",
      value: "created",
    });
    expectTypeOf(event.detail).toEqualTypeOf<ProbeEvents["vf-probe-change"]>();
    expect(Object.isFrozen(dispatcher)).toBe(true);
    expect(
      dispatcher.dispatch(target, "vf-probe-change", {
        reason: "fixture",
        value: "dispatched",
      }),
    ).toBe(true);
    expect(listener).toHaveBeenCalledOnce();
  });

  it("exposes the canonical event dispatcher", () => {
    const event = vyrnForgeEventDispatcher.create("vf-open-change", {
      open: true,
      reason: "trigger",
    });
    expectTypeOf(event.detail).toEqualTypeOf<
      VyrnForgeCanonicalEventDetailMap["vf-open-change"]
    >();
    expect(event.detail).toEqual({ open: true, reason: "trigger" });
  });
  it("types advanced canonical component events", () => {
    const addedToast = vyrnForgeEventDispatcher.create("vf-toast-change", {
      action: "add",
      id: "saved",
    });
    expectTypeOf(addedToast.detail).toEqualTypeOf<
      VyrnForgeCanonicalEventDetailMap["vf-toast-change"]
    >();
    expect(addedToast.detail).toEqual({
      action: "add",
      id: "saved",
    });

    const dismissedToasts = vyrnForgeEventDispatcher.create("vf-toast-change", {
      action: "dismiss-all",
    });
    expect(dismissedToasts.detail).toEqual({
      action: "dismiss-all",
    });

    const confirmed = vyrnForgeEventDispatcher.create("vf-confirm", {
      reason: "confirm",
    });
    expect(confirmed.detail.reason).toBe("confirm");

    const cancelled = vyrnForgeEventDispatcher.create("vf-cancel", {
      reason: "cancel",
    });
    expect(cancelled.detail.reason).toBe("cancel");

    const inputChanged = vyrnForgeEventDispatcher.create(
      "vf-input-value-change",
      {
        value: "atlas",
      },
    );
    expect(inputChanged.detail.value).toBe("atlas");
  });
});
