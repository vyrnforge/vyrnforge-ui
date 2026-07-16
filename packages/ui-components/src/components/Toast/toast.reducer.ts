import type { ToastOptions, ToastRecord } from "./Toast.types";

export type ToastState = {
  toasts: ToastRecord[];
};

export type ToastAction =
  | { type: "add"; toast: ToastRecord }
  | { type: "dismiss"; id: string }
  | { type: "dismissAll" }
  | { type: "update"; id: string; toast: Partial<ToastOptions> };

export const initialToastState: ToastState = {
  toasts: []
};

export function toastReducer(
  state: ToastState,
  action: ToastAction
): ToastState {
  switch (action.type) {
    case "add": {
      const existingIndex = state.toasts.findIndex((toast) =>
        toast.id === action.toast.id
      );

      if (existingIndex === -1) {
        return {
          toasts: [...state.toasts, action.toast]
        };
      }

      return {
        toasts: state.toasts.map((toast, index) =>
          index === existingIndex
            ? { ...toast, ...action.toast, id: toast.id }
            : toast
        )
      };
    }

    case "dismiss":
      return {
        toasts: state.toasts.filter((toast) => toast.id !== action.id)
      };

    case "dismissAll":
      return initialToastState;

    case "update":
      return {
        toasts: state.toasts.map((toast) =>
          toast.id === action.id
            ? { ...toast, ...action.toast, id: toast.id, createdAt: Date.now() }
            : toast
        )
      };

    default:
      return state;
  }
}
