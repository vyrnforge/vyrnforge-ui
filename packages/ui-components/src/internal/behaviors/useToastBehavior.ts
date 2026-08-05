import {
  createToastController,
  type ToastBehaviorController,
} from "@vyrnforge/ui-behaviors";
import { useCallback, useEffect, useMemo, useRef } from "react";
import type {
  ToastController,
  ToastOptions,
  ToastRecord,
  ToastShortcutOptions,
  ToastTone,
} from "../../components/Toast/Toast.types";
import { createToastId } from "../../components/Toast/toast.utils";
import { useBehaviorSnapshot } from "./useBehaviorSnapshot";

type ToastPayload = Omit<
  ToastRecord,
  "id" | "duration" | "dismissible" | "createdAt"
>;

function toToastRecord(
  record: ReturnType<
    ToastBehaviorController<ToastPayload>["getSnapshot"]
  >["records"][number],
): ToastRecord {
  return {
    ...record.payload,
    id: record.id,
    duration: record.duration,
    dismissible: record.dismissible,
    createdAt: record.createdAt,
  };
}

export function useToastBehavior({
  defaultDuration,
  maxVisible,
  newestOnTop,
}: {
  defaultDuration: number;
  maxVisible: number;
  newestOnTop: boolean;
}) {
  const controllerRef = useRef<ToastBehaviorController<ToastPayload> | null>(
    null,
  );

  if (controllerRef.current === null) {
    controllerRef.current = createToastController<ToastPayload>({
      defaultDuration,
      maxVisible,
      newestOnTop,
    });
  }

  const behavior = controllerRef.current;
  const snapshot = useBehaviorSnapshot(behavior);

  useEffect(() => {
    behavior.setMaxVisible(maxVisible);
  }, [behavior, maxVisible]);

  useEffect(() => {
    behavior.setNewestOnTop(newestOnTop);
  }, [behavior, newestOnTop]);

  const dismiss = useCallback(
    (id: string) => {
      behavior.dismiss(id, "programmatic");
    },
    [behavior],
  );
  const dismissAll = useCallback(() => {
    behavior.dismissAll();
  }, [behavior]);
  const toast = useCallback(
    (options: ToastOptions) => {
      const id = options.id ?? createToastId();
      const {
        createdAt = Date.now(),
        dismissible = true,
        duration,
        id: _id,
        ...payload
      } = options;
      behavior.add({
        id,
        payload,
        createdAt,
        dismissible,
        duration,
      });
      return id;
    },
    [behavior],
  );
  const shortcut = useCallback(
    (tone: ToastTone, options: ToastShortcutOptions) =>
      toast({ ...options, tone }),
    [toast],
  );
  const update = useCallback(
    (id: string, options: Partial<ToastOptions>) => {
      const current = behavior
        .getSnapshot()
        .records.find((record) => record.id === id);
      if (!current) return;

      const currentRecord = toToastRecord(current);
      const nextRecord: ToastRecord = {
        ...currentRecord,
        ...options,
        id,
        createdAt: Date.now(),
      };
      const {
        createdAt,
        dismissible = true,
        duration,
        id: _id,
        ...payload
      } = nextRecord;
      behavior.update(id, {
        payload,
        createdAt,
        dismissible,
        duration,
      });
    },
    [behavior],
  );
  const pause = useCallback(
    (id: string, reason: "hover" | "focus") => behavior.pause(id, reason),
    [behavior],
  );
  const resume = useCallback(
    (id: string, reason: "hover" | "focus") => behavior.resume(id, reason),
    [behavior],
  );
  const isPaused = useCallback(
    (id: string) =>
      behavior
        .getSnapshot()
        .records.some((record) => record.id === id && record.paused),
    [behavior],
  );

  const controller = useMemo<ToastController>(
    () => ({
      dismiss,
      dismissAll,
      error: (options) => shortcut("error", options),
      info: (options) => shortcut("info", options),
      success: (options) => shortcut("success", options),
      toast,
      update,
      warning: (options) => shortcut("warning", options),
    }),
    [dismiss, dismissAll, shortcut, toast, update],
  );

  return {
    controller,
    dismiss,
    dismissAll,
    isPaused,
    pause,
    resume,
    visibleToasts: snapshot.visibleRecords.map(toToastRecord),
  };
}
