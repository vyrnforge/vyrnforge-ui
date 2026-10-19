import { useEffect, useRef } from "react";
import {
  createToggleGroupController,
  type BehaviorChangeReason,
  type ToggleGroupController,
} from "@vyrnforge/ui-behaviors";
import { useBehaviorSnapshot, useLatestValue } from "./useBehaviorSnapshot";

export function useToggleGroupBehavior({
  defaultValue,
  onValueChange,
  type = "single",
  value,
}: {
  defaultValue?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  type?: "single" | "multiple";
  value?: string | string[];
}) {
  const callbackRef = useLatestValue(onValueChange);
  const controllerRef = useRef<ToggleGroupController<string> | null>(null);
  const isControlled = value !== undefined;

  if (controllerRef.current === null) {
    controllerRef.current = createToggleGroupController<string>({
      type,
      defaultValue,
      ...(isControlled ? { value } : {}),
      onValueChange: (event) => {
        const selected = event.detail.selectedKeys;
        callbackRef.current?.(
          type === "multiple" ? [...selected] : (selected[0] ?? ""),
        );
      },
    });
  }

  const controller = controllerRef.current;
  const snapshot = useBehaviorSnapshot(controller);

  useEffect(() => {
    if (value !== undefined) controller.syncValue(value);
  }, [controller, value]);

  const selectedValues =
    value === undefined
      ? snapshot.selectedKeys
      : Array.isArray(value)
        ? value
        : value === ""
          ? []
          : [value];

  return {
    value: type === "multiple" ? selectedValues : (selectedValues[0] ?? ""),
    isPressed(itemValue: string) {
      return selectedValues.includes(itemValue);
    },
    toggle(itemValue: string, reason: BehaviorChangeReason = "pointer") {
      controller.toggle(itemValue, reason);
    },
  };
}
