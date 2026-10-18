import { useEffect, useRef } from "react";
import {
  createNumericValueController,
  normalizeNumericValue,
  type BehaviorChangeReason,
  type NumericRange,
  type NumericValueController,
} from "@vyrnforge/ui-behaviors";
import { useBehaviorSnapshot, useLatestValue } from "./useBehaviorSnapshot";

export function useNumericBehavior({
  defaultValue,
  onValueChange,
  value,
  ...range
}: NumericRange & {
  defaultValue: number;
  onValueChange?: (value: number) => void;
  value?: number;
}) {
  const callbackRef = useLatestValue(onValueChange);
  const controllerRef = useRef<NumericValueController | null>(null);
  const isControlled = value !== undefined;

  if (controllerRef.current === null) {
    controllerRef.current = createNumericValueController({
      ...range,
      defaultValue,
      ...(isControlled ? { value } : {}),
      onValueChange: (event) => callbackRef.current?.(event.detail.value),
    });
  }

  const controller = controllerRef.current;
  const snapshot = useBehaviorSnapshot(controller);
  const normalizedControlledValue =
    value === undefined ? undefined : normalizeNumericValue(value, range);

  useEffect(() => {
    controller.setRange(range);
  }, [
    controller,
    range.alignToStep,
    range.max,
    range.min,
    range.precision,
    range.step,
  ]);

  useEffect(() => {
    if (normalizedControlledValue !== undefined) {
      controller.syncNumber(normalizedControlledValue);
    }
  }, [controller, normalizedControlledValue]);

  return {
    value: normalizedControlledValue ?? snapshot.value,
    setValue(nextValue: number, reason: BehaviorChangeReason = "pointer") {
      controller.setNumber(nextValue, reason);
    },
  };
}
