import { describe, expect, it, vi } from "vitest";
import {
  createOverlayLayerRegistry,
  createOverlayLifecycleController,
  resolveOverlayPosition,
} from "./overlay";

const anchor = {
  left: 20,
  top: 20,
  right: 120,
  bottom: 60,
  width: 100,
  height: 40,
};
const floating = {
  left: 0,
  top: 0,
  right: 80,
  bottom: 60,
  width: 80,
  height: 60,
};

describe("overlay lifecycle behavior", () => {
  it("commits uncontrolled open and dismiss transitions with reasons", () => {
    const onEvent = vi.fn();
    const controller = createOverlayLifecycleController({ onEvent });

    expect(controller.open("keyboard")).toBe(true);
    expect(controller.getSnapshot()).toMatchObject({
      open: true,
      lastReason: "keyboard",
    });
    expect(controller.open("pointer")).toBe(false);
    expect(controller.dismiss("outside-pointer")).toBe(true);
    expect(controller.getSnapshot()).toMatchObject({
      open: false,
      lastReason: "outside-pointer",
    });
    expect(onEvent).toHaveBeenLastCalledWith(
      expect.objectContaining({
        type: "open-change",
        reason: "outside-pointer",
      }),
    );
  });

  it("emits controlled proposals until synchronized", () => {
    const onEvent = vi.fn();
    const controller = createOverlayLifecycleController({
      open: false,
      onEvent,
    });

    expect(controller.open("trigger")).toBe(true);
    expect(controller.getSnapshot()).toMatchObject({
      open: false,
      isControlled: true,
    });
    expect(controller.syncOpen(true)).toBe(true);
    expect(controller.getSnapshot().open).toBe(true);
    expect(onEvent).toHaveBeenCalledWith(
      expect.objectContaining({ reason: "trigger" }),
    );
  });

  it("dispatches every lifecycle command", () => {
    const controller = createOverlayLifecycleController();

    controller.dispatch({ type: "open", reason: "focus" });
    controller.dispatch({ type: "dismiss", reason: "escape-key" });
    controller.dispatch({ type: "set-open", open: true, reason: "pointer" });
    controller.dispatch({ type: "toggle", reason: "keyboard" });
    controller.dispatch({ type: "sync", open: true });

    expect(controller.getSnapshot().open).toBe(true);
  });
});

describe("overlay DOM-adapter foundations", () => {
  it("tracks topmost layers with idempotent release", () => {
    const registry = createOverlayLayerRegistry({ baseStackIndex: 2000 });
    const first = registry.register();
    const second = registry.register();

    expect(first.stackIndex).toBe(2001);
    expect(second.stackIndex).toBe(2002);
    expect(first.isTopmost()).toBe(false);
    expect(second.isTopmost()).toBe(true);
    second.release();
    second.release();
    expect(first.isTopmost()).toBe(true);
    expect(registry.size()).toBe(1);
    first.release();
    expect(registry.size()).toBe(0);
  });

  it("resolves, flips, and shifts anchored positions", () => {
    expect(
      resolveOverlayPosition(anchor, floating, { width: 400, height: 300 }),
    ).toEqual({ x: 20, y: 68, resolvedPlacement: "bottom-start" });

    const nearBottom = { ...anchor, top: 240, bottom: 280 };
    expect(
      resolveOverlayPosition(nearBottom, floating, {
        width: 400,
        height: 300,
      }),
    ).toEqual({ x: 20, y: 172, resolvedPlacement: "top-start" });

    const shifted = resolveOverlayPosition(
      { ...anchor, left: -20, right: 80 },
      floating,
      { width: 100, height: 100 },
      { flip: false },
    );
    expect(shifted.x).toBe(8);
    expect(shifted.y).toBe(32);
  });
});
