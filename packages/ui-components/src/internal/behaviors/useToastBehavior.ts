import {
  createToastService,
  type ToastService,
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
  record: ReturnType<ToastService<ToastPayload>["getSnapshot"]>["records"][number],
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
  const serviceRef = useRef<ToastService<ToastPayload> | null>(null);

  if (serviceRef.current === null) {
    serviceRef.current = createToastService<ToastPayload>({
      createId: createToastId,
      defaultDuration,
      maxVisible,
      newestOnTop,
    });
  }

  const service = serviceRef.current;
  const snapshot = useBehaviorSnapshot(service);

  useEffect(() => {
    service.setMaxVisible(maxVisible);
  }, [maxVisible, service]);

  useEffect(() => {
    service.setNewestOnTop(newestOnTop);
  }, [newestOnTop, service]);

  useEffect(() => {
    service.start();
    return () => service.stop();
  }, [service]);

  const dismiss = useCallback(
    (id: string) => {
      service.dismiss(id, "programmatic");
    },
    [service],
  );
  const dismissAll = useCallback(() => {
    service.dismissAll();
  }, [service]);
  const toast = useCallback(
    (options: ToastOptions) => {
      const {
        createdAt,
        dismissible = true,
        duration,
        id,
        ...payload
      } = options;
      return service.add({
        id,
        payload,
        createdAt,
        dismissible,
        duration,
      });
    },
    [service],
  );
  const shortcut = useCallback(
    (tone: ToastTone, options: ToastShortcutOptions) =>
      toast({ ...options, tone }),
    [toast],
  );
  const update = useCallback(
    (id: string, options: Partial<ToastOptions>) => {
      const current = service
        .getSnapshot()
        .records.find((record) => record.id === id);
      if (!current) return;

      const currentRecord = toToastRecord(current);
      const nextRecord: ToastRecord = {
        ...currentRecord,
        ...options,
        id,
      };
      const {
        createdAt,
        dismissible = true,
        duration,
        id: _id,
        ...payload
      } = nextRecord;
      service.update(id, {
        payload,
        createdAt,
        dismissible,
        duration,
      });
    },
    [service],
  );
  const pause = useCallback(
    (id: string, reason: "hover" | "focus") => service.pause(id, reason),
    [service],
  );
  const resume = useCallback(
    (id: string, reason: "hover" | "focus") => service.resume(id, reason),
    [service],
  );
  const isPaused = useCallback(
    (id: string) =>
      service
        .getSnapshot()
        .records.some((record) => record.id === id && record.paused),
    [service],
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
    service,
    visibleToasts: snapshot.visibleRecords.map(toToastRecord),
  };
}
