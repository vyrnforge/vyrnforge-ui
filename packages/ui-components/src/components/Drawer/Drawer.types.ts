import type { ReactNode, RefObject } from "react";

export type DrawerSide = "left" | "right" | "top" | "bottom";
export type DrawerSize = "sm" | "md" | "lg";

export type DrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  side?: DrawerSide;
  size?: DrawerSize;
  closeOnEscape?: boolean;
  closeOnOverlayClick?: boolean;
  modal?: boolean;
  initialFocusRef?: RefObject<HTMLElement | null>;
  portalContainer?: Element | null;
  onMountAutoFocus?: (event: Event) => void;
  onUnmountAutoFocus?: (event: Event) => void;
  className?: string;
};
