import { useEffect, useRef } from "react";
import {
  createTabsController,
  type CollectionMoveIntent,
  type TabsController,
  type TabsItem,
} from "@vyrnforge/ui-behaviors";
import { useBehaviorSnapshot, useLatestValue } from "./useBehaviorSnapshot";

export function useTabsBehavior({
  defaultValue,
  items,
  onValueChange,
  value,
}: {
  defaultValue?: string;
  items: readonly TabsItem[];
  onValueChange?: (value: string) => void;
  value?: string;
}) {
  const callbackRef = useLatestValue(onValueChange);
  const controllerRef = useRef<TabsController | null>(null);
  const isControlled = value !== undefined;

  if (controllerRef.current === null) {
    controllerRef.current = createTabsController({
      items,
      defaultValue,
      ...(isControlled ? { value } : {}),
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

  const selectedValue = value ?? snapshot.selectedValue;

  return {
    selectedValue,
    focusedValue: snapshot.focusedValue,
    select(nextValue: string) {
      controller.select(nextValue, "pointer");
    },
    setFocusedValue(nextValue: string) {
      controller.setFocusedValue(nextValue, "keyboard");
    },
    moveFocus(intent: CollectionMoveIntent) {
      return controller.moveFocus(intent, "keyboard");
    },
  };
}
