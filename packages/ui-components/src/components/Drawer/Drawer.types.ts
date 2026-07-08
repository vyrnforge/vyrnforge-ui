import type { ReactNode } from "react";

export type DrawerSide = "left" | "right" | "bottom";
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
  className?: string;
};
