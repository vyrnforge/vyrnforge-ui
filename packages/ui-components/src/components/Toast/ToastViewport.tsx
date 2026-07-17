import { Portal } from "../../internal/overlay";
import { joinClassNames } from "../../utils/classNames";
import { Toast } from "./Toast";
import type { ToastViewportProps } from "./Toast.types";
import { toastViewportClass } from "./toast.utils";

export function ToastViewport({
  label = "Notifications",
  onDismiss,
  onFocusPause,
  onFocusResume,
  onHoverPause,
  onHoverResume,
  position = "bottom-end",
  toasts
}: ToastViewportProps) {
  if (toasts.length === 0) {
    return null;
  }

  return (
    <Portal>
      <section
        aria-label={label}
        className={joinClassNames(
          "vf-toast-viewport",
          toastViewportClass(position)
        )}
      >
        {toasts.map((toast) => (
          <Toast
            action={toast.action}
            description={toast.description}
            dismissible={toast.dismissible}
            id={toast.id}
            key={toast.id}
            onDismiss={() => onDismiss(toast.id)}
            onFocusPause={() => onFocusPause?.(toast.id)}
            onFocusResume={() => onFocusResume?.(toast.id)}
            onHoverPause={() => onHoverPause?.(toast.id)}
            onHoverResume={() => onHoverResume?.(toast.id)}
            title={toast.title}
            tone={toast.tone}
          />
        ))}
      </section>
    </Portal>
  );
}
