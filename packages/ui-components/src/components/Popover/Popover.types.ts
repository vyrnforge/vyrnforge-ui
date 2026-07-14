import type { CSSProperties, ReactNode, RefObject } from "react";

export type PopoverPlacement =
  | "bottom"
  | "bottom-start"
  | "bottom-end"
  | "top"
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
  closeOnOutsidePointer?: boolean;
  offset?: number;
  matchTriggerWidth?: boolean;
  modal?: boolean;
  initialFocusRef?: RefObject<HTMLElement | null>;
  portalContainer?: Element | null;
  className?: string;
  style?: CSSProperties;
};
