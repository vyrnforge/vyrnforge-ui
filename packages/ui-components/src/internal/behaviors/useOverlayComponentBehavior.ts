import {
  createDialogController,
  createDrawerController,
  createPopoverController,
  createTooltipController,
  type OverlayComponentController,
  type OverlayComponentControllerOptions,
  type OverlayDismissReason,
  type OverlayLifecycleReason,
  type OverlayOpenReason,
} from "@vyrnforge/ui-behaviors";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useBehaviorSnapshot, useLatestValue } from "./useBehaviorSnapshot";

type OverlayControllerFactory = (
  options?: OverlayComponentControllerOptions,
) => OverlayComponentController;

type OverlayComponentBehaviorOptions = {
  defaultOpen?: boolean;
  open?: boolean;
  modal?: boolean;
  disabled?: boolean;
  triggerId?: string | null;
  contentId?: string | null;
  onOpenChange?: (open: boolean) => void;
};

function useOverlayComponentBehavior(
  factory: OverlayControllerFactory,
  {
    contentId = null,
    defaultOpen = false,
    disabled = false,
    modal = false,
    onOpenChange,
    open,
    triggerId = null,
  }: OverlayComponentBehaviorOptions,
) {
  const callbackRef = useLatestValue(onOpenChange);
  const controllerRef = useRef<OverlayComponentController | null>(null);
  const isControlled = open !== undefined;

  if (controllerRef.current === null) {
    controllerRef.current = factory({
      contentId,
      defaultOpen,
      disabled,
      modal,
      triggerId,
      ...(isControlled ? { open } : {}),
      onEvent(event) {
        if (event.type === "open-change") {
          callbackRef.current?.(event.detail.open);
        }
      },
    });
  }

  const controller = controllerRef.current;
  const snapshot = useBehaviorSnapshot(controller);

  useEffect(() => {
    if (open !== undefined) controller.syncOpen(open);
  }, [controller, open]);

  useEffect(() => {
    controller.setDisabled(disabled);
  }, [controller, disabled]);

  useEffect(() => {
    controller.setModal(modal);
  }, [controller, modal]);

  useEffect(() => {
    controller.setRelationship(triggerId, contentId);
  }, [contentId, controller, triggerId]);

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
      contentId: snapshot.contentId,
      disabled: snapshot.disabled,
      dismiss,
      isOpen: open ?? snapshot.open,
      modal: snapshot.modal,
      open: requestOpen,
      setOpen,
      toggle,
      triggerId: snapshot.triggerId,
    }),
    [
      dismiss,
      open,
      requestOpen,
      setOpen,
      snapshot.contentId,
      snapshot.disabled,
      snapshot.modal,
      snapshot.open,
      snapshot.triggerId,
      toggle,
    ],
  );
}

export function useDialogBehavior(
  options: Omit<OverlayComponentBehaviorOptions, "modal" | "disabled">,
) {
  return useOverlayComponentBehavior(createDialogController, {
    ...options,
    modal: true,
  });
}

export function useDrawerBehavior(options: OverlayComponentBehaviorOptions) {
  return useOverlayComponentBehavior(createDrawerController, options);
}

export function usePopoverBehavior(options: OverlayComponentBehaviorOptions) {
  return useOverlayComponentBehavior(createPopoverController, options);
}

export function useTooltipBehavior(
  options: Omit<OverlayComponentBehaviorOptions, "defaultOpen" | "modal">,
) {
  return useOverlayComponentBehavior(createTooltipController, {
    ...options,
    defaultOpen: false,
    modal: false,
  });
}
