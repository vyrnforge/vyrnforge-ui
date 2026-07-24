import { useEffect, useRef } from "react";
import {
  createChoiceController,
  type BehaviorChangeReason,
  type ChoiceController,
  type ChoiceItem,
} from "@vyrnforge/ui-behaviors";
import { useBehaviorSnapshot, useLatestValue } from "./useBehaviorSnapshot";

export function useChoiceBehavior({
  defaultValue = null,
  items,
  onValueChange,
  value,
}: {
  defaultValue?: string | null;
  items: readonly ChoiceItem<string>[];
  onValueChange?: (value: string) => void;
  value?: string;
}) {
  const callbackRef = useLatestValue(onValueChange);
  const controllerRef = useRef<ChoiceController<string> | null>(null);
  const isControlled = value !== undefined;

  if (controllerRef.current === null) {
    controllerRef.current = createChoiceController<string>({
      items,
      defaultValue,
      ...(isControlled ? { value } : {}),
      allowEmpty: true,
      onEvent: (event) => {
        if (
          event.type === "value-change" &&
          event.reason !== "collection-change" &&
          event.detail.value !== null
        ) {
          callbackRef.current?.(event.detail.value);
        }
      },
    });
  }

  const controller = controllerRef.current;
  const snapshot = useBehaviorSnapshot(controller);

  useEffect(() => {
    controller.replaceItems(items);
  }, [controller, items]);

  useEffect(() => {
    if (value !== undefined) controller.syncValue(value);
  }, [controller, value]);

  return {
    value: value ?? snapshot.value ?? "",
    select(nextValue: string, reason: BehaviorChangeReason = "pointer") {
      controller.select(nextValue, reason);
    },
  };
}
