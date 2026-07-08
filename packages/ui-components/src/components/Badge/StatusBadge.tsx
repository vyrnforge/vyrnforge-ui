import { Badge } from "./Badge";
import type { BadgeVariant, StatusBadgeProps } from "./Badge.types";

const defaultVariantMap: Record<string, BadgeVariant> = {
  active: "success",
  success: "success",
  inactive: "neutral",
  neutral: "neutral",
  pending: "warning",
  warning: "warning",
  danger: "danger",
  error: "danger",
  info: "info"
};

export function StatusBadge({
  children,
  label,
  status,
  variantMap,
  ...props
}: StatusBadgeProps) {
  const normalizedStatus = String(status).toLowerCase();
  const variant =
    variantMap?.[normalizedStatus] ?? defaultVariantMap[normalizedStatus] ?? "neutral";

  return (
    <Badge variant={variant} {...props}>
      {children ?? label ?? status}
    </Badge>
  );
}
