import type { CSSProperties, ReactNode } from "react";

export type PopoverPlacement =
  | "bottom-start"
  | "bottom-end"
  | "top-start"
  | "top-end"
  | "right"
  | "left";

export type PopoverAlign = "start" | "center" | "end";

export type PopoverProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger: ReactNode;
  children: ReactNode;
  placement?: PopoverPlacement;
  align?: PopoverAlign;
  closeOnEscape?: boolean;
  closeOnOutsideClick?: boolean;
  className?: string;
  style?: CSSProperties;
};
