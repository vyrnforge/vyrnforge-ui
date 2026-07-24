import { useRef, useSyncExternalStore } from "react";
import type { BehaviorController } from "@vyrnforge/ui-behaviors";

export function useBehaviorSnapshot<TSnapshot>(
  controller: Pick<
    BehaviorController<TSnapshot, never>,
    "getSnapshot" | "subscribe"
  >,
): TSnapshot {
  return useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
    controller.getSnapshot,
  );
}

export function useLatestValue<TValue>(value: TValue) {
  const reference = useRef(value);
  reference.current = value;
  return reference;
}
