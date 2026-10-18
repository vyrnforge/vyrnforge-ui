import { createContext, useContext } from "react";
import type { ToastController } from "./Toast.types";

export const ToastContext = createContext<ToastController | null>(null);

export function useToast() {
  const controller = useContext(ToastContext);

  if (!controller) {
    throw new Error("useToast must be used within a ToastProvider.");
  }

  return controller;
}
