import type { ReactNode } from "react";

export type TooltipPlacement = "top" | "bottom" | "left" | "right";

export type TooltipProps = {
  content: ReactNode;
  children: ReactNode;
  placement?: TooltipPlacement;
  delayMs?: number;
  disabled?: boolean;
  className?: string;
};
