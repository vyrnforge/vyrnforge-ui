import type { HTMLAttributes } from "react";

export type BadgeVariant = "neutral" | "success" | "warning" | "danger" | "info";

export type BadgeSize = "sm" | "md";

export type BadgeTone = "subtle" | "solid";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
  size?: BadgeSize;
  tone?: BadgeTone;
};

export type StatusBadgeStatus =
  | "active"
  | "inactive"
  | "pending"
  | "success"
  | "warning"
  | "danger"
  | "error"
  | "info"
  | "neutral"
  | (string & {});

export type StatusBadgeProps = Omit<BadgeProps, "variant"> & {
  status: StatusBadgeStatus;
  label?: string;
  variantMap?: Partial<Record<string, BadgeVariant>>;
};
