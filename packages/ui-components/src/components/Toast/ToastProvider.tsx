import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef
} from "react";
import {
  initialToastState,
  toastReducer
} from "./toast.reducer";
import {
  createToastId,
  getToastDuration,
  getVisibleToasts
} from "./toast.utils";
import { ToastViewport } from "./ToastViewport";
import type {
  ToastController,
  ToastOptions,
  ToastProviderProps,
  ToastShortcutOptions,
  ToastTone
} from "./Toast.types";
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
  viewportLabel = "Notifications"
}: ToastProviderProps) {
  const [state, dispatch] = useReducer(toastReducer, initialToastState);
  const timersRef = useRef(new Map<string, TimerState>());
  const pausedRef = useRef(new Map<string, number>());
  const visibleToasts = useMemo(
    () => getVisibleToasts(state.toasts, maxVisible, newestOnTop),
    [maxVisible, newestOnTop, state.toasts]
  );

  const dismiss = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer.timeoutId);
      timersRef.current.delete(id);
    }
    pausedRef.current.delete(id);
    dispatch({ type: "dismiss", id });
  }, []);

  const dismissAll = useCallback(() => {
    timersRef.current.forEach((timer) => clearTimeout(timer.timeoutId));
    timersRef.current.clear();
    pausedRef.current.clear();
    dispatch({ type: "dismissAll" });
  }, []);

  const scheduleDismiss = useCallback((id: string, remaining: number) => {
    const timeoutId = setTimeout(() => dismiss(id), remaining);
    timersRef.current.set(id, {
      remaining,
      startedAt: Date.now(),
      timeoutId
    });
  }, [dismiss]);

  const pauseToast = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (!timer) {
      return;
    }

    clearTimeout(timer.timeoutId);
    timersRef.current.delete(id);
    pausedRef.current.set(
      id,
      Math.max(0, timer.remaining - (Date.now() - timer.startedAt))
    );
  }, []);

  const resumeToast = useCallback((id: string) => {
    if (!pausedRef.current.has(id) || timersRef.current.has(id)) {
      return;
    }

    const remaining = pausedRef.current.get(id) ?? 0;
    pausedRef.current.delete(id);
    if (remaining > 0) {
      scheduleDismiss(id, remaining);
    } else {
      dismiss(id);
    }
  }, [dismiss, scheduleDismiss]);

  const toast = useCallback((options: ToastOptions) => {
    const id = options.id ?? createToastId();
    const createdAt = Date.now();

    dispatch({
      type: "add",
      toast: {
        dismissible: true,
        duration: options.duration ?? defaultDuration,
        tone: "neutral",
        ...options,
        id,
        createdAt
      }
    });

    return id;
  }, [defaultDuration]);

  const shortcut = useCallback((tone: ToastTone, options: ToastShortcutOptions) =>
    toast({ ...options, tone }), [toast]);

  const update = useCallback((id: string, options: Partial<ToastOptions>) => {
    dispatch({ type: "update", id, toast: options });
  }, []);

  const controller = useMemo<ToastController>(() => ({
    dismiss,
    dismissAll,
    error: (options) => shortcut("error", options),
    info: (options) => shortcut("info", options),
    success: (options) => shortcut("success", options),
    toast,
    update,
    warning: (options) => shortcut("warning", options)
  }), [dismiss, dismissAll, shortcut, toast, update]);

  useEffect(() => {
    const visibleIds = new Set(visibleToasts.map((toastItem) => toastItem.id));

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

    visibleToasts.forEach((toastItem) => {
      const duration = getToastDuration(toastItem, defaultDuration);

      if (duration === null || duration <= 0 || timersRef.current.has(toastItem.id) || pausedRef.current.has(toastItem.id)) {
        return;
      }

      scheduleDismiss(toastItem.id, duration);
    });
  }, [defaultDuration, scheduleDismiss, visibleToasts]);

  useEffect(() => () => {
    timersRef.current.forEach((timer) => clearTimeout(timer.timeoutId));
    timersRef.current.clear();
    pausedRef.current.clear();
  }, []);

  return (
    <ToastContext.Provider value={controller}>
      {children}
      <ToastViewport
        label={viewportLabel}
        onDismiss={dismiss}
        onFocusPause={pauseOnFocus ? pauseToast : undefined}
        onFocusResume={pauseOnFocus ? resumeToast : undefined}
        onHoverPause={pauseOnHover ? pauseToast : undefined}
        onHoverResume={pauseOnHover ? resumeToast : undefined}
        position={position}
        toasts={visibleToasts}
      />
    </ToastContext.Provider>
  );
}
