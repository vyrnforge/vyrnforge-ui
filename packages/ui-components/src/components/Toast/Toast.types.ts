import type {
  CSSProperties,
  MouseEventHandler,
  ReactNode
} from "react";

export type ToastTone =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "error";

export type ToastPosition =
  | "top-start"
  | "top-center"
  | "top-end"
  | "bottom-start"
  | "bottom-center"
  | "bottom-end";

export type ToastRecord = {
  id: string;
  title?: ReactNode;
  description?: ReactNode;
  tone?: ToastTone;
  duration?: number | null;
  dismissible?: boolean;
  action?: ReactNode;
  createdAt?: number;
};

export type ToastOptions = Omit<ToastRecord, "id"> & {
  id?: string;
};

export type ToastShortcutOptions = Omit<ToastOptions, "tone">;

export type ToastController = {
  toast: (options: ToastOptions) => string;
  success: (options: ToastShortcutOptions) => string;
  error: (options: ToastShortcutOptions) => string;
  warning: (options: ToastShortcutOptions) => string;
  info: (options: ToastShortcutOptions) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
  update: (id: string, options: Partial<ToastOptions>) => void;
};

export type ToastProviderProps = {
  children: ReactNode;
  position?: ToastPosition;
  maxVisible?: number;
  defaultDuration?: number;
  pauseOnHover?: boolean;
  pauseOnFocus?: boolean;
  newestOnTop?: boolean;
  viewportLabel?: string;
};

export type ToastProps = {
  id?: string;
  title?: ReactNode;
  description?: ReactNode;
  tone?: ToastTone;
  dismissible?: boolean;
  action?: ReactNode;
  onDismiss?: () => void;
  onFocusPause?: () => void;
  onFocusResume?: () => void;
  onHoverPause?: () => void;
  onHoverResume?: () => void;
  className?: string;
  style?: CSSProperties;
};

export type ToastViewportProps = {
  toasts: readonly ToastRecord[];
  position?: ToastPosition;
  label?: string;
  onDismiss: (id: string) => void;
  onFocusPause?: (id: string) => void;
  onFocusResume?: (id: string) => void;
  onHoverPause?: (id: string) => void;
  onHoverResume?: (id: string) => void;
};

export type ToastActionProps = {
  altText: string;
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
};
