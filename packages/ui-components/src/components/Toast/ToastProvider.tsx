import { useCallback, useEffect, useRef } from "react";
import { useToastBehavior } from "../../internal/behaviors";
import { getToastDuration } from "./toast.utils";
import { ToastViewport } from "./ToastViewport";
import type { ToastProviderProps } from "./Toast.types";
import { ToastContext } from "./useToast";

type TimerState = {
  remaining: number;
  startedAt: number;
  timeoutId: ReturnType<typeof setTimeout>;
};

export function ToastProvider({
  children,
  defaultDuration = 5000,
  maxVisible = 5,
  newestOnTop = false,
  pauseOnFocus = true,
  pauseOnHover = true,
  position = "bottom-end",
  viewportLabel = "Notifications",
}: ToastProviderProps) {
  const timersRef = useRef(new Map<string, TimerState>());
  const pausedRef = useRef(new Map<string, number>());
  const behavior = useToastBehavior({
    defaultDuration,
    maxVisible,
    newestOnTop,
  });

  const dismiss = useCallback(
    (id: string) => {
      const timer = timersRef.current.get(id);
      if (timer) {
        clearTimeout(timer.timeoutId);
        timersRef.current.delete(id);
      }
      pausedRef.current.delete(id);
      behavior.dismiss(id);
    },
    [behavior],
  );

  const dismissAll = useCallback(() => {
    timersRef.current.forEach((timer) => clearTimeout(timer.timeoutId));
    timersRef.current.clear();
    pausedRef.current.clear();
    behavior.dismissAll();
  }, [behavior]);

  const scheduleDismiss = useCallback(
    (id: string, remaining: number) => {
      const timeoutId = setTimeout(() => dismiss(id), remaining);
      timersRef.current.set(id, {
        remaining,
        startedAt: Date.now(),
        timeoutId,
      });
    },
    [dismiss],
  );

  const pauseToast = useCallback(
    (id: string, reason: "hover" | "focus") => {
      const timer = timersRef.current.get(id);
      if (!timer) return;

      clearTimeout(timer.timeoutId);
      timersRef.current.delete(id);
      pausedRef.current.set(
        id,
        Math.max(0, timer.remaining - (Date.now() - timer.startedAt)),
      );
      behavior.pause(id, reason);
    },
    [behavior],
  );

  const resumeToast = useCallback(
    (id: string, reason: "hover" | "focus") => {
      if (!pausedRef.current.has(id) || timersRef.current.has(id)) return;

      const remaining = pausedRef.current.get(id) ?? 0;
      pausedRef.current.delete(id);
      behavior.resume(id, reason);
      if (remaining > 0) {
        scheduleDismiss(id, remaining);
      } else {
        dismiss(id);
      }
    },
    [behavior, dismiss, scheduleDismiss],
  );

  useEffect(() => {
    const visibleIds = new Set(
      behavior.visibleToasts.map((toastItem) => toastItem.id),
    );

    timersRef.current.forEach((timer, id) => {
      if (!visibleIds.has(id)) {
        clearTimeout(timer.timeoutId);
        timersRef.current.delete(id);
      }
    });

    pausedRef.current.forEach((_, id) => {
      if (!visibleIds.has(id)) {
        pausedRef.current.delete(id);
      }
    });

    behavior.visibleToasts.forEach((toastItem) => {
      const duration = getToastDuration(toastItem, defaultDuration);

      if (
        duration === null ||
        duration <= 0 ||
        timersRef.current.has(toastItem.id) ||
        pausedRef.current.has(toastItem.id) ||
        behavior.isPaused(toastItem.id)
      ) {
        return;
      }

      scheduleDismiss(toastItem.id, duration);
    });
  }, [behavior, defaultDuration, scheduleDismiss]);

  useEffect(
    () => () => {
      timersRef.current.forEach((timer) => clearTimeout(timer.timeoutId));
      timersRef.current.clear();
      pausedRef.current.clear();
    },
    [],
  );

  return (
    <ToastContext.Provider value={behavior.controller}>
      {children}
      <ToastViewport
        label={viewportLabel}
        onDismiss={dismiss}
        onFocusPause={
          pauseOnFocus ? (id) => pauseToast(id, "focus") : undefined
        }
        onFocusResume={
          pauseOnFocus ? (id) => resumeToast(id, "focus") : undefined
        }
        onHoverPause={
          pauseOnHover ? (id) => pauseToast(id, "hover") : undefined
        }
        onHoverResume={
          pauseOnHover ? (id) => resumeToast(id, "hover") : undefined
        }
        position={position}
        toasts={behavior.visibleToasts}
      />
    </ToastContext.Provider>
  );
}
