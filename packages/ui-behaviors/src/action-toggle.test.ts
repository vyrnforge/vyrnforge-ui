import { describe, expect, it, vi } from "vitest";
import {
  createToggleController,
  resolveActionState,
  resolveToggleInputState,
} from "./action-toggle";

describe("action and toggle behaviors", () => {
  it("resolves enabled, disabled, and loading action states", () => {
    expect(resolveActionState()).toEqual({
      disabled: false,
      loading: false,
      interactive: true,
      ariaBusy: undefined,
    });
    expect(resolveActionState({ disabled: true })).toEqual({
      disabled: true,
      loading: false,
      interactive: false,
      ariaBusy: undefined,
    });
    expect(resolveActionState({ loading: true })).toEqual({
      disabled: true,
      loading: true,
      interactive: false,
      ariaBusy: true,
    });
  });

  it("preserves native toggle input state decisions", () => {
    expect(resolveToggleInputState()).toEqual({
      checked: undefined,
      disabled: false,
      interactive: true,
    });
    expect(
      resolveToggleInputState({ defaultChecked: true, readOnly: true }),
    ).toEqual({ checked: true, disabled: false, interactive: false });
    expect(
      resolveToggleInputState({
        checked: false,
        defaultChecked: true,
        disabled: true,
      }),
    ).toEqual({ checked: false, disabled: true, interactive: false });
  });

  it("toggles and sets uncontrolled state with reasoned events", () => {
    const onPressedChange = vi.fn();
    const controller = createToggleController({ onPressedChange });

    expect(controller.toggle("pointer")).toBe(true);
    expect(controller.isPressed()).toBe(true);
    expect(controller.setPressed(true)).toBe(false);
    expect(controller.setPressed(false, "keyboard")).toBe(true);
    expect(onPressedChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        type: "value-change",
        reason: "keyboard",
        detail: expect.objectContaining({ value: false }),
      }),
    );
  });

  it("emits controlled proposals without taking ownership", () => {
    const controller = createToggleController({ pressed: false });
    const events = vi.fn();
    controller.subscribeEvent(events);

    controller.toggle("keyboard");

    expect(controller.isPressed()).toBe(false);
    expect(events).toHaveBeenCalledWith(
      expect.objectContaining({
        reason: "keyboard",
        detail: expect.objectContaining({ value: true, isControlled: true }),
      }),
    );
    expect(controller.syncPressed(true)).toBe(true);
    expect(controller.syncPressed(true)).toBe(false);
    expect(controller.isPressed()).toBe(true);
  });
});
