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
        "vf-badge",
        `vf-badge--${variant}`,
        `vf-badge--${size}`,
        `vf-badge--${tone}`,
        className
      )}
      {...props}
    />
  );
}
