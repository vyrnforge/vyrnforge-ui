import { joinClassNames } from "../../utils/classNames";
import type { BadgeProps } from "./Badge.types";

export function Badge({
  className,
  size = "md",
  tone = "subtle",
  variant = "neutral",
  ...props
}: BadgeProps) {
  return (
    <span
      className={joinClassNames(
        "dv-badge",
        `dv-badge--${variant}`,
        `dv-badge--${size}`,
        `dv-badge--${tone}`,
        className
      )}
      {...props}
    />
  );
}
