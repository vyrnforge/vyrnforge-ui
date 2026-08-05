import { describe, expect, it, vi } from "vitest";
import { createNumericValueController, normalizeNumericValue } from "./numeric";

describe("numeric control behavior", () => {
  it("normalizes non-finite values and reversed ranges", () => {
    expect(normalizeNumericValue(Number.NaN, { min: 2, max: 1 })).toBe(2);
    expect(normalizeNumericValue(Number.POSITIVE_INFINITY)).toBe(0);
    expect(normalizeNumericValue(-5, { min: 0, max: 10 })).toBe(0);
    expect(normalizeNumericValue(1.2345, { precision: 3 })).toBe(1.235);
    expect(normalizeNumericValue(-1.2345, { precision: 3 })).toBe(-1.235);
    expect(normalizeNumericValue(1.2344, { precision: 3 })).toBe(1.234);
  });

  it("clamps, rounds precision, and optionally aligns to step", () => {
    expect(normalizeNumericValue(13, { min: 0, max: 10, step: 2 })).toBe(10);
    expect(normalizeNumericValue(5.26, { min: 0, max: 10, step: 0.1 })).toBe(
      5.3,
    );
    expect(
      normalizeNumericValue(5.26, {
        min: 0,
        max: 10,
        step: 0.5,
        alignToStep: true,
      }),
    ).toBe(5.5);
    expect(normalizeNumericValue(1.2345, { precision: 3 })).toBe(1.235);
  });

  it("increments, decrements, and clamps through the shared controller", () => {
    const controller = createNumericValueController({
      defaultValue: 2,
      min: 0,
      max: 4,
      step: 1,
    });

    controller.increment();
    expect(controller.getSnapshot().value).toBe(3);
    controller.increment();
    controller.increment();
    expect(controller.getSnapshot().value).toBe(4);
    controller.decrement();
    expect(controller.getSnapshot().value).toBe(3);
    expect(controller.setNumber(3)).toBe(false);
    expect(controller.syncNumber(3)).toBe(false);
    controller.setRange({ min: 0, max: 3, step: 0.5 });
    controller.increment();
    expect(controller.getSnapshot().value).toBe(3);
  });

  it("uses a default step when an invalid step is supplied", () => {
    const controller = createNumericValueController({
      defaultValue: 1,
      step: 0,
    });
    controller.increment();
    expect(controller.getSnapshot().value).toBe(2);
  });

  it("emits normalized controlled proposals and accepts sync", () => {
    const onValueChange = vi.fn();
    const controller = createNumericValueController({
      value: 2,
      min: 0,
      max: 5,
      step: 1,
      onValueChange,
    });

    controller.setNumber(9, "pointer");
    expect(controller.getSnapshot().value).toBe(2);
    expect(onValueChange).toHaveBeenCalledWith(
      expect.objectContaining({
        reason: "pointer",
        detail: expect.objectContaining({ value: 5 }),
      }),
    );
    expect(controller.syncNumber(5)).toBe(true);
    expect(controller.getSnapshot().value).toBe(5);
  });
});
