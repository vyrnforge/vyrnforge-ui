import {
  createOverlayLifecycleController,
  type OverlayDismissReason,
  type OverlayLifecycleController,
  type OverlayLifecycleReason,
  type OverlayOpenReason,
} from "@vyrnforge/ui-behaviors";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useBehaviorSnapshot, useLatestValue } from "./useBehaviorSnapshot";

export function useOverlayBehavior({
  defaultOpen = false,
  onOpenChange,
  open,
}: {
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
}) {
  const callbackRef = useLatestValue(onOpenChange);
  const controllerRef = useRef<OverlayLifecycleController | null>(null);
  const isControlled = open !== undefined;

  if (controllerRef.current === null) {
    controllerRef.current = createOverlayLifecycleController({
      defaultOpen,
      ...(isControlled ? { open } : {}),
      onEvent(event) {
        callbackRef.current?.(event.detail.open);
      },
    });
  }

  const controller = controllerRef.current;
  const snapshot = useBehaviorSnapshot(controller);

  useEffect(() => {
    if (open !== undefined) controller.syncOpen(open);
  }, [controller, open]);

  const dismiss = useCallback(
    (reason: OverlayDismissReason) => controller.dismiss(reason),
    [controller],
  );
  const requestOpen = useCallback(
    (reason: OverlayOpenReason = "programmatic") => controller.open(reason),
    [controller],
  );
  const setOpen = useCallback(
    (nextOpen: boolean, reason: OverlayLifecycleReason = "programmatic") =>
      controller.setOpen(nextOpen, reason),
    [controller],
  );
  const toggle = useCallback(
    (reason: OverlayOpenReason = "trigger") => controller.toggle(reason),
    [controller],
  );

  return useMemo(
    () => ({
      isOpen: open ?? snapshot.open,
      dismiss,
      open: requestOpen,
      setOpen,
      toggle,
    }),
    [dismiss, open, requestOpen, setOpen, snapshot.open, toggle],
  );
}
