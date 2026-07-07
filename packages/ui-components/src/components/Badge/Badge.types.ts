import type { HTMLAttributes } from "react";

export type BadgeVariant = "neutral" | "success" | "warning" | "danger" | "info";

export type BadgeSize = "sm" | "md";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
  size?: BadgeSize;
};
