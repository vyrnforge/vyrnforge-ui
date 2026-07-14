import type { ReactNode, RefObject } from "react";

export type DialogSize = "sm" | "md" | "lg" | "xl";

export type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size?: DialogSize;
  closeOnEscape?: boolean;
  closeOnOverlayClick?: boolean;
  initialFocusRef?: RefObject<HTMLElement | null>;
  portalContainer?: Element | null;
  onMountAutoFocus?: (event: Event) => void;
  onUnmountAutoFocus?: (event: Event) => void;
  className?: string;
};
