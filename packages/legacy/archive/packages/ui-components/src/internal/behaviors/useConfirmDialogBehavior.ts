import {
  createConfirmDialogController,
  type ConfirmDialogController,
} from "@vyrnforge/ui-behaviors";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useBehaviorSnapshot, useLatestValue } from "./useBehaviorSnapshot";

export function useConfirmDialogBehavior({
  disabled,
  loading,
  onCancel,
  onConfirm,
  onOpenChange,
  open,
}: {
  disabled: boolean;
  loading: boolean;
  onCancel?: () => void;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) {
  const cancelRef = useLatestValue(onCancel);
  const confirmRef = useLatestValue(onConfirm);
  const openChangeRef = useLatestValue(onOpenChange);
  const controllerRef = useRef<ConfirmDialogController | null>(null);

  if (controllerRef.current === null) {
    controllerRef.current = createConfirmDialogController({
      disabled,
      loading,
      open,
      onEvent(event) {
        if (event.type === "cancel") cancelRef.current?.();
        if (event.type === "confirm") confirmRef.current();
        if (event.type === "open-change") {
          openChangeRef.current(event.detail.open);
        }
      },
    });
  }

  const controller = controllerRef.current;
  const snapshot = useBehaviorSnapshot(controller);

  useEffect(() => {
    controller.syncOpen(open);
  }, [controller, open]);

  useEffect(() => {
    controller.setState(loading, disabled);
  }, [controller, disabled, loading]);

  const cancel = useCallback(() => controller.cancel(), [controller]);
  const confirm = useCallback(() => controller.confirm(), [controller]);
  const setOpen = useCallback(
    (nextOpen: boolean) => controller.setOpen(nextOpen, "programmatic"),
    [controller],
  );

  return useMemo(
    () => ({
      canCancel: snapshot.canCancel,
      canConfirm: snapshot.canConfirm,
      cancel,
      confirm,
      setOpen,
    }),
    [cancel, confirm, setOpen, snapshot.canCancel, snapshot.canConfirm],
  );
}
