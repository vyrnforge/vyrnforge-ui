import { useToastBehavior } from "../../internal/behaviors";
import { ToastViewport } from "./ToastViewport";
import type { ToastProviderProps } from "./Toast.types";
import { ToastContext } from "./useToast";

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
  const behavior = useToastBehavior({
    defaultDuration,
    maxVisible,
    newestOnTop,
  });

  return (
    <ToastContext.Provider value={behavior.controller}>
      {children}
      <ToastViewport
        label={viewportLabel}
        onDismiss={behavior.dismiss}
        onFocusPause={
          pauseOnFocus ? (id) => behavior.pause(id, "focus") : undefined
        }
        onFocusResume={
          pauseOnFocus ? (id) => behavior.resume(id, "focus") : undefined
        }
        onHoverPause={
          pauseOnHover ? (id) => behavior.pause(id, "hover") : undefined
        }
        onHoverResume={
          pauseOnHover ? (id) => behavior.resume(id, "hover") : undefined
        }
        position={position}
        toasts={behavior.visibleToasts}
      />
    </ToastContext.Provider>
  );
}
