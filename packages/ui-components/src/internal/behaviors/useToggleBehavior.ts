import { useEffect, useRef } from "react";
import {
  createToggleController,
  type BehaviorChangeReason,
  type ToggleController,
} from "@vyrnforge/ui-behaviors";
import { useBehaviorSnapshot, useLatestValue } from "./useBehaviorSnapshot";

export function useToggleBehavior({
  defaultPressed = false,
  onPressedChange,
  pressed,
}: {
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  pressed?: boolean;
}) {
  const onPressedChangeRef = useLatestValue(onPressedChange);
  const controllerRef = useRef<ToggleController | null>(null);
  const isControlled = pressed !== undefined;

  if (controllerRef.current === null) {
    controllerRef.current = createToggleController({
      defaultPressed,
      ...(isControlled ? { pressed } : {}),
      onPressedChange: (event) =>
        onPressedChangeRef.current?.(event.detail.value),
    });
  }

  const controller = controllerRef.current;
  const snapshot = useBehaviorSnapshot(controller);

  useEffect(() => {
    if (pressed !== undefined) controller.syncPressed(pressed);
  }, [controller, pressed]);

  return {
    pressed: pressed ?? snapshot.value,
    setPressed(nextPressed: boolean, reason?: BehaviorChangeReason) {
      controller.setPressed(nextPressed, reason);
    },
    toggle(reason?: BehaviorChangeReason) {
      controller.toggle(reason);
    },
  };
}
