import type { ToastPosition, ToastRecord, ToastTone } from "./Toast.types";

let toastIdCounter = 0;

export function createToastId() {
  toastIdCounter += 1;
  return `dv-toast-${toastIdCounter}`;
}

export function getToastTone(toast: Pick<ToastRecord, "tone">): ToastTone {
  return toast.tone ?? "neutral";
}

export function getToastDuration(
  toast: Pick<ToastRecord, "duration">,
  defaultDuration: number
) {
  return toast.duration === undefined ? defaultDuration : toast.duration;
}

export function getVisibleToasts(
  toasts: readonly ToastRecord[],
  maxVisible: number,
  newestOnTop: boolean
) {
  const visible = toasts.slice(0, Math.max(0, maxVisible));

  return newestOnTop ? [...visible].reverse() : visible;
}

export function toastViewportClass(position: ToastPosition) {
  return `dv-toast-viewport--${position}`;
}
